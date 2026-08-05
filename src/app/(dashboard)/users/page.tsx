"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, Plus, Search } from "lucide-react";
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

type DialogState = null | "new" | PlatformUserResponse;

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = "status" in error ? error.status : undefined;

  if (status === 409) return "That username or email is already taken.";
  if (status === 403) return "Your account cannot manage staff.";
  return status ? `Request failed with status ${status}.` : "Request failed.";
}

export default function PlatformStaffPage() {
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
   <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 bg-background text-foreground">
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

  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Platform staff
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
        Colleagues who work inside this console, and what each of them may do.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setDialog("new")}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
    >
      <Plus className="size-4" />
      Add staff
    </button>
  </div>

  <div className="relative mt-7 max-w-md">
    <Search
      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />
    <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      placeholder="Search by name or email"
      aria-label="Search staff"
      className="w-full rounded-full border border-input bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-ring"
    />
  </div>

  <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] text-left">
        <thead className="bg-muted text-sm font-medium text-muted-foreground">
          <tr>
            <th className="px-6 py-4">Person</th>
            <th className="px-6 py-4">Can do</th>
            <th className="px-6 py-4">Status</th>
            <th className="w-40 px-4 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {isLoading && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-14 text-center text-muted-foreground"
              >
                Loading staff...
              </td>
            </tr>
          )}

          {error && !isLoading && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-14 text-center text-destructive"
              >
                {errorMessage(error)}
              </td>
            </tr>
          )}

          {!isLoading && !error && staff.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-14 text-center text-muted-foreground"
              >
                No staff yet. Add the first colleague.
              </td>
            </tr>
          )}

          {staff.map((user) => {
            const visibleRoles = user.roles.filter(
              (role) => !isHiddenRole(role)
            );
            const isSuper = visibleRoles.includes(SUPER_ADMIN_ROLE);

            return (
              <tr
                key={user.id}
                className="transition hover:bg-accent"
              >
                <td className="px-6 py-4">
                  <span className="block font-medium text-card-foreground">
                    {user.username}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {user.email ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isSuper ? (
                    <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                      Full access
                    </span>
                  ) : (
                    <span className="flex flex-wrap gap-1.5">
                      {visibleRoles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
                        >
                          {labelForRole(role)}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      user.enabled
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {user.enabled ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDialog(user)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition hover:bg-accent hover:text-accent-foreground"
                    >
                      <KeyRound className="size-3.5" />
                      Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEnabled({
                          userId: user.id,
                          enabled: !user.enabled,
                        })
                      }
                      className="rounded-full px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      {user.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
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
