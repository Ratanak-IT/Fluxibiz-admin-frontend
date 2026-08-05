"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateBusinessCategoryMutation,
  useDeleteBusinessCategoryMutation,
  useGetBusinessCategoriesQuery,
  useUpdateBusinessCategoryMutation,
} from "@/features/businessManagement/businessAdminApi";

interface EditorState {
  mode: "create" | "edit";
  categoryId?: string;
  parentId?: string | null;
  name: string;
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error } = useGetBusinessCategoriesQuery();
  const [create, createState] = useCreateBusinessCategoryMutation();
  const [update, updateState] = useUpdateBusinessCategoryMutation();
  const [remove] = useDeleteBusinessCategoryMutation();

  const [editor, setEditor] = useState<EditorState | null>(null);
  const busy = createState.isLoading || updateState.isLoading;

  const save = async () => {
    if (!editor?.name.trim()) return;

    if (editor.mode === "create") {
      await create({ name: editor.name.trim(), parentId: editor.parentId ?? null });
    } else if (editor.categoryId) {
      await update({
        categoryId: editor.categoryId,
        name: editor.name.trim(),
        parentId: editor.parentId ?? null,
      });
    }

    setEditor(null);
  };

  const confirmDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"? Shops already using it keep their link.`)) {
      await remove(id);
    }
  };

  return (
  <main className="px-4 py-6 sm:px-8 sm:py-7 bg-[var(--background)] text-[var(--foreground)]">
  <nav className="mb-6 text-[15px] text-neutral-400 dark:text-[var(--muted-foreground)]">
    <Link href="/dashboard" className="hover:text-neutral-600 dark:hover:text-[var(--foreground)]">
      Dashboard
    </Link>
    <span className="px-2">/</span>
    <span className="text-neutral-700 dark:text-[var(--foreground)]">Categories</span>
  </nav>

  <div className="flex items-start justify-between">
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-[var(--foreground)]">Categories</h1>
      <p className="mt-1 text-[15px] text-neutral-500 dark:text-[var(--muted-foreground)]">
        The list shop owners pick from when they set up their business.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setEditor({ mode: "create", name: "", parentId: null })}
      className="flex items-center gap-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
    >
      <Plus className="size-4" />
      Add category
    </button>
  </div>

  {isLoading && <p className="mt-8 text-sm text-neutral-500 dark:text-[var(--muted-foreground)]">Loading categories...</p>}
  {error && (
    <p className="mt-8 text-sm text-red-600 dark:text-[var(--destructive)]">
      Request failed{"status" in error ? ` with status ${error.status}` : ""}.
    </p>
  )}

  {!isLoading && !error && categories.length === 0 && (
    <p className="mt-8 text-sm text-neutral-500 dark:text-[var(--muted-foreground)]">
      No category yet. Add the first one so shop owners have something to choose.
    </p>
  )}

  <div className="mt-7 space-y-3">
    {categories.map((parent) => (
      <div key={parent.id} className="rounded-2xl border border-neutral-200 dark:border-[var(--border)] dark:bg-[var(--card)]">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <span className="font-medium text-neutral-900 dark:text-[var(--card-foreground)]">{parent.name}</span>
            <span className="ml-2 text-xs text-neutral-400 dark:text-[var(--muted-foreground)]">/{parent.slug}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Add sub category"
              onClick={() => setEditor({ mode: "create", name: "", parentId: parent.id })}
              className="rounded-full p-2 text-neutral-400 dark:text-[var(--muted-foreground)] hover:bg-neutral-100 dark:hover:bg-[var(--accent)] hover:text-neutral-700 dark:hover:text-[var(--accent-foreground)]"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              title="Rename"
              onClick={() =>
                setEditor({ mode: "edit", categoryId: parent.id, name: parent.name, parentId: null })
              }
              className="rounded-full p-2 text-neutral-400 dark:text-[var(--muted-foreground)] hover:bg-neutral-100 dark:hover:bg-[var(--accent)] hover:text-neutral-700 dark:hover:text-[var(--accent-foreground)]"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => confirmDelete(parent.id, parent.name)}
              className="rounded-full p-2 text-neutral-400 dark:text-[var(--muted-foreground)] hover:bg-red-50 dark:hover:bg-[var(--destructive)]/20 hover:text-red-600 dark:hover:text-[var(--destructive)]"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {parent.subCategories?.length > 0 && (
          <ul className="border-t border-neutral-100 dark:border-[var(--border)]">
            {parent.subCategories.map((child) => (
              <li
                key={child.id}
                className="flex items-center justify-between px-5 py-3 pl-10 text-sm"
              >
                <span className="flex items-center gap-2 text-neutral-700 dark:text-[var(--card-foreground)]">
                  <ChevronRight className="size-3.5 text-neutral-300 dark:text-[var(--muted-foreground)]" aria-hidden />
                  {child.name}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Rename"
                    onClick={() =>
                      setEditor({
                        mode: "edit",
                        categoryId: child.id,
                        name: child.name,
                        parentId: parent.id,
                      })
                    }
                    className="rounded-full p-2 text-neutral-400 dark:text-muted-foreground hover:bg-neutral-100 dark:hover:bg-accent hover:text-neutral-700 dark:hover:text-accent-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => confirmDelete(child.id, child.name)}
                    className="rounded-full p-2 text-neutral-400 dark:text-muted-foreground)] hover:bg-red-50 dark:hover:bg-destructive/20 hover:text-red-600 dark:hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>

  {editor && (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-popover text-popover-foreground p-6 shadow-xl border border-transparent dark:border-border">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-popover-foreground">
          {editor.mode === "create"
            ? editor.parentId
              ? "New sub category"
              : "New category"
            : "Rename category"}
        </h2>

        <label className="mt-5 block text-sm font-medium text-neutral-700 dark:text-popover-foreground" htmlFor="categoryName">
          Name
        </label>
        <input
          id="categoryName"
          value={editor.name}
          autoFocus
          onChange={(event) => setEditor({ ...editor, name: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && save()}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 dark:border-input bg-transparent dark:text-foreground px-3 py-2 text-sm outline-none focus:border-ring"
        />
        <p className="mt-2 text-xs text-neutral-500 dark:text-muted-foreground">
          The web address is generated from the name.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditor(null)}
            className="rounded-full border border-neutral-300 dark:border-border px-5 py-2 text-sm text-neutral-700 dark:text-foreground hover:bg-neutral-50 dark:hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!editor.name.trim() || busy}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )}
</main>
  );
}
