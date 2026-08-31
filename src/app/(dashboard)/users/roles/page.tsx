"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreatePlatformRoleMutation,
  useDeletePlatformRoleMutation,
  useGetPlatformRolesPageQuery,
  useGetPlatformUsersQuery,
  useUpdatePlatformRoleMutation,
} from "@/features/platformUsers/platformUserApi";
import { RolePanel, type RoleFormValues } from "@/components/admin/RolePanel";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { Panel, PanelHeader, EmptyState } from "@/components/admin/staffUi";
import { PERMISSION_GROUPS } from "@/lib/permissionCatalog";
import type { PlatformRoleResponse } from "@/lib/types/adminTypes";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";

type PanelState = null | "new" | PlatformRoleResponse;

type Category = { key: string; label: string; granted: { role: string; label: string }[] };

function groupPermissions(permissions: string[]): Category[] {
  const grantedSet = new Set(permissions);
  const result: Category[] = [];

  for (const group of PERMISSION_GROUPS) {
    const matching = group.options.filter((option) => grantedSet.has(option.role));
    if (matching.length > 0) {
      result.push({
        key: group.key,
        label: group.title,
        granted: matching.map((option) => ({ role: option.role, label: option.label })),
      });
    }
  }

  return result;
}

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = "status" in error ? (error as { status?: number }).status : undefined;
  if (status === 401) return undefined;
  const data = "data" in error ? (error as { data?: { message?: string } }).data : undefined;
  if (data?.message) return data.message;
  if (status === 409) return "A role with that name already exists.";
  if (status === 403) return "Your account cannot manage roles.";
  return status ? `Request failed with status ${status}.` : "Request failed.";
}

export default function RolesAndPermissionsPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [panel, setPanel] = useState<PanelState>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformRoleResponse | null>(null);

  const { data, isLoading, error, refetch } = useGetPlatformRolesPageQuery({ page, size: pageSize });
  const { data: users = [] } = useGetPlatformUsersQuery();
  const [createRole, createState] = useCreatePlatformRoleMutation();
  const [updateRole, updateState] = useUpdatePlatformRoleMutation();
  const [deleteRole, deleteState] = useDeletePlatformRoleMutation();

  const roles = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? (roles.length ? 1 : 0);
  const totalElements = data?.totalElements ?? roles.length;

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(term) ||
        role.permissions.some((permission) => permission.toLowerCase().includes(term)),
    );
  }, [roles, search]);

  const assignedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const user of users) {
      if (user.roleId) counts.set(user.roleId, (counts.get(user.roleId) ?? 0) + 1);
    }
    return counts;
  }, [users]);

  const busy = createState.isLoading || updateState.isLoading;
  const panelError = errorMessage(createState.error ?? updateState.error);

  const save = async (values: RoleFormValues) => {
    const result =
      panel === "new"
        ? await createRole({ name: values.name, permissions: values.permissions })
        : panel
          ? await updateRole({ roleId: panel.id, body: { name: values.name, permissions: values.permissions } })
          : undefined;

    if (result && !("error" in result)) {
      toast.success(panel === "new" ? "Role created" : "Role updated");
      setPanel(null);
    } else if (result && "error" in result) {
      toast.error(errorMessage(result.error) ?? "Request failed.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteRole(deleteTarget.id);

    if (result && !("error" in result)) {
      toast.success("Role deleted");
    } else if (result && "error" in result) {
      toast.error(errorMessage(result.error) ?? "Unable to delete the role.");
    }
    setDeleteTarget(null);
  };

  const toggleExpand = (roleId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {panel && (
        <RolePanel
          key={panel === "new" ? "new" : panel.id}
          role={panel === "new" ? undefined : panel}
          busy={busy}
          error={panelError}
          onCancel={() => setPanel(null)}
          onSubmit={save}
        />
      )}

      <Panel>
        <PanelHeader
          title="Roles & permissions"
          description="A role is a named set of permissions you assign to staff"
          action={
            !panel ? (
              <Button type="button" onClick={() => setPanel("new")} className="gap-1.5 sm:gap-2">
                <Plus className="size-4 rounded-4xl" aria-hidden="true" />
                <span>Create role</span>
              </Button>
            ) : null
          }
        />

        <div className="relative mt-6 sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="roles-search" className="sr-only">
            Search roles
          </label>
          <input
            id="roles-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles or permissions..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/20 dark:focus-visible:border-gray-600"
          />
        </div>

        {isLoading ? (
          <AdminLoadingState label="Loading roles..." />
        ) : error ? (
          <AdminApiErrorFallback error={error} description={errorMessage(error)} onRetry={refetch} />
        ) : filteredRoles.length === 0 ? (
          <EmptyState
            title={search ? "No matching roles" : "No roles yet"}
            description={search ? "Try a different search term." : "Create a role to start granting permissions."}
          />
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {filteredRoles.map((role) => {
              const assigned = assignedCounts.get(role.id) ?? 0;
              const isExpanded = expanded.has(role.id);
              const categories = groupPermissions(role.permissions);

              return (
                <li key={role.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <p className="text-[17px] font-semibold text-foreground">{role.name}</p>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {role.permissions.length} {role.permissions.length === 1 ? "permission" : "permissions"}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {assigned} {assigned === 1 ? "user" : "users"} assigned to this role
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPanel(panel && panel !== "new" && panel.id === role.id ? null : role)}
                        aria-label={`Edit ${role.name}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(role)}
                        aria-label={`Delete ${role.name}`}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {role.permissions.length === 0 ? (
                    <p className="mt-3 text-xs italic text-muted-foreground">No permissions assigned to this role.</p>
                  ) : (
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {categories.map((category) => (
                          <span
                            key={category.key}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground"
                          >
                            <span className="font-normal text-muted-foreground">{category.label}:</span>
                            <span className="font-semibold text-primary">{category.granted.length}</span>
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(role.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="size-4" />
                            <span>Hide details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-4" />
                            <span>
                              Show breakdown ({role.permissions.length} permissions in {categories.length} categories)
                            </span>
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3.5 grid grid-cols-1 gap-2.5 border-t border-border pt-3.5 sm:grid-cols-2 lg:grid-cols-3">
                          {categories.map((category) => (
                            <div key={category.key} className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-3">
                              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                <span className="text-xs font-semibold text-foreground">{category.label}</span>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {category.granted.length} {category.granted.length === 1 ? "action" : "actions"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {category.granted.map((permission) => (
                                  <span
                                    key={permission.role}
                                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                                  >
                                    {permission.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {totalElements > 0 && (
          <PaginationBar
            page={page}
            size={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={setPage}
            onSizeChange={setPageSize}
            itemLabel="role"
            className="-mx-6 -mb-6 mt-5 rounded-b-3xl border-t lg:-mx-7 lg:-mb-7"
          />
        )}
      </Panel>

      {deleteTarget && (
        <DeleteConfirmDialog
          title={`Delete ${deleteTarget.name}?`}
          description={
            assignedCounts.get(deleteTarget.id)
              ? `${assignedCounts.get(deleteTarget.id)} user(s) assigned to this role will lose it. This action cannot be undone.`
              : "Are you sure you want to delete this role? This action cannot be undone."
          }
          confirmLabel="Delete"
          busy={deleteState.isLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
