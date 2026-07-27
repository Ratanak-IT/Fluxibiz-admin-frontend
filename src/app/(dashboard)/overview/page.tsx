"use client";

import Link from "next/link";
import { useGetPlatformDashboardQuery } from "@/features/businessManagement/businessAdminApi";
import type {
  CategoryCountResponse,
  MonthlyCountResponse,
  ActiveBusinessResponse,
} from "@/lib/types/adminTypes";

function StatCard({
  label,
  value,
  hint,
  href,
  accent,
  money,
}: {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  accent?: "green" | "amber" | "neutral";
}) {
  const tone =
    accent === "green"
      ? "text-green-700 dark:text-green-400"
      : accent === "amber"
        ? "text-amber-700 dark:text-amber-400"
        : "text-neutral-900 dark:text-neutral-50";

  const card = (
    <div className="rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums sm:text-4xl ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (data.length === 0) {
    return (
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        Nothing recorded in this window yet.
      </p>
    );
  }

  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-2">
      {data.map((point) => {
        const heightPercent = (point.value / max) * 100;

        return (
          <div key={point.label} className="flex min-w-14 flex-1 flex-col items-center gap-2">
            <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
              {point.value}
            </span>
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-green-700 to-green-400 dark:from-green-600 dark:to-green-500"
                style={{ height: `${Math.max(heightPercent, 3)}%` }}
                role="img"
                aria-label={`${point.value} in ${point.label}`}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-500">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBreakdown({ data }: { data: CategoryCountResponse[] }) {
  if (data.length === 0) {
    return (
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        No business has picked a category yet.
      </p>
    );
  }

  const max = Math.max(...data.map((row) => row.businessCount), 1);

  return (
    <ul className="mt-5 space-y-4">
      {data.map((row) => (
        <li key={row.categoryName}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">
              {row.categoryName || "Uncategorised"}
            </span>
            <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
              {row.businessCount}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-green-600 dark:bg-green-500"
              style={{ width: `${(row.businessCount / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MostActiveBusinesses({ data }: { data: ActiveBusinessResponse[] }) {
  if (data.length === 0) {
    return (
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        No shop has made a sale in the last 30 days.
      </p>
    );
  }

  return (
    <ol className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
      {data.map((row, index) => (
        <li key={row.businessId} className="flex items-center gap-3 py-3">
          <span className="w-5 shrink-0 text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
            {index + 1}
          </span>
          <Link
            href={`/businesses/${row.businessId}`}
            className="min-w-0 flex-1 truncate text-sm text-neutral-900 hover:text-green-700 dark:text-neutral-50 dark:hover:text-green-400"
          >
            {row.businessName}
          </Link>
          <span className="shrink-0 text-right text-sm tabular-nums text-neutral-900 dark:text-neutral-50">
            {row.orders} order{row.orders === 1 ? "" : "s"}
            <span className="block text-xs text-neutral-400 dark:text-neutral-500">
              {row.itemsSold} item{row.itemsSold === 1 ? "" : "s"}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function OverviewPage() {
  const { data, isLoading, error } = useGetPlatformDashboardQuery();

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
        <span className="text-neutral-900 dark:text-neutral-50">Overview</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
        Platform overview
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">
        How many shops are on the platform, how busy they are, and how that is changing.
      </p>

      {isLoading && (
        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">Loading metrics...</p>
      )}

      {error && (
        <p className="mt-8 text-sm text-red-600 dark:text-red-400">
          Request failed{"status" in error ? ` with status ${error.status}` : ""}.
        </p>
      )}

      {data && (
        <>
          <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Activity, last 30 days
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Orders completed"
              value={data.ordersPaidLast30Days}
              hint="Sales finished across every shop"
              accent="green"
            />
            <StatCard
              label="Shops trading"
              value={data.tradingBusinessesLast30Days}
              hint="Sold at least once"
              accent="green"
            />
            <StatCard
              label="Storefronts live"
              value={data.storefrontsPublished}
              hint="Published to the public directory"
              href="/channels"
            />
            <StatCard
              label="Telegram bots"
              value={data.telegramBotsConnected}
              hint="Connected and active"
              href="/channels"
            />
          </div>

          <h2 className="mt-10 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Businesses
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total businesses"
              value={data.totalBusinesses}
              hint="Every shop ever registered"
              href="/businesses"
            />
            <StatCard
              label="New in last 30 days"
              value={data.newBusinessesLast30Days}
              hint="Sign ups this month"
              accent="green"
            />
            <StatCard label="Active" value={data.activeBusinesses} hint="Trading normally" accent="green" />
            <StatCard
              label="Suspended"
              value={data.suspendedBusinesses}
              hint="Blocked by an administrator"
              accent="amber"
            />
            <StatCard label="Closed" value={data.closedBusinesses} hint="Shut but the account remains" />
            <StatCard label="Deleted" value={data.deletedBusinesses} hint="Marked deleted, data retained" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-3 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Orders by month
              </h2>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Sales completed across the platform in each of the last months.
              </p>
              <BarChart
                data={(data.orderTrend ?? []).map((point: MonthlyCountResponse) => ({
                  label: point.month,
                  value: point.count,
                }))}
              />
            </section>

            <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-2 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Busiest shops
              </h2>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Most orders in the last 30 days.
              </p>
              <MostActiveBusinesses data={data.mostActiveBusinesses ?? []} />
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-3 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Sign ups by month
              </h2>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                New businesses registered in each of the last months.
              </p>
              <BarChart
                data={(data.businessGrowth ?? []).map((point: MonthlyCountResponse) => ({
                  label: point.month,
                  value: point.count,
                }))}
              />
            </section>

            <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-2 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                By category
              </h2>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Which kinds of business are choosing the platform.
              </p>
              <CategoryBreakdown data={data.businessesByCategory ?? []} />
            </section>
          </div>
        </>
      )}
    </main>
  );
}
