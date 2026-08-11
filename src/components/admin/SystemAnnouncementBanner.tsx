"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";
import {
  dismissAnnouncement,
  getAnnouncement,
  isDismissed,
  subscribeToAnnouncement,
  type AnnouncementConfig,
  type AnnouncementType,
} from "@/lib/announcementStore";

const STYLES: Record<
  AnnouncementType,
  {
    container: string;
    icon: typeof Info;
    badge: string;
  }
> = {
  info: {
    container:
      "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/90 dark:text-sky-100 dark:border-sky-800/80",
    icon: Info,
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  },
  warning: {
    container:
      "bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/90 dark:text-amber-100 dark:border-amber-800/80",
    icon: AlertTriangle,
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
  },
  maintenance: {
    container:
      "bg-red-50 text-red-950 border-red-200 dark:bg-red-950/90 dark:text-red-100 dark:border-red-800/80",
    icon: ShieldAlert,
    badge: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200",
  },
  success: {
    container:
      "bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-800/80",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200",
  },
};

export function SystemAnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(getAnnouncement);
  const [dismissed, setDismissed] = useState<boolean>(() => isDismissed(getAnnouncement().id));

  useEffect(() => {
    const sync = (config: AnnouncementConfig) => {
      setAnnouncement(config);
      setDismissed(isDismissed(config.id));
    };

    setAnnouncement(getAnnouncement());
    setDismissed(isDismissed(getAnnouncement().id));

    return subscribeToAnnouncement(sync);
  }, []);

  if (!announcement.active || dismissed || !announcement.message.trim()) {
    return null;
  }

  const style = STYLES[announcement.type] ?? STYLES.info;
  const IconComponent = style.icon;

  const handleDismiss = () => {
    dismissAnnouncement(announcement.id);
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="System Announcement"
      className={`relative flex items-center justify-between gap-3 border-b px-4 py-2.5 text-xs font-medium transition-all sm:px-6 sm:text-sm ${style.container}`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 overflow-hidden text-center sm:text-left">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${style.badge}`}>
          <IconComponent className="size-3.5 shrink-0" aria-hidden />
          <span className="capitalize">{announcement.type}</span>
        </span>

        <p className="truncate font-medium">{announcement.message}</p>
      </div>

      {announcement.dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="rounded-lg p-1 transition hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
