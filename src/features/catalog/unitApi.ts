import { baseApi } from "@/lib/baseApi";
import type { UnitResponse, UnitUpsertRequest } from "@/lib/types/unitTypes";

const PUBLIC_UNITS = "/api/v1/units";
const ADMIN_UNITS = "/api/v1/admin/units";

export const unitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnits: builder.query<UnitResponse[], void>({
      query: () => PUBLIC_UNITS,
      providesTags: ["Unit"],
    }),

    createUnit: builder.mutation<UnitResponse, UnitUpsertRequest>({
      query: (body) => ({ url: ADMIN_UNITS, method: "POST", body }),
      invalidatesTags: ["Unit", "AuditLog"],
    }),

    updateUnit: builder.mutation<UnitResponse, { unitId: string } & UnitUpsertRequest>({
      query: ({ unitId, ...body }) => ({ url: `${ADMIN_UNITS}/${unitId}`, method: "PUT", body }),
      invalidatesTags: ["Unit", "AuditLog"],
    }),

    deleteUnit: builder.mutation<void, string>({
      query: (unitId) => ({ url: `${ADMIN_UNITS}/${unitId}`, method: "DELETE" }),
      invalidatesTags: ["Unit", "AuditLog"],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi;