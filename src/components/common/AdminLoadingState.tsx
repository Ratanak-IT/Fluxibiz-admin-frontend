"use client";

import { Loader2 } from "lucide-react";

interface AdminLoadingStateProps {
  label?: string;
  compact?: boolean;
  colSpan?: number;
}

export function AdminLoadingState({
  label = "Loading...",
  compact = false,
  colSpan = 6,
}: AdminLoadingStateProps) {
  if (compact) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-6 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span>{label}</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex min-h-[200px] w-full items-center justify-center p-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-medium">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>{label}</span>
      </div>
    </div>
  );
}
