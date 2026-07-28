import { baseApi } from "@/lib/baseApi";
import type {
  AdminAuditLogResponse,
  BusinessFeatureResponse,
  FeatureToggleRequest,
  BusinessChannelResponse,
  BusinessCategoryResponse,
  BusinessCategoryUpsertRequest,
  BusinessQuery,
  BusinessResponse,
  Page,
  PlatformDashboardResponse,
  PlatformFeatureResponse,
  PlatformFeatureToggleRequest,
  StatusActionRequest,
} from "@/lib/types/adminTypes";

const ADMIN = "/api/v1/admin";

const toParams = (query: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));

export const businessAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformDashboard: builder.query<PlatformDashboardResponse, void>({
      query: () => `${ADMIN}/dashboard`,
      providesTags: ["Dashboard"],
    }),

    getBusinessChannels: builder.query<BusinessChannelResponse[], void>({
      query: () => `${ADMIN}/channels`,
      providesTags: ["Business"],
    }),

    getBusinesses: builder.query<Page<BusinessResponse>, BusinessQuery | void>({
      query: (query) => ({
        url: `${ADMIN}/businesses`,
        params: toParams({ size: 20, ...(query ?? {}) }),
      }),
      providesTags: ["Business"],
    }),

    getBusiness: builder.query<BusinessResponse, string>({
      query: (businessId) => `${ADMIN}/businesses/${businessId}`,
      providesTags: ["Business"],
    }),

    activateBusiness: builder.mutation<BusinessResponse, string>({
      query: (businessId) => ({ url: `${ADMIN}/businesses/${businessId}/activate`, method: "PATCH" }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    suspendBusiness: builder.mutation<BusinessResponse, { businessId: string } & StatusActionRequest>({
      query: ({ businessId, ...body }) => ({
        url: `${ADMIN}/businesses/${businessId}/suspend`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    enableBusiness: builder.mutation<BusinessResponse, string>({
      query: (businessId) => ({ url: `${ADMIN}/businesses/${businessId}/enable`, method: "PATCH" }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    disableBusiness: builder.mutation<BusinessResponse, { businessId: string } & StatusActionRequest>({
      query: ({ businessId, ...body }) => ({
        url: `${ADMIN}/businesses/${businessId}/disable`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    closeBusiness: builder.mutation<BusinessResponse, { businessId: string } & StatusActionRequest>({
      query: ({ businessId, ...body }) => ({
        url: `${ADMIN}/businesses/${businessId}/close`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    reopenBusiness: builder.mutation<BusinessResponse, string>({
      query: (businessId) => ({ url: `${ADMIN}/businesses/${businessId}/reopen`, method: "PATCH" }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    deleteBusiness: builder.mutation<BusinessResponse, string>({
      query: (businessId) => ({ url: `${ADMIN}/businesses/${businessId}`, method: "DELETE" }),
      invalidatesTags: ["Business", "Dashboard", "AuditLog"],
    }),

    getBusinessCategories: builder.query<BusinessCategoryResponse[], void>({
      query: () => `${ADMIN}/business-categories`,
      providesTags: ["BusinessCategory"],
    }),

    createBusinessCategory: builder.mutation<unknown, BusinessCategoryUpsertRequest>({
      query: (body) => ({ url: `${ADMIN}/business-categories`, method: "POST", body }),
      invalidatesTags: ["BusinessCategory", "AuditLog"],
    }),

    updateBusinessCategory: builder.mutation<
      unknown,
      { categoryId: string } & BusinessCategoryUpsertRequest
    >({
      query: ({ categoryId, ...body }) => ({
        url: `${ADMIN}/business-categories/${categoryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["BusinessCategory", "AuditLog"],
    }),

    deleteBusinessCategory: builder.mutation<void, string>({
      query: (categoryId) => ({
        url: `${ADMIN}/business-categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BusinessCategory", "AuditLog"],
    }),

    getBusinessFeatures: builder.query<BusinessFeatureResponse[], string>({
      query: (businessId) => `${ADMIN}/businesses/${businessId}/features`,
      providesTags: ["BusinessFeature"],
    }),

    toggleBusinessFeature: builder.mutation<
      BusinessFeatureResponse[],
      { businessId: string } & FeatureToggleRequest
    >({
      query: ({ businessId, ...body }) => ({
        url: `${ADMIN}/businesses/${businessId}/features`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BusinessFeature", "Business", "AuditLog"],
    }),

    getPlatformFeatures: builder.query<PlatformFeatureResponse[], void>({
      query: () => `${ADMIN}/platform-features`,
      providesTags: ["PlatformFeature"],
    }),

    togglePlatformFeature: builder.mutation<PlatformFeatureResponse[], PlatformFeatureToggleRequest>({
      query: ({ feature, ...body }) => ({
        url: `${ADMIN}/platform-features/${feature}`,
        method: "PATCH",
        body,
      }),

      invalidatesTags: ["PlatformFeature", "BusinessFeature", "Business", "AuditLog"],
    }),

    getAuditLogs: builder.query<
      Page<AdminAuditLogResponse>,
      {
        targetId?: string;
        targetType?: string;
        actionType?: string;
        keyword?: string;
        page?: number;
        size?: number;
      } | void
    >({
      query: (query) => ({
        url: `${ADMIN}/audit-logs`,
        params: toParams({ size: 20, ...(query ?? {}) }),
      }),
      providesTags: ["AuditLog"],
    }),
  }),
});

export const {
  useGetPlatformDashboardQuery,
  useGetBusinessChannelsQuery,
  useGetBusinessesQuery,
  useGetBusinessQuery,
  useActivateBusinessMutation,
  useSuspendBusinessMutation,
  useEnableBusinessMutation,
  useDisableBusinessMutation,
  useCloseBusinessMutation,
  useReopenBusinessMutation,
  useDeleteBusinessMutation,
  useGetAuditLogsQuery,
  useGetBusinessFeaturesQuery,
  useToggleBusinessFeatureMutation,
  useGetPlatformFeaturesQuery,
  useTogglePlatformFeatureMutation,
  useGetBusinessCategoriesQuery,
  useCreateBusinessCategoryMutation,
  useUpdateBusinessCategoryMutation,
  useDeleteBusinessCategoryMutation,
} = businessAdminApi;
