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

export interface ActiveBusinessResponse {
  businessId: string;
  businessName: string;
  orders: number;
  itemsSold: number;
}

/**
 * Platform health for the operator. Carries no money on purpose: what a shop
 * earns is its own business, so the console reports activity and configuration.
 */
export interface PlatformDashboardResponse {
  totalBusinesses: number;
  newBusinessesLast30Days: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  deletedBusinesses: number;
  closedBusinesses: number;

  ordersPaidLast30Days: number;
  tradingBusinessesLast30Days: number;
  storefrontsPublished: number;
  telegramBotsConnected: number;

  businessesByCategory: CategoryCountResponse[];
  businessGrowth: MonthlyCountResponse[];
  orderTrend: MonthlyCountResponse[];
  mostActiveBusinesses: ActiveBusinessResponse[];
}

/** How one shop reaches its customers. Configuration only, no secrets. */
export interface BusinessChannelResponse {
  businessId: string;
  businessName: string;
  slug: string;

  storefrontPublished: boolean;
  storefrontUrl: string | null;
  website: string | null;

  telegramConnected: boolean;
  telegramBotUsername: string | null;
  telegramBotId: number | null;
  telegramActive: boolean;

  bakongConfigured: boolean;
  bakongActive: boolean;

  registeredAt: string | null;
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
