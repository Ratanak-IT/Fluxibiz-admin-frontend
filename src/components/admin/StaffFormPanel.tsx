"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
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
  roleId: string;
}

const NO_ROLE = "__none";

const genderLabels: Record<(typeof userProfileGenders)[number], string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  UNSPECIFIED: "Unspecified",
};

function PasswordInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id="staff-password"
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        value={value}
        placeholder="At least 6 characters"
        onChange={(e) => onChange(e.target.value)}
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
  const [roleId, setRoleId] = useState(user?.roleId ?? NO_ROLE);

  const editing = Boolean(user);

  const missingFields = [
    username.trim() === "" && "Username",
    email.trim() === "" && "Email",
    !editing && password.trim().length < 6 && "Password (at least 6 characters)",
    firstName.trim() === "" && "First name",
    lastName.trim() === "" && "Last name",
    phoneNumber.trim() === "" && "Phone number",
    gender.trim() === "" && "Gender",
  ].filter((v): v is string => Boolean(v));

  const canSubmit = !busy && missingFields.length === 0;

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
            <FormField label="Username" htmlFor="staff-username">
              <input
                id="staff-username"
                value={username}
                autoFocus
                placeholder="john"
                onChange={(e) => setUsername(e.target.value)}
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Email" htmlFor="staff-email">
              <input
                id="staff-email"
                type="email"
                value={email}
                placeholder="john@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Password" htmlFor="staff-password">
              <PasswordInput value={password} onChange={setPassword} />
            </FormField>
          </>
        )}

        <FormField label="First name" htmlFor="staff-first">
          <input
            id="staff-first"
            value={firstName}
            placeholder="Alex"
            onChange={(e) => setFirstName(e.target.value)}
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Last name" htmlFor="staff-last">
          <input
            id="staff-last"
            value={lastName}
            placeholder="john"
            onChange={(e) => setLastName(e.target.value)}
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Phone number" htmlFor="staff-phone">
          <input
            id="staff-phone"
            value={phoneNumber}
            placeholder="012 345 678"
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Gender" htmlFor="staff-gender">
          <SelectField
            id="staff-gender"
            value={gender}
            placeholder="Select gender"
            onValueChange={setGender}
            options={userProfileGenders.map((g) => ({ value: g, label: genderLabels[g] }))}
          />
        </FormField>

        <FormField
          label="Role"
          htmlFor="staff-role"
          hint={roles.length === 0 ? "Create a role first to assign one." : undefined}
        >
          <SelectField
            id="staff-role"
            value={roleId}
            onValueChange={setRoleId}
            options={[
              { value: NO_ROLE, label: "No role" },
              ...roles.map((role) => ({ value: role.id, label: role.name })),
            ]}
          />
        </FormField>
      </div>

      {!error && missingFields.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Still needed: {missingFields.join(", ")}.</p>
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
              roleId: roleId === NO_ROLE ? "" : roleId,
            })
          }
        >
          {busy ? "Saving…" : editing ? "Save changes" : "Create user"}
        </Button>
      </div>
    </Panel>
  );
}
