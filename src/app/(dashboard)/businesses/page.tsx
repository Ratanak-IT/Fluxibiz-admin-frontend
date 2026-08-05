"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
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

const STATUS_FILTERS: Array<{ label: string; value: BusinessOwnerStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Deleted", value: "DELETED" },
];

const COLUMNS: ColumnDef[] = [
  { id: "business", label: "Business" },
  { id: "category", label: "Category" },
  { id: "city", label: "City" },
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

  const { data, isLoading, isFetching, error } = useGetBusinessesInfiniteQuery(query);

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

  const handleCreate = async () => {
    if (!createForm) return;
    if (createForm.password !== createForm.confirmPassword) {
      alert("Passwords do not match.");
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
      setCreateForm(null);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        err?.data?.detail ||
        "Registration failed. Please check your information and try again.";
      alert(msg);
    }
  };

  const inputCls =
    "mt-1.5 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-green-600";
  const labelCls =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav className="mb-5 flex flex-wrap items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="transition hover:text-foreground">
          Dashboard
        </Link>
        <span className="px-2 text-muted-foreground/60">/</span>
        <span className="text-foreground">Businesses</span>
      </nav>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Businesses
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Every shop registered on the platform, and the controls to moderate them.
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
          className="flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
        >
          <Plus className="size-4" />
          Create Business
        </button>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(0);
            }}
            placeholder="Search by name, city or description"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden />
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(0);
              }}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                status === filter.value
                  ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500 dark:text-neutral-950"
                  : "border-border text-foreground hover:bg-accent",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <ColumnPicker state={cols} />
      </div>

      <div className="mt-6 overflow-visible rounded-2xl border border-neutral-200">
        <table className={`w-full text-left ${cols.tableClassName}`}>
          <thead className="bg-neutral-50 text-sm font-semibold text-neutral-800">
            <tr>
              <th className="px-6 py-4">Business</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Storefront</th>
              <th className="px-6 py-4">Features</th>
              <th className="w-14 px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                  Loading businesses...
                </td>
              </tr>
            )}

            {error && !isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-red-600">
                  Could not load businesses. Check that your session still has the SUPER_ADMIN role.
                </td>
              </tr>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                  No business matches this filter. Try clearing the search.
                </td>
              </tr>
            )}

            {rows.map((business) => (
              <tr key={business.id} className="hover:bg-neutral-50/60">
                <td className="px-6 py-4">
                  <Link
                    href={`/businesses/${business.id}`}
                    className="font-medium text-neutral-900 hover:text-green-700"
                  >
                    {business.name}
                  </Link>
                  <span className="block text-xs text-neutral-400">/{business.slug}</span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {business.category?.name ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {business.cityOrProvince ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={business.status} />
                </td>
                <td className="px-6 py-4">
                  <Flag on={business.isListing && !business.isClosed} onLabel="Listed" offLabel="Hidden" />
                </td>
                <td className="px-6 py-4">
                  <Flag on={business.isEnabled} onLabel="Enabled" offLabel="Disabled" />
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
      <div ref={sentinelRef} className="mt-5 flex flex-col items-center gap-3 py-6 text-sm">
        {isFetching && !isLoading && (
          <span className="text-muted-foreground">Loading more businesses...</span>
        )}

        {!isFetching && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full border border-border px-5 py-2 text-foreground transition hover:bg-accent"
          >
            Load more
          </button>
        )}

        {data && rows.length > 0 && (
          <span className="text-muted-foreground">
            Showing {rows.length}
            {data.totalElements >= 0 ? ` of ${data.totalElements}` : ""} businesses
            {!hasMore && !isFetching ? " · end of list" : ""}
          </span>
        )}
      </div>

      {createForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 my-8">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Register New Business</h2>
            <p className="mt-1 text-sm text-neutral-500">Create a Keycloak user account and provision a new business.</p>

            <div className="mt-5 space-y-4">
              {/* ── Owner Info ── */}
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Owner Account</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="firstName">First Name</label>
                  <input id="firstName" value={createForm.firstName} placeholder="Sokha"
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="lastName">Last Name</label>
                  <input id="lastName" value={createForm.lastName} placeholder="Seng"
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="ownerEmail">Email</label>
                <input id="ownerEmail" type="email" value={createForm.email} placeholder="merchant@gmail.com"
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className={inputCls} />
              </div>

              <div>
                <label className={labelCls} htmlFor="ownerPhone">Phone Number</label>
                <input id="ownerPhone" value={createForm.phone} placeholder="+855 12 345 678"
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="ownerPassword">Password</label>
                  <input id="ownerPassword" type="password" value={createForm.password} placeholder="Min 8 characters"
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ownerConfirmPassword">Confirm Password</label>
                  <input id="ownerConfirmPassword" type="password" value={createForm.confirmPassword} placeholder="Re-type password"
                    onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              {/* ── Business Info ── */}
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Business Details</p>

              <div>
                <label className={labelCls} htmlFor="bizName">Business Name</label>
                <input id="bizName" value={createForm.businessName} placeholder="e.g. My Awesome Shop"
                  onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                  className={inputCls} />
              </div>

              <div>
                <label className={labelCls} htmlFor="bizCategory">Business Type</label>
                <select id="bizCategory" value={createForm.businessCategoryId}
                  onChange={(e) => setCreateForm({ ...createForm, businessCategoryId: e.target.value })}
                  className={inputCls}>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="bizAddress">Business Address</label>
                <input id="bizAddress" value={createForm.businessAddress} placeholder="e.g. #123 St 456, Phnom Penh"
                  onChange={(e) => setCreateForm({ ...createForm, businessAddress: e.target.value })}
                  className={inputCls} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateForm(null)}
                className="rounded-full border border-neutral-300 dark:border-neutral-700 px-5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
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
                className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
              >
                {createResult.isLoading ? "Registering..." : "Register Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}