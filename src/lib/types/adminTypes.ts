export type BusinessOwnerStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BusinessSubCategoryResponse {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface BusinessResponse {
  id: string;
  keycloakUserId: string;
  slug: string;
  name: string;
  status: BusinessOwnerStatus;
  provisionedAt?: string | null;
  logo?: string | null;
  thumbnail?: string | null;
  about?: string | null;
  phoneNumber?: string | null;
  googleMap?: string | null;
  address?: string | null;
  cityOrProvince?: string | null;
  website?: string | null;
  email?: string | null;
  isEnabled: boolean;
  isListing: boolean;
  isClosed: boolean;
  category?: BusinessSubCategoryResponse | null;
  baseCurrency?: string | null;
  displayCurrency?: string | null;
  socialLinks?: Array<Record<string, string>> | null;
}

export interface BusinessQuery {
  status?: BusinessOwnerStatus;
  isEnabled?: boolean;
  isClosed?: boolean;
  categoryId?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface StatusActionRequest {
  reason?: string;
}

export interface CategoryCountResponse {
  categoryName: string;
  businessCount: number;
}

export interface MonthlyCountResponse {
  month: string;
  count: number;
}

export interface PlatformDashboardResponse {
  totalBusinesses: number;
  newBusinessesLast30Days: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  deletedBusinesses: number;
  closedBusinesses: number;
  businessesByCategory: CategoryCountResponse[];
  businessGrowth: MonthlyCountResponse[];
}

export type AdminActionType =
  | "BUSINESS_ACTIVATED"
  | "BUSINESS_SUSPENDED"
  | "BUSINESS_ENABLED"
  | "BUSINESS_DISABLED"
  | "BUSINESS_CLOSED"
  | "BUSINESS_REOPENED"
  | "BUSINESS_DELETED"
  | "BUSINESS_CATEGORY_CREATED"
  | "BUSINESS_CATEGORY_UPDATED"
  | "BUSINESS_CATEGORY_DELETED"
  | "UNIT_CREATED"
  | "UNIT_UPDATED"
  | "UNIT_DELETED";

export interface AdminAuditLogResponse {
  id: string;
  actorId: string;
  actorUsername: string;
  actionType: AdminActionType;
  targetType: "BUSINESS" | "BUSINESS_CATEGORY" | "UNIT";
  targetId: string;
  targetLabel?: string | null;
  previousState?: string | null;
  newState?: string | null;
  reason?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface BusinessCategoryResponse {
  id: string;
  name: string;
  slug: string;
  subCategories: BusinessSubCategoryResponse[];
}

export interface BusinessCategoryUpsertRequest {
  name: string;
  parentId?: string | null;
  icon?: string | null;
}

export interface RealmRoleResponse {
  id: string;
  name: string;
  description: string | null;
  protectedRole: boolean;
}

export interface PlatformUserResponse {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  createdAt: string | null;
}

export interface PlatformUserRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  temporaryPassword?: string;
  roles: string[];
}
