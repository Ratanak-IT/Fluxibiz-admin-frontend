export type BusinessOwnerStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface BusinessCategorySummary {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

/** Mirrors BusinessResponse on the server. */
export interface MyBusiness {
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
  category?: BusinessCategorySummary | null;
  baseCurrency?: string | null;
  displayCurrency?: string | null;
  socialLinks?: Array<Record<string, string>> | null;
}

export interface UpdateBusinessRequest {
  name?: string;
  about?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  cityOrProvince?: string | null;
  googleMap?: string | null;
  website?: string | null;
  categoryId?: string | null;
}
