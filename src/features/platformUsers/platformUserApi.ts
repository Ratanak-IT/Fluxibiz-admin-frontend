import { baseApi } from "@/lib/baseApi";
import type {
  CreateStaffRequest,
  PlatformRolePage,
  PlatformRoleRequest,
  PlatformRoleResponse,
  StaffResponse,
  StaffStatus,
  UpdateStaffRequest,
} from "@/lib/types/adminTypes";

const PLATFORM = "/api/v1/platform";

export const platformUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformRoles: builder.query<PlatformRoleResponse[], void>({
      query: () => ({ url: `${PLATFORM}/roles`, params: { page: 0, size: 100 } }),
      transformResponse: (response: PlatformRolePage) => response.content,
      providesTags: ["Role"],
    }),

    getPlatformRolesPage: builder.query<PlatformRolePage, { page: number; size: number }>({
      query: ({ page, size }) => ({ url: `${PLATFORM}/roles`, params: { page, size } }),
      providesTags: ["Role"],
    }),

    getPlatformUsers: builder.query<StaffResponse[], void>({
      query: () => `${PLATFORM}/staff`,
      providesTags: ["PlatformUser"],
    }),

    createPlatformUser: builder.mutation<void, CreateStaffRequest>({
      query: (body) => ({ url: `${PLATFORM}/staff`, method: "POST", body }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),

    updatePlatformUser: builder.mutation<void, { userId: string; body: UpdateStaffRequest }>({
      query: ({ userId, body }) => ({ url: `${PLATFORM}/staff/${userId}`, method: "PUT", body }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),

    setUserStatus: builder.mutation<void, { userId: string; status: StaffStatus }>({
      query: ({ userId, status }) => ({
        url: `${PLATFORM}/staff/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),

    deletePlatformUser: builder.mutation<void, string>({
      query: (userId) => ({ url: `${PLATFORM}/staff/${userId}`, method: "DELETE" }),
      invalidatesTags: ["PlatformUser", "AuditLog"],
    }),

    createPlatformRole: builder.mutation<void, PlatformRoleRequest>({
      query: (body) => ({ url: `${PLATFORM}/roles`, method: "POST", body }),
      invalidatesTags: ["Role", "AuditLog"],
    }),

    updatePlatformRole: builder.mutation<void, { roleId: string; body: PlatformRoleRequest }>({
      query: ({ roleId, body }) => ({ url: `${PLATFORM}/roles/${roleId}`, method: "PUT", body }),
      invalidatesTags: ["Role", "PlatformUser", "AuditLog"],
    }),

    deletePlatformRole: builder.mutation<void, string>({
      query: (roleId) => ({ url: `${PLATFORM}/roles/${roleId}`, method: "DELETE" }),
      invalidatesTags: ["Role", "PlatformUser", "AuditLog"],
    }),
  }),
});

export const {
  useGetPlatformRolesQuery,
  useGetPlatformRolesPageQuery,
  useGetPlatformUsersQuery,
  useCreatePlatformUserMutation,
  useUpdatePlatformUserMutation,
  useSetUserStatusMutation,
  useDeletePlatformUserMutation,
  useCreatePlatformRoleMutation,
  useUpdatePlatformRoleMutation,
  useDeletePlatformRoleMutation,
} = platformUserApi;
