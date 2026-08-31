import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { authClient } from "@/lib/auth/auth-client";
import { isTokenValid, tokenStore } from "@/lib/auth/tokenStore";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  credentials: "include",
  prepareHeaders: async (headers) => {
    let token = tokenStore.getAccessToken();

    if (!isTokenValid(token) && typeof window !== "undefined") {
      try {
        const { data } = await authClient.getAccessToken({
          providerId: "keycloak",
        });
        if (data?.accessToken) {
          token = data.accessToken;
          tokenStore.setTokens(token, "");
        }
      } catch {
        // ignore
      }
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && typeof window !== "undefined") {
    tokenStore.clear();
    try {
      const { data } = await authClient.getAccessToken({
        providerId: "keycloak",
      });
      if (data?.accessToken) {
        tokenStore.setTokens(data.accessToken, "");
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
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
