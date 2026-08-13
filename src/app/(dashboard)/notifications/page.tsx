"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  CheckCheck,
  Globe,
  Search,
  Server,
  Shield,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useGetAuditLogsQuery } from "@/features/businessManagement/businessAdminApi";
import { notificationSocket } from "@/lib/notification-socket";
import type {
  AdminNotification,
  NotificationCategory,
  NotificationSeverity,
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | NotificationCategory>("ALL");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | NotificationSeverity>("ALL");

  const { data: auditData, isLoading } = useGetAuditLogsQuery(
    { page: 0, size: 50 },
    { pollingInterval: 5000 },
  );

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

      const severity: NotificationSeverity = type.includes("SUSPENDED") || type.includes("DELETED")
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
      return [...newItems, ...prev];
    });
  }, [auditData]);

  useEffect(() => {
    notificationSocket.connect();
    const readIds = getReadIds();
    const unsubscribe = notificationSocket.subscribe((newNotif) => {
      const formatted = { ...newNotif, read: readIds.has(newNotif.id) };
      setNotifications((prev) => [formatted, ...prev.filter((n) => n.id !== newNotif.id)]);
    });
    return () => unsubscribe();
  }, []);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q) || (n.actorUsername ?? "").toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "ALL" || n.category === categoryFilter;
      const matchesSeverity = severityFilter === "ALL" || n.severity === severityFilter;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [notifications, searchQuery, categoryFilter, severityFilter]);

  const markAllRead = () => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearAll = () => setNotifications([]);
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getSeverityBadge = (sev: NotificationSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="rounded-full bg-rose-500/15 text-rose-600 px-2.5 py-0.5 text-xs font-bold dark:bg-rose-500/25 dark:text-rose-400">CRITICAL</span>;
      case "WARNING":
        return <span className="rounded-full bg-amber-500/15 text-amber-600 px-2.5 py-0.5 text-xs font-bold dark:bg-amber-500/25 dark:text-amber-400">WARNING</span>;
      case "SUCCESS":
        return <span className="rounded-full bg-emerald-500/15 text-emerald-600 px-2.5 py-0.5 text-xs font-bold dark:bg-emerald-500/25 dark:text-emerald-400 font-mono">SUCCESS</span>;
      default:
        return <span className="rounded-full bg-blue-500/15 text-blue-600 px-2.5 py-0.5 text-xs font-bold dark:bg-blue-500/25 dark:text-blue-400 font-mono">INFO</span>;
    }
  };

  return (
    <div className="w-full pt-2">

      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Center
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Real-time platform notifications, webhooks, and administrative event stream.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, message, or admin username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-10 text-sm text-foreground outline-none transition focus:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(["ALL", "BUSINESS", "CHANNEL", "SECURITY", "SYSTEM"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3.5 py-1.5 transition font-semibold ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {isLoading && notifications.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading notifications...</p>
        )}

        {!isLoading && filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:border-primary/30">
              <Bell className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">No notifications found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search query or filters." : "You're all caught up!"}
            </p>
          </div>
        )}

        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition hover:border-border/80 text-card-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 rounded-full p-2 bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:border-primary/30 shrink-0">
                  {notif.category === "BUSINESS" ? (
                    <Building2 className="h-4 w-4 text-primary" />
                  ) : notif.category === "CHANNEL" ? (
                    <Globe className="h-4 w-4 text-primary" />
                  ) : notif.category === "SECURITY" ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <Server className="h-4 w-4 text-primary" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{notif.title}</h3>
                    {getSeverityBadge(notif.severity)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>

                  <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span>
                      Actor: <strong className="text-foreground font-semibold">{notif.actorUsername || "System"}</strong>
                    </span>
                    <span>•</span>
                    <span>{new Date(notif.createdAt).toLocaleString("en-GB")}</span>
                    {notif.actionUrl && (
                      <>
                        <span>•</span>
                        <Link href={notif.actionUrl} className="font-semibold text-primary hover:underline">
                          View details →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteNotification(notif.id)}
                aria-label="Delete notification"
                title="Delete"
                className="rounded-full p-2 text-destructive transition hover:bg-destructive/15 hover:text-destructive shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
