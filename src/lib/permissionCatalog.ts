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

/**
 * Codes must match `PermissionCode` in the backend exactly (kebab:action
 * strings, not the old SCREAMING_SNAKE Keycloak realm-role names) and be
 * flagged `platformStaffAssignable = true` there — anything else is rejected
 * with "Unknown permission" or "Permission cannot be assigned to platform
 * staff" by `KeycloakRoleAdapter`. Business-scoped codes (order:create,
 * item:read, ...) live in the business dashboard's own catalog instead.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "businesses",
    title: "Businesses",
    options: [
      { role: "admin-business:read", label: "View businesses", hint: "See the shop list and each shop's details" },
      { role: "admin-business:manage", label: "Manage businesses", hint: "Suspend, close, reopen or otherwise change a shop" },
      { role: "admin-business:delete", label: "Delete businesses", hint: "Mark a shop as deleted" },
    ],
  },
  {
    key: "catalog",
    title: "Shared catalog",
    options: [
      { role: "admin-category:read", label: "View categories", hint: "The list shop owners choose from" },
      { role: "admin-category:create", label: "Create categories", hint: "Add a new category" },
      { role: "admin-category:update", label: "Edit categories", hint: "Rename or change a category" },
      { role: "admin-category:delete", label: "Delete categories", hint: "Remove a category" },
      { role: "admin-unit:read", label: "View units", hint: "Shared measures such as kilogram and box" },
      { role: "admin-unit:create", label: "Create units", hint: "Add a new unit" },
      { role: "admin-unit:update", label: "Edit units", hint: "Rename or change a unit" },
      { role: "admin-unit:delete", label: "Delete units", hint: "Remove a unit" },
    ],
  },
  {
    key: "insight",
    title: "Reporting",
    options: [
      { role: "admin-dashboard:read", label: "View dashboard", hint: "Platform totals and growth" },
      { role: "admin-audit:read", label: "View audit log", hint: "Who changed what, and why" },
    ],
  },
  {
    key: "platform",
    title: "Role management",
    options: [
      { role: "role:read", label: "View roles", hint: "See the roles and permissions that exist" },
      { role: "role:create", label: "Create roles", hint: "Add a new role" },
      { role: "role:update", label: "Edit roles", hint: "Change what a role can do" },
      { role: "role:delete", label: "Delete roles", hint: "Remove a role" },
      { role: "role:assign", label: "Assign roles", hint: "Give a role to a staff member" },
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