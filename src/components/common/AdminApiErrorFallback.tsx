"use client";

import { ShieldAlert, RefreshCw, LogIn, AlertCircle } from "lucide-react";
import { logout } from "@/lib/auth/keycloak";

interface AdminApiErrorFallbackProps {
  error?: any;
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
  colSpan?: number;
}

export function AdminApiErrorFallback({
  error,
  title,
  description,
  onRetry,
  compact = false,
  colSpan = 6,
}: AdminApiErrorFallbackProps) {
  const rawMsg = typeof error === "string" ? error : error?.data?.message || error?.error || "";
  const status = error?.status || error?.originalStatus;
  const is401 = status === 401 || status === "401" || (typeof rawMsg === "string" && rawMsg.includes("401"));

  const displayTitle =
    title ||
    (is401
      ? "Session Expired"
      : "Could Not Load Data");

  const displayDescription =
    description ||
    (is401
      ? "Your authentication token has expired. Please sign in again."
      : "Unable to complete request from server. Please try again.");

  if (compact) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-6 py-10 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{displayTitle}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{displayDescription}</p>
            {is401 ? (
              <button
                type="button"
                onClick={() => logout()}
                className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 shadow-xs cursor-pointer"
              >
                <LogIn className="size-3.5" />
                Sign In Again
              </button>
            ) : onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent cursor-pointer"
              >
                <RefreshCw className="size-3.5 text-primary" />
                Retry
              </button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex min-h-[220px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3.5">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">{displayTitle}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{displayDescription}</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          {is401 && (
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 shadow-xs cursor-pointer"
            >
              <LogIn className="size-4" />
              Sign In Again
            </button>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground transition hover:bg-accent cursor-pointer"
            >
              <RefreshCw className="size-4 text-primary" />
              Retry Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
