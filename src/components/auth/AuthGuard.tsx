"use client";

import { useEffect, useState } from "react";
import { redirectToLogin } from "@/lib/auth/keycloak";
import { useAutoRefresh } from "@/lib/auth/useAutoRefresh";
import { hasRole, isTokenValid, refreshIfNeeded } from "@/lib/auth/session";



const REQUIRED_ROLE = "SUPER_ADMIN";

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

      setState(hasRole(token, REQUIRED_ROLE) ? "allowed" : "forbidden");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-xl font-semibold">Not authorised</h1>
        <p className="text-sm text-muted-foreground">
          This console requires the {REQUIRED_ROLE} role.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
