"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, Pencil, Plus, Search } from "lucide-react";
import {
  useCreatePlatformUserMutation,
  useGetPlatformUsersQuery,
  useGetRealmRolesQuery,
  useReplaceUserRolesMutation,
  useSetUserEnabledMutation,
} from "@/features/platformUsers/platformUserApi";
import { StaffFormDialog, type StaffFormValues } from "@/components/admin/StaffFormDialog";
import { isHiddenRole, labelForRole, SUPER_ADMIN_ROLE } from "@/lib/permissionCatalog";
import type { PlatformUserResponse } from "@/lib/types/adminTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";

type DialogState = null | "new" | PlatformUserResponse;

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = "status" in error ? error.status : undefined;

  if (status === 409) return "That username or email is already taken.";
  if (status === 403) return "Your account cannot manage staff.";
  return status ? `Request failed with status ${status}.` : "Request failed.";
}

const COLUMNS: ColumnDef[] = [
  { id: "person", label: "Person" },
  { id: "canDo", label: "Can do" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions", locked: true },
];

export default function PlatformStaffPage() {
  const cols = useColumnVisibility("platform-users", COLUMNS);

  const [keyword, setKeyword] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  const { data: users = [], isLoading, error } = useGetPlatformUsersQuery();
  const { data: realmRoles = [] } = useGetRealmRolesQuery();
  const [createUser, createState] = useCreatePlatformUserMutation();
  const [replaceRoles, replaceState] = useReplaceUserRolesMutation();
  const [setEnabled] = useSetUserEnabledMutation();

  const availableRoles = useMemo(() => realmRoles.map((role) => role.name), [realmRoles]);


  const staff = useMemo(() => {
    const needle = keyword.trim().toLowerCase();

    return users
      .filter((user) => user.roles.some((role) => !isHiddenRole(role) && role !== "BUSINESS" && role !== "CUSTOMER" && role !== "BUSINESS_STAFF" && role !== "GLOBAL_USER"))
      .filter((user) =>
        !needle ||
        user.username.toLowerCase().includes(needle) ||
        (user.email ?? "").toLowerCase().includes(needle),
      );
  }, [users, keyword]);

  const busy = createState.isLoading || replaceState.isLoading;
  const dialogError = errorMessage(createState.error ?? replaceState.error);

  const save = async (values: StaffFormValues) => {
    const result =
      dialog === "new"
        ? await createUser({
            username: values.username,
            email: values.email,
            firstName: values.firstName || undefined,
            lastName: values.lastName || undefined,
            roles: values.roles,
          })
        : dialog
          ? await replaceRoles({ userId: dialog.id, roles: values.roles })
          : undefined;

    if (result && !("error" in result)) setDialog(null);
  };

  return (
   <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 bg-background text-foreground">
  <nav aria-label="Breadcrumb" className="mb-5 text-sm">
    <Link
      href="/dashboard"
      className="text-muted-foreground transition hover:text-foreground"
    >
      Dashboard
    </Link>
    <span className="px-2 text-muted-foreground">/</span>
    <span className="text-foreground">Staff</span>
  </nav>

  <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
        Platform staff
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
        Colleagues who work inside this console, and what each of them may do.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setDialog("new")}
      className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
    >
      <Plus className="size-4" />
      Add staff
    </button>
  </div>

   
        <div className="mt-7 flex items-center gap-2 sm:gap-3">
  {/* Search */}
  <div className="relative min-w-0 flex-1 lg:max-w-md">
    <Search
      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />

    <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      placeholder="Search by name or email"
      aria-label="Search staff"
      className="w-full rounded-full border border-border bg-white py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary dark:bg-background"
    />
  </div>

  {/* Filter / Column Picker */}
  <div className="shrink-0">
    <ColumnPicker
      state={cols}
      buttonClassName="bg-white dark:bg-background"
    />
  </div>
</div>

{/* Card */}
<div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white dark:bg-background">
  <div className="overflow-x-auto">
    <table
      className={`w-full text-left ${cols.tableClassName}`}
      style={{ minWidth: cols.minWidthRem(46) }}
    >
      <thead className="bg-muted text-sm font-medium text-muted-foreground">
        <tr>
          <th className="px-4 py-3 sm:px-6 sm:py-4">
            Person
          </th>

          <th className="px-4 py-3 sm:px-6 sm:py-4">
            Can do
          </th>

          <th className="px-4 py-3 sm:px-6 sm:py-4">
            Status
          </th>

          <th className="w-32 px-3 py-3 sm:w-40 sm:px-4 sm:py-4" />
        </tr>
      </thead>

      <tbody className="divide-y divide-border text-sm">
        {staff.map((user) => (
          <tr
            key={user.id}
            className="transition hover:bg-accent"
          >
            <td className="px-4 py-3 font-medium text-card-foreground sm:px-6 sm:py-4">
              {user.firstName} {user.lastName}
            </td>

            <td className="px-4 py-3 text-muted-foreground sm:px-6 sm:py-4">
              {user.roles
                .filter((role) => !isHiddenRole(role))
                .join(", ")}
            </td>

            <td className="px-4 py-3 sm:px-6 sm:py-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                  user.enabled
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {user.enabled ? "Enabled" : "Disabled"}
              </span>
            </td>

            <td className="px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setDialog(user)}
                  aria-label={`Edit ${user.username}`}
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

  {dialog && (
    <StaffFormDialog
      user={dialog === "new" ? undefined : dialog}
      availableRoles={availableRoles}
      busy={busy}
      error={dialogError}
      onCancel={() => setDialog(null)}
      onSubmit={save}
    />
  )}
</main>
  );
}
