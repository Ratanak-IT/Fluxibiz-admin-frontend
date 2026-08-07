import { baseApi } from "@/lib/baseApi";
import {
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
      queryFn: async ({ file, ...fields }, api, extraOptions, baseQuery) => {
        // Step 1: Upload profile picture if a file was provided
        if (file) {
          const formData = new FormData();
          formData.append("file", file, file.name);

          const uploadResult = await baseQuery({
            url: "/api/v1/user-profiles/me/picture",
            method: "POST",
            body: formData,
          });

          if (uploadResult.error) {
            return { error: uploadResult.error };
          }
        }

        // Step 2: Update profile text fields via JSON
        const jsonBody: Record<string, string> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined && value !== null && String(value).trim() !== "") {
            jsonBody[key] = String(value).trim();
          }
        }

        const updateResult = await baseQuery({
          url: "/api/v1/user-profiles/me",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: jsonBody,
        });

        if (updateResult.error) {
          return { error: updateResult.error };
        }

        return { data: updateResult.data as UserProfile };
      },
      invalidatesTags: ["UserProfile"],
    }),
    deleteProfilePicture: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/user-profiles/me/picture",
        method: "DELETE",
      }),
      invalidatesTags: ["UserProfile"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useDeleteProfilePictureMutation,
} = userProfileApi;

