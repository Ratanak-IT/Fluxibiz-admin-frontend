export interface PermissionOption {
  role: string;
  label: string;
  hint: string;
}

export interface PermissionGroup {
  /** Matches a `NavSection.id` in `components/layout/navigation.ts` 1:1, so
   *  sidebar/app-launcher visibility can be derived straight from this catalog. */
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
 *
 * Groups mirror the 7 admin sidebar sections exactly (`key` === `NavSection.id`)
 * so a staff member's assigned permissions map directly onto which app tiles
 * and sidebar sections they see.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "businesses",
    title: "Business Management",
    options: [
      { role: "admin-business:read", label: "View businesses", hint: "See the shop list and each shop's details" },
      { role: "admin-business:manage", label: "Manage businesses", hint: "Suspend, close, reopen or otherwise change a shop" },
      { role: "admin-business:delete", label: "Delete businesses", hint: "Mark a shop as deleted" },
      { role: "admin-category:read", label: "View categories", hint: "The list shop owners choose from" },
      { role: "admin-category:create", label: "Create categories", hint: "Add a new category" },
      { role: "admin-category:update", label: "Edit categories", hint: "Rename or change a category" },
      { role: "admin-category:delete", label: "Delete categories", hint: "Remove a category" },
    ],
  },
  {
    key: "overview",
    title: "Overview Dashboard",
    options: [
      { role: "admin-dashboard:read", label: "View dashboard", hint: "Platform totals and growth" },
    ],
  },
  {
    key: "units",
    title: "Units",
    options: [
      { role: "admin-unit:read", label: "View units", hint: "Shared measures such as kilogram and box" },
      { role: "admin-unit:create", label: "Create units", hint: "Add a new unit" },
      { role: "admin-unit:update", label: "Edit units", hint: "Rename or change a unit" },
      { role: "admin-unit:delete", label: "Delete units", hint: "Remove a unit" },
    ],
  },
  {
    key: "channels",
    title: "Shop Channels",
    options: [
      { role: "admin-channel:read", label: "View channels", hint: "See the sales channels shops can adopt" },
      { role: "admin-channel:manage", label: "Manage channels", hint: "Add, edit or remove a sales channel" },
    ],
  },
  {
    key: "audit",
    title: "Audit Log",
    options: [
      { role: "admin-audit:read", label: "View audit log", hint: "Who changed what, and why" },
    ],
  },
  {
    key: "users",
    title: "Platform Staff",
    options: [
      { role: "role:read", label: "View roles", hint: "See the roles and permissions that exist" },
      { role: "role:create", label: "Create roles", hint: "Add a new role" },
      { role: "role:update", label: "Edit roles", hint: "Change what a role can do" },
      { role: "role:delete", label: "Delete roles", hint: "Remove a role" },
      { role: "role:assign", label: "Assign roles", hint: "Give a role to a staff member" },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    options: [
      { role: "admin-platform-feature:read", label: "View platform features", hint: "See which features are switched on" },
      { role: "admin-platform-feature:update", label: "Manage platform features", hint: "Switch a platform feature on or off" },
    ],
  },
];

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

/**
 * A second realm role with the exact same full-access rights as
 * SUPER_ADMIN. Kept as its own constant (rather than folded into
 * SUPER_ADMIN_ROLE) so any place naming the platform's top role stays
 * accurate about there being two, not one, spelled-out account types.
 */
export const GLOBAL_ADMIN_ROLE = "GLOBLE_ADMIN";

export const FULL_ACCESS_ROLES = [SUPER_ADMIN_ROLE, GLOBAL_ADMIN_ROLE];

export const HIDDEN_ROLES = [
  "USER",
  "offline_access",
  "uma_authorization",
  "default-roles",
  "BUSINESS",
  "BUSINESS_STAFF",
  "CUSTOMER",
  "GLOBAL_USER",
  "GLOBLE_CUSTOMER",
];

export function isHiddenRole(role: string): boolean {
  return HIDDEN_ROLES.some((hidden) => role === hidden || role.startsWith("default-roles"));
}

export const EXPLICITLY_DENIED_ROLES = ["BUSINESS", "GLOBLE_CUSTOMER"];

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

export function hasAnyPlatformPermission(roles: string[]): boolean {
  // Full access wins outright, even for an account that also happens to
  // carry BUSINESS/GLOBLE_CUSTOMER alongside it (e.g. a shared test
  // account, or a platform admin who is separately also a shop owner) —
  // the deny-list exists to stop accounts that have *only* a shopper/owner
  // role from getting in, not to override an explicit admin grant.
  if (roles.some((role) => FULL_ACCESS_ROLES.includes(role))) return true;
  if (roles.some((role) => EXPLICITLY_DENIED_ROLES.includes(role))) return false;
  return allPermissionRoles().some((permission) => roles.includes(permission));
}

/**
 * Whether the given roles/permissions grant access to a sidebar section.
 * SUPER_ADMIN/GLOBLE_ADMIN always pass. A section with no matching entry in
 * `PERMISSION_GROUPS` (e.g. "account") has no permission of its own and is
 * open to any signed-in staff member.
 */
export function canAccessSection(roles: string[], sectionId: string): boolean {
  if (roles.some((role) => FULL_ACCESS_ROLES.includes(role))) return true;
  const group = PERMISSION_GROUPS.find((candidate) => candidate.key === sectionId);
  if (!group) return true;
  return group.options.some((option) => roles.includes(option.role));
}