"use client";

import {
  Building2,
  FolderTree,
  LayoutGrid,
  Ruler,
  ScrollText,
  SlidersHorizontal,
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
  // Navigation is managed directly by AppShell Sidebar.tsx matching ipos-business-dashboard
  return null;
}
