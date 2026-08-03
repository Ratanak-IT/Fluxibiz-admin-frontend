export type RecordStatus = "ACTIVE" | "INACTIVE";

/** One entry of the fixed vocabulary a role may draw from. */
export interface ShopPermission {
  key: string;
  group: string;
  label: string;
  hint: string;
}

export interface ShopRole {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  permissions: string[];
  system: boolean;
}

export interface ShopRoleRequest {
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface ShopStaff {
  userId: string;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  businessRoleId: string | null;
  businessRoleName: string | null;
  status: RecordStatus | null;
  enabled: boolean;
  joinedAt: string | null;
}

export interface StaffInviteRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  /** Omit to have Keycloak email a set password link instead. */
  temporaryPassword?: string;
  businessRoleId: string;
}
