import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { refreshIfNeeded } from "@/lib/auth/session";
import { redirectToLogin } from "@/lib/auth/keycloak";
import { tokenStore } from "@/lib/auth/tokenStore";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await refreshIfNeeded();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const token = await refreshIfNeeded();

    if (token) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      tokenStore.clear();
      await redirectToLogin();
    }
  }

  return result;
};



export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Business", "AuditLog", "Unit", "BusinessCategory", "Dashboard",
           "Role", "PlatformUser", "MyBusiness", "ShopRole", "ShopStaff",
           "BusinessFeature", "PlatformFeature"],
  endpoints: () => ({}),
});
