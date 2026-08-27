"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, ExternalLink, Search, Send } from "lucide-react";
import {
  useGetBusinessChannelsQuery,
  useGetPlatformFeaturesQuery,
  useGetBusinessesQuery,
} from "@/features/businessManagement/businessAdminApi";
import { Flag } from "@/components/admin/StatusPill";
import type { BusinessChannelResponse } from "@/lib/types/adminTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";

type Filter = "all" | "storefront" | "telegram" | "bakong" | "none";

const FILTERS: Array<{ label: string; value: Filter }> = [
  { label: "All", value: "all" },
  { label: "Store Menu live", value: "storefront" },
  { label: "Telegram bot", value: "telegram" },
  { label: "KHQR ready", value: "bakong" },
  { label: "Nothing set up", value: "none" },
];

function Badge({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={
        on
          ? "inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary "
          : "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
      }
    >
      {label}
    </span>
  );
}

function matches(row: BusinessChannelResponse, filter: Filter): boolean {
  if (filter === "storefront") return row.storefrontPublished;
  if (filter === "telegram") return row.telegramConnected;
  if (filter === "bakong") return row.bakongConfigured;
  if (filter === "none") {
    return !row.storefrontPublished && !row.telegramConnected && !row.bakongConfigured;
  }
  return true;
}

function errorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Request failed.";
  const status = "status" in error ? error.status : undefined;
  if (status === 403) return "Your account cannot view shop channels.";
  return status ? `Request failed with status ${status}.` : "Request failed.";
}

const COLUMNS: ColumnDef[] = [
  { id: "shop", label: "Shop", locked: true },
  { id: "storefront", label: "Store Menu" },
  { id: "telegram", label: "Telegram" },
  { id: "khqr", label: "KHQR" },
  { id: "registered", label: "Registered" },
];

const PAGE_SIZE = 10;

