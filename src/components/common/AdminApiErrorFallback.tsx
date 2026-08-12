"use client";

import { AlertCircle, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const status = error?.status || error?.originalStatus;
  const is401 = status === 401 || status === "401";

  const displayTitle =
    title ||
    (is401
      ? "Session Expired (Status 401)"
      : "Could Not Load Data");

  const displayDescription =
    description ||
    (is401
      ? "Your session has expired. Please sign in again."
      : "Unable to complete request. Please try again.");

  if (compact) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{displayTitle}</span>
            {is401 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => logout()}
                className="h-7 rounded-md px-2.5 text-xs font-semibold"
              >
                Sign In
              </Button>
            ) : onRetry ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex min-h-[200px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="flex items-center gap-2 text-destructive font-semibold text-base">
        <AlertCircle className="h-5 w-5" />
        <span>{displayTitle}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{displayDescription}</p>

      <div className="mt-4 flex items-center gap-2">
        {is401 && (
          <Button size="sm" onClick={() => logout()} className="rounded-md gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            Sign In Again
          </Button>
        )}
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="rounded-md gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
