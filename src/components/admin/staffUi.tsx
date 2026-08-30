import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:ring-1 focus-visible:ring-gray-400/20 shadow-xs disabled:opacity-60";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-border bg-card p-6 shadow-sm lg:p-7",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-[17px] font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 justify-end sm:justify-start">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-1 px-6 text-center">
      <p className="text-[15px] text-foreground">{title}</p>
      <p className="text-[14px] text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
        active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-destructive")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
