"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AtSign,
  BadgeCheck,
  Camera,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { z } from "zod";
import { ImagePicker, useStagedImage } from "@/components/ui/image-picker";
import {
  profilePictureRules,
  userProfileGenders,
  userProfileSchema,
  type UserProfile,
  type UserProfileInput,
} from "@/lib/api/user-profile";
import {
  useDeleteProfilePictureMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  userProfileApi,
} from "@/services/userProfileApi";
import { useAppDispatch } from "@/store/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FieldName = keyof UserProfileInput;
type FieldErrors = Partial<Record<FieldName, string>>;

const genderLabels: Record<(typeof userProfileGenders)[number], string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  UNSPECIFIED: "Prefer not to say",
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }
  return fallback;
}

function getFieldErrors(error: z.ZodError<UserProfileInput>): FieldErrors {
  const flattened = z.flattenError(error).fieldErrors;
  const fieldErrors: FieldErrors = {};

  for (const [name, messages] of Object.entries(flattened)) {
    const message = messages?.[0];
    if (message) {
      fieldErrors[name as FieldName] = message;
    }
  }

  return fieldErrors;
}

function withFreshPicture(updated: UserProfile, previous: string) {
  const picture = updated.profilePicture;
  if (!picture || picture !== previous) {
    return updated;
  }
  return {
    ...updated,
    profilePicture: `${picture}${picture.includes("?") ? "&" : "?"}v=${Date.now()}`,
  };
}

