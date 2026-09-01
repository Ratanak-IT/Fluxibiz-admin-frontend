import {
  Building2,
  Calendar,
  Compass,
  LayoutGrid,
  Ruler,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  exact?: boolean;
  badge?: number;
};

export type NavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  exact?: boolean;
  children?: NavLink[];
  app?: {
    label: string;
    fill: string;
    ink: string;
  };
};

export const NAVIGATION: NavSection[] = [
  {
    id: "businesses",
    label: "Business Management",
    icon: Building2,
    app: {
      label: "Business Management",
      fill: "linear-gradient(155deg, #46ca22 0%, #0e8a1e 71.64%)",
      ink: "#ffffff",
    },
    children: [
      {
        label: "All Business",
        href: "/businesses",
      },
      {
        label: "Categories",
        href: "/businesses/categories",
      },
    ],
  },
  {
    id: "overview",
    label: "Overview Dashboard",
    icon: LayoutGrid,
    app: {
      label: "Overview Dashboard",
      fill: "linear-gradient(-42.73deg, #008000 14.44%, #36f928 91.63%)",
      ink: "#ffffff",
    },
    children: [
      {
        label: "Overview",
        href: "/overview",
        exact: true,
      },
    ],
  },
  {
    id: "units",
    label: "Units",
    icon: Ruler,
    app: {
      label: "Units",
      fill: "linear-gradient(-40.5deg, #08832b 20.11%, #48d321 82.16%)",
      ink: "#ffffff",
    },
    children: [
      {
        label: "Unit Measures",
        href: "/units",
      },
    ],
  },
  {
    id: "channels",
    label: "Shop Channels",
    icon: Building2,
    app: {
      label: "Shop Channels",
      fill: "#e8e8e8",
      ink: "#00932a",
    },
    children: [
      {
        label: "Channels",
        href: "/channels",
        exact: true,
      },
    ],
  },
  {
    id: "audit",
    label: "Audit Log",
    icon: ScrollText,
    app: {
      label: "Audit Log",
      fill: "#e8e8e8",
      ink: "#00932a",
    },
    children: [
      {
        label: "Audit Logs",
        href: "/audit-logs",
      },
    ],
  },

  {
    id: "users",
    label: "Platform Staff",
    icon: UserCog,
    app: {
      label: "Platform Staff",
      fill: "#e8e8e8",
      ink: "#00932a",
    },
    children: [
      {
        label: "Staff Members",
        href: "/users",
        exact: true,
      },
      {
        label: "Roles & Permissions",
        href: "/users/roles",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SlidersHorizontal,
    app: {
      label: "Settings",
      fill: "#e8e8e8",
      ink: "#00932a",
    },
    children: [
      {
        label: "Platform Features",
        href: "/settings/platform-features",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: UserCircle,
    app: {
      label: "Account",
      fill: "#e8e8e8",
      ink: "#00932a",
    },
    children: [
      {
        label: "Account Profile",
        href: "/account",
      },
    ],
  },
];

export function sectionEntryHref(section: NavSection) {
  const firstChild = section.children?.[0];
  return (
    section.href ??
    (firstChild ? firstChild.href : "/overview") ??
    "/overview"
  );
}

export function isLeafActive(leaf: NavLink, pathname: string): boolean {
  if (leaf.href === "/businesses" && pathname.startsWith("/businesses/categories")) {
    return false;
  }

  return leaf.exact
    ? pathname === leaf.href
    : pathname === leaf.href || pathname.startsWith(`${leaf.href}/`);
}

export function isSectionActive(section: NavSection, pathname: string): boolean {
  if (section.children) {
    return section.children.some((leaf) => isLeafActive(leaf, pathname));
  }
  if (!section.href) return false;
  return section.exact
    ? pathname === section.href
    : pathname === section.href || pathname.startsWith(`${section.href}/`);
}

/**
 * Paths that need a permission check but aren't (and shouldn't become) their
 * own visible sidebar link — e.g. `/channels/manage` is reached from inside
 * the Shop Channels page, not a nav entry of its own. `sectionId: null` means
 * the area has no PermissionCode of its own yet, so it's restricted to
 * SUPER_ADMIN/GLOBLE_ADMIN until one exists.
 */
const EXTRA_ROUTE_PERMISSIONS: { prefix: string; sectionId: string | null }[] = [
  { prefix: "/channels/manage", sectionId: "channels" },
  { prefix: "/settings/webhooks", sectionId: "settings" },
  { prefix: "/categories", sectionId: "businesses" },
  { prefix: "/logs", sectionId: null },
  { prefix: "/subscriptions", sectionId: null },
];

/**
 * Resolves which permission section (if any) gates a path. Returns:
 * - a section id — the path needs `canAccessSection(roles, id)`
 * - `null` — the path has no permission of its own yet; SUPER_ADMIN/GLOBLE_ADMIN only
 * - `undefined` — the path is open to any signed-in staff member (e.g. /account)
 */
export function sectionIdForPath(pathname: string): string | null | undefined {
  const navSection = NAVIGATION.find((section) => isSectionActive(section, pathname));
  if (navSection) return navSection.id;

  const extra = EXTRA_ROUTE_PERMISSIONS.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );
  return extra ? extra.sectionId : undefined;
}

export type PageTitle = {
  app: string;
  page?: string;
};

export function getPageTitle(pathname: string): PageTitle {
  for (const section of NAVIGATION) {
    const app = section.app?.label ?? section.label;

    if (section.children) {
      const leaf = section.children.find((child) => isLeafActive(child, pathname));
      if (leaf) {
        return { app, page: leaf.label };
      }
    }

    if (isSectionActive(section, pathname)) {
      return { app };
    }
  }

  if (pathname.startsWith("/account")) return { app: "Account" };

  return { app: "Admin Platform" };
}
