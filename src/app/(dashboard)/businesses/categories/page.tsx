"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateBusinessCategoryMutation,
  useDeleteBusinessCategoryMutation,
  useGetBusinessCategoriesQuery,
  useGetBusinessesQuery,
  useUpdateBusinessCategoryMutation,
} from "@/features/businessManagement/businessAdminApi";

interface EditorState {
  mode: "create" | "edit";
  categoryId?: string;
  parentId?: string | null;
  name: string;
}

type FilterType = "ALL" | "PARENT_ONLY" | "HAS_SUB";

const TYPE_FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: "All", value: "ALL" },
  { label: "Main Only", value: "PARENT_ONLY" },
  { label: "With Subcategories", value: "HAS_SUB" },
];

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error } = useGetBusinessCategoriesQuery();
  const [create, createState] = useCreateBusinessCategoryMutation();
  const [update, updateState] = useUpdateBusinessCategoryMutation();
  const [remove] = useDeleteBusinessCategoryMutation();

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: businessData } = useGetBusinessesQuery({ size: 200 });
  const businessList = businessData?.content ?? [];

  const categoryBusinessCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    businessList.forEach((b) => {
      if (b.category?.id) {
        map[b.category.id] = (map[b.category.id] ?? 0) + 1;
      }
    });
    return map;
  }, [businessList]);

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const busy = createState.isLoading || updateState.isLoading;

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .map((parent) => {
        // Apply type filter
        if (typeFilter === "HAS_SUB" && (!parent.subCategories || parent.subCategories.length === 0)) {
          return null;
        }

        const parentMatch =
          parent.name.toLowerCase().includes(query) ||
          parent.slug.toLowerCase().includes(query);

        const matchingSubCategories =
          typeFilter === "PARENT_ONLY"
            ? []
            : (parent.subCategories ?? []).filter(
                (child) =>
                  child.name.toLowerCase().includes(query) ||
                  child.slug.toLowerCase().includes(query),
              );

        if (!query) {
          return {
            ...parent,
            subCategories:
              typeFilter === "PARENT_ONLY" ? [] : (parent.subCategories ?? []),
          };
        }

        if (parentMatch || matchingSubCategories.length > 0) {
          return {
            ...parent,
            subCategories: parentMatch
              ? typeFilter === "PARENT_ONLY"
                ? []
                : (parent.subCategories ?? [])
              : matchingSubCategories,
          };
        }

        return null;
      })
      .filter((cat): cat is NonNullable<typeof cat> => cat !== null);
  }, [categories, searchQuery, typeFilter]);

  const totalParents = categories.length;
  const totalSubs = useMemo(
    () => categories.reduce((acc, cat) => acc + (cat.subCategories?.length ?? 0), 0),
    [categories],
  );

  const save = async () => {
    if (!editor?.name.trim()) return;

    try {
      if (editor.mode === "create") {
        await create({ name: editor.name.trim(), parentId: editor.parentId ?? null }).unwrap();
        toast.success(`Category "${editor.name}" created.`);
      } else if (editor.categoryId) {
        await update({
          categoryId: editor.categoryId,
          name: editor.name.trim(),
          parentId: editor.parentId ?? null,
        }).unwrap();
        toast.success(`Category "${editor.name}" updated.`);
      }
      setEditor(null);
    } catch {
      toast.error("Failed to save category.");
    }
  };

  const confirmDelete = (id: string, name: string) => {
    toast(`Delete category "${name}"?`, {
      description: "Shops already using it will keep their link.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await remove(id).unwrap();
            toast.success(`Category "${name}" deleted.`);
          } catch {
            toast.error("Failed to delete category.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="w-full pt-2">

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The list shop owners pick from when they set up their business ({totalParents} main, {totalSubs} sub).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditor({ mode: "create", name: "", parentId: null })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto sm:justify-start shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Add category
        </button>
      </div>

      {/* Toolbar: Search, Filters */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="text"
              placeholder="Search by category name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-10 text-sm text-foreground outline-none transition focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile dropdown filter */}
            <div className="relative lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFilterOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground outline-none transition hover:bg-accent"
              >
                <SlidersHorizontal className="size-4 fill-primary text-primary" aria-hidden />
                <span>{TYPE_FILTERS.find((f) => f.value === typeFilter)?.label}</span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {mobileFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMobileFilterOpen(false)} />
                  <div role="listbox" className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
                    {TYPE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => {
                          setTypeFilter(filter.value);
                          setMobileFilterOpen(false);
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          typeFilter === filter.value
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Desktop status pill filters */}
            <div className="hidden items-center gap-2 lg:flex">
              <SlidersHorizontal className="size-4 fill-primary text-primary" aria-hidden />
              {TYPE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setTypeFilter(filter.value)}
                  className={`rounded-full border px-4 py-2 text-sm transition font-medium ${
                    typeFilter === filter.value
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading categories...</p>}
      {error && (
        <p className="mt-8 text-sm text-destructive font-medium">
          Request failed{"status" in error ? ` with status ${error.status}` : ""}.
        </p>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          No category yet. Add the first one so shop owners have something to choose.
        </p>
      )}

      {!isLoading && !error && categories.length > 0 && filteredCategories.length === 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <FolderTree className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-3 text-base font-semibold text-card-foreground">No matching categories found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search query or filter options.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("ALL");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-primary-foreground px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent dark:bg-background shadow-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filteredCategories.map((parent) => {
          const parentDirectCount = categoryBusinessCountMap[parent.id] ?? 0;
          const subTotalCount = (parent.subCategories ?? []).reduce(
            (acc, child) => acc + (categoryBusinessCountMap[child.id] ?? 0),
            0,
          );
          const totalCategoryBusinesses = parentDirectCount + subTotalCount;
          const subCount = parent.subCategories?.length ?? 0;

          return (
            <div
              key={parent.id}
              className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition hover:border-border/80"
            >
              <div className="flex items-center justify-between gap-2 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-card-foreground text-base break-words">
                    {parent.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                    /{parent.slug}
                  </span>

                  {/* Subcategories count badge */}
                  {subCount > 0 && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium shrink-0">
                      {subCount} {subCount === 1 ? "subcategory" : "subcategories"}
                    </span>
                  )}

                  {/* Live Business Count Badge */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary shrink-0">
                    <Building2 className="size-3" />
                    {totalCategoryBusinesses} {totalCategoryBusinesses === 1 ? "Business" : "Businesses"}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Add subcategory"
                    onClick={() => setEditor({ mode: "create", name: "", parentId: parent.id })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="size-3.5" />
                    <span className="hidden sm:inline">Subcategory</span>
                  </button>
                  <button
                    type="button"
                    title="Rename"
                    onClick={() =>
                      setEditor({ mode: "edit", categoryId: parent.id, name: parent.name, parentId: null })
                    }
                    className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => confirmDelete(parent.id, parent.name)}
                    className="rounded-full p-2 text-destructive transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {parent.subCategories && parent.subCategories.length > 0 && (
                <ul className="divide-y divide-border border-t border-border bg-muted/20">
                  {parent.subCategories.map((child) => {
                    const childBusinessCount = categoryBusinessCountMap[child.id] ?? 0;
                    return (
                      <li
                        key={child.id}
                        className="flex items-center justify-between gap-2 px-5 py-3 pl-8 sm:pl-10 text-sm hover:bg-accent/40 transition-colors"
                      >
                        <span className="flex min-w-0 items-center gap-2.5 text-foreground">
                          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="break-words font-medium">{child.name}</span>
                          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">/{child.slug}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
                            <Building2 className="size-3" />
                            {childBusinessCount}
                          </span>
                        </span>

                        <div className="flex shrink-0 items-center gap-1">
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
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => confirmDelete(child.id, child.name)}
                            className="rounded-full p-2 text-destructive transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Editor Modal */}
      {editor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border text-card-foreground">
            <h2 className="text-lg font-semibold text-card-foreground">
              {editor.mode === "create"
                ? editor.parentId
                  ? "New Subcategory"
                  : "New Category"
                : "Rename Category"}
            </h2>

            <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="categoryName">
              Name
            </label>
            <input
              id="categoryName"
              value={editor.name}
              autoFocus
              onChange={(event) => setEditor({ ...editor, name: event.target.value })}
              onKeyDown={(event) => event.key === "Enter" && save()}
              placeholder="e.g. Food & Beverage"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              The web address slug will be generated automatically from the name.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editor.name.trim() || busy}
                onClick={save}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
