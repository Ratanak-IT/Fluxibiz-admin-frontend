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

export interface TrendCountResponse {
  day?: string;
  date?: string;
  month?: string;
  count: number;
}

export type MonthlyCountResponse = TrendCountResponse;

export interface ActiveBusinessResponse {
  businessId: string;
  businessName: string;
  orders: number;
  itemsSold: number;
}

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
  businessGrowth: TrendCountResponse[];
  orderTrend: TrendCountResponse[];
  mostActiveBusinesses: ActiveBusinessResponse[];
}

/** How one shop reaches its customers. Configuration only, no secrets. */
export interface BusinessChannelResponse {
  businessId: string;
  businessName: string;
  slug: string;
  logo?: string | null;
  thumbnail?: string | null;

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
  | "UNIT_DELETED"
  | "BUSINESS_FEATURE_ENABLED"
  | "BUSINESS_FEATURE_DISABLED";

export interface AdminAuditLogResponse {
  id: string;
  actorId: string;
  actorUsername: string;
  actionType: AdminActionType;
  targetType: "BUSINESS" | "BUSINESS_CATEGORY" | "UNIT" | "BUSINESS_FEATURE";
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

export type StaffStatus = "ACTIVE" | "INACTIVE";

export interface PlatformRoleResponse {
  id: string;
  name: string;
  permissions: string[];
}

export interface PlatformRoleRequest {
  name: string;
  permissions: string[];
}

export interface PlatformRolePage {
  content: PlatformRoleResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface StaffResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: StaffStatus;
  roleId: string | null;
}

export interface CreateStaffRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  roleId?: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  roleId?: string;
}

export type BusinessFeature = "STOREFRONT" | "TELEGRAM_BOT" | "KHQR_PAYMENT";

/** One switch the platform holds over a shop. Absent row means enabled. */
export interface BusinessFeatureResponse {
  feature: BusinessFeature;
  label: string;
  description: string;
  enabled: boolean;
  disabledReason: string | null;
  disabledBy: string | null;
  disabledAt: string | null;
}

export interface FeatureToggleRequest {
  feature: BusinessFeature;
  enabled: boolean;
  reason?: string;
}

/**
 * Platform-wide switch for a feature, independent of any single shop.
 * When off, the feature is unavailable to every business regardless of
 * that business's own BusinessFeatureResponse.enabled value — the
 * effective availability is platformEnabled && businessEnabled.
 */
export interface PlatformFeatureResponse {
  feature: BusinessFeature;
  label: string;
  description: string;
  enabled: boolean;
  disabledReason: string | null;
  disabledBy: string | null;
  disabledAt: string | null;
}

export interface PlatformFeatureToggleRequest {
  feature: BusinessFeature;
  enabled: boolean;
  reason?: string;
}

export interface SalesChannelResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CreateSalesChannelRequest {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateSalesChannelRequest {
  name?: string;
  code?: string;
  isActive?: boolean;
}
