"use client";

export type AnnouncementType = "info" | "warning" | "maintenance" | "success";

export interface AnnouncementConfig {
  id: string;
  message: string;
  type: AnnouncementType;
  active: boolean;
  dismissible: boolean;
  updatedAt: number;
}

const STORAGE_KEY = "ipos_system_announcement_v1";
const DISMISSED_KEY = "ipos_announcement_dismissed_v1";
const ANNOUNCEMENT_EVENT = "ipos_announcement_updated";

export const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  id: "default-announcement-1",
  message: "Scheduled Maintenance: System upgrade scheduled for tonight at 12:00 AM UTC.",
  type: "warning",
  active: false,
  dismissible: true,
  updatedAt: Date.now(),
};

export function getAnnouncement(): AnnouncementConfig {
  if (typeof window === "undefined") return DEFAULT_ANNOUNCEMENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ANNOUNCEMENT;
    const parsed = JSON.parse(raw) as AnnouncementConfig;
    return parsed;
  } catch {
    return DEFAULT_ANNOUNCEMENT;
  }
}

export function saveAnnouncement(config: AnnouncementConfig): void {
  if (typeof window === "undefined") return;
  try {
    const updated = { ...config, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(ANNOUNCEMENT_EVENT, { detail: updated }));
  } catch (err) {
    console.error("Failed to save announcement:", err);
  }
}

export function isDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const dismissedId = localStorage.getItem(DISMISSED_KEY);
    return dismissedId === id;
  } catch {
    return false;
  }
}

export function dismissAnnouncement(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISSED_KEY, id);
    window.dispatchEvent(new CustomEvent(ANNOUNCEMENT_EVENT));
  } catch (err) {
    console.error("Failed to dismiss announcement:", err);
  }
}

export function subscribeToAnnouncement(callback: (config: AnnouncementConfig) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(getAnnouncement());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === DISMISSED_KEY) {
      handleUpdate();
    }
  };

  window.addEventListener(ANNOUNCEMENT_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(ANNOUNCEMENT_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}
