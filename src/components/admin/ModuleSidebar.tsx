"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FolderTree,
  LayoutGrid,
  Menu,
  Ruler,
  ScrollText,
  SlidersHorizontal,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  business: Building2,
  category: FolderTree,
  audit: ScrollText,
  unit: Ruler,
  overview: LayoutGrid,
  account: UserCog,
  settings: SlidersHorizontal,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export interface SidebarItem {
  label: string;
  href: string;
  icon: IconKey;
}

export function ModuleSidebar({
  title,
  icon,
  items,
}: {
  title: string;
  icon: IconKey;
  items: SidebarItem[];
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const TitleIcon = ICONS[icon];
  const rootHref = items[0]?.href;

  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const heading = (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
        <TitleIcon className="size-5" strokeWidth={1.9} aria-hidden />
      </span>
      <span className="whitespace-pre-line text-[15px] font-semibold leading-tight text-foreground">
        {title}
      </span>
    </div>
  );

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
     
        const active =
          item.href === pathname || (item.href !== rootHref && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
 "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition",
 "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-brand-subtle font-medium text-brand-subtle-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.8} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
        {heading}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open module menu"
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-card p-5 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              {heading}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close module menu"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <aside className="sticky top-[var(--header-height)] hidden h-[calc(100vh-var(--header-height))] w-64 shrink-0 overflow-y-auto border-r border-border px-4 py-6 lg:block">
        <div className="mb-6 px-2">{heading}</div>
        {nav}
      </aside>
    </>
  );
}
