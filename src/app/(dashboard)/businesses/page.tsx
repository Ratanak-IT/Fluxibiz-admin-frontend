"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, ChevronDown, Download } from "lucide-react";
import { toast } from "sonner";
import {
  useGetBusinessesInfiniteQuery,
  useGetBusinessCategoriesQuery,
  useCreateBusinessMutation,
} from "@/features/businessManagement/businessAdminApi";
import { BusinessRowActions } from "@/components/admin/BusinessRowActions";
import { Flag, StatusPill } from "@/components/admin/StatusPill";
import type { BusinessOwnerStatus } from "@/lib/types/adminTypes";

import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { ColumnDef, useColumnVisibility } from "@/lib/hook/useColumnVisibility";
import { useInfiniteScroll } from "@/lib/hook/useInfiniteScroll";
import { ExportReportDialog } from "@/components/admin/ExportReportDialog";

const STATUS_FILTERS: Array<{
  label: string;
  value: BusinessOwnerStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Deleted", value: "DELETED" },
];

const COLUMNS: ColumnDef[] = [
  { id: "business", label: "Business" },
  { id: "category", label: "Category" },
  { id: "status", label: "Status" },
  { id: "storefront", label: "Storefront" },
  { id: "features", label: "Features" },
  { id: "actions", label: "Actions", locked: true },
];

const PAGE_SIZE = 20;

interface CreateFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  businessName: string;
  businessCategoryId: string;
  businessAddress: string;
}

