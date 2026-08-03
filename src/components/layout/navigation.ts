import {
  Building2,
  FolderTree,
  LayoutGrid,
  Ruler,
  ScrollText,
  SlidersHorizontal,
  UserCircle,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  exact?: boolean;
  permission?: string;
  badge?: number;
};

export type NavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  exact?: boolean;
  permission?: string;
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
        label: "All businesses",
        href: "/businesses",
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
    id: "categories",
    label: "Business Categories",
    icon: FolderTree,
    app: {
      label: "Business Categories",
      fill: "linear-gradient(-42.95deg, #0e7e2e 5.06%, #42d00e 80.71%)",
      ink: "#ffffff",
    },
    children: [
      {
        label: "Categories",
        href: "/categories",
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
      {
        label: "Staff Roles",
        href: "/settings/roles",
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
