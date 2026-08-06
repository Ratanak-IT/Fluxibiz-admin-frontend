"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useGetAuditLogsInfiniteQuery } from "@/features/businessManagement/businessAdminApi";
import type { AdminActionType } from "@/lib/types/adminTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { useInfiniteScroll } from "@/lib/hook/useInfiniteScroll";

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
  BUSINESS_FEATURE_ENABLED: "Feature switched on",
  BUSINESS_FEATURE_DISABLED: "Feature switched off",
};

type TargetType = "BUSINESS" | "BUSINESS_CATEGORY" | "UNIT" | "BUSINESS_FEATURE";

const ACTIONS_BY_TARGET: Record<TargetType, AdminActionType[]> = {
  BUSINESS: [
    "BUSINESS_ACTIVATED",
    "BUSINESS_SUSPENDED",
    "BUSINESS_ENABLED",
    "BUSINESS_DISABLED",
    "BUSINESS_CLOSED",
    "BUSINESS_REOPENED",
    "BUSINESS_DELETED",
  ],
  BUSINESS_CATEGORY: [
    "BUSINESS_CATEGORY_CREATED",
    "BUSINESS_CATEGORY_UPDATED",
    "BUSINESS_CATEGORY_DELETED",
  ],
  UNIT: ["UNIT_CREATED", "UNIT_UPDATED", "UNIT_DELETED"],
  BUSINESS_FEATURE: ["BUSINESS_FEATURE_ENABLED", "BUSINESS_FEATURE_DISABLED"],
};

const ALL_ACTIONS = Object.values(ACTIONS_BY_TARGET).flat();

const COLUMNS: ColumnDef[] = [
  { id: "when", label: "When" },
  { id: "administrator", label: "Administrator" },
  { id: "action", label: "Action" },
  { id: "target", label: "Target" },
  { id: "change", label: "Change" },
  { id: "reason", label: "Reason" },
];

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

interface FilterState {
  keyword: string;
  actionType: AdminActionType | "ALL";
  page: number;
}

const INITIAL_FILTERS: FilterState = { keyword: "", actionType: "ALL", page: 0 };

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
  const cols = useColumnVisibility(`audit-log:${targetType ?? "all"}`, COLUMNS);

  const [keywordInput, setKeywordInput] = useState("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [actionFilterOpen, setActionFilterOpen] = useState(false);
  const actionFilterRef = useRef<HTMLDivElement>(null);

  const actionOptions = useMemo(
    () => (targetType ? ACTIONS_BY_TARGET[targetType] : ALL_ACTIONS),
    [targetType],
  );

  useEffect(() => {
    const next = keywordInput.trim();
    if (next === filters.keyword) return;

    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: next, page: 0 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keywordInput, filters.keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionFilterRef.current && !actionFilterRef.current.contains(event.target as Node)) {
        setActionFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setActionType = (value: AdminActionType | "ALL") =>
    setFilters((prev) => ({ ...prev, actionType: value, page: 0 }));

  const setPage = useCallback(
    (updater: (prev: number) => number) =>
      setFilters((prev) => ({ ...prev, page: updater(prev.page) })),
    [],
  );

  const clearFilters = () => {
    setKeywordInput("");
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters = filters.keyword !== "" || filters.actionType !== "ALL";

  const query = useMemo(
    () => ({
      keyword: filters.keyword || undefined,
      targetType,
      actionType: filters.actionType === "ALL" ? undefined : filters.actionType,
      page: filters.page,
      size: PAGE_SIZE,
    }),
    [filters.keyword, filters.actionType, filters.page, targetType],
  );

  const { data, isLoading, isFetching, error } = useGetAuditLogsInfiniteQuery(query);
  const rows = data?.content ?? [];

  const { sentinelRef, loadMore, hasMore } = useInfiniteScroll({
    data,
    isFetching,
    page: filters.page,
    setPage,
  });

  const actionFilterLabel =
    filters.actionType === "ALL" ? "All actions" : ACTION_LABELS[filters.actionType] ?? filters.actionType;

  return (
  <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 bg-background text-foreground">
  <nav className="mb-6 text-sm sm:text-[15px] text-muted-foreground">
    <Link href="/dashboard" className="transition hover:text-foreground">
      Dashboard
    </Link>
    <span className="px-2 text-muted-foreground">/</span>
    <Link href="/audit-logs" className="transition hover:text-foreground">
      Audit
    </Link>
    <span className="px-2 text-muted-foreground">/</span>
    <span className="text-foreground">{breadcrumb}</span>
  </nav>

  <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">{title}</h1>
  <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">{subtitle}</p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Search by target, admin or reason"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-40 sm:w-56" ref={actionFilterRef}>
            <button
              type="button"
              onClick={() => setActionFilterOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={actionFilterOpen}
              className="flex w-full items-center gap-2 rounded-full border border-border bg-background py-2.5 pl-4 pr-4 text-sm text-foreground outline-none transition hover:bg-accent hover:text-foreground focus:border-brand"
            >
              <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1 truncate text-left">{actionFilterLabel}</span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${actionFilterOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {actionFilterOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={filters.actionType === "ALL"}
                  onClick={() => {
                    setActionType("ALL");
                    setActionFilterOpen(false);
                  }}
                  className={[
                    "block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition",
                    filters.actionType === "ALL"
                      ? "bg-primary text-primary-foreground"
                      : "text-popover-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  All actions
                </button>
                {actionOptions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    role="option"
                    aria-selected={filters.actionType === action}
                    onClick={() => {
                      setActionType(action);
                      setActionFilterOpen(false);
                    }}
                    className={[
                      "block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition",
                      filters.actionType === action
                        ? "bg-primary text-primary-foreground"
                        : "text-popover-foreground hover:bg-accent hover:text-foreground",
                    ].join(" ")}
                  >
                    {ACTION_LABELS[action] ?? action}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <ColumnPicker state={cols} />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${cols.tableClassName}`}
            style={{ minWidth: cols.minWidthRem(72) }}>
            <thead className="bg-muted/60 text-sm font-semibold text-foreground">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4">When</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Administrator</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Action</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Target</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Change</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6 sm:py-12">
                    Loading audit log...
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-red-600 sm:px-6 sm:py-12">
                    Request failed{"status" in error ? ` with status ${error.status}` : ""}.
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6 sm:py-12">
                    {hasActiveFilters
                      ? "No entry matches these filters. Try clearing them."
                      : "Nothing recorded yet. Take an action and it will appear here."}
                  </td>
                </tr>
              )}

              {rows.map((log) => (
                <tr key={log.id} className="align-top hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground sm:px-6 sm:py-4">{log.actorUsername}</td>
                  <td className="px-4 py-3 text-sm text-foreground sm:px-6 sm:py-4">
                    {ACTION_LABELS[log.actionType] ?? log.actionType}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">{log.targetLabel ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">
                    {log.previousState || log.newState
                      ? `${log.previousState ?? "—"} → ${log.newState ?? "—"}`
                      : "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4">{log.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={sentinelRef} className="mt-5 flex flex-col items-center gap-3 py-6 text-sm">
        {isFetching && !isLoading && (
          <span className="text-muted-foreground">Loading more entries...</span>
        )}

        {!isFetching && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full border border-border px-5 py-2 text-foreground transition hover:bg-accent"
          >
            Load more
          </button>
        )}

        {data && rows.length > 0 && (
          <span className="text-muted-foreground">
            Showing {rows.length}
            {data.totalElements >= 0 ? ` of ${data.totalElements}` : ""} entries
            {!hasMore && !isFetching ? " · end of log" : ""}
          </span>
        )}
      </div>
    </main>
  );
}