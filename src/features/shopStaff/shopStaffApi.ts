import { baseApi } from "@/lib/baseApi";
import type {
  ShopPermission,
  ShopRole,
  ShopRoleRequest,
  ShopStaff,
  StaffInviteRequest,
} from "@/lib/types/shopStaffTypes";


const shop = (businessId: string) => `/api/v1/businesses/${businessId}`;

export const shopStaffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShopPermissions: builder.query<ShopPermission[], string>({
      query: (businessId) => `${shop(businessId)}/roles/permissions`,
    }),

    getShopRoles: builder.query<ShopRole[], string>({
      query: (businessId) => `${shop(businessId)}/roles`,
      providesTags: ["ShopRole"],
    }),

    seedDefaultRoles: builder.mutation<ShopRole[], string>({
      query: (businessId) => ({ url: `${shop(businessId)}/roles/defaults`, method: "POST" }),
      invalidatesTags: ["ShopRole"],
    }),

    createShopRole: builder.mutation<ShopRole, { businessId: string } & ShopRoleRequest>({
      query: ({ businessId, ...body }) => ({ url: `${shop(businessId)}/roles`, method: "POST", body }),
      invalidatesTags: ["ShopRole"],
    }),

    updateShopRole: builder.mutation<ShopRole, { businessId: string; roleId: string } & ShopRoleRequest>({
      query: ({ businessId, roleId, ...body }) => ({
        url: `${shop(businessId)}/roles/${roleId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ShopRole", "ShopStaff"],
    }),

    deleteShopRole: builder.mutation<void, { businessId: string; roleId: string }>({
      query: ({ businessId, roleId }) => ({
        url: `${shop(businessId)}/roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShopRole"],
    }),

    getShopStaff: builder.query<ShopStaff[], string>({
      query: (businessId) => `${shop(businessId)}/staff`,
      providesTags: ["ShopStaff"],
    }),

    inviteStaff: builder.mutation<ShopStaff, { businessId: string } & StaffInviteRequest>({
      query: ({ businessId, ...body }) => ({ url: `${shop(businessId)}/staff`, method: "POST", body }),
      invalidatesTags: ["ShopStaff"],
    }),

    changeStaffRole: builder.mutation<
      ShopStaff,
      { businessId: string; userId: string; businessRoleId: string }
    >({
      query: ({ businessId, userId, businessRoleId }) => ({
        url: `${shop(businessId)}/staff/${userId}/role`,
        method: "PUT",
        body: { businessRoleId },
      }),
      invalidatesTags: ["ShopStaff"],
    }),

    setStaffActive: builder.mutation<
      ShopStaff,
      { businessId: string; userId: string; active: boolean }
    >({
      query: ({ businessId, userId, active }) => ({
        url: `${shop(businessId)}/staff/${userId}/${active ? "activate" : "deactivate"}`,
        method: "PATCH",
      }),
      invalidatesTags: ["ShopStaff"],
    }),

    removeStaff: builder.mutation<void, { businessId: string; userId: string }>({
      query: ({ businessId, userId }) => ({
        url: `${shop(businessId)}/staff/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShopStaff"],
    }),
  }),
});

export const {
  useGetShopPermissionsQuery,
  useGetShopRolesQuery,
  useSeedDefaultRolesMutation,
  useCreateShopRoleMutation,
  useUpdateShopRoleMutation,
  useDeleteShopRoleMutation,
  useGetShopStaffQuery,
  useInviteStaffMutation,
  useChangeStaffRoleMutation,
  useSetStaffActiveMutation,
  useRemoveStaffMutation,
} = shopStaffApi;
