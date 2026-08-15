"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} from "@/features/catalog/unitApi";
import type { UnitResponse, UnitUpsertRequest } from "@/lib/types/unitTypes";

import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";
import { UnitFormDialog } from "@/components/admin/UnitFormDialog";

const COLUMNS: ColumnDef[] = [
  { id: "name", label: "Name", locked: true },
  { id: "slug", label: "Slug / Code" },
  { id: "note", label: "Note" },
  { id: "actions", label: "Actions", locked: true },
];

export default function UnitsPage() {
  const cols = useColumnVisibility("units", COLUMNS);
  const [keyword, setKeyword] = useState("");
  const [dialog, setDialog] = useState<"new" | UnitResponse | null>(null);

  const { data: units = [], isLoading, error } = useGetUnitsQuery(undefined, { pollingInterval: 5000 });
  const [createUnit, createStatus] = useCreateUnitMutation();
  const [updateUnit, updateStatus] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();

  const visibleUnits = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return units;
    return units.filter(
      (u: UnitResponse) =>
        u.name.toLowerCase().includes(q) ||
        u.slug.toLowerCase().includes(q) ||
        (u.note ?? "").toLowerCase().includes(q),
    );
  }, [units, keyword]);

  const save = async (payload: UnitUpsertRequest) => {
    try {
      if (dialog === "new") {
        await createUnit(payload).unwrap();
        toast.success(`Unit "${payload.name}" created.`);
      } else if (dialog) {
        await updateUnit({ unitId: dialog.id, ...payload }).unwrap();
        toast.success(`Unit "${payload.name}" updated.`);
      }
      setDialog(null);
    } catch {
      toast.error("Failed to save unit measure.");
    }
  };

  const remove = async (unit: UnitResponse) => {
    try {
      await deleteUnit(unit.id).unwrap();
      toast.success(`Unit "${unit.name}" deleted.`);
    } catch {
      toast.error("Failed to delete unit.");
    }
  };

  return (
    <div className="w-full pt-2">

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Units
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Measures every shop shares, such as kilogram, box or cup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDialog("new")}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto shadow-sm"
        >
          <Plus className="size-4" />
          Add unit
        </button>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search units..."
            aria-label="Search units"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <div className="shrink-0">
          <ColumnPicker state={cols} buttonClassName="bg-card border-border" />
        </div>
      </div>

      {/* Table Container - Scrollable area */}
      <div className="mt-6 max-h-[calc(100dvh-15rem)] overflow-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className={`w-full text-left text-sm ${cols.tableClassName}`}>
          <thead className="sticky top-0 z-10 bg-card border-b border-border shadow-2xs text-xs sm:text-sm font-bold text-foreground">
            <tr>
              {!cols.isHidden("name") && <th className="px-4 py-3 sm:px-6 sm:py-4 bg-card first:rounded-tl-2xl">Name</th>}
              {!cols.isHidden("slug") && <th className="px-4 py-3 sm:px-6 sm:py-4 bg-card">Slug / Code</th>}
              {!cols.isHidden("note") && <th className="px-4 py-3 sm:px-6 sm:py-4 bg-card">Note</th>}
              {!cols.isHidden("actions") && <th className="w-20 px-3 py-3 sm:w-24 sm:px-4 sm:py-4 text-right bg-card last:rounded-tr-2xl">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {isLoading && (
              <AdminLoadingState label="Loading unit measures..." compact colSpan={4} />
            )}

            {error && !isLoading && (
              <AdminApiErrorFallback error={error} compact colSpan={4} />
            )}

            {!isLoading && !error && visibleUnits.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground sm:px-6 sm:py-14">
                  {keyword ? "No unit matches that search." : "No unit yet. Add the first one."}
                </td>
              </tr>
            )}

            {visibleUnits.map((unit: UnitResponse) => (
              <tr key={unit.id} className="transition hover:bg-accent/40">
                {!cols.isHidden("name") && (
                  <td className="px-4 py-3 font-semibold text-foreground sm:px-6 sm:py-4">
                    {unit.name}
                  </td>
                )}
                {!cols.isHidden("slug") && (
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs sm:px-6 sm:py-4">
                    /{unit.slug}
                  </td>
                )}
                {!cols.isHidden("note") && (
                  <td className="px-4 py-3 text-muted-foreground sm:px-6 sm:py-4">
                    {unit.note || "—"}
                  </td>
                )}
                {!cols.isHidden("actions") && (
                  <td className="px-3 py-3 sm:px-4 sm:py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDialog(unit)}
                        aria-label={`Edit ${unit.name}`}
                        title="Edit"
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(unit)}
                        aria-label={`Delete ${unit.name}`}
                        title="Delete"
                        className="rounded-full p-2 text-destructive transition hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialog && (
        <UnitFormDialog
          unit={dialog === "new" ? undefined : dialog}
          busy={createStatus.isLoading || updateStatus.isLoading}
          onCancel={() => setDialog(null)}
          onSubmit={save}
        />
      )}
    </div>
  );
}
