"use client";

export interface ChannelMaintenanceSchedule {
  channelId: string;
  channelName: string;
  enabled: boolean;
  scheduledTime: string;
  durationMins: number;
  reason: string;
}

const STORAGE_KEY = "ipos_channel_maintenance_v1";
const EVENT_NAME = "ipos_maintenance_updated";

const DEFAULT_SCHEDULES: ChannelMaintenanceSchedule[] = [
  {
    channelId: "STOREFRONT",
    channelName: "Public Storefront",
    enabled: false,
    scheduledTime: "Sunday at 02:00 AM",
    durationMins: 30,
    reason: "Scheduled database indexing & SSL update",
  },
  {
    channelId: "TELEGRAM_BOT",
    channelName: "Telegram Ordering Bot",
    enabled: false,
    scheduledTime: "Monday at 01:00 AM",
    durationMins: 15,
    reason: "Telegram API webhook synchronization",
  },
  {
    channelId: "BAKONG",
    channelName: "Bakong KHQR Gateway",
    enabled: false,
    scheduledTime: "Sunday at 03:00 AM",
    durationMins: 20,
    reason: "Bakong settlement engine update",
  },
];

export function getMaintenanceSchedules(): ChannelMaintenanceSchedule[] {
  if (typeof window === "undefined") return DEFAULT_SCHEDULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCHEDULES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

export function saveMaintenanceSchedule(schedule: ChannelMaintenanceSchedule): void {
  if (typeof window === "undefined") return;
  try {
    const current = getMaintenanceSchedules();
    const updated = current.map((s) => (s.channelId === schedule.channelId ? schedule : s));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error("Failed to save maintenance schedule:", err);
  }
}
