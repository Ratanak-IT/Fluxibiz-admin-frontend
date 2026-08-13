"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetAuditLogsQuery } from "@/features/businessManagement/businessAdminApi";
import { notificationSocket } from "@/lib/notification-socket";
import { parseApiDate } from "@/lib/dateUtils";
import type {
  AdminNotification,
  NotificationCategory,
  NotificationSeverity,
} from "@/lib/types/notificationTypes";

const READ_IDS_KEY = "admin_read_notification_ids";
const DELETED_IDS_KEY = "admin_deleted_notification_ids";
const EVENT_NAME = "admin-notifications-changed";

function getStoredSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredSet(key: string, set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // Ignore storage quota errors
  }
}

export function useAdminNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(() => getStoredSet(READ_IDS_KEY));
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => getStoredSet(DELETED_IDS_KEY));
  const [socketNotifications, setSocketNotifications] = useState<AdminNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Sync state across components when localStorage or custom event changes
  useEffect(() => {
    const handleSync = () => {
      setReadIds(getStoredSet(READ_IDS_KEY));
      setDeletedIds(getStoredSet(DELETED_IDS_KEY));
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Fetch real audit logs from backend API as initial/polling stream
  const { data: auditData, isLoading, refetch } = useGetAuditLogsQuery(
    { page: 0, size: 50 },
    { pollingInterval: 5000 },
  );

  // Map API audit logs to AdminNotification objects
  const apiNotifications = useMemo<AdminNotification[]>(() => {
    if (!auditData?.content) return [];
    return auditData.content.map((log) => {
      const type = log.actionType;
      const category: NotificationCategory = type.startsWith("BUSINESS")
        ? "BUSINESS"
        : "CHANNEL";

      const severity: NotificationSeverity =
        type.includes("SUSPENDED") || type.includes("DELETED")
          ? "CRITICAL"
          : type.includes("DISABLED") || type.includes("CLOSED")
            ? "WARNING"
            : "SUCCESS";

      return {
        id: log.id,
        type: type as any,
        category,
        severity,
        title: type.replace(/_/g, " "),
        message:
          log.reason ||
          (log.targetLabel
            ? `Action performed on ${log.targetLabel}`
            : "System administrative event"),
        targetId: log.targetId,
        read: false, // will be overridden by readIds
        createdAt: log.createdAt,
        actorUsername: log.actorUsername,
        actionUrl: log.targetId ? `/businesses/${log.targetId}` : undefined,
      };
    });
  }, [auditData]);

  // Connect to STOMP WebSockets for live push notifications
  useEffect(() => {
    notificationSocket.connect();
    setIsConnected(notificationSocket.isConnected());

    const checkInterval = setInterval(() => {
      setIsConnected(notificationSocket.isConnected());
    }, 3000);

    const unsubscribe = notificationSocket.subscribe((newNotif) => {
      setSocketNotifications((prev) => [
        newNotif,
        ...prev.filter((n) => n.id !== newNotif.id),
      ]);
    });

    return () => {
      clearInterval(checkInterval);
      unsubscribe();
    };
  }, []);

  // Combine socket and API notifications, applying read/deleted status
  const allNotifications = useMemo<AdminNotification[]>(() => {
    const combinedMap = new Map<string, AdminNotification>();

    // Add socket notifications first (latest)
    for (const notif of socketNotifications) {
      if (!deletedIds.has(notif.id)) {
        combinedMap.set(notif.id, {
          ...notif,
          read: readIds.has(notif.id),
        });
      }
    }

    // Add API audit logs
    for (const notif of apiNotifications) {
      if (!combinedMap.has(notif.id) && !deletedIds.has(notif.id)) {
        combinedMap.set(notif.id, {
          ...notif,
          read: readIds.has(notif.id),
        });
      }
    }

    return Array.from(combinedMap.values()).sort(
      (a, b) => parseApiDate(b.createdAt).getTime() - parseApiDate(a.createdAt).getTime(),
    );
  }, [socketNotifications, apiNotifications, readIds, deletedIds]);

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.read).length,
    [allNotifications],
  );

  // Actions
  const markAsRead = (id: string) => {
    const nextRead = new Set(readIds);
    nextRead.add(id);
    setReadIds(nextRead);
    saveStoredSet(READ_IDS_KEY, nextRead);
  };

  const markAllAsRead = () => {
    const nextRead = new Set(readIds);
    allNotifications.forEach((n) => nextRead.add(n.id));
    setReadIds(nextRead);
    saveStoredSet(READ_IDS_KEY, nextRead);
  };

  const deleteNotification = (id: string) => {
    const nextDeleted = new Set(deletedIds);
    nextDeleted.add(id);
    setDeletedIds(nextDeleted);
    saveStoredSet(DELETED_IDS_KEY, nextDeleted);
  };

  const clearAll = () => {
    const nextDeleted = new Set(deletedIds);
    allNotifications.forEach((n) => nextDeleted.add(n.id));
    setDeletedIds(nextDeleted);
    saveStoredSet(DELETED_IDS_KEY, nextDeleted);
  };

  return {
    notifications: allNotifications,
    unreadCount,
    totalCount: allNotifications.length,
    isLoading: isLoading && allNotifications.length === 0,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch,
  };
}
