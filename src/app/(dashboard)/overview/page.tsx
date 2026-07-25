"use client";

import Link from "next/link";
import { useGetPlatformDashboardQuery } from "@/features/businessManagement/businessAdminApi";
import type {
  CategoryCountResponse,
  MonthlyCountResponse,
} from "@/lib/types/adminTypes";

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
      ? "text-green-700"
      : accent === "amber"
        ? "text-amber-700"
        : "text-neutral-900";

  const card = (
    <div className="rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-300">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-2 text-4xl font-semibold tabular-nums ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

/**
 * A plain SVG column chart. The project has no charting library, and a bar
 * chart of a dozen months does not justify adding one.
 */
function GrowthChart({ data }: { data: MonthlyCountResponse[] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-sm text-neutral-500">No sign ups recorded in this window yet.</p>;
  }

  const max = Math.max(...data.map((point) => point.count), 1);

  return (
    <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-2">
      {data.map((point) => {
        const heightPercent = (point.count / max) * 100;

        return (
          <div key={point.month} className="flex min-w-12 flex-1 flex-col items-center gap-2">
            <span className="text-xs tabular-nums text-neutral-500">{point.count}</span>
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-green-700 to-green-400"
                style={{ height: `${Math.max(heightPercent, 3)}%` }}
                role="img"
                aria-label={`${point.count} in ${point.month}`}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-neutral-400">{point.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBreakdown({ data }: { data: CategoryCountResponse[] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-sm text-neutral-500">No business has picked a category yet.</p>;
  }

  const max = Math.max(...data.map((row) => row.businessCount), 1);

  return (
    <ul className="mt-5 space-y-4">
      {data.map((row) => (
        <li key={row.categoryName}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-neutral-700">{row.categoryName || "Uncategorised"}</span>
            <span className="tabular-nums text-neutral-500">{row.businessCount}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-green-600"
              style={{ width: `${(row.businessCount / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function OverviewPage() {
  const { data, isLoading, error } = useGetPlatformDashboardQuery();

  return (
    <main className="px-8 py-7">
      <nav className="mb-6 text-[15px] text-neutral-400">
        <Link href="/dashboard" className="hover:text-neutral-600">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <span className="text-neutral-700">Overview</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 ">Platform overview</h1>
      <p className="mt-1 text-[15px] text-neutral-500">
        How many shops are on the platform, and how that is changing.
      </p>

      {isLoading && <p className="mt-8 text-sm text-neutral-500">Loading metrics...</p>}

      {error && (
        <p className="mt-8 text-sm text-red-600">
          Request failed{"status" in error ? ` with status ${error.status}` : ""}.
        </p>
      )}

      {data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <StatCard
              label="Active"
              value={data.activeBusinesses}
              hint="Trading normally"
              accent="green"
            />
            <StatCard
              label="Suspended"
              value={data.suspendedBusinesses}
              hint="Blocked by an administrator"
              accent="amber"
            />
            <StatCard
              label="Closed"
              value={data.closedBusinesses}
              hint="Shop is shut but the account remains"
            />
            <StatCard
              label="Deleted"
              value={data.deletedBusinesses}
              hint="Marked deleted, data retained"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-3">
              <h2 className="text-sm font-semibold text-neutral-900">Sign ups by month</h2>
              <p className="mt-1 text-xs text-neutral-400">
                New businesses registered in each of the last months.
              </p>
              <GrowthChart data={data.businessGrowth} />
            </section>

            <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-2">
              <h2 className="text-sm font-semibold text-neutral-900">By category</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Which kinds of business are choosing the platform.
              </p>
              <CategoryBreakdown data={data.businessesByCategory} />
            </section>
          </div>
        </>
      )}
    </main>
  );
}