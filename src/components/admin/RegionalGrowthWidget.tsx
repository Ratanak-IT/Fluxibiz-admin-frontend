"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, MapPin, TrendingUp, X } from "lucide-react";
import { useGetBusinessesQuery } from "@/features/businessManagement/businessAdminApi";

export function RegionalGrowthWidget() {
  const { data: businessData, isLoading } = useGetBusinessesQuery({ page: 0, size: 200 });
  const [showAllModal, setShowAllModal] = useState(false);

  const businesses = businessData?.content ?? [];

  // Group strictly by real dynamic cityOrProvince from backend API response
  const cityStats = useMemo(() => {
    const counts: Record<string, number> = {};

    businesses.forEach((b) => {
      let city = (b.cityOrProvince || b.address || "Unspecified Region").trim();
      if (!city || city === "—") city = "Unspecified Region";

      // Normalize common city names
      const lower = city.toLowerCase();
      if (lower.includes("phnom penh")) city = "Phnom Penh";
      else if (lower.includes("siem reap")) city = "Siem Reap";
      else if (lower.includes("battambang")) city = "Battambang";
      else if (lower.includes("kampot")) city = "Kampot";
      else if (lower.includes("sihanouk") || lower.includes("kompong som")) city = "Sihanoukville";

      counts[city] = (counts[city] || 0) + 1;
    });

    const total = Math.max(1, businesses.length);
    const sorted = Object.entries(counts)
      .map(([city, count]) => ({
        city,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }, [businesses]);

  const top5Stats = useMemo(() => cityStats.slice(0, 5), [cityStats]);
  const maxCount = Math.max(...cityStats.map((s) => s.count), 1);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <Globe className="size-4 text-[#00932A]" />
            Regional Merchant Density & City Heatmap
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Top regional distribution grouped by real shop locations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="flex items-center gap-1 text-xs font-bold text-primary transition hover:underline"
        >
          <span>View More</span>
          <ArrowRight className="size-3" />
        </button>
      </div>

      {isLoading ? (
        <p className="mt-5 text-xs text-muted-foreground">Analyzing dynamic regional distribution...</p>
      ) : top5Stats.length === 0 ? (
        <p className="mt-5 text-xs text-muted-foreground">No registered merchant locations found.</p>
      ) : (
        <div className="mt-5 space-y-3.5">
          {top5Stats.map((item) => (
            <div key={item.city} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <MapPin className="size-3 text-primary" />
                  {item.city}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {item.count} shops ({item.percent}%)
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500"
                  style={{ width: `${Math.max(5, (item.count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Regional Breakdown Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAllModal(false)} />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Globe className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">All Regional Merchant Density</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 max-h-[400px] overflow-y-auto space-y-3.5 pr-1">
              {cityStats.map((item) => (
                <div key={item.city} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <MapPin className="size-3 text-primary" />
                      {item.city}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.count} shops ({item.percent}%)
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500"
                      style={{ width: `${Math.max(5, (item.count / maxCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Link
                href="/businesses"
                onClick={() => setShowAllModal(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Go to Business Directory
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
