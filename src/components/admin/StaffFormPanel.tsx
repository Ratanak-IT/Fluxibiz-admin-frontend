"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/SelectField";
import { Panel, PanelHeader, FormField, fieldClassName } from "@/components/admin/staffUi";
import { userProfileGenders } from "@/lib/api/user-profile";
import type { PlatformRoleResponse, StaffResponse } from "@/lib/types/adminTypes";

export interface StaffFormValues {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  roleIds: string[];
}

const genderLabels: Record<(typeof userProfileGenders)[number], string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  UNSPECIFIED: "Unspecified",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_HINT =
  "Use at least 8 characters, with one uppercase letter, one number, and one special character.";

type FieldErrors = Partial<
  Record<"username" | "email" | "password" | "firstName" | "lastName" | "phoneNumber" | "gender", string>
>;

function validateFields(values: {
  editing: boolean;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.editing) {
    const username = values.username.trim();
    if (!username) errors.username = "Username is required.";
    else if (!USERNAME_PATTERN.test(username))
      errors.username = "Use 3-30 letters, numbers, dots, underscores, or hyphens — no spaces.";

    const email = values.email.trim();
    if (!email) errors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";

    if (values.password.length === 0) errors.password = "Password is required.";
    else if (
      values.password.length < PASSWORD_MIN_LENGTH ||
      !/[A-Z]/.test(values.password) ||
      !/[0-9]/.test(values.password) ||
      !/[^A-Za-z0-9]/.test(values.password)
    ) {
      errors.password = PASSWORD_HINT;
    }
  }

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";

  const phoneNumber = values.phoneNumber.trim();
  if (!phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    if (!PHONE_PATTERN.test(phoneNumber) || !digitsOnly.startsWith("0") || digitsOnly.length < 8) {
      errors.phoneNumber = "Enter a valid phone number — starts with 0, at least 8 digits.";
    }
  }

  if (!values.gender.trim()) errors.gender = "Select a gender.";

  return errors;
}

function PasswordInput({
  value,
  onChange,
  onBlur,
  onFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id="staff-password"
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        value={value}
        placeholder="At least 8 characters"
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        className={`${fieldClassName} pr-11`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

export function StaffFormPanel({
  user,
  roles,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  user?: StaffResponse;
  roles: PlatformRoleResponse[];
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: StaffFormValues) => void;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [roleIds, setRoleIds] = useState<string[]>(user?.roleIds ?? []);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const passwordHintShown = useRef(false);

  const editing = Boolean(user);
  const markTouched = (field: string) => setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
  const toggleRole = (id: string) =>
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((roleId) => roleId !== id) : [...prev, id]));

  const errors = validateFields({
    editing,
    username,
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    gender,
  });
  const fieldError = (field: keyof FieldErrors) => (touched.has(field) ? errors[field] : undefined);

  const hasErrors = Object.keys(errors).length > 0;
  const canSubmit = !busy && !hasErrors;

  return (
    <Panel>
      <PanelHeader
        title={editing ? `Edit ${user?.username}` : "Add a user"}
        description={
          editing ? "Sign-in details can only be changed by the user." : "The user signs in with these credentials."
        }
        action={
          <Button type="button" onClick={onCancel} aria-label="Close the form" variant="ghost" size="icon">
            <X className="size-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {!editing && (
          <>
            <FormField label="Username" htmlFor="staff-username" error={fieldError("username")}>
              <input
                id="staff-username"
                value={username}
                autoFocus
                placeholder="john"
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => markTouched("username")}
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Email" htmlFor="staff-email" error={fieldError("email")}>
              <input
                id="staff-email"
                type="email"
                value={email}
                placeholder="john@company.com"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Password" htmlFor="staff-password" error={fieldError("password")}>
              <PasswordInput
                value={password}
                onChange={setPassword}
                onBlur={() => markTouched("password")}
                onFocus={() => {
                  if (passwordHintShown.current) return;
                  passwordHintShown.current = true;
                  toast.info(PASSWORD_HINT);
                }}
              />
            </FormField>
          </>
        )}

        <FormField label="First name" htmlFor="staff-first" error={fieldError("firstName")}>
          <input
            id="staff-first"
            value={firstName}
            placeholder="Alex"
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => markTouched("firstName")}
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="staff-last" error={fieldError("lastName")}>
          <input
            id="staff-last"
            value={lastName}
            placeholder="john"
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => markTouched("lastName")}
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Phone number" htmlFor="staff-phone" error={fieldError("phoneNumber")}>
          <input
            id="staff-phone"
            value={phoneNumber}
            placeholder="012 345 678"
            onChange={(e) => setPhoneNumber(e.target.value)}
            onBlur={() => markTouched("phoneNumber")}
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Gender" htmlFor="staff-gender" error={fieldError("gender")}>
          <SelectField
            id="staff-gender"
            value={gender}
            placeholder="Select gender"
            onValueChange={(v) => {
              setGender(v);
              markTouched("gender");
            }}
            options={userProfileGenders.map((g) => ({ value: g, label: genderLabels[g] }))}
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField
            label="Roles"
            htmlFor="staff-roles"
            hint={roles.length === 0 ? "Create a role first to assign one." : "Select as many as apply."}
          >
            <div
              id="staff-roles"
              className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-card p-2"
            >
              {roles.length === 0 ? (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">No roles yet.</p>
              ) : (
                roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={roleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="size-4 shrink-0 rounded accent-primary"
                    />
                    <span className="text-sm text-foreground">{role.name}</span>
                  </label>
                ))
              )}
            </div>
          </FormField>
        </div>
      </div>

      {!error && hasErrors && (
        <p className="mt-4 text-sm text-muted-foreground">Complete the required fields to continue.</p>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              username: username.trim(),
              email: email.trim(),
              password,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phoneNumber: phoneNumber.trim(),
              gender,
              roleIds,
            })
          }
        >
          {busy ? "Saving…" : editing ? "Save changes" : "Create user"}
        </Button>
      </div>
    </Panel>
  );
}
