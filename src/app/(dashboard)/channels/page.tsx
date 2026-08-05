"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, Send } from "lucide-react";
import {
  useGetBusinessChannelsQuery,
  useGetPlatformFeaturesQuery,
} from "@/features/businessManagement/businessAdminApi";
import type { BusinessChannelResponse } from "@/lib/types/adminTypes";

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
          ? "inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/70 dark:text-green-400"
          : "inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
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

export default function ChannelsPage() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 bg-[var(--background)] text-[var(--foreground)]">
  <nav aria-label="Breadcrumb" className="mb-5 text-sm">
    <Link
      href="/dashboard"
      className="text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
    >
      Dashboard
    </Link>
    <span className="px-2 text-[var(--muted-foreground)]">/</span>
    <span className="text-[var(--foreground)]">Channels</span>
  </nav>

  <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
    Shop channels
  </h1>
  <p className="mt-1.5 text-sm text-[var(--muted-foreground)] sm:text-[15px]">
    What each shop has published and connected. Setup only, never their
    trading figures.
  </p>

  <div className="mt-7 flex flex-wrap items-center gap-3">
    <div className="relative min-w-[260px] flex-1">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
        aria-hidden
      />
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Search by shop, address or bot"
        aria-label="Search channels"
        className="w-full rounded-full border border-[var(--input)] bg-[var(--card)] py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)]"
      />
    </div>

    <div className="flex flex-wrap gap-2">
      {FILTERS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setFilter(option.value)}
          className={[
            "rounded-full border px-4 py-2 text-sm transition",
            filter === option.value
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>

  <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left">
        <thead className="bg-[var(--muted)] text-sm font-medium text-[var(--muted-foreground)]">
          <tr>
            <th className="px-6 py-4">Shop</th>
            <th className="px-6 py-4">Storefront</th>
            <th className="px-6 py-4">Telegram</th>
            <th className="px-6 py-4">KHQR</th>
            <th className="px-6 py-4">Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] text-sm">
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center text-[var(--muted-foreground)]">
                Loading channels...
              </td>
            </tr>
          )}

          {error && !isLoading && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center text-[var(--destructive)]">
                {errorMessage(error)}
              </td>
            </tr>
          )}

          {!isLoading && !error && rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center text-[var(--muted-foreground)]">
                No shop matches this filter.
              </td>
            </tr>
          )}

          {rows.map((row) => (
            <tr
              key={row.businessId}
              className="transition hover:bg-[var(--accent)]"
            >
              <td className="px-6 py-4">
                <Link
                  href={`/businesses/${row.businessId}`}
                  className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                >
                  {row.businessName}
                </Link>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  /{row.slug}
                </span>
              </td>

              <td className="px-6 py-4">
                <Badge on={row.storefrontPublished} label={row.storefrontPublished ? "Live" : "Not published"} />
                {row.storefrontUrl && (
                  <a
                    href={row.storefrontUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1.5 flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    <ExternalLink className="size-3" aria-hidden />
                    <span className="max-w-56 truncate">{row.storefrontUrl}</span>
                  </a>
                )}
              </td>

              <td className="px-6 py-4">
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
                    <span className="mt-1.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Send className="size-3" aria-hidden />
                      @{row.telegramBotUsername ?? "unknown"}
                    </span>
                  </>
                ) : (
                  <Badge on={false} label="No bot" />
                )}
              </td>

              <td className="px-6 py-4">
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

              <td className="px-6 py-4 text-[var(--muted-foreground)]">
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
