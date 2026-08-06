"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import {
  useGetAuditLogsQuery,
  useGetBusinessQuery,
} from "@/features/businessManagement/businessAdminApi";
import { BusinessRowActions } from "@/components/admin/BusinessRowActions";
import { FeatureToggleCard } from "@/components/admin/FeatureToggleCard";
import { Flag, StatusPill } from "@/components/admin/StatusPill";
import Image from "next/image";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-800">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: business, isLoading, error } = useGetBusinessQuery(id);
  const { data: logs } = useGetAuditLogsQuery({ targetId: id, size: 8 });

  if (isLoading) {
    return <main className="px-8 py-7 text-sm text-neutral-500">Loading business...</main>;
  }

  if (error || !business) {
    return (
      <main className="px-8 py-7">
        <p className="text-sm text-red-600">
          Could not load this business
          {error && "status" in error ? ` (status ${error.status})` : ""}.
        </p>
        <Link href="/businesses" className="mt-4 inline-block text-sm text-green-700">
          Back to all businesses
        </Link>
      </main>
    );
  }

  return (
    <main className="px-8 py-7 dark:bg-background">
      <nav className="mb-6 text-[15px] text-neutral-400">
        <Link href="/dashboard" className="hover:text-neutral-600">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <Link href="/businesses" className="hover:text-neutral-600">
          Businesses
        </Link>
        <span className="px-2">/</span>
        <span className="text-neutral-700">{business.name}</span>
      </nav>

      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {business.logo ? (

            <Image
              src={business.logo}
              width={100}
              height={100}
              alt="Logo"
              className="size-16 rounded-2xl border border-neutral-200 object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-2xl bg-neutral-100 text-xl font-semibold text-neutral-400">
              {business.name.charAt(0).toUpperCase()}
            </span>
          )}

          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{business.name}</h1>
            <p className="mt-1 text-sm text-neutral-400">/{business.slug}</p>
            <div className="mt-3 flex items-center gap-3">
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

        <BusinessRowActions business={business} />
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-neutral-200 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {business.about?.trim() || "The owner has not written a description yet."}
          </p>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Category" value={business.category?.name} />
            <Field label="Currency" value={business.baseCurrency} />
            <Field label="Registered" value={business.provisionedAt?.slice(0, 10)} />
            <Field label="Owner ID" value={business.keycloakUserId} />
          </dl>
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>

          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
              {business.phoneNumber || "—"}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
              {business.email || "—"}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
              <span>
                {business.address || "—"}
                {business.cityOrProvince && (
                  <span className="block text-neutral-400">{business.cityOrProvince}</span>
                )}
              </span>
            </li>
            {business.website && (
              <li className="flex items-start gap-2">
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
                <a
                  href={business.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-green-700 hover:underline"
                >
                  {business.website}
                </a>
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="mt-6">
        <FeatureToggleCard businessId={id} />
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Recent admin activity</h2>
          <Link href="/audit-logs/businesses" className="text-sm text-green-700 hover:underline">
            View all
          </Link>
        </div>

        {logs?.content?.length ? (
          <ul className="mt-4 divide-y divide-neutral-100">
            {logs.content.map((log) => (
              <li key={log.id} className="py-3 text-sm">
                <span className="text-neutral-800">{log.actionType.replace(/_/g, " ").toLowerCase()}</span>
                <span className="text-neutral-400"> by {log.actorUsername} · </span>
                <span className="text-neutral-400">{new Date(log.createdAt).toLocaleString()}</span>
                {log.reason && <p className="mt-1 text-neutral-600">{log.reason}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Nothing recorded for this business yet.
          </p>
        )}
      </section>

      <Link
        href="/businesses"
        className="mt-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="size-4" />
        Back to all businesses
      </Link>
    </main>
  );
}