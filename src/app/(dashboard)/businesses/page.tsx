"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useGetBusinessesQuery } from "@/features/businessManagement/businessAdminApi";
import { BusinessRowActions } from "@/components/admin/BusinessRowActions";
import { Flag, StatusPill } from "@/components/admin/StatusPill";
import type { BusinessOwnerStatus } from "@/lib/types/adminTypes";

const STATUS_FILTERS: Array<{ label: string; value: BusinessOwnerStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Deleted", value: "DELETED" },
];

const PAGE_SIZE = 10;

export default function BusinessesPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<BusinessOwnerStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const query = useMemo(
    () => ({
      keyword: keyword.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      page,
      size: PAGE_SIZE,
    }),
    [keyword, status, page],
  );

  const { data, isLoading, isFetching, error } = useGetBusinessesQuery(query);
  const rows = data?.content ?? [];

  return (
    <main className="px-8 py-7">
      <nav className="mb-6 text-[15px] text-neutral-400">
        <Link href="/dashboard" className="hover:text-neutral-600">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <span className="text-neutral-700">Businesses</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900">Businesses</h1>
      <p className="mt-1 text-[15px] text-neutral-500">
        Every shop registered on the platform, and the controls to moderate them.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(0);
            }}
            placeholder="Search by name, city or description"
            className="w-full rounded-full border border-neutral-200 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-neutral-400" aria-hidden />
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(0);
              }}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                status === filter.value
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-visible rounded-2xl border border-neutral-200">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-sm font-semibold text-neutral-800">
            <tr>
              <th className="px-6 py-4">Business</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Storefront</th>
              <th className="px-6 py-4">Features</th>
              <th className="w-14 px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                  Loading businesses...
                </td>
              </tr>
            )}

            {error && !isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-red-600">
                  Could not load businesses. Check that your session still has the SUPER_ADMIN role.
                </td>
              </tr>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                  No business matches this filter. Try clearing the search.
                </td>
              </tr>
            )}

            {rows.map((business) => (
              <tr key={business.id} className="hover:bg-neutral-50/60">
                <td className="px-6 py-4">
                  <Link
                    href={`/businesses/${business.id}`}
                    className="font-medium text-neutral-900 hover:text-green-700"
                  >
                    {business.name}
                  </Link>
                  <span className="block text-xs text-neutral-400">/{business.slug}</span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {business.category?.name ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {business.cityOrProvince ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={business.status} />
                </td>
                <td className="px-6 py-4">
                  <Flag on={business.isListing && !business.isClosed} onLabel="Listed" offLabel="Hidden" />
                </td>
                <td className="px-6 py-4">
                  <Flag on={business.isEnabled} onLabel="Enabled" offLabel="Disabled" />
                </td>
                <td className="px-4 py-4">
                  <BusinessRowActions business={business} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-neutral-600">
          <span>
            Page {data.number + 1} of {data.totalPages} · {data.totalElements} businesses
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={data.number === 0 || isFetching}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded-full border border-neutral-200 px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={data.number + 1 >= data.totalPages || isFetching}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-full border border-neutral-200 px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}