export interface PermissionOption {
  role: string;
  label: string;
  hint: string;
}

export interface PermissionGroup {
  key: string;
  title: string;
  options: PermissionOption[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "businesses",
    title: "Businesses",
    options: [
      { role: "BUSINESS_READ", label: "View businesses", hint: "See the shop list and each shop's details" },
      { role: "BUSINESS_WRITE", label: "Edit businesses", hint: "Change shop records" },
      { role: "BUSINESS_SUSPEND", label: "Suspend and activate", hint: "Block a shop from trading, or let it back in" },
      { role: "BUSINESS_CLOSE", label: "Close and reopen", hint: "Take a shop out of the public directory" },
      { role: "BUSINESS_DELETE", label: "Delete", hint: "Mark a shop as deleted" },
    ],
  },
  {
    key: "catalog",
    title: "Shared catalog",
    options: [
      { role: "CATEGORY_READ", label: "View categories", hint: "The list shop owners choose from" },
      { role: "CATEGORY_WRITE", label: "Manage categories", hint: "Add, rename and remove categories" },
      { role: "UNIT_READ", label: "View units", hint: "Shared measures such as kilogram and box" },
      { role: "UNIT_WRITE", label: "Manage units", hint: "Add, rename and remove units" },
    ],
  },
  {
    key: "insight",
    title: "Reporting",
    options: [
      { role: "DASHBOARD_READ", label: "View dashboard", hint: "Platform totals and growth" },
      { role: "AUDIT_READ", label: "View audit log", hint: "Who changed what, and why" },
    ],
  },
  {
    key: "platform",
    title: "Platform administration",
    options: [
      { role: "USER_READ", label: "View staff", hint: "See colleagues and what they may do" },
      { role: "USER_WRITE", label: "Manage staff", hint: "Create colleagues and change their permissions" },
      { role: "ROLE_READ", label: "View roles", hint: "See the permission names that exist" },
      { role: "ROLE_WRITE", label: "Manage roles", hint: "Add or remove permission names themselves" },
      { role: "PLATFORM_FEATURE_WRITE", label: "Platform-wide feature switches", hint: "Turn a feature off for every shop at once" },
    ],
  },
];

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export const HIDDEN_ROLES = [
  "USER",
  "offline_access",
  "uma_authorization",
  "default-roles",
  "BUSINESS",
  "BUSINESS_STAFF",
  "CUSTOMER",
  "GLOBAL_USER",
];

export function isHiddenRole(role: string): boolean {
  return HIDDEN_ROLES.some((hidden) => role === hidden || role.startsWith("default-roles"));
}

export function labelForRole(role: string): string {
  for (const group of PERMISSION_GROUPS) {
    const found = group.options.find((option) => option.role === role);
    if (found) return found.label;
  }
  return role;
}

export function allPermissionRoles(): string[] {
  return PERMISSION_GROUPS.flatMap((group) => group.options.map((option) => option.role));
}