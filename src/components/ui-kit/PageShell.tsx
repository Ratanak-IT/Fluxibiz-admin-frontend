import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  crumbs?: Crumb[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="mt-7">{children}</div>
    </div>
  );
}
