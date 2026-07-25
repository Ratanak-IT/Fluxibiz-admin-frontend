import {
  Building2,
  FolderTree,
  LayoutGrid,
  Ruler,
  ScrollText,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface AdminModule {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  hint: string;
}


export const ADMIN_MODULES: AdminModule[] = [
  {
    key: "businesses",
    label: "Business\nManagement",
    href: "/businesses",
    icon: Building2,
    available: true,
    hint: "Approve, suspend and close shops",
  },
  {
    key: "overview",
    label: "Overview\nDashboard",
    href: "/overview",
    icon: LayoutGrid,
    available: true,
    hint: "Platform totals and growth",
  },
  {
    key: "categories",
    label: "Business\nCategories",
    href: "/categories",
    icon: FolderTree,
    available: true,
    hint: "The category tree shops choose from",
  },
  {
    key: "units",
    label: "Units",
    href: "/units",
    icon: Ruler,
    available: true,
    hint: "Shared measures like kg and box",
  },
  {
    key: "audit",
    label: "Audit\nLog",
    href: "/audit-logs",
    icon: ScrollText,
    available: true,
    hint: "Who changed what, and why",
  },
  {
    key: "account",
    label: "Account",
    href: "/account",
    icon: UserCog,
    available: true,
    hint: "Your admin profile and session",
  },
];
