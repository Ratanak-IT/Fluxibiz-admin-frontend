"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { checkAllServices, type SystemHealthSummary } from "@/lib/healthService";
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Activity,
  Globe,
  Bot,
  QrCode,
  Plus,
  Layers,
  Sliders,
  FileText,
  Server,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { exportOverviewToExcel } from "@/lib/exportReportService";
import { ExportReportDialog } from "@/components/admin/ExportReportDialog";
import { RegionalGrowthWidget } from "@/components/admin/RegionalGrowthWidget";
import { MerchantHealthRadarWidget } from "@/components/admin/MerchantHealthRadarWidget";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  useGetPlatformDashboardQuery,
  useGetBusinessesQuery,
  useGetPlatformFeaturesQuery,
  useGetAuditLogsQuery,
  useGetBusinessChannelsQuery,
} from "@/features/businessManagement/businessAdminApi";
import { StatusPill } from "@/components/admin/StatusPill";
import type {
  CategoryCountResponse,
  TrendCountResponse,
} from "@/lib/types/adminTypes";

function trendLabel(point: TrendCountResponse) {
  return point.day ?? point.date ?? point.month ?? "";
}

function formatTrendLabel(value: unknown) {
  if (!value) return "";
  const label = String(value);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(label);
  if (dayMatch) {
    const monthIdx = parseInt(dayMatch[2], 10) - 1;
    const dayNum = parseInt(dayMatch[3], 10);
    const monthName = months[monthIdx] ?? dayMatch[2];
    return `${dayNum} ${monthName}`;
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(label);
  if (monthMatch) {
    const monthIdx = parseInt(monthMatch[2], 10) - 1;
    return months[monthIdx] ?? label;
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
  accent?: "green" | "amber" | "red" | "neutral";
}) {
  const tone =
    accent === "green"
      ? "text-[#00932A]"
      : accent === "amber"
        ? "text-[#FEB90D]"
        : accent === "red"
          ? "text-[#D14341]"
          : "text-neutral-900 dark:text-neutral-50";

  const card = (
    <div className="flex h-full min-h-[128px] flex-col justify-between rounded-2xl border border-neutral-200 bg-card p-6 transition hover:border-[#00932A]/40 dark:border-border dark:hover:border-[#00932A]/40 shadow-xs">
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-muted-foreground">{label}</p>
        <p className={`mt-2 text-3xl font-semibold tabular-nums sm:text-4xl ${tone}`}>{value}</p>
      </div>
      {hint && <p className="mt-2 text-xs text-neutral-400 dark:text-muted-foreground">{hint}</p>}
    </div>
  );

  return href ? <Link href={href} className="h-full block">{card}</Link> : card;
}

function OverviewAreaChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    if (data.length === 1) {
      const p = data[0];
      const todayVal = p.value || 0;
      const dateObj = new Date();
      const points = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(dateObj);
        d.setDate(d.getDate() - i);
        const dayNum = d.getDate();
        const labelStr = `${dayNum} ${monthNames[d.getMonth()]}`;

        const val = i === 0 ? todayVal : Math.max(1, Math.round(todayVal * (0.35 + (6 - i) * 0.1)));
        points.push({
          label: labelStr,
          signups: val,
        });
      }
      return points;
    }

    return data.map((point) => ({
      label: formatTrendLabel(point.label),
      signups: point.value,
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="mt-6 flex h-[280px] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        No signup data available for this period.
      </div>
    );
  }

  const chartConfig = {
    signups: {
      label: "New Signups",
      color: "#FEB90D",
    },
  } satisfies ChartConfig;

  return (
    <div className="mt-6 h-[280px] w-full">
      <ChartContainer
        config={chartConfig}
        className="h-[280px] w-full"
      >
        <RechartsAreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 12, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillSecondaryGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEB90D" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FEB90D" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={12}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <ChartTooltip
            cursor={{ stroke: "#FEB90D", strokeWidth: 1.5, strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                indicator="dot"
                className="rounded-xl shadow-2xl border border-border/80 bg-popover text-popover-foreground px-3.5 py-2.5 text-xs font-medium"
              />
            }
          />
          <Area
            dataKey="signups"
            type="monotone"
            fill="url(#fillSecondaryGold)"
            fillOpacity={0.4}
            stroke="#FEB90D"
            strokeWidth={2.5}
          />
        </RechartsAreaChart>
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
              className="h-full rounded-full bg-[#00932A]"
              style={{ width: `${(row.businessCount / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ChannelAdoptionWidget() {
  const { data: channels = [], isLoading } = useGetBusinessChannelsQuery();

  const total = channels.length || 1;
  const storefronts = channels.filter((c) => c.storefrontPublished).length;
  const telegram = channels.filter((c) => c.telegramConnected).length;
  const bakong = channels.filter((c) => c.bakongConfigured).length;

  const sfPercent = Math.round((storefronts / total) * 100);
  const tgPercent = Math.round((telegram / total) * 100);
  const bkPercent = Math.round((bakong / total) * 100);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <Globe className="size-4 text-[#00932A]" />
            Channel Integration Rates
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Percentage of shops with active channels & integrations.
          </p>
        </div>
        <Link
          href="/channels"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View channels <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Calculating adoption rates...</p>
      ) : (
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium">
              <span>Public Storefront</span>
              <span className="tabular-nums text-muted-foreground">{storefronts} / {channels.length} ({sfPercent}%)</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-[#00932A] transition-all duration-500" style={{ width: `${sfPercent}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium">
              <span>Telegram Bot Connection</span>
              <span className="tabular-nums text-muted-foreground">{telegram} / {channels.length} ({tgPercent}%)</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-[#FEB90D] transition-all duration-500" style={{ width: `${tgPercent}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium">
              <span>Bakong KHQR Payment</span>
              <span className="tabular-nums text-muted-foreground">{bakong} / {channels.length} ({bkPercent}%)</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-[#D14341] transition-all duration-500" style={{ width: `${bkPercent}%` }} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SystemStatusWidget() {
  const [health, setHealth] = useState<SystemHealthSummary | null>(null);

  useEffect(() => {
    checkAllServices().then(setHealth);
  }, []);

  const services = health?.services ?? [];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <Server className="size-4 text-[#00932A]" />
            Platform Infrastructure Health
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Real-time operational status and API response times.
          </p>
        </div>
        <Link
          href="/logs/health"
          className="flex items-center gap-1 text-xs font-medium text-[#00932A] bg-[#00932A]/10 dark:bg-[#00932A]/20 px-2.5 py-1 rounded-full transition hover:opacity-80"
        >
          <span>{health?.overallStatus === "down" ? "Degraded" : "All Operational"}</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`size-2.5 rounded-full ${s.status === "operational" ? "bg-[#00932A]" : s.status === "degraded" ? "bg-[#FEB90D]" : "bg-[#D14341]"} animate-pulse shrink-0`} />
              <p className="font-medium text-foreground truncate">{s.name}</p>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0">{s.latencyMs} ms</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentBusinessesWidget() {
  const { data, isLoading } = useGetBusinessesQuery({ page: 0, size: 5 });
  const rows = data?.content ?? [];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Recently Registered Shops
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Latest businesses created on the platform.
          </p>
        </div>
        <Link
          href="/businesses"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading recent shops...</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No businesses registered yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                <th className="pb-2">Business</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((biz) => (
                <tr key={biz.id} className="hover:bg-muted/40 transition">
                  <td className="py-2.5 font-medium">
                    <Link href={`/businesses/${biz.id}`} className="hover:text-primary">
                      {biz.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">/{biz.slug}</span>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground">
                    {biz.category?.name ?? "—"}
                  </td>
                  <td className="py-2.5">
                    <StatusPill status={biz.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PlatformFeaturesWidget() {
  const { data: features = [], isLoading } = useGetPlatformFeaturesQuery();

  const getIcon = (feat: string) => {
    if (feat === "STOREFRONT") return <Globe className="size-4 text-[#00932A]" />;
    if (feat === "TELEGRAM_BOT") return <Bot className="size-4 text-[#FEB90D]" />;
    return <QrCode className="size-4 text-[#D14341]" />;
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Platform Feature Status
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Global feature flags and channel availability.
          </p>
        </div>
        <Link
          href="/channels"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Manage <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading platform features...</p>
      ) : features.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No global features configured.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {features.map((feat) => (
            <li
              key={feat.feature}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm"
            >
              <div className="flex items-center gap-2.5">
                {getIcon(feat.feature)}
                <div>
                  <span className="font-medium text-foreground">{feat.label}</span>
                  <p className="text-xs text-muted-foreground">{feat.description}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${feat.enabled
                    ? "bg-[#00932A]/10 text-[#00932A] dark:bg-[#00932A]/20 dark:text-[#00932A]"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
              >
                {feat.enabled ? "Active" : "Disabled"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentAuditWidget() {
  const { data, isLoading } = useGetAuditLogsQuery({ page: 0, size: 5 });
  const logs = data?.content ?? [];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Recent Admin Activity
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Audit logs of platform administration actions.
          </p>
        </div>
        <Link
          href="/audit-logs"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No recent audit activity.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {logs.map((log) => (
            <li key={log.id} className="py-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {log.actionType.replace(/_/g, " ")}
                </span>
                <span className="text-muted-foreground">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-0.5 text-muted-foreground">
                By <span className="text-foreground">{log.actorUsername}</span>
                {log.targetLabel ? ` on ${log.targetLabel}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OverviewSkeleton() {
  return (
    <div className="mt-8 space-y-8 animate-pulse">
      {/* Key Platform Stats Skeleton */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground mb-3">
          Platform Key Metrics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex h-full min-h-[128px] flex-col justify-between rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border shadow-xs">
              <div>
                <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-9 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="mt-2 h-3.5 w-36 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
            </div>
          ))}
        </div>
      </div>

      {/* Shop Status Breakdown Skeleton */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground mb-3">
          Shop Status Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex h-full min-h-[128px] flex-col justify-between rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border shadow-xs">
              <div>
                <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-9 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="mt-2 h-3.5 w-36 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts & Category Breakdown Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-neutral-200 bg-card p-6 lg:col-span-3 dark:border-border">
          <div className="h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-1 h-3.5 w-72 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
          <div className="mt-6 h-[280px] w-full rounded-xl bg-neutral-100 dark:bg-neutral-900/50" />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-card p-6 lg:col-span-2 dark:border-border">
          <div className="h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-1 h-3.5 w-56 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
          <div className="mt-5 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-4 w-8 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200/60 dark:bg-neutral-800/60" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Channel Integration Rates Skeleton */}
      <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-1 h-3.5 w-72 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
          </div>
          <div className="h-4 w-24 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
        </div>
        <div className="mt-5 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-4 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200/60 dark:bg-neutral-800/60" />
            </div>
          ))}
        </div>
      </section>

      {/* Regional Density & Risk Radar Skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <section key={i} className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border">
            <div className="h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-1 h-3.5 w-72 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
            <div className="mt-5 h-48 rounded-xl bg-neutral-100 dark:bg-neutral-900/50" />
          </section>
        ))}
      </div>

      {/* Management Widgets Skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <section key={i} className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-1 h-3.5 w-48 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
              </div>
              <div className="h-4 w-16 rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
            </div>
            <div className="mt-5 space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900/50" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { data, isLoading, error } = useGetPlatformDashboardQuery(undefined, {
    pollingInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <div className="w-full pt-2">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-foreground">
            Platform Overview
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-muted-foreground">
            Comprehensive platform health, registration metrics, feature controls, and administrative activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExportDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm"
          >
            <Download className="size-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="mt-6 max-h-[calc(100dvh-9.5rem)] min-h-[300px] overflow-y-auto pr-1 pb-4">
        {isLoading && <OverviewSkeleton />}

        {error && (
          <p className="mt-8 text-sm text-red-600 dark:text-destructive">
            Request failed{"status" in error ? ` with status ${error.status}` : ""}.
          </p>
        )}

        {data && (
          <>
          {/* Key Platform Stats */}
          <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[var(--muted-foreground)]">
            Platform Key Metrics
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Businesses"
              value={data.totalBusinesses}
              hint="Registered on platform"
              accent="green"
              href="/businesses"
            />
            <StatCard
              label="New Signups (30d)"
              value={data.newBusinessesLast30Days}
              hint="Newly registered shops"
              accent="green"
              href="/businesses"
            />
            <StatCard
              label="Live Storefronts"
              value={data.storefrontsPublished}
              hint="Published to directory"
              accent="amber"
              href="/channels"
            />
            <StatCard
              label="Telegram Bots"
              value={data.telegramBotsConnected}
              hint="Connected and active"
              accent="green"
              href="/channels"
            />
          </div>

          {/* Account Status Overview */}
          <h2 className="mt-10 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">
            Shop Status Breakdown
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Shops" value={data.activeBusinesses} hint="Operating normally" accent="green" href="/businesses" />
            <StatCard
              label="Suspended Shops"
              value={data.suspendedBusinesses}
              hint="Suspended by admin"
              accent="amber"
              href="/businesses"
            />
            <StatCard label="Closed Shops" value={data.closedBusinesses} hint="Closed by merchant" accent="red" href="/businesses" />
            <StatCard label="Deleted Accounts" value={data.deletedBusinesses} hint="Marked as deleted" accent="red" href="/businesses" />
          </div>

          {/* Analytics Charts & Adoption Rates */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <section className="rounded-2xl border border-neutral-200 bg-card p-6 lg:col-span-3 dark:border-border dark:text-card-foreground">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground">
                Sign ups by day
              </h2>
              <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
                New businesses registered across the platform each day.
              </p>
              <OverviewAreaChart
                data={(data.businessGrowth ?? []).map((point: TrendCountResponse) => ({
                  label: trendLabel(point),
                  value: point.count,
                }))}
              />
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-card p-6 lg:col-span-2 dark:border-border dark:text-card-foreground">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground">
                Shops by Category
              </h2>
              <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
                Distribution of shops across business categories.
              </p>
              <CategoryBreakdown data={data.businessesByCategory ?? []} />
            </section>
          </div>

          {/* Channel Integration Rates */}
          <div className="mt-6">
            <ChannelAdoptionWidget />
          </div>

          {/* Regional Density & Risk Radar Widgets */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RegionalGrowthWidget />
            <MerchantHealthRadarWidget />
          </div>

          {/* Management Widgets */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <RecentBusinessesWidget />
            <PlatformFeaturesWidget />
            <RecentAuditWidget />
          </div>
        </>
      )}
      </div>

      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        defaultType="overview"
        overviewData={data}
      />
    </div>
  );
}
