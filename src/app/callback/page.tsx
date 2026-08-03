"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { exchangeCodeForTokens, redirectToLogin } from "@/lib/auth/keycloak";
import { decodeToken, tokenStore } from "@/lib/auth/tokenStore";

const DASHBOARD_REDIRECT_DELAY_MS = 2300;
const CELEBRATION_PIECES = [
  "left-1/2 top-0 h-3 w-1 -translate-x-1/2 bg-green-500 animate-[auth-confetti-up_850ms_ease-out_130ms_both]",
  "left-6 top-4 h-2.5 w-1 rotate-[-28deg] bg-emerald-400 animate-[auth-confetti-left_900ms_ease-out_180ms_both]",
  "right-6 top-4 h-2.5 w-1 rotate-[28deg] bg-lime-400 animate-[auth-confetti-right_900ms_ease-out_180ms_both]",
  "left-3 top-1/2 h-1.5 w-3 bg-green-600 animate-[auth-confetti-left_820ms_ease-out_220ms_both]",
  "right-3 top-1/2 h-1.5 w-3 bg-emerald-500 animate-[auth-confetti-right_820ms_ease-out_220ms_both]",
  "bottom-5 left-7 h-2 w-2 rotate-45 bg-lime-500 animate-[auth-confetti-down_780ms_ease-out_260ms_both]",
  "bottom-5 right-7 h-2 w-2 rotate-45 bg-green-400 animate-[auth-confetti-down_780ms_ease-out_300ms_both]",
] as const;

function getDisplayName() {
  const claims = decodeToken(tokenStore.getAccessToken() ?? "");
  const fullName = claims?.name ?? claims?.preferred_username ?? "there";
  return fullName.split(/[\s._-]+/).filter(Boolean)[0] ?? fullName;
}

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError) {
      return params.get("error_description") ?? authError;
    }
    if (!params.get("code") || !params.get("state")) {
      return "Missing authorization code.";
    }
    return null;
  });
  const [displayName, setDisplayName] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || error) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) return;

    exchangeCodeForTokens(code, state)
      .then((tokens) => {
        tokenStore.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
        const returnTo = tokenStore.getReturnTo();
        const nextRoute = returnTo && returnTo !== "/callback" ? returnTo : "/dashboard";

        setDisplayName(getDisplayName());
        window.setTimeout(() => router.replace(nextRoute), DASHBOARD_REDIRECT_DELAY_MS);
      })
      .catch((exception: Error) => setError(exception.message));
  }, [router, error]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-xl font-semibold">Sign in failed</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          className="rounded-md border px-4 py-2 text-sm"
          onClick={() => redirectToLogin("/dashboard")}
        >
          Try again
        </button>
      </div>
    );
  }

  const isSuccess = Boolean(displayName);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_48%,#eefbf3_100%)] px-4 dark:bg-[linear-gradient(135deg,#07120b_0%,#0a0a0a_48%,#102016_100%)]"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-7 text-center shadow-[0_28px_80px_rgba(15,118,63,0.16)] backdrop-blur animate-[auth-card-enter_700ms_cubic-bezier(0.22,1,0.36,1)_both] dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/50">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-lime-300 via-green-600 to-emerald-300 animate-[auth-sweep_1.35s_ease-out_0.15s_both]" />
        <div className="absolute inset-x-8 top-0 h-24 bg-[linear-gradient(180deg,rgba(34,197,94,0.16),transparent)] animate-[auth-spotlight_2.4s_ease-in-out_infinite]" />

        <div className="relative mx-auto grid size-24 place-items-center">
          {isSuccess && (
            <>
              <span className="absolute inset-2 rounded-full border border-green-400/50 animate-[auth-ring_950ms_ease-out_both]" />
              <span className="absolute inset-0 rounded-full border border-green-300/40 animate-[auth-ring_950ms_ease-out_160ms_both]" />
              {CELEBRATION_PIECES.map((className) => (
                <span
                  key={className}
                  aria-hidden
                  className={`absolute rounded-[2px] shadow-sm ${className}`}
                />
              ))}
            </>
          )}

          <div
            className={[
              "relative z-10 grid size-18 place-items-center rounded-full shadow-lg",
              isSuccess
                ? "bg-green-600 text-white shadow-green-700/25 animate-[auth-success-pop_700ms_cubic-bezier(0.22,1,0.36,1)_both]"
                : "bg-green-50 text-green-600 shadow-green-950/5 dark:bg-green-500/15 dark:text-green-400",
            ].join(" ")}
          >
            {isSuccess ? (
              <CheckCircle2 className="size-10" strokeWidth={1.9} aria-hidden />
            ) : (
              <LoaderCircle className="size-10 animate-spin" strokeWidth={1.8} aria-hidden />
            )}
          </div>
        </div>

        <div key={isSuccess ? "success-copy" : "loading-copy"} className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700 animate-[auth-copy-up_540ms_ease-out_120ms_both] dark:text-green-400">
            {isSuccess ? "Login successful" : "Signing you in"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 animate-[auth-copy-up_540ms_ease-out_220ms_both] dark:text-neutral-50">
            {isSuccess ? `Welcome back, ${displayName}` : "Preparing your dashboard"}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-neutral-500 animate-[auth-copy-up_540ms_ease-out_320ms_both] dark:text-neutral-400">
            {isSuccess ? "Taking you to the dashboard." : "Please wait a moment."}
          </p>
        </div>

        <div className="mt-7 h-1 overflow-hidden rounded-full bg-green-100 dark:bg-green-500/15">
          <div
            className={[
              "h-full rounded-full bg-gradient-to-r from-green-400 via-green-600 to-emerald-400",
              isSuccess
                ? "animate-[auth-progress-finish_1.8s_ease-out_both]"
                : "animate-[auth-progress-loading_1.2s_ease-in-out_infinite]",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}
