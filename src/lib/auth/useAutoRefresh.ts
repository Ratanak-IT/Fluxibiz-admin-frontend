"use client";

import { useEffect } from "react";
import { redirectToLogin } from "./keycloak";

import { decodeToken, isTokenValid, tokenStore } from "./tokenStore";
import { refreshIfNeeded } from "./session";

const LEAD_SECONDS = 60;

function millisUntilRefresh(): number {
  const claims = decodeToken(tokenStore.getAccessToken() ?? "");
  if (!claims?.exp) return 0;
  return Math.max(0, claims.exp * 1000 - LEAD_SECONDS * 1000 - Date.now());
}

export function useAutoRefresh() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      clearTimeout(timer);
      timer = setTimeout(run, millisUntilRefresh());
    };

    const run = async () => {
      if (cancelled) return;

      if (!tokenStore.getRefreshToken()) {
        await redirectToLogin();
        return;
      }

      const token = await refreshIfNeeded();
      if (cancelled) return;

      if (!token) {
        tokenStore.clear();
        await redirectToLogin();
        return;
      }

      schedule();
    };

    const onWake = () => {
      if (document.visibilityState !== "visible") return;
      if (!isTokenValid(tokenStore.getAccessToken())) {
        void run();
      } else {
        schedule();
      }
    };

    schedule();
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, []);
}