import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}


export function PageShell({
  crumbs,
  title,
  subtitle,
  action,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center text-sm">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center">
            {index > 0 && <span className="px-2 text-muted-foreground/60">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground transition hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

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
    </main>
  );
}
