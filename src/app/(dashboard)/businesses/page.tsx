"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search, Plus, ChevronDown, Download, Building2 } from "lucide-react";
import {
  useGetBusinessesInfiniteQuery,
  useGetBusinessCategoriesQuery,
} from "@/features/businessManagement/businessAdminApi";
import { BusinessInspectorDrawer } from "@/components/admin/BusinessInspectorDrawer";
import { CreateBusinessDialog } from "@/components/admin/CreateBusinessDialog";
import { BusinessRowActions } from "@/components/admin/BusinessRowActions";
import { Flag, StatusPill } from "@/components/admin/StatusPill";
import type { BusinessOwnerStatus, BusinessResponse } from "@/lib/types/adminTypes";

import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { useInfiniteScroll } from "@/lib/hook/useInfiniteScroll";
import { ExportReportDialog } from "@/components/admin/ExportReportDialog";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";

const STATUS_FILTERS: Array<{
  label: string;
  value: BusinessOwnerStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Deleted", value: "DELETED" },
];

const COLUMNS: ColumnDef[] = [
  { id: "business", label: "Business" },
  { id: "category", label: "Category" },
  { id: "status", label: "Status" },
  { id: "storefront", label: "Storefront" },
  { id: "features", label: "Features" },
  { id: "actions", label: "Actions", locked: true },
];

const PAGE_SIZE = 20;

function TableSkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-border/60">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted" />
              <div className="space-y-2 min-w-0 flex-1">
                <div className="h-4 w-36 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 rounded bg-muted" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-20 rounded-full bg-muted" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 rounded-full bg-muted" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 rounded-full bg-muted" />
          </td>
          <td className="px-4 py-4 text-right">
            <div className="h-8 w-16 rounded-full bg-muted ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function BusinessesPage() {
  const cols = useColumnVisibility("businesses", COLUMNS);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<BusinessOwnerStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [inspectedBusiness, setInspectedBusiness] = useState<BusinessResponse | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const query = useMemo(
    () => ({
      keyword: keyword.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      page,
      size: PAGE_SIZE,
    }),
    [keyword, status, page],
  );

  const { data, isLoading, isFetching, error } = useGetBusinessesInfiniteQuery(query);

  const { sentinelRef, loadMore, hasMore } = useInfiniteScroll({
    data,
    isFetching,
    page,
    setPage,
  });
  const { data: categories = [] } = useGetBusinessCategoriesQuery();
  const rows = data?.content ?? [];

  const subCategories = useMemo(() => {
    return categories.flatMap((cat) => cat.subCategories ?? []);
  }, [categories]);

  const activeFilter = STATUS_FILTERS.find((f) => f.value === status) ?? STATUS_FILTERS[0];
  return (
    <div className="w-full pt-2">
      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Businesses
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Every shop registered on the platform, and the controls to moderate them.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm"
          >
            <Plus className="size-4" />
            Create Business
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Export, Column Picker */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(0);
            }}
            placeholder="Search by name, description or address..."
            aria-label="Search businesses"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile/tablet dropdown filter */}
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setFilterMenuOpen((prev) => !prev)}
              aria-expanded={filterMenuOpen}
              aria-haspopup="listbox"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-accent"
            >
              <span>{activeFilter.label}</span>
              <ChevronDown className={`size-4 text-muted-foreground transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {filterMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterMenuOpen(false)} />
                <div role="listbox" className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      role="option"
                      aria-selected={status === filter.value}
                      onClick={() => {
                        setStatus(filter.value);
                        setPage(0);
                        setFilterMenuOpen(false);
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${status === filter.value ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-accent"}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop status pill filters */}
          <div className="hidden items-center gap-2 lg:flex">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setStatus(filter.value);
                  setPage(0);
                }}
                className={`rounded-full border px-4 py-2 text-sm transition font-medium ${
                  status === filter.value
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setExportDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            <Download className="size-3.5 text-muted-foreground" />
            Export
          </button>

          <ColumnPicker state={cols} buttonClassName="bg-card border-border" />
        </div>
      </div>

      {/* Table Container - Scrollable area */}
      <div className="mt-6 max-h-[calc(100dvh-15rem)] overflow-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className={`w-full min-w-[720px] text-left text-sm ${cols.tableClassName}`}>
          <thead className="sticky top-0 z-10 bg-card border-b border-border shadow-2xs text-xs sm:text-sm font-bold text-foreground">
            <tr>
              {!cols.isHidden("business") && <th className="px-6 py-4 bg-card first:rounded-tl-2xl">Business</th>}
              {!cols.isHidden("category") && <th className="px-6 py-4 bg-card">Category</th>}
              {!cols.isHidden("status") && <th className="px-6 py-4 bg-card">Status</th>}
              {!cols.isHidden("storefront") && <th className="px-6 py-4 bg-card">Storefront</th>}
              {!cols.isHidden("features") && <th className="px-6 py-4 bg-card">Features</th>}
              {!cols.isHidden("actions") && <th className="w-20 px-4 py-4 text-right bg-card last:rounded-tr-2xl">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && rows.length === 0 && <TableSkeletonRows />}

            {error && !isLoading && (
              <AdminApiErrorFallback
                error={error}
                colSpan={6}
                compact
                onRetry={loadMore}
              />
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No business matches this filter. Try clearing the search.
                </td>
              </tr>
            )}

            {rows.map((business) => (
              <tr key={business.id} className="hover:bg-accent/40 transition-colors">
                {!cols.isHidden("business") && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {business.logo || business.thumbnail ? (
                        <img
                          src={business.logo || business.thumbnail || ""}
                          alt={business.name}
                          className="h-12 w-12 min-w-[48px] min-h-[48px] shrink-0 rounded-2xl object-cover shadow-xs bg-muted"
                        />
                      ) : (
                        <div className="flex h-12 w-12 min-w-[48px] min-h-[48px] shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary text-base shadow-xs">
                          {business.name ? business.name.charAt(0).toUpperCase() : "B"}
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/businesses/${business.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {business.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground font-mono mt-0.5">
                          /{business.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                )}

                {!cols.isHidden("category") && (
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {business.category?.name ?? "—"}
                  </td>
                )}

                {!cols.isHidden("status") && (
                  <td className="px-6 py-4">
                    <StatusPill status={business.status} />
                  </td>
                )}

                {!cols.isHidden("storefront") && (
                  <td className="px-6 py-4">
                    <Flag
                      on={business.isListing && !business.isClosed}
                      onLabel="Listed"
                      offLabel="Hidden"
                    />
                  </td>
                )}

                {!cols.isHidden("features") && (
                  <td className="px-6 py-4">
                    <Flag
                      on={business.isEnabled}
                      onLabel="Enabled"
                      offLabel="Disabled"
                    />
                  </td>
                )}

                {!cols.isHidden("actions") && (
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Quick Inspect"
                        onClick={() => setInspectedBusiness(business)}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary"
                      >
                        <Eye className="size-4" />
                      </button>
                      <BusinessRowActions business={business} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Infinite Scroll Footer inside table scroll area */}
        <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-6 text-sm">
          {isFetching && !isLoading && (
            <span className="text-muted-foreground font-medium text-xs">
              Loading more businesses...
            </span>
          )}

          {!isFetching && hasMore && (
            <button
              type="button"
              onClick={loadMore}
              className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
            >
              Load more businesses
            </button>
          )}

          {data && rows.length > 0 && (
            <span className="text-muted-foreground text-xs">
              Showing {rows.length}
              {data.totalElements >= 0 ? ` of ${data.totalElements}` : ""} businesses
              {!hasMore && !isFetching ? " · End of list" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Inspect Slide-Over Drawer */}
      <BusinessInspectorDrawer
        business={inspectedBusiness}
        onClose={() => setInspectedBusiness(null)}
      />

      {/* Register Business Modal */}
      <CreateBusinessDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        subCategories={subCategories}
      />

      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        defaultType="businesses"
        businessData={rows}
      />
    </div>
  );
}
