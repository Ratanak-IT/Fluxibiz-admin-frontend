"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import {
  useChangeStaffRoleMutation,
  useGetShopPermissionsQuery,
  useGetShopRolesQuery,
  useGetShopStaffQuery,
  useInviteStaffMutation,
  useRemoveStaffMutation,
  useSeedDefaultRolesMutation,
  useSetStaffActiveMutation,
  useCreateShopRoleMutation,
} from "@/features/shopStaff/shopStaffApi";
import { useGetMyBusinessQuery } from "@/features/business/businessApi";
import { StaffInviteDialog } from "@/components/shop/StaffInviteDialog";
import { RoleFormDialog } from "@/components/shop/RoleFormDialog";
import type { ShopRoleRequest, StaffInviteRequest } from "@/lib/types/shopStaffTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";

type Dialog = null | "invite" | "role";

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = "status" in error ? error.status : undefined;

  if (status === 409) return "That username or email is already in use.";
  if (status === 403) return "Only the shop owner can manage staff.";
  if (status === 400) return "Some details are missing or invalid.";
  return status ? `Request failed with status ${status}.` : "Request failed.";
}

const COLUMNS: ColumnDef[] = [
  { id: "person", label: "Person" },
  { id: "role", label: "Role" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions", locked: true },
];

export default function ShopStaffPage() {
  const cols = useColumnVisibility("shop-staff", COLUMNS);

  const [dialog, setDialog] = useState<Dialog>(null);

  const { data: business } = useGetMyBusinessQuery();
  const businessId = business?.id ?? "";

  const { data: staff = [], isLoading } = useGetShopStaffQuery(businessId, { skip: !businessId });
  const { data: roles = [] } = useGetShopRolesQuery(businessId, { skip: !businessId });
  const { data: catalogue = [] } = useGetShopPermissionsQuery(businessId, { skip: !businessId });

  const [invite, inviteState] = useInviteStaffMutation();
  const [createRole, createRoleState] = useCreateShopRoleMutation();
  const [seedDefaults, seedState] = useSeedDefaultRolesMutation();
  const [changeRole] = useChangeStaffRoleMutation();
  const [setActive] = useSetStaffActiveMutation();
  const [remove] = useRemoveStaffMutation();

  const submitInvite = async (values: Omit<StaffInviteRequest, "businessId">) => {
    const result = await invite({ businessId, ...values });
    if (!("error" in result)) setDialog(null);
  };

  const submitRole = async (values: ShopRoleRequest) => {
    const result = await createRole({ businessId, ...values });
    if (!("error" in result)) setDialog(null);
  };

  const confirmRemove = async (userId: string, name: string) => {
    if (confirm(`Remove ${name} from the shop? Past orders keep their name.`)) {
      await remove({ businessId, userId });
    }
  };

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
            Staff
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">
            People who work in your shop, and the job each of them does.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setDialog("role")}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800">
            <Plus className="size-4" />
            New role
          </button>
          <button type="button" disabled={!businessId || inviteState.isLoading}
            onClick={() => setDialog("invite")}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:text-neutral-950 dark:hover:bg-green-400">
            <Plus className="size-4" />
            Add staff
          </button>
        </div>
      </div>

      {roles.length === 0 && businessId && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            No roles yet
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Start with Cashier, Stock keeper and Manager. You can rename or change them after.
          </p>
          <button type="button" disabled={seedState.isLoading}
            onClick={() => seedDefaults(businessId)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:text-neutral-950 dark:hover:bg-green-400">
            <Sparkles className="size-4" />
            {seedState.isLoading ? "Creating..." : "Create the usual three"}
          </button>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <ColumnPicker state={cols} />
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${cols.tableClassName}`}
            style={{ minWidth: cols.minWidthRem(42) }}>
            <thead className="bg-neutral-50 text-sm font-medium text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4">Person</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="w-40 px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
              {isLoading && (
                <tr><td colSpan={4} className="px-6 py-14 text-center text-neutral-500 dark:text-neutral-400">Loading staff...</td></tr>
              )}

              {!isLoading && staff.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-14 text-center text-neutral-500 dark:text-neutral-400">Nobody yet. Add your first colleague.</td></tr>
              )}

              {staff.map((person) => (
                <tr key={person.userId} className="transition hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40">
                  <td className="px-6 py-4">
                    <span className="block font-medium text-neutral-900 dark:text-neutral-50">
                      {[person.firstName, person.lastName].filter(Boolean).join(" ") || person.username}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {person.email ?? person.phoneNumber ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                
                    <select
                      value={person.businessRoleId ?? ""}
                      onChange={(e) => changeRole({
                        businessId,
                        userId: person.userId,
                        businessRoleId: e.target.value,
                      })}
                      className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 outline-none focus:border-green-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={person.status === "ACTIVE"
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-400 dark:text-neutral-600"}>
                      {person.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button"
                        onClick={() => setActive({
                          businessId,
                          userId: person.userId,
                          active: person.status !== "ACTIVE",
                        })}
                        className="rounded-full px-3 py-1.5 text-xs text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">
                        {person.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button"
                        onClick={() => confirmRemove(person.userId, person.username ?? "this person")}
                        className="rounded-full px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dialog === "invite" && (
        <StaffInviteDialog
          roles={roles}
          busy={inviteState.isLoading}
          error={errorMessage(inviteState.error)}
          onCancel={() => setDialog(null)}
          onSubmit={submitInvite}
        />
      )}

      {dialog === "role" && (
        <RoleFormDialog
          catalogue={catalogue}
          busy={createRoleState.isLoading}
          error={errorMessage(createRoleState.error)}
          onCancel={() => setDialog(null)}
          onSubmit={submitRole}
        />
      )}
    </main>
  );
}