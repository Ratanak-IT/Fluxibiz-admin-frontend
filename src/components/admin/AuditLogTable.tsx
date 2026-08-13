"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Download, FileSpreadsheet, Search, SlidersHorizontal, X } from "lucide-react";
import { useGetAuditLogsInfiniteQuery } from "@/features/businessManagement/businessAdminApi";
import type { AdminActionType } from "@/lib/types/adminTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { useInfiniteScroll } from "@/lib/hook/useInfiniteScroll";
import { exportAuditLogsToExcel } from "@/lib/exportReportService";
import { ExportReportDialog } from "@/components/admin/ExportReportDialog";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";

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

type TargetType =
  | "BUSINESS"
  | "BUSINESS_CATEGORY"
  | "UNIT"
  | "BUSINESS_FEATURE";

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

  BUSINESS_FEATURE: [
    "BUSINESS_FEATURE_ENABLED",
    "BUSINESS_FEATURE_DISABLED",
  ],
};

const ALL_ACTIONS = Object.values(ACTIONS_BY_TARGET).flat();

const COLUMNS: ColumnDef[] = [
  { id: "when", label: "Date" },
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

const INITIAL_FILTERS: FilterState = {
  keyword: "",
  actionType: "ALL",
  page: 0,
};

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
  const cols = useColumnVisibility(
    `audit-log:${targetType ?? "all"}`,
    COLUMNS,
  );

  const [keywordInput, setKeywordInput] = useState("");

  const [filters, setFilters] =
    useState<FilterState>(INITIAL_FILTERS);

  const [actionFilterOpen, setActionFilterOpen] =
    useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const actionFilterRef =
    useRef<HTMLDivElement>(null);

  const actionOptions = useMemo(
    () =>
      targetType
        ? ACTIONS_BY_TARGET[targetType]
        : ALL_ACTIONS,
    [targetType],
  );

  useEffect(() => {
    const next = keywordInput.trim();

    if (next === filters.keyword) return;

    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        keyword: next,
        page: 0,
      }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keywordInput, filters.keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionFilterRef.current &&
        !actionFilterRef.current.contains(
          event.target as Node,
        )
      ) {
        setActionFilterOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const setActionType = (
    value: AdminActionType | "ALL",
  ) =>
    setFilters((prev) => ({
      ...prev,
      actionType: value,
      page: 0,
    }));

  const setPage = useCallback(
    (updater: (prev: number) => number) =>
      setFilters((prev) => ({
        ...prev,
        page: updater(prev.page),
      })),
    [],
  );

  const clearFilters = () => {
    setKeywordInput("");
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.keyword !== "" ||
    filters.actionType !== "ALL";

  const query = useMemo(
    () => ({
      keyword: filters.keyword || undefined,
      targetType,
      actionType:
        filters.actionType === "ALL"
          ? undefined
          : filters.actionType,
      page: filters.page,
      size: PAGE_SIZE,
    }),
    [
      filters.keyword,
      filters.actionType,
      filters.page,
      targetType,
    ],
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useGetAuditLogsInfiniteQuery(query);

  const rows = data?.content ?? [];

function formatDateDMY(isoString: string) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return `${day}/${month}/${year}, ${time}`;
}

  const filteredRows = useMemo(() => {
    if (!filters.keyword) return rows;
    const needle = filters.keyword.trim().toLowerCase();

    return rows.filter((log) => {
      const targetMatch = (log.targetLabel ?? "").toLowerCase().includes(needle);
      const adminMatch = (log.actorUsername ?? "").toLowerCase().includes(needle);
      const reasonMatch = (log.reason ?? "").toLowerCase().includes(needle);
      const actionMatch = (log.actionType ?? "").toLowerCase().replace(/_/g, " ").includes(needle);
      const labelMatch = (ACTION_LABELS[log.actionType] ?? "").toLowerCase().includes(needle);

      let dateMatch = false;
      if (log.createdAt) {
        const d = new Date(log.createdAt);
        if (!isNaN(d.getTime())) {
          const dayNum = d.getDate().toString().padStart(2, "0");
          const monthNum = (d.getMonth() + 1).toString().padStart(2, "0");
          const yearStr = d.getFullYear().toString();

          // Day-Month-Year Formats
          const dmySlash = `${dayNum}/${monthNum}/${yearStr}`;
          const dmyHyphen = `${dayNum}-${monthNum}-${yearStr}`;
          const dmyShortSlash = `${dayNum}/${monthNum}`;
          const dmyShortHyphen = `${dayNum}-${monthNum}`;

          const monthNameShort = d.toLocaleDateString("en-GB", { month: "short" }).toLowerCase();
          const monthNameFull = d.toLocaleDateString("en-GB", { month: "long" }).toLowerCase();

          const dmyNamedSlash = `${dayNum} ${monthNameShort} ${yearStr}`.toLowerCase();
          const dmyNamedHyphen = `${dayNum}-${monthNameShort}-${yearStr}`.toLowerCase();
          const dmyNamedFull = `${dayNum} ${monthNameFull} ${yearStr}`.toLowerCase();

          const isoDate = `${yearStr}-${monthNum}-${dayNum}`;
          const monthYearStr = `${monthNum}/${yearStr}`;

          dateMatch =
            dmySlash.includes(needle) ||
            dmyHyphen.includes(needle) ||
            dmyShortSlash.includes(needle) ||
            dmyShortHyphen.includes(needle) ||
            dmyNamedSlash.includes(needle) ||
            dmyNamedHyphen.includes(needle) ||
            dmyNamedFull.includes(needle) ||
            isoDate.includes(needle) ||
            monthYearStr.includes(needle) ||
            yearStr.includes(needle) ||
            monthNameShort.includes(needle) ||
            monthNameFull.includes(needle);
        }
      }

      return targetMatch || adminMatch || reasonMatch || actionMatch || labelMatch || dateMatch;
    });
  }, [rows, filters.keyword]);

  const {
    sentinelRef,
    loadMore,
    hasMore,
  } = useInfiniteScroll({
    data,
    isFetching,
    page: filters.page,
    setPage,
  });

  const actionFilterLabel =
    filters.actionType === "ALL"
      ? "All actions"
      : ACTION_LABELS[filters.actionType] ??
        filters.actionType;

  return (
    <div className="w-full pt-2">

      <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
        {title}
      </h1>

      <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">
        {subtitle}
      </p>

      {/* Search + Filters */}
      <div className="mt-7 flex items-center gap-2 sm:gap-3 lg:flex-wrap lg:justify-between">
        {/* Search */}
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />

          <input
            value={keywordInput}
            onChange={(event) =>
              setKeywordInput(event.target.value)
            }
            placeholder="Search by target, admin, reason or date (DD/MM/YYYY)..."
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="relative w-40 sm:w-56"
            ref={actionFilterRef}
          >
            <button
              type="button"
              onClick={() =>
                setActionFilterOpen((open) => !open)
              }
              aria-haspopup="listbox"
              aria-expanded={actionFilterOpen}
              className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition hover:bg-accent focus:border-primary"
            >
              <SlidersHorizontal
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />

              <span className="flex-1 truncate text-left font-medium">
                {actionFilterLabel}
              </span>

              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  actionFilterOpen
                    ? "rotate-180"
                    : ""
                }`}
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
                  aria-selected={
                    filters.actionType === "ALL"
                  }
                  onClick={() => {
                    setActionType("ALL");
                    setActionFilterOpen(false);
                  }}
                  className={`block w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                    filters.actionType === "ALL"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  All actions
                </button>

                {actionOptions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    role="option"
                    aria-selected={
                      filters.actionType === action
                    }
                    onClick={() => {
                      setActionType(action);
                      setActionFilterOpen(false);
                    }}
                    className={`block w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                      filters.actionType === action
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {ACTION_LABELS[action] ?? action}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => setExportDialogOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-accent"
          >
            <Download className="size-3.5 text-muted-foreground" />
            Export
          </button>

          {/* Column Picker */}
          <div className="shrink-0">
            <ColumnPicker
              state={cols}
              buttonClassName="bg-card border-border"
            />
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table
            className={`w-full text-left text-sm ${cols.tableClassName}`}
            style={{
              minWidth: cols.minWidthRem(72),
            }}
          >
            <thead className="bg-muted/70 text-xs sm:text-sm font-bold text-foreground border-b border-border">
              <tr>
                {!cols.isHidden("when") && <th className="px-4 py-3.5 sm:px-6">Date</th>}
                {!cols.isHidden("administrator") && <th className="px-4 py-3.5 sm:px-6">Administrator</th>}
                {!cols.isHidden("action") && <th className="px-4 py-3.5 sm:px-6">Action</th>}
                {!cols.isHidden("target") && <th className="px-4 py-3.5 sm:px-6">Target</th>}
                {!cols.isHidden("change") && <th className="px-4 py-3.5 sm:px-6">Change</th>}
                {!cols.isHidden("reason") && <th className="px-4 py-3.5 sm:px-6">Reason</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading && rows.length === 0 && (
                <AdminLoadingState label="Loading audit logs..." compact colSpan={6} />
              )}

              {error && !isLoading && rows.length === 0 && (
                <AdminApiErrorFallback error={error} compact colSpan={6} />
              )}

              {!isLoading &&
                (!error || rows.length > 0) &&
                filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6 sm:py-12"
                    >
                      {hasActiveFilters
                        ? "No entry matches these filters. Try clearing them."
                        : "Nothing recorded yet. Take an action and it will appear here."}
                    </td>
                  </tr>
                )}

              {filteredRows.map((log) => (
                <tr
                  key={log.id}
                  className="transition hover:bg-accent/40"
                >
                  {!cols.isHidden("when") && (
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground sm:px-6">
                      {formatDateDMY(log.createdAt)}
                    </td>
                  )}

                  {!cols.isHidden("administrator") && (
                    <td className="px-4 py-3.5 font-medium text-foreground sm:px-6">
                      {log.actorUsername}
                    </td>
                  )}

                  {!cols.isHidden("action") && (
                    <td className="px-4 py-3.5 font-semibold text-foreground sm:px-6">
                      {ACTION_LABELS[log.actionType] ?? log.actionType}
                    </td>
                  )}

                  {!cols.isHidden("target") && (
                    <td className="px-4 py-3.5 text-muted-foreground sm:px-6">
                      {log.targetLabel ?? "—"}
                    </td>
                  )}

                  {!cols.isHidden("change") && (
                    <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs sm:px-6">
                      {log.previousState || log.newState
                        ? `${log.previousState ?? "—"} → ${log.newState ?? "—"}`
                        : "—"}
                    </td>
                  )}

                  {!cols.isHidden("reason") && (
                    <td className="max-w-xs px-4 py-3.5 text-muted-foreground sm:px-6">
                      {log.reason ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite Scroll */}
      <div
        ref={sentinelRef}
        className="mt-5 flex flex-col items-center gap-3 py-6 text-sm"
      >
        {isFetching && !isLoading && (
          <span className="text-muted-foreground">
            Loading more entries...
          </span>
        )}

        {!isFetching && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full border border-border bg-white px-5 py-2 text-foreground transition hover:bg-accent dark:bg-background"
          >
            Load more
          </button>
        )}

        {data && rows.length > 0 && (
          <span className="text-muted-foreground">
            Showing {rows.length}
            {data.totalElements >= 0
              ? ` of ${data.totalElements}`
              : ""}{" "}
            entries
            {!hasMore && !isFetching
              ? " · end of log"
              : ""}
          </span>
        )}
      </div>

      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        defaultType="audit"
        auditData={filteredRows}
      />
    </div>
  );
}