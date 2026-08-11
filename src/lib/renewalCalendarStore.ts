"use client";

export type AccountTypeFilter = "ALL" | "BUSINESS_SUBSCRIPTION" | "PUBLIC_TRIAL";
export type RenewalStatus = "active" | "expiring_soon" | "expired";

export interface RenewalEvent {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: "BUSINESS_SUBSCRIPTION" | "PUBLIC_TRIAL";
  planName: string;
  renewalDate: string; // ISO format YYYY-MM-DD
  amount: number;
  status: RenewalStatus;
  location: string;
}

const CALENDAR_STORAGE_KEY = "ipos_renewal_calendar_events_v1";
const CALENDAR_EVENT = "ipos_calendar_updated";

const DEFAULT_RENEWALS: RenewalEvent[] = [
  {
    id: "ren-1",
    name: "Phnom Penh Roastery",
    email: "owner@roastery.com",
    phone: "+855 12 345 678",
    accountType: "BUSINESS_SUBSCRIPTION",
    planName: "Enterprise Retail Plan",
    renewalDate: "2026-08-15",
    amount: 99,
    status: "expiring_soon",
    location: "Phnom Penh",
  },
  {
    id: "ren-2",
    name: "Siem Reap Souvenirs",
    email: "info@souvenirs.com",
    phone: "+855 17 888 999",
    accountType: "BUSINESS_SUBSCRIPTION",
    planName: "Standard Merchant Plan",
    renewalDate: "2026-08-20",
    amount: 29,
    status: "active",
    location: "Siem Reap",
  },
  {
    id: "ren-3",
    name: "Battambang Mart",
    email: "contact@battambangmart.com",
    phone: "+855 92 111 222",
    accountType: "BUSINESS_SUBSCRIPTION",
    planName: "Standard Merchant Plan",
    renewalDate: "2026-08-08",
    amount: 29,
    status: "expired",
    location: "Battambang",
  },
  {
    id: "ren-4",
    name: "Vannak Sam (Public Account)",
    email: "vannak.sam@gmail.com",
    phone: "+855 98 444 555",
    accountType: "PUBLIC_TRIAL",
    planName: "14-Day Free Starter Trial",
    renewalDate: "2026-08-18",
    amount: 0,
    status: "expiring_soon",
    location: "Phnom Penh",
  },
  {
    id: "ren-5",
    name: "Kampot Pepper House",
    email: "kampot.pepper@gmail.com",
    phone: "+855 88 777 666",
    accountType: "BUSINESS_SUBSCRIPTION",
    planName: "Enterprise Retail Plan",
    renewalDate: "2026-08-28",
    amount: 99,
    status: "active",
    location: "Kampot",
  },
];

export function getRenewalEvents(): RenewalEvent[] {
  if (typeof window === "undefined") return DEFAULT_RENEWALS;
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) return DEFAULT_RENEWALS;
    const parsed = JSON.parse(raw) as RenewalEvent[];
    return parsed;
  } catch {
    return DEFAULT_RENEWALS;
  }
}

export function saveRenewalEvents(events: RenewalEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent(CALENDAR_EVENT, { detail: events }));
  } catch (err) {
    console.error("Failed to save renewal events:", err);
  }
}

export function subscribeToCalendar(callback: (events: RenewalEvent[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(getRenewalEvents());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === CALENDAR_STORAGE_KEY) {
      handleUpdate();
    }
  };

  window.addEventListener(CALENDAR_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CALENDAR_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}
