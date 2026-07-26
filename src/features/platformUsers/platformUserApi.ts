import { baseApi } from "@/lib/baseApi";
import type {
  PlatformUserRequest,
  PlatformUserResponse,
  RealmRoleResponse,
} from "@/lib/types/adminTypes";

const ADMIN = "/api/v1/admin";

export const platformUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRealmRoles: builder.query<RealmRoleResponse[], void>({
      query: () => `${ADMIN}/roles`,
      providesTags: ["Role"],
    }),

    getPlatformUsers: builder.query<PlatformUserResponse[], { keyword?: string } | void>({
      query: (params) => ({
        url: `${ADMIN}/users`,
        params: params?.keyword ? { keyword: params.keyword, max: 50 } : { max: 50 },
      }),
      providesTags: ["PlatformUser"],
    }),

    createPlatformUser: builder.mutation<PlatformUserResponse, PlatformUserRequest>({
      query: (body) => ({ url: `${ADMIN}/users`, method: "POST", body }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),

    replaceUserRoles: builder.mutation<
      PlatformUserResponse,
      { userId: string; roles: string[] }
    >({
      query: ({ userId, roles }) => ({
        url: `${ADMIN}/users/${userId}/roles`,
        method: "PUT",
        body: { roles },
      }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),

    setUserEnabled: builder.mutation<PlatformUserResponse, { userId: string; enabled: boolean }>({
      query: ({ userId, enabled }) => ({
        url: `${ADMIN}/users/${userId}/${enabled ? "enable" : "disable"}`,
        method: "PATCH",
      }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),
  }),
});

export const {
  useGetRealmRolesQuery,
  useGetPlatformUsersQuery,
  useCreatePlatformUserMutation,
  useReplaceUserRolesMutation,
  useSetUserEnabledMutation,
} = platformUserApi;
