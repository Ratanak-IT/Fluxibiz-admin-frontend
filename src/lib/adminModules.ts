import {
  Building2,
  FolderTree,
  LayoutGrid,
  Ruler,
  ScrollText,
  UserCircle,
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
  requires: string;
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    key: "businesses",
    label: "Business\nManagement",
    href: "/businesses",
    icon: Building2,
    available: true,
    hint: "Approve, suspend and close shops",
    requires: "BUSINESS_READ",
  },
  {
    key: "overview",
    label: "Overview\nDashboard",
    href: "/overview",
    icon: LayoutGrid,
    available: true,
    hint: "Platform totals and growth",
    requires: "DASHBOARD_READ",
  },
  {
    key: "categories",
    label: "Business\nCategories",
    href: "/categories",
    icon: FolderTree,
    available: true,
    hint: "The category tree shops choose from",
    requires: "CATEGORY_READ",
  },
  {
    key: "units",
    label: "Units",
    href: "/units",
    icon: Ruler,
    available: true,
    hint: "Shared measures like kg and box",
    requires: "UNIT_READ",
  },
  {
    key: "audit",
    label: "Audit\nLog",
    href: "/audit-logs",
    icon: ScrollText,
    available: true,
    hint: "Who changed what, and why",
    requires: "AUDIT_READ",
  },
  {
    key: "user",
    label: "Platform\nStaff",
    href: "/users",
    icon: UserCog,
    available: true,
    hint: "Colleagues who work in this console",
    requires: "USER_READ",
  },
  {
    key: "account",
    label: "Account",
    href: "/account",
    icon: UserCircle,
    available: true,
    hint: "Your admin profile and session",
    requires: "",
  },
];

export function visibleModules(roles: string[], superAdminRole: string): AdminModule[] {
  if (roles.includes(superAdminRole)) {
    return ADMIN_MODULES;
  }

  return ADMIN_MODULES.filter((module) => !module.requires || roles.includes(module.requires));
}