export default function BusinessesPage() {
  const cols = useColumnVisibility("businesses", COLUMNS);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<BusinessOwnerStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const [createForm, setCreateForm] = useState<CreateFormState | null>(null);

  const query = useMemo(
    () => ({
      keyword: keyword.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      page,
      size: PAGE_SIZE,
    }),
    [keyword, status, page],
  );

  const { data, isLoading, isFetching, error } =
    useGetBusinessesInfiniteQuery(query);

  const { sentinelRef, loadMore, hasMore } = useInfiniteScroll({
    data,
    isFetching,
    page,
    setPage,
  });
  const { data: categories = [] } = useGetBusinessCategoriesQuery();
  const [createBusiness, createResult] = useCreateBusinessMutation();

  const rows = data?.content ?? [];

  const subCategories = useMemo(() => {
    return categories.flatMap((cat) => cat.subCategories ?? []);
  }, [categories]);

  const activeFilter =
    STATUS_FILTERS.find((f) => f.value === status) ?? STATUS_FILTERS[0];

  const handleCreate = async () => {
    if (!createForm) return;
    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await createBusiness({
        username: createForm.email,
        password: createForm.password,
        confirmPassword: createForm.confirmPassword,
        email: createForm.email,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        phoneNumber: createForm.phone,
        gender: "UNSPECIFIED",
        businessName: createForm.businessName,
        businessAddress: createForm.businessAddress,
        businessCategoryId: createForm.businessCategoryId,
      }).unwrap();
      toast.success("Business registered successfully!");
      setCreateForm(null);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        err?.data?.detail ||
        "Registration failed. Please check your information and try again.";
      toast.error(msg);
    }
  };

  const inputCls =
    "mt-1.5 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-green-600";
  const labelCls =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 bg-background">
      <nav className="mb-5 flex flex-wrap items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="transition hover:text-foreground">
          Dashboard
        </Link>
        <span className="px-2 opacity-60">/</span>
        <span className="font-medium text-foreground">Businesses</span>
      </nav>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Businesses
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Every shop registered on the platform, and the controls to moderate
            them.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setCreateForm({
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              confirmPassword: "",
              phone: "",
              businessName: "",
              businessCategoryId: subCategories[0]?.id ?? "",
              businessAddress: "",
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto sm:justify-start"
        >
          <Plus className="size-4" />
          Create Business
        </button>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(0);
            }}
            placeholder="Search by name, description or address"
            aria-label="Search businesses"
            className="w-full rounded-full border border-border bg-primary-foreground py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary dark:bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
        {/* Mobile/tablet dropdown filter */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setFilterMenuOpen((prev) => !prev)}
            aria-expanded={filterMenuOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-2 rounded-full border border-border bg-primary-foreground px-4 py-2.5 text-sm text-foreground transition hover:bg-accent dark:bg-background"
          >
            <SlidersHorizontal className="size-4 fill-primary text-primary" aria-hidden />
            <span>{activeFilter.label}</span>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {filterMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFilterMenuOpen(false)} />
              <div role="listbox" className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    role="option"
                    aria-selected={status === filter.value}
                    onClick={() => {
                      setStatus(filter.value);
                      setPage(0);
                      setFilterMenuOpen(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${status === filter.value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop pill filters */}
        <div className="hidden items-center gap-2 lg:flex">
          <SlidersHorizontal className="size-4 fill-primary text-primary" aria-hidden />
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(0);
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${status === filter.value ? "border-primary bg-primary-foreground text-primary dark:bg-background" : "border-border bg-primary-foreground text-foreground hover:bg-accent dark:bg-background"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExportDialogOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          <Download className="size-3.5" />
          Export
        </button>

        <ColumnPicker state={cols} buttonClassName="bg-primary-foreground dark:bg-background" />
      </div>

      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        defaultType="businesses"
        businessData={rows}
      />
    </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table
          className={`w-full min-w-[720px] text-left ${cols.tableClassName}`}
        >
          <thead className="bg-muted text-sm font-semibold text-card-foreground">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Business</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Storefront</th>
              <th className="px-6 py-4">Features</th>
              <th className="w-14 px-4 py-4 rounded-tr-2xl" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  Loading businesses...
                </td>
              </tr>
            )}

            {error && !isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-destructive"
                >
                  Could not load businesses. Check that your session still has
                  the SUPER_ADMIN role.
                </td>
              </tr>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No business matches this filter. Try clearing the search.
                </td>
              </tr>
            )}

            {rows.map((business) => (
              <tr
                key={business.id}
                className="hover:bg-accent/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/businesses/${business.id}`}
                    className="font-medium text-card-foreground hover:text-primary"
                  >
                    {business.name}
                  </Link>
                  <span className="block text-xs text-muted-foreground">
                    /{business.slug}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {business.category?.name ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={business.status} />
                </td>
                <td className="px-6 py-4">
                  <Flag
                    on={business.isListing && !business.isClosed}
                    onLabel="Listed"
                    offLabel="Hidden"
                  />
                </td>
                <td className="px-6 py-4">
                  <Flag
                    on={business.isEnabled}
                    onLabel="Enabled"
                    offLabel="Disabled"
                  />
                </td>
                <td className="px-4 py-4">
                  <BusinessRowActions business={business} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* scroll sentinel + status footer */}
      <div
        ref={sentinelRef}
        className="mt-5 flex flex-col items-center gap-3 py-6 text-sm"
      >
        {isFetching && !isLoading && (
          <span className="text-muted-foreground">
            Loading more businesses...
          </span>
        )}

        {!isFetching && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full border border-border px-5 py-2 text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Load more
          </button>
        )}

        {data && rows.length > 0 && (
          <span className="text-muted-foreground">
            Showing {rows.length}
            {data.totalElements >= 0 ? ` of ${data.totalElements}` : ""}{" "}
            businesses
            {!hasMore && !isFetching ? " · end of list" : ""}
          </span>
        )}
      </div>

      {createForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-xl border border-border my-8 sm:p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Register New Business
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a Keycloak user account and provision a new business.
            </p>

            <div className="mt-5 space-y-4">
              {/* ── Owner Info ── */}
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Owner Account
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    value={createForm.firstName}
                    placeholder="Sokha"
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        firstName: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={createForm.lastName}
                    placeholder="Seng"
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lastName: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="ownerEmail">
                  Email
                </label>
                <input
                  id="ownerEmail"
                  type="email"
                  value={createForm.email}
                  placeholder="merchant@gmail.com"
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="ownerPhone">
                  Phone Number
                </label>
                <input
                  id="ownerPhone"
                  value={createForm.phone}
                  placeholder="+855 12 345 678"
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="ownerPassword">
                    Password
                  </label>
                  <input
                    id="ownerPassword"
                    type="password"
                    value={createForm.password}
                    placeholder="Min 8 characters"
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ownerConfirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="ownerConfirmPassword"
                    type="password"
                    value={createForm.confirmPassword}
                    placeholder="Re-type password"
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              {/* ── Business Info ── */}
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business Details
              </p>

              <div>
                <label className={labelCls} htmlFor="bizName">
                  Business Name
                </label>
                <input
                  id="bizName"
                  value={createForm.businessName}
                  placeholder="e.g. My Awesome Shop"
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      businessName: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="bizCategory">
                  Business Type
                </label>
                <select
                  id="bizCategory"
                  value={createForm.businessCategoryId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      businessCategoryId: e.target.value,
                    })
                  }
                  className={inputCls}
                >
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="bizAddress">
                  Business Address
                </label>
                <input
                  id="bizAddress"
                  value={createForm.businessAddress}
                  placeholder="e.g. #123 St 456, Phnom Penh"
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      businessAddress: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCreateForm(null)}
                className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  !createForm.firstName.trim() ||
                  !createForm.lastName.trim() ||
                  !createForm.email.trim() ||
                  !createForm.phone.trim() ||
                  !createForm.password.trim() ||
                  createForm.password.length < 8 ||
                  !createForm.confirmPassword.trim() ||
                  !createForm.businessName.trim() ||
                  !createForm.businessCategoryId.trim() ||
                  !createForm.businessAddress.trim() ||
                  createResult.isLoading
                }
                onClick={handleCreate}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                {createResult.isLoading
                  ? "Registering..."
                  : "Register Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
