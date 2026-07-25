"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FolderTree,
  LayoutGrid,
  Ruler,
  ScrollText,
  UserCog,
  type LucideIcon,
} from "lucide-react";


const ICONS = {
  business: Building2,
  category: FolderTree,
  audit: ScrollText,
  unit: Ruler,
  overview: LayoutGrid,
  account: UserCog,
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
  const TitleIcon = ICONS[icon];
  const rootHref = items[0]?.href;

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 px-4 py-6">
      <div className="mb-6 flex items-center gap-3 px-2">
        <span className="grid size-12 place-items-center rounded-xl bg-green-700 text-white">
          <TitleIcon className="size-6" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="whitespace-pre-line text-[15px] font-semibold leading-tight text-neutral-900">
          {title}
        </span>
      </div>

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
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
                active
                  ? "bg-green-50 font-medium text-green-700"
                  : "text-neutral-700 hover:bg-neutral-50",
              ].join(" ")}
            >
              <Icon className="size-5" strokeWidth={1.8} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}