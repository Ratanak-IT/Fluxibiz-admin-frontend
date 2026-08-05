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
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link
          href="/dashboard"
          className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Dashboard
        </Link>
        <span className="px-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-neutral-900 dark:text-neutral-50">Units</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
            Units
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">
            Measures every shop shares, such as kilogram, box or cup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDialog("new")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 dark:bg-green-500 dark:text-neutral-950 dark:hover:bg-green-400"
        >
          <Plus className="size-4" />
          Add unit
        </button>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search units"
            aria-label="Search units"
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-4 text-sm text-neutral-900 outline-none transition focus:border-green-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-green-500"
          />
        </div>

        <ColumnPicker state={cols} />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${cols.tableClassName}`}
            style={{ minWidth: cols.minWidthRem(38) }}>
            <thead className="bg-neutral-50 text-sm font-medium text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Note</th>
                <th className="w-24 px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-neutral-500 dark:text-neutral-400">
                    Loading units...
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-red-600 dark:text-red-400">
                    {errorMessage(error)}
                  </td>
                </tr>
              )}

              {!isLoading && !error && visibleUnits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-neutral-500 dark:text-neutral-400">
                    {keyword ? "No unit matches that search." : "No unit yet. Add the first one."}
                  </td>
                </tr>
              )}

              {visibleUnits.map((unit) => (
                <tr
                  key={unit.id}
                  className="transition hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40"
                >
                  <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-50">
                    {unit.name}
                  </td>
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">/{unit.slug}</td>
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                    {unit.note || "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDialog(unit)}
                        aria-label={`Edit ${unit.name}`}
                        className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(unit)}
                        aria-label={`Delete ${unit.name}`}
                        className="rounded-full p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
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