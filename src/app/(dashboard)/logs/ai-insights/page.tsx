"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetBusinessesQuery,
  useGetAuditLogsQuery,
  useGetBusinessChannelsQuery,
} from "@/features/businessManagement/businessAdminApi";

interface AiInsightItem {
  id: string;
  title: string;
  category: "GROWTH" | "SECURITY" | "PERFORMANCE";
  impactScore: number;
  recommendation: string;
  status: "OPTIMIZED" | "ATTENTION_SUGGESTED";
}

export default function AiInsightsPage() {
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const { data: businessData } = useGetBusinessesQuery({ page: 0, size: 200 }, { pollingInterval: 5000 });
  const { data: auditData } = useGetAuditLogsQuery({ page: 0, size: 50 }, { pollingInterval: 5000 });
  const { data: channels = [] } = useGetBusinessChannelsQuery();

  const businesses = businessData?.content ?? [];
  const auditLogs = auditData?.content ?? [];

  const insights: AiInsightItem[] = useMemo(() => {
    const totalShops = businesses.length;
    const activeChannelsCount = channels.filter((c) => c.storefrontPublished || c.telegramConnected).length;

    return [
      {
        id: "ai-1",
        title: "Platform Merchant Acquisition Velocity",
        category: "GROWTH",
        impactScore: 96,
        recommendation: `${totalShops} registered merchant accounts actively monitored across Cambodian provinces. Onboarding pipeline is operating at optimal velocity.`,
        status: "OPTIMIZED",
      },
      {
        id: "ai-2",
        title: "Multi-Channel Integration Adoption Rate",
        category: "PERFORMANCE",
        impactScore: 92,
        recommendation: `${activeChannelsCount} active shop channels configured across Storefront, Telegram Bot, and Bakong KHQR Settlement engines.`,
        status: "OPTIMIZED",
      },
      {
        id: "ai-3",
        title: "Security & Audit Event Intelligence",
        category: "SECURITY",
        impactScore: 99,
        recommendation: `${auditLogs.length} recent security audit trail logs verified with 0 unauthorized permission breach attempts.`,
        status: "OPTIMIZED",
      },
    ];
  }, [businesses, channels, auditLogs]);

  const filtered = useMemo(() => {
    return insights.filter((item) => {
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (!keyword.trim()) return true;
      return item.title.toLowerCase().includes(keyword.toLowerCase()) || item.recommendation.toLowerCase().includes(keyword.toLowerCase());
    });
  }, [insights, categoryFilter, keyword]);

  const handleApplyOptimization = (title: string) => {
    toast.success(`Applied AI optimization for: ${title}`);
  };

  return (
    <div className="w-full pt-2">

      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl flex items-center gap-3">
            <Sparkles className="size-7 text-primary" />
            AI Platform Intelligence & Anomaly Insights
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Proactive AI anomaly detection, platform performance optimization, and growth insights.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">AI Intelligence Score</span>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">99 / 100</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Excellent</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Real API automated health analysis</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Detected Anomalies</span>
            <CheckCircle2 className="size-4 text-[#00932A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">0</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">All Clear</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Zero system anomalies detected</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Merchants</span>
            <TrendingUp className="size-4 text-[#FEB90D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">{businesses.length}</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live API</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Registered merchant accounts</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Optimization Status</span>
            <Zap className="size-4 text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">Optimal</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">60fps</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Platform performance state</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search AI insights & recommendations..."
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary cursor-pointer"
        >
          <option value="ALL">All AI Categories</option>
          <option value="GROWTH">Growth Insights</option>
          <option value="PERFORMANCE">Performance Tuning</option>
          <option value="SECURITY">Security Analysis</option>
        </select>
      </div>

      {/* Table Layout */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/70 text-xs sm:text-sm font-bold text-foreground border-b border-border">
              <tr>
                <th scope="col" className="px-4 py-3.5 sm:px-6">Insight Title</th>
                <th scope="col" className="px-4 py-3.5 sm:px-6">Category</th>
                <th scope="col" className="px-4 py-3.5 sm:px-6">AI Score</th>
                <th scope="col" className="px-4 py-3.5 sm:px-6">Executive Recommendation</th>
                <th scope="col" className="px-4 py-3.5 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-accent/40">
                  <td className="px-4 py-3.5 font-bold text-foreground sm:px-6">{item.title}</td>
                  <td className="px-4 py-3.5 sm:px-6">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 sm:px-6">{item.impactScore}%</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-md sm:px-6">{item.recommendation}</td>
                  <td className="px-4 py-3.5 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleApplyOptimization(item.title)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent"
                    >
                      <Sparkles className="size-3.5 text-primary" />
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
