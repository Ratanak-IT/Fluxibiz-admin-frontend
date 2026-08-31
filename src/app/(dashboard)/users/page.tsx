"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreatePlatformUserMutation,
  useDeletePlatformUserMutation,
  useGetPlatformRolesQuery,
  useGetPlatformUsersQuery,
  useSetUserStatusMutation,
  useUpdatePlatformUserMutation,
} from "@/features/platformUsers/platformUserApi";
import {
  StaffFormPanel,
  type StaffFormValues,
} from "@/components/admin/StaffFormPanel";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/SelectField";
import { PaginationBar } from "@/components/ui/PaginationBar";
import {
  Panel,
  PanelHeader,
  EmptyState,
  StatusPill,
} from "@/components/admin/staffUi";
import type { StaffResponse } from "@/lib/types/adminTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";

type PanelState = null | "new" | StaffResponse;
type SortColumn = "name" | "role" | "status";

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status =
    "status" in error ? (error as { status?: number }).status : undefined;
  if (status === 401) return undefined;
  const data =
    "data" in error
      ? (error as { data?: { message?: string } }).data
      : undefined;
  if (data?.message) return data.message;
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
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [panel, setPanel] = useState<PanelState>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffResponse | null>(null);

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useGetPlatformUsersQuery();
  const { data: roles = [] } = useGetPlatformRolesQuery();
  const [createUser, createState] = useCreatePlatformUserMutation();
  const [updateUser, updateState] = useUpdatePlatformUserMutation();
  const [setStatus] = useSetUserStatusMutation();
  const [deleteUser, deleteState] = useDeletePlatformUserMutation();

  const roleNameById = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  );

  const resetFilters = () => {
    setKeyword("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    keyword || roleFilter !== "ALL" || statusFilter !== "ALL",
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    let list = users;

    if (needle) {
      list = list.filter(
        (user) =>
          user.username.toLowerCase().includes(needle) ||
          (user.email ?? "").toLowerCase().includes(needle) ||
          (user.phoneNumber ?? "").toLowerCase().includes(needle) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(needle),
      );
    }

    if (roleFilter !== "ALL") {
      list =
        roleFilter === "NO_ROLE"
          ? list.filter((user) => !user.roleId)
          : list.filter((user) => user.roleId === roleFilter);
    }

    if (statusFilter !== "ALL") {
      list = list.filter((user) => user.status === statusFilter);
    }

    if (sortColumn) {
      list = [...list].sort((a, b) => {
        let valA = "";
        let valB = "";

        if (sortColumn === "name") {
          valA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valB = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (sortColumn === "role") {
          valA = (
            a.roleId ? roleNameById.get(a.roleId) || "" : ""
          ).toLowerCase();
          valB = (
            b.roleId ? roleNameById.get(b.roleId) || "" : ""
          ).toLowerCase();
        } else if (sortColumn === "status") {
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    users,
    keyword,
    roleFilter,
    statusFilter,
    sortColumn,
    sortDirection,
    roleNameById,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const staff = filtered.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize,
  );

  const busy = createState.isLoading || updateState.isLoading;
  const panelError = errorMessage(createState.error ?? updateState.error);

  const save = async (values: StaffFormValues) => {
    const result =
      panel === "new"
        ? await createUser({
            username: values.username,
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber,
            gender: values.gender,
            roleId: values.roleId || undefined,
          })
        : panel
          ? await updateUser({
              userId: panel.id,
              body: {
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                gender: values.gender,
                roleId: values.roleId || undefined,
              },
            })
          : undefined;

    if (result && !("error" in result)) {
      toast.success(panel === "new" ? "User created" : "Changes saved");
      setPanel(null);
    } else if (result && "error" in result) {
      toast.error(errorMessage(result.error) ?? "Request failed.");
    }
  };

  const toggleStatus = async (user: StaffResponse) => {
    const next = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const result = await setStatus({ userId: user.id, status: next });

    if (result && !("error" in result)) {
      toast.success(next === "ACTIVE" ? "User activated" : "User deactivated");
    } else if (result && "error" in result) {
      toast.error(
        errorMessage(result.error) ?? "Unable to change the user's status.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteUser(deleteTarget.id);

    if (result && !("error" in result)) {
      toast.success("User removed");
    } else if (result && "error" in result) {
      toast.error(errorMessage(result.error) ?? "Unable to remove the user.");
    }
    setDeleteTarget(null);
  };

  const renderSortHeader = (column: SortColumn, label: string) => (
    <button
      type="button"
      onClick={() => handleSort(column)}
      className="group inline-flex items-center gap-1.5 font-bold transition-colors hover:text-primary"
    >
      <span>{label}</span>
      {sortColumn === column ? (
        sortDirection === "asc" ? (
          <ArrowUp className="size-3.5 text-primary" />
        ) : (
          <ArrowDown className="size-3.5 text-primary" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      {panel && (
        <StaffFormPanel
          key={panel === "new" ? "new" : panel.id}
          user={panel === "new" ? undefined : panel}
          roles={roles}
          busy={busy}
          error={panelError}
          onCancel={() => setPanel(null)}
          onSubmit={save}
        />
      )}

      <Panel>
        <PanelHeader
          title="Staff"
          description="Colleagues who work inside this console, and what each of them may do"
          action={
            !panel ? (
              <Button
                type="button"
                onClick={() => setPanel("new")}
                className="gap-1.5 rounded-xl sm:gap-2"
              >
                <Plus className="size-4" aria-hidden="true" />
                <span>Add staff</span>
              </Button>
            ) : null
          }
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <label htmlFor="staff-search" className="sr-only">
                Search users
              </label>
              <input
                id="staff-search"
                type="search"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                placeholder="Search by name, email, or phone..."
                className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-8 text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/20 dark:focus-visible:border-gray-600 sm:text-sm"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-44">
              <SelectField
                size="sm"
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v);
                  setPage(0);
                }}
                options={[
                  { value: "ALL", label: "All roles" },
                  ...roles.map((role) => ({
                    value: role.id,
                    label: role.name,
                  })),
                  { value: "NO_ROLE", label: "No role" },
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <SelectField
                size="sm"
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(0);
                }}
                options={[
                  { value: "ALL", label: "All status" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 size-3.5" />
                Reset
              </Button>
            )}
          </div>

          <ColumnPicker state={cols} buttonClassName="bg-card border-border" />
        </div>

        {isLoading ? (
          <AdminLoadingState label="Loading users..." />
        ) : error ? (
          <AdminApiErrorFallback
            error={error}
            description={errorMessage(error)}
            onRetry={refetch}
          />
        ) : staff.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No matching users" : "No users yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Add your first user to give someone access."
            }
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  {!cols.isHidden("person") && (
                    <th className="py-3 pr-4">
                      {renderSortHeader("name", "Name")}
                    </th>
                  )}
                  {!cols.isHidden("canDo") && (
                    <th className="py-3 pr-4">
                      {renderSortHeader("role", "Role")}
                    </th>
                  )}
                  {!cols.isHidden("status") && (
                    <th className="py-3 pr-4">
                      {renderSortHeader("status", "Status")}
                    </th>
                  )}
                  {!cols.isHidden("actions") && (
                    <th className="py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {staff.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0"
                  >
                    {!cols.isHidden("person") && (
                      <td className="py-4 pr-4">
                        <p className="text-[15px] font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email || `@${user.username}`}
                        </p>
                      </td>
                    )}

                    {!cols.isHidden("canDo") && (
                      <td className="py-4 pr-4 text-sm text-muted-foreground">
                        {user.roleId
                          ? (roleNameById.get(user.roleId) ?? "Unknown role")
                          : "No role"}
                      </td>
                    )}

                    {!cols.isHidden("status") && (
                      <td className="py-4 pr-4">
                        <StatusPill active={user.status === "ACTIVE"} />
                      </td>
                    )}

                    {!cols.isHidden("actions") && (
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(user)}
                          >
                            {user.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setPanel(
                                panel && panel !== "new" && panel.id === user.id
                                  ? null
                                  : user,
                              )
                            }
                            aria-label={`Edit ${user.username}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(user)}
                            aria-label={`Remove ${user.username}`}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <PaginationBar
            page={currentPage}
            size={pageSize}
            totalElements={filtered.length}
            totalPages={totalPages}
            onPageChange={setPage}
            onSizeChange={setPageSize}
            itemLabel="user"
            className="-mx-6 -mb-6 mt-5 rounded-b-3xl border-t lg:-mx-7 lg:-mb-7"
          />
        )}
      </Panel>

      {deleteTarget && (
        <DeleteConfirmDialog
          title={`Delete ${deleteTarget.username}?`}
          description="Are you sure you want to remove this staff member? This action cannot be undone."
          confirmLabel="Delete"
          busy={deleteState.isLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
