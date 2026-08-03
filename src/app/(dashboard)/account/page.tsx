"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { accountConsoleUrl, logout } from "@/lib/auth/keycloak";
import { decodeToken, type KeycloakClaims } from "@/lib/auth/tokenStore";
import { tokenStore } from "@/lib/auth/tokenStore";

/** Roles Keycloak gives everyone; hiding them keeps the list meaningful. */
const NOISE_ROLES = ["offline_access", "uma_authorization", "default-roles"];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-40 shrink-0 text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-neutral-900 dark:text-neutral-50">{value}</dd>
    </div>
  );
}

export default function AccountPage() {
  const [claims, setClaims] = useState<KeycloakClaims | null>(null);

  useEffect(() => {
    setClaims(decodeToken(tokenStore.getAccessToken() ?? ""));
  }, []);

  const roles = (claims?.realm_access?.roles ?? []).filter(
    (role) => !NOISE_ROLES.some((noise) => role.startsWith(noise)),
  );

  const expiresAt = claims?.exp ? new Date(claims.exp * 1000) : null;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link
          href="/dashboard"
          className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Dashboard
        </Link>
        <span className="px-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-neutral-900 dark:text-neutral-50">Account</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
        Account
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">
        Your identity comes from Keycloak, so changes are made there rather than here.
      </p>

      <div className="mt-7 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Profile</h2>

          {!claims ? (
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Reading session...</p>
          ) : (
            <dl className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
              <Row label="Name" value={claims.name ?? "—"} />
              <Row label="Username" value={claims.preferred_username ?? "—"} />
              <Row label="Email" value={claims.email ?? "—"} />
              <Row
                label="Roles"
                value={
                  roles.length ? (
                    <span className="flex flex-wrap gap-1.5">
                      {roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/70 dark:text-green-400"
                        >
                          {role}
                        </span>
                      ))}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <Row
                label="User ID"
                value={<span className="font-mono text-xs">{claims.sub}</span>}
              />
            </dl>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            <ShieldCheck className="size-4 text-neutral-400" aria-hidden />
            Session
          </h2>

          {/* <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            {expiresAt
              ? `This token expires at ${expiresAt.toLocaleTimeString()}. It renews on its own while the tab stays open.`
              : "No active session found."}
          </p> */}

          <a
            href={accountConsoleUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800"
          >
            <ExternalLink className="size-4" />
            Password and security
          </a>

          <button
            type="button"
            onClick={logout}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </section>
      </div>
    </main>
  );
}