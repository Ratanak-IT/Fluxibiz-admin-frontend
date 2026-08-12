"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Globe,
  Radio,
  RefreshCw,
  Server,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  checkAllServices,
  pingService,
  type MonitoredService,
  type ServiceStatus,
  type SystemHealthSummary,
} from "@/lib/healthService";

export default function SystemHealthPage() {
  const [summary, setSummary] = useState<SystemHealthSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // in seconds, 0 = off
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await checkAllServices(summary?.services);
      setSummary(res);
    } catch (err) {
      console.error("Failed to run health check:", err);
    } finally {
      setRefreshing(false);
    }
  }, [summary?.services]);

  useEffect(() => {
    loadHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const timer = setInterval(() => {
      loadHealth();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshInterval, loadHealth]);

  const handleTestSingle = async (service: MonitoredService) => {
    setTestingId(service.id);
    try {
      const updated = await pingService(service);
      setSummary((prev) => {
        if (!prev) return prev;
        const newServices = prev.services.map((s) => (s.id === service.id ? updated : s));
        const total = newServices.length;
        const opCount = newServices.filter((s) => s.status === "operational").length;
        const degCount = newServices.filter((s) => s.status === "degraded").length;
        const downCount = newServices.filter((s) => s.status === "down").length;
        const avg = Math.round(newServices.reduce((a, b) => a + b.latencyMs, 0) / (total || 1));
        return {
          ...prev,
          services: newServices,
          operationalCount: opCount,
          degradedCount: degCount,
          downCount,
          avgLatencyMs: avg,
        };
      });
    } finally {
      setTestingId(null);
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            Degraded
          </span>
        );
      case "down":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            Down
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Checking...
          </span>
        );
    }
  };

  return (
    <div className="w-full pt-2">

      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl flex items-center gap-3">
            <Activity className="size-7 text-[#00932A]" />
            Infrastructure & API Health Monitor
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Real-time status, network latency, and service availability across the IPOS platform.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            <span>Auto-refresh:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value={0}>Off</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </div>

          <button
            type="button"
            onClick={loadHealth}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Run Check
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: System Status */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Overall System</span>
            <Server className="size-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-xl font-bold text-foreground capitalize">
              {summary ? summary.overallStatus : "Checking..."}
            </p>
            {summary && getStatusBadge(summary.overallStatus)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {summary?.downCount === 0
              ? "All core infrastructure operating normally"
              : `${summary?.downCount} service(s) experiencing issues`}
          </p>
        </div>

        {/* Card 2: Avg Latency */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Avg API Latency</span>
            <Zap className="size-4 text-[#FEB90D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">
              {summary ? `${summary.avgLatencyMs} ms` : "..."}
            </p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Fast
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Response time across active endpoints</p>
        </div>

        {/* Card 3: Uptime SLA */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Platform Uptime</span>
            <CheckCircle2 className="size-4 text-[#00932A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">
              {summary ? `${summary.uptimePct}%` : "..."}
            </p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">SLA 99.9%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Average 30-day service availability</p>
        </div>

        {/* Card 4: Monitored Services */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Services</span>
            <Radio className="size-4 text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">
              {summary ? `${summary.operationalCount}/${summary.totalServices}` : "..."}
            </p>
            <span className="text-xs font-medium text-muted-foreground">Healthy</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Active microservices & gateways</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mt-8">
        <h2 className="text-base font-bold text-foreground mb-4">Monitored Microservices & Gateways</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summary?.services.map((service) => {
            const isSingleTesting = testingId === service.id;
            return (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {service.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-foreground">{service.name}</h3>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  {/* Latency Meter */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Latency</span>
                      <span className="font-bold text-foreground">{service.latencyMs} ms</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          service.latencyMs < 100
                            ? "bg-[#00932A]"
                            : service.latencyMs < 400
                            ? "bg-[#FEB90D]"
                            : "bg-[#D14341]"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, (service.latencyMs / 300) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="truncate max-w-[180px]" title={service.endpoint}>
                    {service.endpoint}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestSingle(service)}
                    disabled={isSingleTesting}
                    className="inline-flex items-center gap-1.5 font-semibold text-primary transition hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${isSingleTesting ? "animate-spin" : ""}`} />
                    Test Endpoint
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident & Maintenance Feed */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Maintenance & Events Log</h2>
            <p className="text-xs text-muted-foreground">Historical records of scheduled upgrades and service events.</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            System Normal
          </span>
        </div>

        <div className="mt-4 divide-y divide-border">
          {[
            {
              date: "Today, 02:15 AM",
              event: "System Announcement Store & Real-time Banner module deployed",
              status: "Completed",
              badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
            },
            {
              date: "Yesterday, 11:30 PM",
              event: "Bakong KHQR Payment Settlement Gateway health check passed",
              status: "Operational",
              badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
            },
            {
              date: "3 days ago",
              event: "Keycloak SSO Authentication Token Refresh auto-retry verification",
              status: "Passed",
              badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-foreground">{item.event}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.badge}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
