"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, Send } from "lucide-react";
import { useGetBusinessChannelsQuery } from "@/features/businessManagement/businessAdminApi";
import type { BusinessChannelResponse } from "@/lib/types/adminTypes";

type Filter = "all" | "storefront" | "telegram" | "bakong" | "none";

const FILTERS: Array<{ label: string; value: Filter }> = [
  { label: "All", value: "all" },
  { label: "Storefront live", value: "storefront" },
  { label: "Telegram bot", value: "telegram" },
  { label: "KHQR ready", value: "bakong" },
  { label: "Nothing set up", value: "none" },
];

/** A small on/off marker. Muted when off so the eye skips it. */
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

  // The endpoint returns every shop at once, so filtering stays on the client
  // and the field responds without a round trip on each keystroke.
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
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link
          href="/dashboard"
          className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Dashboard
        </Link>
        <span className="px-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-neutral-900 dark:text-neutral-50">Channels</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
        Shop channels
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">
        What each shop has published and connected. Setup only, never their
        trading figures.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by shop, address or bot"
            aria-label="Search channels"
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-4 text-sm text-neutral-900 outline-none transition focus:border-green-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-green-500"
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
                  ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500 dark:text-neutral-950"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead className="bg-neutral-50 text-sm font-medium text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">Storefront</th>
                <th className="px-6 py-4">Telegram</th>
                <th className="px-6 py-4">KHQR</th>
                <th className="px-6 py-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-neutral-500 dark:text-neutral-400">
                    Loading channels...
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-red-600 dark:text-red-400">
                    {errorMessage(error)}
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-neutral-500 dark:text-neutral-400">
                    No shop matches this filter.
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr
                  key={row.businessId}
                  className="transition hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/businesses/${row.businessId}`}
                      className="font-medium text-neutral-900 hover:text-green-700 dark:text-neutral-50 dark:hover:text-green-400"
                    >
                      {row.businessName}
                    </Link>
                    <span className="block text-xs text-neutral-400 dark:text-neutral-500">
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
                        className="mt-1.5 flex items-center gap-1 text-xs text-green-700 hover:underline dark:text-green-400"
                      >
                        <ExternalLink className="size-3" aria-hidden />
                        <span className="max-w-56 truncate">{row.storefrontUrl}</span>
                      </a>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {row.telegramConnected ? (
                      <>
                        <Badge on={row.telegramActive} label={row.telegramActive ? "Active" : "Paused"} />
                        <span className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
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
                      <Badge on={row.bakongActive} label={row.bakongActive ? "Active" : "Configured"} />
                    ) : (
                      <Badge on={false} label="Not set up" />
                    )}
                  </td>

                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
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
