"use client";

import { useEffect, useState } from "react";
import { logout, redirectToLogin } from "@/lib/auth/keycloak";
import { useAutoRefresh } from "@/lib/auth/useAutoRefresh";
import { decodeToken, isTokenValid, refreshIfNeeded } from "@/lib/auth/session";
import { tokenStore } from "@/lib/auth/tokenStore";
import { allPermissionRoles, SUPER_ADMIN_ROLE } from "@/lib/permissionCatalog";
import { ShieldAlert, LogOut, RefreshCw } from "lucide-react";

function getUserRoles(token: string | null): string[] {
  const claims = decodeToken(token ?? "");
  const realmRoles = claims?.realm_access?.roles ?? [];
  const resourceAccess = claims?.resource_access ?? {};
  const clientRoles = Object.values(resourceAccess).flatMap((res) => res?.roles ?? []);
  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

function hasConsoleAccess(token: string | null): boolean {
  const roles = getUserRoles(token);

  if (roles.includes(SUPER_ADMIN_ROLE)) {
    return true;
  }

  return allPermissionRoles().some((permission) => roles.includes(permission));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "allowed" | "forbidden">("checking");

  useAutoRefresh();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await refreshIfNeeded();

      if (cancelled) return;

      if (!isTokenValid(token)) {
        await redirectToLogin();
        return;
      }

      setState(hasConsoleAccess(token) ? "allowed" : "forbidden");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") {
    return null;
  }

  if (state === "forbidden") {
    const currentToken = tokenStore.getAccessToken();
    const claims = decodeToken(currentToken ?? "");
    const username = claims?.preferred_username ?? claims?.email ?? claims?.name ?? "Unknown Account";
    const userRoles = getUserRoles(currentToken);

    return (
      <div className="grid min-h-screen place-items-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <ShieldAlert className="size-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Not Authorised
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Signed in as <strong className="text-neutral-800 dark:text-neutral-200">{username}</strong>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Your Keycloak user account does not have administrative permissions for this admin platform.
            Access requires the <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-red-600 dark:bg-neutral-800 dark:text-red-400">{SUPER_ADMIN_ROLE}</code> role or a specific platform permission role assigned in Keycloak.
          </p>

          {userRoles.length > 0 && (
            <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-left dark:bg-neutral-800/50">
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Your assigned roles:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {userRoles.map((role) => (
                  <span
                    key={role}
                    className="rounded bg-neutral-200/60 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <RefreshCw className="size-4" />
              Re-check
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              <LogOut className="size-4" />
              Sign out / Switch account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
