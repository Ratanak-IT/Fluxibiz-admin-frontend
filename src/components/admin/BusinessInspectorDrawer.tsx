"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useGetAuditLogsQuery } from "@/features/businessManagement/businessAdminApi";
import type { BusinessResponse } from "@/lib/types/adminTypes";
import { Flag, StatusPill } from "./StatusPill";

interface BusinessInspectorDrawerProps {
  business: BusinessResponse | null;
  onClose: () => void;
}

export function BusinessInspectorDrawer({
  business,
  onClose,
}: BusinessInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "audit">("overview");

  const { data: auditData, isLoading: auditLoading } = useGetAuditLogsQuery(
    business?.id ? { targetId: business.id } : undefined,
    { skip: !business?.id, pollingInterval: 5000 },
  );

  if (!business) return null;

  const auditLogs = auditData?.content ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden />

      {/* Slide-over panel */}
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Business Inspector</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="border-b border-border p-6 bg-card">
          <div className="flex items-start gap-4">
            {business.logo || business.thumbnail ? (
              <img
                src={business.logo || business.thumbnail || ""}
                alt={business.name}
                className="h-20 w-20 min-w-[80px] shrink-0 rounded-2xl border-2 border-neutral-200 shadow-md object-cover bg-white p-1 dark:border-neutral-700 dark:bg-card"
              />
            ) : (
              <div className="flex h-20 w-20 min-w-[80px] shrink-0 items-center justify-center rounded-2xl bg-neutral-100 font-black text-neutral-600 text-2xl shadow-md border-2 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                {business.name ? business.name.charAt(0).toUpperCase() : "B"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-foreground truncate">{business.name}</h3>
                <StatusPill status={business.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">/{business.slug}</p>

              <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-foreground">
                  {business.category?.name ?? "General"}
                </span>
                <span className="text-border">•</span>
                <span>Base Currency: <strong className="text-foreground">{business.baseCurrency || "USD"}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Button to full page */}
          <div className="mt-5 flex items-center gap-2">
            <Link
              href={`/businesses/${business.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
            >
              <span>View Full Business Details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-muted/20 px-6 text-xs font-semibold text-muted-foreground">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 py-3 px-3 transition ${
              activeTab === "overview"
                ? "border-primary text-primary font-bold"
                : "border-transparent hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`border-b-2 py-3 px-3 transition ${
              activeTab === "features"
                ? "border-primary text-primary font-bold"
                : "border-transparent hover:text-foreground"
            }`}
          >
            Features & Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`border-b-2 py-3 px-3 transition flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-primary text-primary font-bold"
                : "border-transparent hover:text-foreground"
            }`}
          >
            <span>Live Audit Trail</span>
            {auditLogs.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] text-primary">
                {auditLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Contact Information
                </h4>
                <div className="grid gap-2.5 pt-1 text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground font-medium">{business.email || "No email set"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground font-medium">{business.phoneNumber || "No phone set"}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span className="text-foreground font-medium">{business.address || "No address set"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Storefront URL & Registration
                </h4>
                <div className="grid gap-2.5 pt-1 text-muted-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <span>Storefront Domain:</span>
                    <a
                      href={`https://${business.slug}.fluxibiz.store`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono font-medium text-primary hover:underline"
                    >
                      {business.slug}.fluxibiz.store
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Registered On:</span>
                    <span className="font-medium text-foreground">
                      {business.provisionedAt ? new Date(business.provisionedAt).toLocaleDateString("en-GB") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h4 className="font-bold text-foreground text-sm">Feature Controls</h4>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span>Platform Enabled State</span>
                  <Flag on={business.isEnabled} onLabel="Enabled" offLabel="Disabled" />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span>Public Directory Listing</span>
                  <Flag on={business.isListing && !business.isClosed} onLabel="Listed" offLabel="Hidden" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Closed Status</span>
                  <Flag on={business.isClosed} onLabel="Closed" offLabel="Open" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Business Audit History
                </h4>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-syncing (5s)
                </span>
              </div>

              {auditLoading && auditLogs.length === 0 && (
                <p className="py-6 text-center text-muted-foreground">Loading audit logs...</p>
              )}

              {!auditLoading && auditLogs.length === 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
                  No specific audit log entries found for this business.
                </div>
              )}

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-border bg-card p-3 space-y-1 hover:border-border/80 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{log.actionType.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-GB")}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      By <strong className="text-foreground">{log.actorUsername}</strong>
                      {log.previousState && log.newState && (
                        <span> ({log.previousState} → {log.newState})</span>
                      )}
                    </div>
                    {log.reason && (
                      <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-1.5 rounded-lg mt-1">
                        "{log.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