export default function ChannelsPage() {
  const cols = useColumnVisibility("channels", COLUMNS);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: channels = [], isLoading, error } = useGetBusinessChannelsQuery();
  const { data: platformFeatures = [] } = useGetPlatformFeaturesQuery();
  const { data: businessData } = useGetBusinessesQuery({ size: 200 });

  const businessLogoMap = useMemo(() => {
    const map: Record<string, { logo?: string | null; thumbnail?: string | null }> = {};
    if (businessData?.content) {
      businessData.content.forEach((b) => {
        map[b.id] = { logo: b.logo, thumbnail: b.thumbnail };
      });
    }
    return map;
  }, [businessData]);

  const telegramOffPlatformWide = platformFeatures.some(
    (row) => row.feature === "TELEGRAM_BOT" && !row.enabled,
  );
  const bakongOffPlatformWide = platformFeatures.some(
    (row) => row.feature === "KHQR_PAYMENT" && !row.enabled,
  );

  const filteredRows = useMemo(() => {
    const needle = keyword.trim().toLowerCase();

    return channels.filter((row) => {
      if (!matches(row, filter)) return false;
      if (!needle) return true;

      return (
        row.businessName.toLowerCase().includes(needle) ||
        row.slug.toLowerCase().includes(needle) ||
        (row.telegramBotUsername ?? "").toLowerCase().includes(needle)
      );
    });
  }, [channels, keyword, filter]);

  useEffect(() => {
    setPage(1);
  }, [keyword, filter]);

  const visibleCount = page * PAGE_SIZE;
  const rows = useMemo(() => {
    return filteredRows.slice(0, visibleCount);
  }, [filteredRows, visibleCount]);

  const hasMore = visibleCount < filteredRows.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="w-full pt-2">

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
        <Building2 className="h-7 w-7 text-primary" />
        Shop Channels
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
        What each shop has published and connected. Setup only, never their
        trading figures.
      </p>

      <div className="mt-7 flex flex-row items-center justify-between gap-3 flex-nowrap">
        <div className="relative min-w-[200px] flex-1 max-w-sm shrink-0 sm:shrink">
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
            placeholder="Search by shop, address or bot..."
            aria-label="Search channels"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          <div className="relative sm:hidden" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition hover:bg-accent focus:border-primary whitespace-nowrap"
            >
              <span className="truncate max-w-[120px]">
                {FILTERS.find((option) => option.value === filter)?.label}
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${filterOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {filterOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-20 mt-2 min-w-[160px] overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
              >
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={filter === option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setPage(0);
                      setFilterOpen(false);
                    }}
                    className={`block w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                      filter === option.value
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 overflow-x-auto pb-1 sm:flex flex-nowrap">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilter(option.value);
                  setPage(0);
                }}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition whitespace-nowrap ${
                  filter === option.value
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <ColumnPicker state={cols} buttonClassName="bg-card border-border whitespace-nowrap" />
        </div>
      </div>

      <div className="mt-6 max-h-[calc(100dvh-15rem)] overflow-auto rounded-2xl border border-border bg-card shadow-xs">
        <table
          className={`w-full text-left text-sm ${cols.tableClassName}`}
          style={{ minWidth: cols.minWidthRem(52) }}
        >
          <thead className="sticky top-0 z-10 bg-card border-b border-border shadow-2xs text-xs sm:text-sm font-bold text-foreground">
            <tr>
              {!cols.isHidden("shop") && <th className="px-6 py-4 bg-card first:rounded-tl-2xl">Shop</th>}
              {!cols.isHidden("storefront") && (
                <th className="bg-card p-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("storefront");
                      setPage(0);
                    }}
                    className={`w-full px-6 py-4 text-left transition hover:text-primary ${filter === "storefront" ? "text-primary" : ""}`}
                  >
                    Store Menu
                  </button>
                </th>
              )}
              {!cols.isHidden("telegram") && (
                <th className="bg-card p-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("telegram");
                      setPage(0);
                    }}
                    className={`w-full px-6 py-4 text-left transition hover:text-primary ${filter === "telegram" ? "text-primary" : ""}`}
                  >
                    Telegram
                  </button>
                </th>
              )}
              {!cols.isHidden("khqr") && (
                <th className="bg-card p-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("bakong");
                      setPage(0);
                    }}
                    className={`w-full px-6 py-4 text-left transition hover:text-primary ${filter === "bakong" ? "text-primary" : ""}`}
                  >
                    KHQR
                  </button>
                </th>
              )}
              {!cols.isHidden("registered") && <th className="px-6 py-4 bg-card last:rounded-tr-2xl">Registered</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {isLoading && (
              <AdminLoadingState label="Loading sales channels..." compact colSpan={5} />
            )}

            {error && !isLoading && (
              <AdminApiErrorFallback error={error} compact colSpan={5} />
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground sm:py-14">
                  No shop matches this filter.
                </td>
              </tr>
            )}

            {rows.map((row) => {
              const logoUrl =
                row.logo ||
                row.thumbnail ||
                businessLogoMap[row.businessId]?.logo ||
                businessLogoMap[row.businessId]?.thumbnail;

              return (
                <tr
                  key={row.businessId}
                  className="transition hover:bg-accent/40"
                >
                  {!cols.isHidden("shop") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={row.businessName}
                            className="h-12 w-12 min-w-[48px] min-h-[48px] shrink-0 rounded-2xl object-cover shadow-xs bg-muted"
                          />
                        ) : (
                          <div className="flex h-12 w-12 min-w-[48px] min-h-[48px] shrink-0 items-center justify-center rounded-2xl bg-muted font-bold text-foreground text-lg shadow-xs">
                            {row.businessName ? row.businessName.charAt(0).toUpperCase() : "S"}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/businesses/${row.businessId}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {row.businessName}
                          </Link>
                          <span className="block text-xs text-muted-foreground font-mono">
                            /{row.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}

                  {!cols.isHidden("storefront") && (
                    <td className="px-6 py-4">
                      <Flag
                        on={row.storefrontPublished}
                        onLabel="Live"
                        offLabel="Not published"
                      />
                      {row.storefrontUrl && (
                        <a
                          href={row.storefrontUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="size-3" aria-hidden />
                          <span className="max-w-56 truncate">{row.storefrontUrl}</span>
                        </a>
                      )}
                    </td>
                  )}

                  {!cols.isHidden("telegram") && (
                    <td className="px-6 py-4">
                      {row.telegramConnected ? (
                        <>
                          <Flag
                            on={row.telegramActive && !telegramOffPlatformWide}
                            onLabel={
                              telegramOffPlatformWide
                                ? "Off (platform-wide)"
                                : row.telegramActive
                                  ? "Active"
                                  : "Paused"
                            }
                            offLabel="Off (platform-wide)"
                          />
                          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                            <Send className="size-3" aria-hidden />
                            @{row.telegramBotUsername ?? "unknown"}
                          </span>
                        </>
                      ) : (
                        <Flag on={false} onLabel="" offLabel="No bot" />
                      )}
                    </td>
                  )}

                  {!cols.isHidden("khqr") && (
                    <td className="px-6 py-4">
                      {row.bakongConfigured ? (
                        <Flag
                          on={row.bakongActive && !bakongOffPlatformWide}
                          onLabel={
                            bakongOffPlatformWide
                              ? "Off (platform-wide)"
                              : row.bakongActive
                                ? "Active"
                                : "Configured"
                          }
                          offLabel="Off (platform-wide)"
                        />
                      ) : (
                        <Flag on={false} onLabel="" offLabel="Not set up" />
                      )}
                    </td>
                  )}

                  {!cols.isHidden("registered") && (
                    <td className="px-6 py-4 text-muted-foreground">
                      {row.registeredAt ? row.registeredAt.slice(0, 10) : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          ref={sentinelRef}
          className="flex flex-col items-center gap-3 py-6 text-sm"
        >
          {hasMore && (
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-full border border-border px-5 py-2 text-foreground transition hover:bg-accent hover:text-accent-foreground font-medium"
            >
              Load more ({rows.length} of {filteredRows.length})
            </button>
          )}

          {!hasMore && rows.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Showing all {rows.length} shop channels
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
