"use client";

import { useGetAuditLogsQuery } from "@/features/businessManagement/businessAdminApi";
import { formatFullDateTime, formatRelativeTime } from "@/lib/dateUtils";
import { Clock } from "lucide-react";
import Link from "next/link";

export function LiveAuditTicker() {
  const { data } = useGetAuditLogsQuery(
    { page: 0, size: 5 },
    { pollingInterval: 5000 },
  );

  const logs = data?.content ?? [];
  if (logs.length === 0) return null;

  const latest = logs[0];

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 sm:flex-row sm:items-center sm:justify-between text-xs dark:bg-primary/10 transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-6 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE TICKER
        </span>

        <span className="truncate text-foreground font-medium">
          <strong className="font-bold text-primary">{latest.actorUsername}</strong>{" "}
          {latest.actionType.replace(/_/g, " ").toLowerCase()}{" "}
          {latest.targetLabel ? <span className="font-semibold text-foreground">"{latest.targetLabel}"</span> : ""}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
        <span className="flex items-center gap-1" title={formatFullDateTime(latest.createdAt)}>
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeTime(latest.createdAt)}
        </span>

        <Link
          href="/audit-logs"
          className="font-semibold text-primary hover:underline flex items-center gap-1"
        >
          View activity →
        </Link>
      </div>
    </div>
  );
}
