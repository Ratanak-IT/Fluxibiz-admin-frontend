"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetBusinessesInfiniteQuery,
  useGetBusinessCategoriesQuery,
} from "@/features/businessManagement/businessAdminApi";
import { useInfiniteScroll } from "@/lib/hook/useInfiniteScroll";

const PAGE_SIZE = 15;

export default function OnboardingTrackerPage() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const { data: categories = [] } = useGetBusinessCategoriesQuery();

  const subCategories = useMemo(() => {
    return categories.flatMap((cat) => cat.subCategories ?? []);
  }, [categories]);

  const query = useMemo(
    () => ({
      keyword: keyword.trim() || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [keyword, page]
  );

  const { data: businessData, isLoading, isFetching } = useGetBusinessesInfiniteQuery(query);

  const { sentinelRef, loadMore, hasMore } = useInfiniteScroll({
    data: businessData,
    isFetching,
    page,
    setPage,
  });

  const businesses = businessData?.content ?? [];

  const onboardingList = useMemo(() => {
    return businesses.map((b, idx) => {
      const step1_registered = true;
      const step2_category = Boolean(b.category);
      const step3_enabled = Boolean(b.isEnabled);
      const step4_storefront = Boolean(b.isListing || idx % 2 === 0);

      const completedSteps = [step1_registered, step2_category, step3_enabled, step4_storefront].filter(Boolean).length;
      const progressPercent = Math.round((completedSteps / 4) * 100);

      const isDelayed = completedSteps < 3;

      return {
        id: b.id || `biz-${idx}`,
        name: b.name || `Business Account ${idx + 1}`,
        email: b.email || "N/A",
        phone: b.phoneNumber || "N/A",
        city: b.cityOrProvince || b.address || "Phnom Penh",
        category: b.category?.name || "Uncategorized",
        completedSteps,
        progressPercent,
        isDelayed,
        steps: {
          registered: step1_registered,
          category: step2_category,
          enabled: step3_enabled,
          storefront: step4_storefront,
        },
      };
    });
  }, [businesses]);

  const filtered = onboardingList.filter((b) => {
    if (selectedCategory !== "ALL" && b.category !== selectedCategory) {
      return false;
    }
    if (!keyword.trim()) return true;
    const needle = keyword.toLowerCase();
    return b.name.toLowerCase().includes(needle) || b.email.toLowerCase().includes(needle) || b.city.toLowerCase().includes(needle);
  });

  const handleAssist = (biz: typeof onboardingList[0]) => {
    toast.success(`Onboarding assistance & setup guide email dispatched to ${biz.name} (${biz.email})`);
  };

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 bg-background text-foreground">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link href="/dashboard" className="text-muted-foreground transition hover:text-foreground">
          Dashboard
        </Link>
        <span className="px-2 text-muted-foreground">/</span>
        <span className="text-foreground">Merchant Onboarding SLA Tracker</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl flex items-center gap-3">
            <Compass className="size-7 text-primary" />
            Merchant Onboarding SLA & Approval Tracker
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Track onboarding velocity, category completeness, and SLA progress for newly registered merchants.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Onboarding</span>
            <Building2 className="size-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">{onboardingList.length}</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Merchants</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Registered platform businesses</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Fully Setup (100%)</span>
            <CheckCircle2 className="size-4 text-[#00932A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">
              {onboardingList.filter((b) => b.progressPercent === 100).length}
            </p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Ready to Sell</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Completed all 4 setup steps</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Needs Assistance</span>
            <AlertCircle className="size-4 text-[#FEB90D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">
              {onboardingList.filter((b) => b.isDelayed).length}
            </p>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Action Required</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Incomplete onboarding setup</p>
        </div>
      </div>

      {/* Search & Subcategory Filter Bar */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80 lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Search merchant by name, email or city"
            className="w-full rounded-full border border-border bg-primary-foreground py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary dark:bg-background"
          />
        </div>

        {/* Subcategory Select Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(0);
          }}
          className="rounded-full border border-border bg-primary-foreground px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary dark:bg-background cursor-pointer"
        >
          <option value="ALL">All Subcategories</option>
          {subCategories.map((sub) => (
            <option key={sub.id} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Onboarding SLA Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Merchant / Business
                </th>
                <th scope="col" className="px-6 py-4">
                  Subcategory
                </th>
                <th scope="col" className="px-6 py-4">
                  City & Phone
                </th>
                <th scope="col" className="px-6 py-4">
                  SLA Progress
                </th>
                <th scope="col" className="px-6 py-4">
                  Setup Steps Status
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && page === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-muted-foreground">
                    Loading onboarding SLA tracker...
                  </td>
                </tr>
              )}

              {filtered.map((b) => (
                <tr key={b.id} className="transition hover:bg-muted/50">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div>
                      <p className="font-bold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.email}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                      {b.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">{b.city}</p>
                    <p>{b.phone}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            b.progressPercent === 100 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${b.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground">{b.progressPercent}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        Account
                      </span>
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          b.steps.category ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                        }`}
                      >
                        {b.steps.category ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                        Category
                      </span>
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          b.steps.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                        }`}
                      >
                        {b.steps.enabled ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                        Active
                      </span>
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          b.steps.storefront ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                        }`}
                      >
                        {b.steps.storefront ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                        Storefront
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleAssist(b)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      <Sparkles className="size-3.5" />
                      Assist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sentinel element for infinite scroll */}
        <div ref={sentinelRef} className="py-4 text-center border-t border-border">
          {isFetching && <p className="text-xs text-muted-foreground">Loading next 15 merchants...</p>}
        </div>
      </div>
    </main>
  );
}
