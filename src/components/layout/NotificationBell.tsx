"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Sparkles,
  Trash2,
  Building2,
  Globe,
  Server,
  Shield,
} from "lucide-react";
import { useAdminNotifications } from "@/lib/hook/useAdminNotifications";
import { formatFullDateTime, formatRelativeTime } from "@/lib/dateUtils";
import type { NotificationCategory } from "@/lib/types/notificationTypes";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"ALL" | NotificationCategory>("ALL");
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    isConnected,
  } = useAdminNotifications();

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

  const filteredNotifications = notifications.filter((n) =>
    activeCategory === "ALL" ? true : n.category === activeCategory,
  );

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "BUSINESS":
        return <Building2 className="h-3.5 w-3.5 text-primary" />;
      case "CHANNEL":
        return <Globe className="h-3.5 w-3.5 text-primary" />;
      case "SECURITY":
        return <Shield className="h-3.5 w-3.5 text-primary" />;
      default:
        return <Server className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Admin Notifications"
        title="Admin Notifications"
        className="relative grid size-9 sm:size-10 place-items-center rounded-lg border-0 bg-transparent text-[#16181c] dark:text-[#f8fafc] outline-none transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#00932a]"
      >
        <Bell className="size-6 text-neutral-600 dark:text-[#94a3b8]" aria-hidden="true" />
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
                  onClick={markAllAsRead}
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
                  aria-label="Clear all notifications"
                  title="Clear all notifications"
                  className="rounded-full p-2 text-destructive transition hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
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
                  onClick={() => markAsRead(notif.id)}
                  className={`flex items-start justify-between gap-3 p-3.5 text-xs transition cursor-pointer hover:bg-accent/40 ${
                    !notif.read ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 shrink-0 rounded-full p-1.5 bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:border-primary/30 shadow-2xs">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground truncate">{notif.title}</span>
                        <span
                          title={formatFullDateTime(notif.createdAt)}
                          className="text-[10px] text-muted-foreground shrink-0 font-medium"
                        >
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-muted-foreground line-clamp-2">{notif.message}</p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>By <strong className="text-foreground">{notif.actorUsername || "System"}</strong></span>
                        {notif.actionUrl && (
                          <Link
                            href={notif.actionUrl}
                            onClick={() => setOpen(false)}
                            className="font-medium text-primary hover:underline flex items-center gap-0.5"
                          >
                            View <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    aria-label="Delete notification"
                    title="Delete"
                    className="rounded-full p-1.5 text-destructive transition hover:bg-destructive/15 hover:text-destructive shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </button>
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
