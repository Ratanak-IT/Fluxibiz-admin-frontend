"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, LayoutDashboard, Mail, MapPin, Phone } from "lucide-react";
import {
  useGetAuditLogsQuery,
  useGetBusinessQuery,
} from "@/features/businessManagement/businessAdminApi";
import { BusinessRowActions } from "@/components/admin/BusinessRowActions";
import { FeatureToggleCard } from "@/components/admin/FeatureToggleCard";
import { Flag, StatusPill } from "@/components/admin/StatusPill";

import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";
import { useSessionContext } from "@/lib/auth/session-context";
import { hasPermission } from "@/lib/permissionCatalog";

function Field({ label, value, breakAll = false }: { label: string; value?: string | null; breakAll?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</dt>
      <dd className={`mt-1 text-sm font-medium text-foreground ${breakAll ? "break-all font-mono text-xs sm:text-sm" : "break-words"}`}>
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const session = useSessionContext();
  const canSeeAudit = session !== null && hasPermission(session.roles, "admin-audit:read");

  const { data: business, isLoading, error, refetch } = useGetBusinessQuery(id);
  const { data: logs } = useGetAuditLogsQuery({ targetId: id, size: 8 }, { skip: !canSeeAudit });

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 md:px-8">
        <AdminLoadingState label="Loading business detail profile..." />
      </main>
    );
  }

  if (error || !business) {
    return (
      <main className="px-4 py-6 sm:px-6 md:px-8">
        <AdminApiErrorFallback
          error={error}
          title="Could Not Load Business Profile"
          onRetry={refetch}
        />
        <div className="text-center mt-4">
          <Link href="/businesses" className="text-sm font-semibold text-primary hover:underline">
            ← Back to all businesses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full pt-2">
      {/* Top Action */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/businesses"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Businesses
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {business.logo || business.thumbnail ? (
            <img
              src={business.logo || business.thumbnail || ""}
              alt={business.name}
              className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 min-w-[96px] min-h-[96px] sm:min-w-[112px] sm:min-h-[112px] md:min-w-[128px] md:min-h-[128px] shrink-0 rounded-3xl object-cover bg-muted shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 min-w-[96px] min-h-[96px] sm:min-w-[112px] sm:min-h-[112px] md:min-w-[128px] md:min-h-[128px] shrink-0 items-center justify-center rounded-3xl bg-muted font-bold text-foreground text-3xl shadow-sm">
              {business.name ? business.name.charAt(0).toUpperCase() : "B"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground break-words">{business.name}</h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground truncate">/{business.slug}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill status={business.status} />
              <Flag
                on={business.isListing && !business.isClosed}
                onLabel="Listed publicly"
                offLabel="Hidden from directory"
              />
              <Flag on={business.isEnabled} onLabel="Features enabled" offLabel="Features disabled" />
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex justify-end shrink-0 pt-2 sm:pt-0 border-t border-border sm:border-t-0">
          <BusinessRowActions business={business} />
        </div>
      </div>

      {/* Profile & Contact Details */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-foreground">Profile Description</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {business.about?.trim() || "The owner has not written a description yet."}
          </p>

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-border">
            <Field label="Category" value={business.category?.name} />
            <Field label="Base Currency" value={business.baseCurrency} />
            <Field label="Registered At" value={business.provisionedAt?.slice(0, 10)} />
            <Field label="Owner ID" value={business.keycloakUserId} breakAll />
          </dl>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Contact Information</h2>

          <ul className="mt-4 space-y-4 text-sm text-foreground">
            <li className="flex items-start gap-3 break-all">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>{business.phoneNumber || "—"}</span>
            </li>
            <li className="flex items-start gap-3 break-all">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>{business.email || "—"}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <span className="break-words">{business.address || "—"}</span>
                {business.cityOrProvince && (
                  <span className="block text-xs text-muted-foreground">{business.cityOrProvince}</span>
                )}
              </div>
            </li>
            {business.website && (
              <li className="flex items-start gap-3 border-t border-border pt-3 break-all">
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <a
                  href={business.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-primary hover:underline"
                >
                  {business.website}
                </a>
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Platform Features Toggle */}
      <div className="mt-6 sm:mt-8 overflow-x-auto">
        <FeatureToggleCard businessId={id} />
      </div>

      {/* Audit Logs History */}
      {canSeeAudit && (
        <section className="mt-6 sm:mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">Recent Admin Activity</h2>
            <Link href="/audit-logs/businesses" className="text-xs font-bold text-primary hover:underline">
              View All Activity →
            </Link>
          </div>

          {logs?.content?.length ? (
            <ul className="mt-4 divide-y divide-border">
              {logs.content.map((log) => (
                <li key={log.id} className="py-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-semibold text-foreground">{log.actionType.replace(/_/g, " ").toLowerCase()}</span>
                    <span className="text-muted-foreground"> by {log.actorUsername}</span>
                    {log.reason && <p className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded-lg">{log.reason}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              No admin activity recorded for this business yet.
            </p>
          )}
        </section>
      )}

      {/* Bottom Back Button */}
      <div className="mt-6 sm:mt-8 flex justify-start">
        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-xs sm:text-sm font-bold text-foreground transition hover:bg-accent shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Businesses
        </Link>
      </div>
    </div>
  );
}