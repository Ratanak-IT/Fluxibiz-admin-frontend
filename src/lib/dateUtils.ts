/**
 * Safely parses any date input from backend API (ISO string with or without 'Z', timestamp, etc.)
 * into a valid JavaScript Date object in local user timezone.
 */
export function parseApiDate(dateStr?: string | number | null): Date {
  if (!dateStr) return new Date();

  if (typeof dateStr === "number") {
    // Handle unix epoch timestamp in seconds vs milliseconds
    return new Date(dateStr < 1e11 ? dateStr * 1000 : dateStr);
  }

  if (typeof dateStr === "string") {
    let s = dateStr.trim();

    // If it's a numeric string timestamp
    if (/^\d+$/.test(s)) {
      const num = Number(s);
      return new Date(num < 1e11 ? num * 1000 : num);
    }

    // Replace space between date and time with 'T' (e.g., "2026-08-13 09:41:22" -> "2026-08-13T09:41:22")
    s = s.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:?\d*)/, "$1T$2");

    // If ISO string without timezone offset or Z suffix (e.g. "2026-08-13T09:41:22"), append 'Z' to force UTC parsing
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
      s += "Z";
    }

    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return new Date();
}

/**
 * Returns a human-friendly relative time string (e.g. "Just now", "5m ago", "2h ago", "3d ago").
 */
export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  const date = dateInput instanceof Date ? dateInput : parseApiDate(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Formats date as full readable local date & time (e.g. "13 Aug 2026, 16:41:22" or "13/08/2026, 04:41 PM")
 */
export function formatFullDateTime(dateInput?: string | number | Date | null): string {
  const date = dateInput instanceof Date ? dateInput : parseApiDate(dateInput);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/**
 * Formats time only (e.g. "04:41 PM" or "16:41")
 */
export function formatTimeOnly(dateInput?: string | number | Date | null): string {
  const date = dateInput instanceof Date ? dateInput : parseApiDate(dateInput);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
