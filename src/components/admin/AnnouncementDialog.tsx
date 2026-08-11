"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Megaphone, ShieldAlert, Sparkles, X } from "lucide-react";
import {
  getAnnouncement,
  saveAnnouncement,
  type AnnouncementConfig,
  type AnnouncementType,
} from "@/lib/announcementStore";

const PRESETS: Array<{ label: string; message: string; type: AnnouncementType }> = [
  {
    label: "Scheduled Maintenance",
    message: "System Maintenance: IPOS Platform will undergo scheduled maintenance tonight at 12:00 AM UTC (Approx. 30 mins).",
    type: "warning",
  },
  {
    label: "Emergency Maintenance",
    message: "Maintenance Notice: We are currently applying an urgent system update. Some features may be temporarily delayed.",
    type: "maintenance",
  },
  {
    label: "New Feature Live",
    message: "New Feature: Telegram Shop Channel integration and KHQR Payment sync are now live!",
    type: "success",
  },
  {
    label: "General Notice",
    message: "Platform Update: Please clear your browser cache if you experience any visual display issues.",
    type: "info",
  },
];

export function AnnouncementDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AnnouncementType>("warning");
  const [active, setActive] = useState(false);
  const [dismissible, setDismissible] = useState(true);

  useEffect(() => {
    if (open) {
      const current = getAnnouncement();
      setMessage(current.message);
      setType(current.type);
      setActive(current.active);
      setDismissible(current.dismissible);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    const current = getAnnouncement();
    const updated: AnnouncementConfig = {
      id: active ? `announcement-${Date.now()}` : current.id,
      message,
      type,
      active,
      dismissible,
      updatedAt: Date.now(),
    };

    saveAnnouncement(updated);
    onOpenChange(false);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setMessage(preset.message);
    setType(preset.type);
    setActive(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">System Announcement Manager</h2>
              <p className="text-xs text-muted-foreground">
                Broadcast top notification banners across the platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4 text-sm">
          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-4">
            <div>
              <p className="font-semibold">Banner Status</p>
              <p className="text-xs text-muted-foreground">
                {active ? "Banner is currently live for all users" : "Banner is currently hidden"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                active ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
                >
                  <Sparkles className="size-3 text-primary" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity / Type */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              Banner Severity Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: "info", label: "Info", icon: Info, color: "border-sky-500 text-sky-600 dark:text-sky-400" },
                  { id: "warning", label: "Warning", icon: AlertTriangle, color: "border-amber-500 text-amber-600 dark:text-amber-400" },
                  { id: "maintenance", label: "Maintenance", icon: ShieldAlert, color: "border-red-500 text-red-600 dark:text-red-400" },
                  { id: "success", label: "Success", icon: CheckCircle2, color: "border-emerald-500 text-emerald-600 dark:text-emerald-400" },
                ] as const
              ).map((t) => {
                const IconComp = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-medium transition ${
                      isSelected
                        ? `bg-primary/5 ${t.color} font-semibold ring-2 ring-primary/30`
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <IconComp className="size-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Announcement Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your system broadcast message..."
              className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Dismissible Toggle */}
          <label className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={dismissible}
              onChange={(e) => setDismissible(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            Allow users to close/dismiss this banner
          </label>

          {/* Live Preview Box */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Live Preview
            </label>
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-3">
              <div
                className={`flex items-center justify-between gap-2 rounded-xl p-3 text-xs font-medium ${
                  type === "info"
                    ? "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100"
                    : type === "warning"
                    ? "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
                    : type === "maintenance"
                    ? "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-100"
                    : "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="rounded-full bg-black/10 px-2 py-0.5 font-bold capitalize dark:bg-white/20">
                    {type}
                  </span>
                  <span className="truncate">{message || "No message entered..."}</span>
                </div>
                {dismissible && <X className="size-4 shrink-0 opacity-60" />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Publish Announcement
          </button>
        </div>
      </div>
    </div>
  );
}
