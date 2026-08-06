"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitsQuery,
  useUpdateUnitMutation,
} from "@/features/catalog/unitApi";
import { UnitFormDialog } from "@/components/admin/UnitFormDialog";
import type { UnitResponse, UnitUpsertRequest } from "@/lib/types/unitTypes";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";

type DialogState = null | "new" | UnitResponse;

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const status = "status" in error ? error.status : undefined;

  if (status === 409) return "A unit with that name already exists.";
  if (status === 403) return "Your account is not allowed to change units.";

  return status ? `Request failed with status ${status}.` : "Request failed.";
}

const COLUMNS: ColumnDef[] = [
  { id: "name", label: "Name" },
  { id: "address", label: "Address" },
  { id: "note", label: "Note" },
  { id: "actions", label: "Actions", locked: true },
];

export default function UnitsPage() {
  const cols = useColumnVisibility("units", COLUMNS);

  const [keyword, setKeyword] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  const { data: units = [], isLoading, error } = useGetUnitsQuery();
  const [createUnit, createState] = useCreateUnitMutation();
  const [updateUnit, updateState] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();

  const visibleUnits = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle) return units;

    return units.filter(
      (unit) =>
        unit.name.toLowerCase().includes(needle) ||
        unit.slug.toLowerCase().includes(needle) ||
        (unit.note ?? "").toLowerCase().includes(needle),
    );
  }, [units, keyword]);

  const saving = createState.isLoading || updateState.isLoading;
  const saveError = errorMessage(createState.error ?? updateState.error);

  const save = async (values: UnitUpsertRequest) => {
    const result =
      dialog === "new"
        ? await createUnit(values)
        : dialog
          ? await updateUnit({ unitId: dialog.id, ...values })
          : undefined;

    if (result && !("error" in result)) setDialog(null);
  };

  const remove = async (unit: UnitResponse) => {
    const confirmed = confirm(
      `Delete "${unit.name}"? Products already using it will block the delete.`,
    );

    if (confirmed) await deleteUnit(unit.id);
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
    <span className="text-foreground">Units</span>
  </nav>

  <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
        Units
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
        Measures every shop shares, such as kilogram, box or cup.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setDialog("new")}
      className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
    >
      <Plus className="size-4" />
      Add unit
    </button>
  </div>

      <div className="mt-7 flex items-center gap-2 sm:gap-3 lg:flex-wrap lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search units"
            aria-label="Search units"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <div className="shrink-0">
          <ColumnPicker state={cols} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${cols.tableClassName}`}
            style={{ minWidth: cols.minWidthRem(38) }}>
            <thead className="bg-muted text-sm font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Name</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Address</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Note</th>
                <th className="w-20 px-3 py-3 sm:w-24 sm:px-4 sm:py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground sm:px-6 sm:py-14">
                    Loading units...
                  </td>
                </tr>
              )}

          {error && !isLoading && (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-destructive sm:px-6 sm:py-14">
                {errorMessage(error)}
              </td>
            </tr>
          )}

          {!isLoading && !error && visibleUnits.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground sm:px-6 sm:py-14">
                {keyword ? "No unit matches that search." : "No unit yet. Add the first one."}
              </td>
            </tr>
          )}

          {visibleUnits.map((unit) => (
            <tr
              key={unit.id}
              className="transition hover:bg-accent"
            >
              <td className="px-4 py-3 font-medium text-card-foreground sm:px-6 sm:py-4">
                {unit.name}
              </td>
              <td className="px-4 py-3 text-muted-foreground sm:px-6 sm:py-4">/{unit.slug}</td>
              <td className="px-4 py-3 text-muted-foreground sm:px-6 sm:py-4">
                {unit.note || "—"}
              </td>
              <td className="px-3 py-3 sm:px-4 sm:py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setDialog(unit)}
                    aria-label={`Edit ${unit.name}`}
                    className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(unit)}
                    aria-label={`Delete ${unit.name}`}
                    className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
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
    <UnitFormDialog
      unit={dialog === "new" ? undefined : dialog}
      busy={saving}
      error={saveError}
      onCancel={() => setDialog(null)}
      onSubmit={save}
    />
  )}
</main>
  );
}