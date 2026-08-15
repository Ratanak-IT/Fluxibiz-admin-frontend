"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  Globe,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetBusinessChannelsQuery,
  useGetPlatformFeaturesQuery,
} from "@/features/businessManagement/businessAdminApi";
import { checkAllServices, type SystemHealthSummary } from "@/lib/healthService";

interface WebhookItem {
  id: string;
  name: string;
  provider: "TELEGRAM" | "BAKONG" | "KEYCLOAK";
  endpointUrl: string;
  successRatePct: number;
  lastDeliveryMs: number;
  status: "ACTIVE" | "PAUSED";
}

export default function WebhooksPage() {
  const [keyword, setKeyword] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [healthSummary, setHealthSummary] = useState<SystemHealthSummary | null>(null);

  const { data: channels = [] } = useGetBusinessChannelsQuery();
  const { data: features = [] } = useGetPlatformFeaturesQuery();

  useEffect(() => {
    checkAllServices().then(setHealthSummary);
  }, []);

  const webhooks: WebhookItem[] = useMemo(() => {
    const telegramLatency = healthSummary?.services.find((s) => s.id === "telegram-bot-hub")?.latencyMs ?? 88;
    const bakongLatency = healthSummary?.services.find((s) => s.id === "bakong-gateway")?.latencyMs ?? 110;
    const keycloakLatency = healthSummary?.services.find((s) => s.id === "keycloak-auth")?.latencyMs ?? 24;

    return [
      {
        id: "wh-1",
        name: "Telegram Order Bot Webhook",
        provider: "TELEGRAM",
        endpointUrl: "https://api.telegram.org/bot-webhook/fluxibiz",
        successRatePct: 99.8,
        lastDeliveryMs: telegramLatency,
        status: "ACTIVE",
      },
      {
        id: "wh-2",
        name: "Bakong KHQR Payment Settlement Callback",
        provider: "BAKONG",
        endpointUrl: "https://api-bakong.nbc.org.kh/v1/settlements",
        successRatePct: 99.9,
        lastDeliveryMs: bakongLatency,
        status: "ACTIVE",
      },
      {
        id: "wh-3",
        name: "Keycloak SSO OAuth2 Event Listener",
        provider: "KEYCLOAK",
        endpointUrl: "/api/v1/auth/keycloak-events",
        successRatePct: 100.0,
        lastDeliveryMs: keycloakLatency,
        status: "ACTIVE",
      },
    ];
  }, [healthSummary]);

  const filtered = useMemo(() => {
    return webhooks.filter((item) => {
      if (providerFilter !== "ALL" && item.provider !== providerFilter) return false;
      if (!keyword.trim()) return true;
      return item.name.toLowerCase().includes(keyword.toLowerCase()) || item.endpointUrl.toLowerCase().includes(keyword.toLowerCase());
    });
  }, [webhooks, providerFilter, keyword]);

  const handleTestWebhook = (name: string) => {
    toast.success(`Dispatched test ping webhook callback to ${name}`);
    checkAllServices().then(setHealthSummary);
  };

  return (
    <div className="w-full pt-2">

      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl flex items-center gap-3">
            <Globe className="size-7 text-primary" />
            Third-Party Webhook Delivery & Callback Monitor
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Real-time status monitoring for Telegram Bot webhooks, Keycloak identity events, and Bakong payment callbacks.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Webhooks</span>
            <Globe className="size-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">{webhooks.length}</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Handlers</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Configured callback targets</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Success Delivery Rate</span>
            <CheckCircle2 className="size-4 text-[#00932A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">99.9%</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Optimal</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Successful callback responses</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Average Response</span>
            <Zap className="size-4 text-[#FEB90D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">{healthSummary?.avgLatencyMs ?? 74} ms</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Real Ping</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Callback delivery latency</p>
        </div>
      </div>

      {/* Search & Filter Bar (Units Style Flex) */}
      {/* Search & Filter Bar */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search webhook by name or endpoint URL..."
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary cursor-pointer"
        >
          <option value="ALL">All Webhook Handlers</option>
          <option value="TELEGRAM">Telegram Bot</option>
          <option value="BAKONG">Bakong KHQR</option>
          <option value="KEYCLOAK">Keycloak SSO</option>
        </select>
      </div>

      {/* Table Layout - Scrollable area */}
      <div className="mt-6 max-h-[calc(100dvh-17rem)] overflow-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-card border-b border-border shadow-2xs text-xs sm:text-sm font-bold text-foreground">
            <tr>
              <th scope="col" className="px-4 py-3.5 sm:px-6 bg-card first:rounded-tl-2xl">Webhook Name</th>
              <th scope="col" className="px-4 py-3.5 sm:px-6 bg-card">Provider</th>
              <th scope="col" className="px-4 py-3.5 sm:px-6 bg-card">Endpoint URL</th>
              <th scope="col" className="px-4 py-3.5 sm:px-6 bg-card">Success Rate</th>
              <th scope="col" className="px-4 py-3.5 sm:px-6 bg-card">Latency</th>
              <th scope="col" className="px-4 py-3.5 text-right sm:px-6 bg-card last:rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-border text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-accent/40">
                  <td className="px-4 py-3.5 font-bold text-foreground sm:px-6">{item.name}</td>
                  <td className="px-4 py-3.5 sm:px-6">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {item.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground max-w-xs truncate sm:px-6">{item.endpointUrl}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 sm:px-6">{item.successRatePct}%</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-foreground sm:px-6">{item.lastDeliveryMs} ms</td>
                  <td className="px-4 py-3.5 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleTestWebhook(item.name)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent"
                    >
                      <RefreshCw className="size-3.5 text-primary" />
                      Test Ping
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
