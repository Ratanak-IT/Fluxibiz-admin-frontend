"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
  Building2,
  Globe,
  Server,
  Shield,
} from "lucide-react";
import { useGetAuditLogsQuery } from "@/features/businessManagement/businessAdminApi";
import { notificationSocket } from "@/lib/notification-socket";
import type {
  AdminNotification,
  NotificationCategory,
} from "@/lib/types/notificationTypes";

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("admin_read_notification_ids");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("admin_read_notification_ids", JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<"ALL" | NotificationCategory>("ALL");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback API query to populate initial audit notifications
  const { data: auditData } = useGetAuditLogsQuery({ page: 0, size: 10 }, { pollingInterval: 5000 });

  // Map API audit logs to AdminNotification format with localStorage read state
  useEffect(() => {
    if (!auditData?.content) return;
    const readIds = getReadIds();

    const mapped: AdminNotification[] = auditData.content.map((log) => {
      const type = log.actionType;
      const category: NotificationCategory = type.startsWith("BUSINESS")
        ? "BUSINESS"
        : type.includes("FEATURE")
          ? "CHANNEL"
          : type.startsWith("STAFF")
            ? "SECURITY"
            : "SYSTEM";

      const severity = type.includes("SUSPENDED") || type.includes("DELETED")
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
        message: log.reason || (log.targetLabel ? `Action performed on ${log.targetLabel}` : "System administrative event"),
        targetId: log.targetId,
        read: readIds.has(log.id),
        createdAt: log.createdAt,
        actorUsername: log.actorUsername,
        actionUrl: log.targetId ? `/businesses/${log.targetId}` : undefined,
      };
    });

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newItems = mapped.filter((n) => !existingIds.has(n.id));
      return [...newItems, ...prev].slice(0, 30);
    });
  }, [auditData]);

  // Subscribe to real-time WebSockets
  useEffect(() => {
    notificationSocket.connect();
    const readIds = getReadIds();

    const unsubscribe = notificationSocket.subscribe((newNotif) => {
      const formatted = { ...newNotif, read: readIds.has(newNotif.id) };
      setNotifications((prev) => [formatted, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 30));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) =>
    activeCategory === "ALL" ? true : n.category === activeCategory,
  );

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "BUSINESS":
        return <Building2 className="h-3.5 w-3.5 text-emerald-500" />;
      case "CHANNEL":
        return <Globe className="h-3.5 w-3.5 text-amber-500" />;
      case "SECURITY":
        return <Shield className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Server className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Admin Notifications"
        className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-card-foreground">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="rounded-full p-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  title="Clear all notifications"
                  className="rounded-full p-1.5 text-xs text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 border-b border-border bg-muted/10 p-1.5 overflow-x-auto text-xs">
            {(["ALL", "BUSINESS", "CHANNEL", "SECURITY", "SYSTEM"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-2.5 py-1 transition text-[11px] font-medium shrink-0 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No notifications right now.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`flex items-start gap-3 p-3.5 text-xs transition cursor-pointer hover:bg-accent/40 ${
                    !notif.read ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-full p-1.5 bg-card border border-border shadow-2xs">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground truncate">{notif.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="mt-0.5 text-muted-foreground line-clamp-2">{notif.message}</p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>By <strong className="text-foreground">{notif.actorUsername || "System"}</strong></span>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          className="font-medium text-primary hover:underline flex items-center gap-0.5"
                        >
                          View <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2 bg-muted/20 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline block py-1"
            >
              View Full Notification Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
