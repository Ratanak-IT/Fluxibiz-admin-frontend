import { baseApi } from "@/lib/baseApi";
import type { MyBusiness, UpdateBusinessRequest } from "@/lib/types/businessTypes";

const BUSINESSES = "/api/v1/businesses";

export const businessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMyBusiness: builder.query<MyBusiness, void>({
      query: () => `${BUSINESSES}/me`,
      providesTags: ["MyBusiness"],
    }),

    updateMyBusiness: builder.mutation<MyBusiness, UpdateBusinessRequest>({
      query: (body) => ({ url: `${BUSINESSES}/me`, method: "PUT", body }),
      invalidatesTags: ["MyBusiness"],
    }),
  }),
});

export const { useGetMyBusinessQuery, useUpdateMyBusinessMutation } = businessApi;
