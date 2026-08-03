import { baseApi } from "@/lib/baseApi";
import {
  toUserProfileFormData,
  type UserProfile,
  type UserProfileUpdate,
} from "@/lib/api/user-profile";

export const userProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/api/v1/user-profiles/me",
      providesTags: ["UserProfile"],
    }),
    updateUserProfile: builder.mutation<UserProfile, UserProfileUpdate>({
      query: ({ file, ...fields }) => ({
        url: "/api/v1/user-profiles/me",
        method: "PATCH",
        body: toUserProfileFormData(fields, file),
      }),
    }),
    deleteProfilePicture: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/user-profiles/me/picture",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useDeleteProfilePictureMutation,
} = userProfileApi;
