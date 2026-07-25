"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useGetAuditLogsQuery } from "@/features/businessManagement/businessAdminApi";
import type { AdminActionType } from "@/lib/types/adminTypes";

const ACTION_LABELS: Record<AdminActionType, string> = {
  BUSINESS_ACTIVATED: "Activated",
  BUSINESS_SUSPENDED: "Suspended",
  BUSINESS_ENABLED: "Enabled features",
  BUSINESS_DISABLED: "Disabled features",
  BUSINESS_CLOSED: "Closed shop",
  BUSINESS_REOPENED: "Reopened shop",
  BUSINESS_DELETED: "Deleted",
  BUSINESS_CATEGORY_CREATED: "Category created",
  BUSINESS_CATEGORY_UPDATED: "Category updated",
  BUSINESS_CATEGORY_DELETED: "Category deleted",
  UNIT_CREATED: "Unit created",
  UNIT_UPDATED: "Unit updated",
  UNIT_DELETED: "Unit deleted",
};

const PAGE_SIZE = 15;

export function AuditLogTable({
  title,
  subtitle,
  breadcrumb,
  targetType,
}: {
  title: string;
  subtitle: string;
  breadcrumb: string;
  targetType?: "BUSINESS" | "BUSINESS_CATEGORY" | "UNIT";
}) {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);

  const query = useMemo(
    () => ({ keyword: keyword.trim() || undefined, targetType, page, size: PAGE_SIZE }),
    [keyword, targetType, page],
  );

  const { data, isLoading, error } = useGetAuditLogsQuery(query);
  const rows = data?.content ?? [];

  return (
    <main className="px-8 py-7">
      <nav className="mb-6 text-[15px] text-muted-foreground">
        <Link href="/dashboard" className="hover:text-muted-foreground">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <Link href="/audit-logs" className="hover:text-muted-foreground">
          Audit
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{breadcrumb}</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>

      <div className="relative mt-7 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setPage(0);
          }}
          placeholder="Search by target, admin or reason"
          className="w-full rounded-full border border-border py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left">
          <thead className="bg-muted/60 text-sm font-semibold text-foreground">
            <tr>
              <th className="px-6 py-4">When</th>
              <th className="px-6 py-4">Administrator</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Change</th>
              <th className="px-6 py-4">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Loading audit log...
                </td>
              </tr>
            )}

            {error && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-red-600">
                  Request failed{"status" in error ? ` with status ${error.status}` : ""}.
                </td>
              </tr>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Nothing recorded yet. Take an action and it will appear here.
                </td>
              </tr>
            )}

            {rows.map((log) => (
              <tr key={log.id} className="align-top hover:bg-muted/40">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{log.actorUsername}</td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {ACTION_LABELS[log.actionType] ?? log.actionType}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{log.targetLabel ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {log.previousState || log.newState
                    ? `${log.previousState ?? "—"} → ${log.newState ?? "—"}`
                    : "—"}
                </td>
                <td className="max-w-xs px-6 py-4 text-sm text-muted-foreground">{log.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.number + 1} of {data.totalPages} · {data.totalElements} entries
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={data.number === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded-full border border-border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={data.number + 1 >= data.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-full border border-border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
