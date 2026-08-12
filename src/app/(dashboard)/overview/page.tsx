"use client";

import Link from "next/link";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useGetPlatformDashboardQuery } from "@/features/businessManagement/businessAdminApi";
import type {
  CategoryCountResponse,
  TrendCountResponse,
  ActiveBusinessResponse,
} from "@/lib/types/adminTypes";

function trendLabel(point: TrendCountResponse) {
  return point.day ?? point.date ?? point.month ?? "";
}

function formatTrendLabel(value: unknown) {
  const label = String(value);
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(label);

  if (dayMatch) {
    return `${dayMatch[2]}-${dayMatch[3]}`;
  }

  return label;
}

function StatCard({
  label,
  value,
  hint,
  href,
  accent,
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
   <div className="rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-300 dark:border-border dark:bg-card dark:hover:border-muted">
  <p className="text-sm text-neutral-500 dark:text-muted-foreground">{label}</p>
  <p className={`mt-2 text-3xl font-semibold tabular-nums sm:text-4xl ${tone}`}>{value}</p>
  {hint && <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">{hint}</p>}
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

  const chartConfig = {
    value: {
      label: "Count",
      color: "var(--brand)",
    },
  } satisfies ChartConfig;

  return (
   <div className="mt-6 overflow-x-auto ">
  <ChartContainer
    config={chartConfig}
    className="min-h-50 min-w-[28rem] w-full"
  >
    <RechartsBarChart accessibilityLayer data={data}>
      <CartesianGrid 
        vertical={false} 
        stroke="var(--border)" 
      />
      <XAxis
        dataKey="label"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        minTickGap={12}
        tickFormatter={formatTrendLabel}
        tick={{ fill: "var(--muted-foreground)" }}
      />
      <ChartTooltip
        cursor={false}
        content={
          <ChartTooltipContent
            labelFormatter={formatTrendLabel}
            className="bg-popover border-border text-popover-foreground"
          />
        }
      />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar 
        dataKey="value" 
        fill="var(--primary)" 
        radius={4} 
        maxBarSize={56} 
      />
    </RechartsBarChart>
  </ChartContainer>
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
        <span className="text-foreground">
          {row.categoryName || "Uncategorised"}
        </span>

        <span className="tabular-nums text-muted-foreground">
          {row.businessCount}
        </span>
      </div>

      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
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
   <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 bg-[var(--background)] text-[var(--foreground)]">


  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-foreground">
    Platform overview
  </h1>
  <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-muted-foreground">
    How many shops are on the platform, how busy they are, and how that is changing.
  </p>

  {isLoading && (
    <p className="mt-8 text-sm text-neutral-500 dark:text-muted-foreground">Loading metrics...</p>
  )}

  {error && (
    <p className="mt-8 text-sm text-red-600 dark:text-destructive">
      Request failed{"status" in error ? ` with status ${error.status}` : ""}.
    </p>
  )}

  {data && (
    <>
      <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[var(--muted-foreground)]">
        Activity, last 30 days
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <h2 className="mt-10 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">
        Businesses
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

   <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-3 dark:border-border dark:bg-card dark:text-card-foreground">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground">
            Orders by day
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Sales completed across the platform each day.
          </p>
          <BarChart
            data={(data.orderTrend ?? []).map((point: TrendCountResponse) => ({
              label: trendLabel(point),
              value: point.count,
            }))}
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-2 dark:border-border dark:bg-card dark:text-card-foreground">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground">
            Busiest shops
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Most orders in the last 30 days.
          </p>
          <MostActiveBusinesses data={data.mostActiveBusinesses ?? []} />
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-3 dark:border-border dark:bg-card dark:text-card-foreground">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground">
            Sign ups by day
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            New businesses registered each day.
          </p>
          <BarChart
            data={(data.businessGrowth ?? []).map((point: TrendCountResponse) => ({
              label: trendLabel(point),
              value: point.count,
            }))}
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-2 dark:border-border dark:bg-card dark:text-card-foreground">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground">
            By category
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
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
