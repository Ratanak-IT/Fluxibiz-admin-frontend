"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Search, Send, SlidersHorizontal } from "lucide-react";
import {
  useGetBusinessChannelsQuery,
  useGetPlatformFeaturesQuery,
} from "@/features/businessManagement/businessAdminApi";
import type { BusinessChannelResponse } from "@/lib/types/adminTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";

type Filter = "all" | "storefront" | "telegram" | "bakong" | "none";

const FILTERS: Array<{ label: string; value: Filter }> = [
  { label: "All", value: "all" },
  { label: "Storefront live", value: "storefront" },
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
  { id: "shop", label: "Shop" },
  { id: "storefront", label: "Storefront" },
  { id: "telegram", label: "Telegram" },
  { id: "khqr", label: "KHQR" },
  { id: "registered", label: "Registered" },
];

export default function ChannelsPage() {
  const cols = useColumnVisibility("channels", COLUMNS);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
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

  const telegramOffPlatformWide = platformFeatures.some(
    (row) => row.feature === "TELEGRAM_BOT" && !row.enabled,
  );
  const bakongOffPlatformWide = platformFeatures.some(
    (row) => row.feature === "KHQR_PAYMENT" && !row.enabled,
  );

  const rows = useMemo(() => {
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

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 bg-background text-foreground">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link
          href="/dashboard"
          className="text-muted-foreground transition hover:text-foreground"
        >
          Dashboard
        </Link>
        <span className="px-2 text-muted-foreground">/</span>
        <span className="text-foreground">Channels</span>
      </nav>

      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
        Shop channels
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
        What each shop has published and connected. Setup only, never their
        trading figures.
      </p>

      <div className="mt-7 flex items-center gap-2 sm:gap-3 lg:flex-wrap lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by shop, address or bot"
            aria-label="Search channels"
            className="w-full rounded-full border border-border bg-primary-foreground py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary dark:bg-background"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile dropdown filter */}
          <div className="relative lg:hidden" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              className="flex items-center gap-2 rounded-full border border-border bg-primary-foreground py-2.5 px-4 text-sm text-foreground outline-none transition hover:bg-accent focus:border-primary dark:bg-background"
            >
              <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate">
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
                      setFilterOpen(false);
                    }}
                    className={`block w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                      filter === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-popover-foreground hover:bg-accent"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop pill filters */}
          <div className="hidden flex-wrap gap-2 lg:flex">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-full border bg-primary-foreground px-4 py-2 text-sm transition dark:bg-background ${
                  filter === option.value
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <ColumnPicker state={cols} buttonClassName="bg-primary-foreground dark:bg-background" />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${cols.tableClassName}`}
            style={{ minWidth: cols.minWidthRem(52) }}>
            <thead className="bg-muted text-sm font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Shop</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Storefront</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Telegram</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">KHQR</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground sm:px-6 sm:py-14">
                    Loading channels...
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-destructive sm:px-6 sm:py-14">
                    {errorMessage(error)}
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground sm:px-6 sm:py-14">
                    No shop matches this filter.
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr
                  key={row.businessId}
                  className="transition hover:bg-muted/60"
                >
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <Link
                      href={`/businesses/${row.businessId}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {row.businessName}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      /{row.slug}
                    </span>
                  </td>

                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <Badge on={row.storefrontPublished} label={row.storefrontPublished ? "Live" : "Not published"} />
                    {row.storefrontUrl && (
                      <a
                        href={row.storefrontUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-1.5 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" aria-hidden />
                        <span className="max-w-56 truncate">{row.storefrontUrl}</span>
                      </a>
                    )}
                  </td>

                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    {row.telegramConnected ? (
                      <>
                        <Badge
                          on={row.telegramActive && !telegramOffPlatformWide}
                          label={
                            telegramOffPlatformWide
                              ? "Off (platform-wide)"
                              : row.telegramActive
                                ? "Active"
                                : "Paused"
                          }
                        />
                        <span className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Send className="size-3" aria-hidden />
                          @{row.telegramBotUsername ?? "unknown"}
                        </span>
                      </>
                    ) : (
                      <Badge on={false} label="No bot" />
                    )}
                  </td>

                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    {row.bakongConfigured ? (
                      <Badge
                        on={row.bakongActive && !bakongOffPlatformWide}
                        label={
                          bakongOffPlatformWide
                            ? "Off (platform-wide)"
                            : row.bakongActive
                              ? "Active"
                              : "Configured"
                        }
                      />
                    ) : (
                      <Badge on={false} label="Not set up" />
                    )}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground sm:px-6 sm:py-4">
                    {row.registeredAt ? row.registeredAt.slice(0, 10) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