function getInitials(firstName: string, lastName: string, username?: string) {
  const initials = [firstName, lastName]
    .map((name) => name.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || username?.slice(0, 2).toUpperCase() || "AD";
}

function getProfileName(firstName: string, lastName: string, username?: string) {
  return (
    [firstName, lastName]
      .map((name) => name.trim())
      .filter(Boolean)
      .join(" ") ||
    username ||
    "Administrator Profile"
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: FieldName;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-[#424841] dark:text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[#d14341]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GenderSelect({
  value,
  onChange,
  options,
  labels,
}: {
  value: (typeof userProfileGenders)[number];
  onChange: (value: (typeof userProfileGenders)[number]) => void;
  options: readonly (typeof userProfileGenders)[number][];
  labels: Record<(typeof userProfileGenders)[number], string>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-11 w-full items-center justify-between rounded-xl border border-[#e2e2de] bg-white px-4 text-left text-[14px] font-semibold text-[#16181c] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-input dark:bg-card dark:text-foreground dark:focus-visible:ring-offset-card">
        <span>{labels[value]}</span>
        <ChevronDown className="size-4 text-[#7a8478] dark:text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mt-2 min-w-60 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-2 shadow-lg dark:border-border dark:bg-card">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
              option === value
                ? "bg-primary text-white"
                : "text-[#16181c] hover:bg-[#eff9ee] hover:text-[#16181c] dark:text-foreground dark:hover:bg-[#163d21]"
            }`}
            onSelect={() => onChange(option)}
          >
            {labels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#f6f8f5] p-4 dark:bg-muted">
  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#00932a]/10 text-[#00932a]">
    {icon}
  </span>
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-[#6b7569] dark:text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 truncate text-sm font-semibold text-[#1a222b] dark:text-foreground">
      {value || "Not available"}
    </p>
  </div>
</div>
  );
}

function UserProfileEditor({ profile }: { profile: UserProfile }) {
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const storedPicture = profile.profilePicture || "";
  const initialGender = userProfileGenders.includes(
    profile.gender as (typeof userProfileGenders)[number]
  )
    ? (profile.gender as (typeof userProfileGenders)[number])
    : "UNSPECIFIED";

  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [gender, setGender] = useState(initialGender);
  const picture = useStagedImage(profilePictureRules, storedPicture);
  const [pictureNote, setPictureNote] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [updateUserProfile, { isLoading: isSaving }] =
    useUpdateUserProfileMutation();
  const [deleteProfilePicture, { isLoading: isRemovingPicture }] =
    useDeleteProfilePictureMutation();

  const profileName = getProfileName(firstName, lastName, profile.username);

  function publishProfile(updated: UserProfile) {
    dispatch(
      userProfileApi.util.upsertQueryData(
        "getUserProfile",
        undefined,
        updated
      )
    );
  }

  function handlePicturePick(file: File) {
    picture.pick(file);
    setPictureNote("New picture ready — save to apply it.");
  }

  async function handlePictureRemove() {
    setPictureNote(null);
    try {
      await deleteProfilePicture().unwrap();
      picture.reset();
      publishProfile({ ...profile, profilePicture: "" });
      setPictureNote("Profile picture removed.");
    } catch (error) {
      picture.setError(
        getApiErrorMessage(
          error,
          "Unable to remove your profile picture."
        )
      );
    }
  }

  function handleCancel() {
    formRef.current?.reset();
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setGender(initialGender);
    picture.reset();
    setFieldErrors({});
    setPictureNote(null);
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const result = userProfileSchema.safeParse({
      firstName,
      lastName,
      phoneNumber: String(formData.get("phoneNumber") || ""),
      gender: String(formData.get("gender") || "UNSPECIFIED"),
      address: String(formData.get("address") || ""),
    });

    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      setStatus({
        type: "error",
        message: "Check the highlighted fields and try again.",
      });
      return;
    }

    setFieldErrors({});

    try {
      const updated = await updateUserProfile({
        ...result.data,
        file: picture.file,
      }).unwrap();

      publishProfile(
        picture.file
          ? withFreshPicture(updated, storedPicture)
          : updated
      );
      picture.reset();
      setPictureNote(null);
      setStatus({
        type: "success",
        message: "Your profile was saved successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Unable to save your profile."
        ),
      });
    }
  }

  return (
   <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
  <aside className="flex flex-col gap-5">
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm dark:border-border dark:bg-card">
      <ImagePicker
        rules={profilePictureRules}
        disabled={isSaving}
        error={picture.error}
        busy={isSaving && Boolean(picture.file)}
        previewShape="circle"
        label="Profile picture"
        onPick={handlePicturePick}
        onError={picture.setError}
        preview={
          <span className="relative inline-flex size-28 sm:size-32 items-center justify-center">
            <span className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[linear-gradient(145deg,#dff5e2,#b9e5bf)] text-3xl font-bold text-[#00932a] shadow-md dark:border-card dark:bg-[linear-gradient(145deg,#0f2818,#163d21)]">
              {picture.preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={picture.preview}
                  alt={`${profileName} profile`}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(firstName, lastName, profile.username)
              )}
            </span>
            <span className="absolute right-0 bottom-0 z-10 grid size-9.5 place-items-center rounded-full border-2 border-white bg-[#00932a] text-white shadow-md transition-transform group-hover:scale-105 dark:border-card">
              <Camera className="size-4.5" aria-hidden="true" />
            </span>
          </span>
        }
        actions={
          picture.file ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                picture.reset();
                setPictureNote(null);
              }}
              className="px-0 text-sm font-medium text-[#2563eb] hover:underline dark:text-blue-400"
            >
              Undo
            </button>
          ) : storedPicture ? (
            <button
              type="button"
              disabled={isSaving || isRemovingPicture}
              onClick={handlePictureRemove}
              className="px-0 text-sm font-medium text-[#2563eb] hover:underline dark:text-blue-400"
            >
              {isRemovingPicture ? "Removing…" : "Remove photo"}
            </button>
          ) : null
        }
      />

      <div className="mt-5 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-foreground tracking-tight">
          {profileName}
        </h2>
        <p className="mt-1 text-xs font-bold tracking-widest text-[#94a3b8] dark:text-muted-foreground uppercase">
          {profile.role || "BUSINESS"}
        </p>
      </div>

      <div className="min-h-4" aria-live="polite">
        {pictureNote ? (
          <p className="mt-2 text-xs text-[#00932a]" role="status">
            {pictureNote}
          </p>
        ) : null}
      </div>
    </section>

    <section className="rounded-2xl border border-[#e4eae2] bg-white p-5 shadow-sm dark:border-border dark:bg-card">
      <h2 className="text-base font-bold text-[#16181c] dark:text-foreground">
        Account information
      </h2>
      <p className="mt-1 text-sm text-[#6b7569] dark:text-muted-foreground">
        These details are managed by your Keycloak account provider.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <AccountDetail
          icon={<AtSign className="size-4" />}
          label="Username"
          value={profile.username}
        />
        <AccountDetail
          icon={<Mail className="size-4" />}
          label="Email"
          value={profile.email}
        />
        <AccountDetail
          icon={<BadgeCheck className="size-4" />}
          label="Role"
          value={profile.role || "Super Admin"}
        />
      </div>
    </section>
  </aside>

  <form
    ref={formRef}
    onSubmit={handleSubmit}
    noValidate
    className="rounded-2xl border border-[#e4eae2] bg-white p-5 shadow-sm sm:p-7 dark:border-border dark:bg-card"
  >
    <div className="flex items-start gap-3 border-b border-[#edf0ec] pb-5 dark:border-border">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#00932a]/10 text-[#00932a]">
        <UserRound className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-[#16181c] dark:text-foreground">
          Personal details
        </h2>
        <p className="mt-1 text-sm text-[#657064] dark:text-muted-foreground">
          Keep your contact and profile information current.
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Field
        label="First name"
        name="firstName"
        error={fieldErrors.firstName}
      >
        <input
          id="firstName"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={255}
          autoComplete="given-name"
          className="h-11 w-full rounded-xl border border-[#e2e2de] bg-white px-4 text-[14px] text-[#16181c] outline-none focus-visible:border-[#00932a] focus-visible:ring-2 focus-visible:ring-[#00932a]/25 dark:border-input dark:bg-card dark:text-foreground"
        />
      </Field>

      <Field
        label="Last name"
        name="lastName"
        error={fieldErrors.lastName}
      >
        <input
          id="lastName"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          maxLength={255}
          autoComplete="family-name"
          className="h-11 w-full rounded-xl border border-[#e2e2de] bg-white px-4 text-[14px] text-[#16181c] outline-none focus-visible:border-[#00932a] focus-visible:ring-2 focus-visible:ring-[#00932a]/25 dark:border-input dark:bg-card dark:text-foreground"
        />
      </Field>

      <Field
        label="Phone number"
        name="phoneNumber"
        error={fieldErrors.phoneNumber}
      >
        <div className="relative">
          <Phone className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#7a8478] dark:text-muted-foreground" />
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            defaultValue={profile.phoneNumber || ""}
            maxLength={30}
            autoComplete="tel"
            className="h-11 w-full rounded-xl border border-[#e2e2de] bg-white pr-4 pl-11 text-[14px] text-[#16181c] outline-none focus-visible:border-[#00932a] focus-visible:ring-2 focus-visible:ring-[#00932a]/25 dark:border-input dark:bg-card dark:text-foreground"
          />
        </div>
      </Field>

      <Field
        label="Gender"
        name="gender"
        error={fieldErrors.gender}
       
      >
        <GenderSelect
          value={gender}
          onChange={setGender}
          options={userProfileGenders}
          labels={genderLabels}
        />
        <input type="hidden" name="gender" value={gender}
         />
      </Field>

      <div className="md:col-span-2">
        <Field
          label="Address"
          name="address"
          error={fieldErrors.address}
        >
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-4 left-4 size-4 text-[#7a8478] dark:text-muted-foreground" />
            <textarea
              id="address"
              name="address"
              defaultValue={profile.address || ""}
              rows={3}
              autoComplete="street-address"
              className="w-full min-h-28 rounded-xl border border-[#e2e2de] bg-white py-3 pr-4 pl-11 text-[14px] text-[#16181c] outline-none focus-visible:border-[#00932a] focus-visible:ring-2 focus-visible:ring-[#00932a]/25 dark:border-input dark:bg-card dark:text-foreground"
            />
          </div>
        </Field>
      </div>
    </div>

    <div className="mt-8 flex flex-col gap-4 border-t border-[#edf0ec] pt-6 sm:flex-row sm:items-center dark:border-border">
      <div className="min-h-5 flex-1 text-sm" aria-live="polite">
        {status ? (
          <p
            className={
              status.type === "success"
                ? "text-[#00932a]"
                : "text-[#d14341] dark:text-red-400"
            }
          >
            {status.message}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSaving}
        className="h-11 rounded-xl border border-[#e2e2de] bg-white px-6 text-sm font-semibold text-[#16181c] transition-colors hover:bg-black/5 dark:border-input dark:bg-card dark:text-foreground dark:hover:bg-accent"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="h-11 rounded-xl bg-[#00932a] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#00932a]/90 disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save changes"}
      </button>
    </div>
  </form>
</div>
  );
}

export default function UserProfileForm() {
  const profileQuery = useGetUserProfileQuery();

  if (profileQuery.isLoading) {
    return (
      <div
        className="min-h-125 animate-pulse rounded-2xl bg-[#e8ede7]"
        aria-label="Loading user profile"
      />
    );
  }

  const profile = profileQuery.data || {};

  return (
    <UserProfileEditor
      key={profile.userId || "user-profile"}
      profile={profile}
    />
  );
}
