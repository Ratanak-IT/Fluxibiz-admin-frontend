"use client";

import { Client, Message, StompSubscription } from "@stomp/stompjs";
import { toast } from "sonner";
import { playNotificationSound } from "./audio-alert";
import type {
  AdminNotification,
  AdminNotificationType,
  NotificationCategory,
  NotificationSeverity,
} from "./types/notificationTypes";

export type NotificationCallback = (notification: AdminNotification) => void;

class NotificationSocketService {
  private client: Client | null = null;
  private callbacks: Set<NotificationCallback> = new Set();
  private isConnecting = false;
  private processedIds = new Set<string>();
  private subscriptions = new Map<string, StompSubscription>();

  private getSocketUrl(): string {
    if (typeof window === "undefined") return "";

    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }

    const host = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws").replace(/\/+$/, "")
      : "wss://api.fluxibiz.store";

    return `${host}/ws/notifications`;
  }

  private subscribeTopics(): void {
    if (!this.client?.connected) return;

    const topicsToSubscribe = [
      "/topic/notifications",
      "/topic/admin-notifications",
      "/user/queue/notifications",
    ];

    for (const topic of topicsToSubscribe) {
      if (this.subscriptions.has(topic)) continue;

      this.subscriptions.set(
        topic,
        this.client.subscribe(topic, (message: Message) => {
          this.handleIncomingMessage(message);
        }),
      );
    }
  }

  public async connect(): Promise<void> {
    if (typeof window === "undefined") return;
    if (this.client?.active || this.isConnecting) return;

    const url = this.getSocketUrl();
    if (!url) return;

    this.isConnecting = true;

    // Fetched fresh for this connection only — never persisted to
    // sessionStorage/localStorage. This is the one place a token has to
    // reach the browser at all: STOMP connects straight to the backend and
    // can't be routed through our own `/api/v1/...` proxy.
    let token: string | null = null;
    try {
      const response = await fetch("/api/ws-token", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { accessToken?: string };
        token = data.accessToken ?? null;
      }
    } catch {
      // fall through and connect without auth; the server will reject it
    }

    if (!this.isConnecting) return; // disconnected while we were fetching

    const connectHeaders: Record<string, string> = {};
    if (token) {
      connectHeaders["Authorization"] = `Bearer ${token}`;
    }

    const client = new Client({
      brokerURL: url,
      connectHeaders,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[AdminNotificationSocket]", str);
        }
      },
    });

    client.onConnect = () => {
      this.isConnecting = false;
      this.subscriptions.clear();
      this.subscribeTopics();
    };

    client.onStompError = (frame) => {
      this.isConnecting = false;
      console.error("[AdminNotificationSocket] STOMP Error:", frame.headers["message"]);
    };

    client.onWebSocketClose = () => {
      this.isConnecting = false;
      this.subscriptions.clear();
    };

    this.client = client;
    client.activate();
  }

  public isConnected(): boolean {
    return Boolean(this.client?.connected);
  }

  private mapSeverity(type?: string): NotificationSeverity {
    if (!type) return "INFO";
    if (type.includes("SUSPENDED") || type.includes("DOWN") || type.includes("DELETED")) return "CRITICAL";
    if (type.includes("DISABLED") || type.includes("DEGRADED") || type.includes("CLOSED")) return "WARNING";
    if (type.includes("ACTIVATED") || type.includes("REGISTERED") || type.includes("PUBLISHED") || type.includes("CONNECTED")) return "SUCCESS";
    return "INFO";
  }

  private mapCategory(type?: string): NotificationCategory {
    if (!type) return "BUSINESS";
    if (type.startsWith("BUSINESS")) return "BUSINESS";
    return "CHANNEL";
  }

  private handleIncomingMessage(message: Message) {
    try {
      const data = JSON.parse(message.body);
      const id = String(data.id || data.notificationId || Date.now());

      if (this.processedIds.has(id)) return;
      this.processedIds.add(id);

      if (this.processedIds.size > 200) {
        const firstKey = this.processedIds.values().next().value;
        if (firstKey) this.processedIds.delete(firstKey);
      }

      const notifType: AdminNotificationType = (data.type || "GENERAL") as AdminNotificationType;

      const notification: AdminNotification = {
        id,
        type: notifType,
        category: (data.category as NotificationCategory) || this.mapCategory(notifType),
        severity: (data.severity as NotificationSeverity) || this.mapSeverity(notifType),
        title: data.title || data.actionType?.replace(/_/g, " ") || "Real-Time Notification",
        message: data.content || data.message || data.targetLabel ? `Action on ${data.targetLabel}` : "New event received",
        targetId: data.targetId || null,
        targetType: data.targetType || null,
        read: false,
        createdAt: data.createdAt || new Date().toISOString(),
        actorUsername: data.actorUsername || data.senderName || "System",
        actionUrl: data.actionUrl || (data.targetId ? `/businesses/${data.targetId}` : undefined),
      };

      // Play audio chime
      playNotificationSound();

      // Show toast
      toast.info(notification.title, {
        description: notification.message,
      });

      // Notify all subscribers
      this.callbacks.forEach((cb) => {
        try {
          cb(notification);
        } catch (err) {
          console.error("[AdminNotificationSocket] Callback error:", err);
        }
      });
    } catch (err) {
      console.error("[AdminNotificationSocket] Failed to parse message:", err);
    }
  }

  public subscribe(callback: NotificationCallback): () => void {
    this.callbacks.add(callback);

    if (!this.client?.active && !this.isConnecting) {
      this.connect();
    } else if (this.client?.connected) {
      this.subscribeTopics();
    }

    return () => {
      this.callbacks.delete(callback);
    };
  }

  public disconnect(): void {
    if (!this.client) return;
    this.client.deactivate();
    this.client = null;
    this.isConnecting = false;
    this.subscriptions.clear();
    this.processedIds.clear();
  }
}

export const notificationSocket = new NotificationSocketService();
