import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

// No token handling here on purpose: every request goes to our own
// `/api/v1/...` route handler (same origin), which resolves the bearer token
// server-side from the httpOnly session cookie and attaches it itself. The
// browser only ever carries that httpOnly cookie — it never sees, stores, or
// sends an access/refresh token.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  credentials: "include",
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && typeof window !== "undefined") {
    // The session itself is gone (expired refresh token, signed out
    // elsewhere, ...) — nothing left to retry client-side.
    window.location.href = "/login";
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Business",
    "AuditLog",
    "Unit",
    "BusinessCategory",
    "Dashboard",
    "Role",
    "PlatformUser",
    "MyBusiness",
    "ShopRole",
    "ShopStaff",
    "BusinessFeature",
    "PlatformFeature",
    "UserProfile",
    "SalesChannel",
  ],
  endpoints: () => ({}),
});
