"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Tag,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Check,
  Sparkles,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateBusinessMutation } from "@/features/businessManagement/businessAdminApi";

export interface SubCategoryItem {
  id: string;
  name: string;
}

export interface CreateBusinessFormState {
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

interface CreateBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategories: SubCategoryItem[];
  onSuccess?: () => void;
}

export function CreateBusinessDialog({
  open,
  onOpenChange,
  subCategories,
  onSuccess,
}: CreateBusinessDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<CreateBusinessFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    businessCategoryId: subCategories[0]?.id ?? "",
    businessAddress: "",
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setStep(1);
      setCategoryDropdownOpen(false);
      setCategorySearch("");
      if (subCategories.length > 0 && !form.businessCategoryId) {
        setForm((prev) => ({
          ...prev,
          businessCategoryId: subCategories[0].id,
        }));
      }
    }
  }, [open, subCategories]);

  const selectedCategory =
    subCategories.find((cat) => cat.id === form.businessCategoryId) ??
    subCategories[0];

  const filteredSubCategories = subCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const [createBusiness, { isLoading }] = useCreateBusinessMutation();

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setCategoryDropdownOpen(false);
  };

  const isStep1Valid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password !== "" &&
    form.password === form.confirmPassword;

  const handleNext = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter owner first and last name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!form.password) {
      toast.error("Please enter a password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      toast.error("Please enter business name.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await createBusiness({
        username: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        gender: "UNSPECIFIED",
        businessName: form.businessName,
        businessAddress: form.businessAddress,
        businessCategoryId: form.businessCategoryId || (subCategories[0]?.id ?? ""),
      }).unwrap();

      toast.success("Business & owner account created successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        err?.data?.detail ||
        "Failed to register business. Please check fields and try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog Shell */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl text-card-foreground sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Register New Business
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provision a Keycloak owner account and merchant shop instance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1.5 border border-border/60">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
              step === 1
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-3.5" /> 1. Owner Account
          </button>

          <button
            type="button"
            onClick={() => {
              if (isStep1Valid) setStep(2);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
              step === 2
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground opacity-80"
            }`}
          >
            <Building2 className="size-3.5" /> 2. Shop Details
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {step === 1 ? (
            /* STEP 1: Owner Account */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Sokha"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Chan"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Email Address / Username <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="owner@example.com"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-xs text-foreground outline-none transition focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-xs text-foreground outline-none transition focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {form.password && form.confirmPassword && (
                <div className="text-[11px]">
                  {form.password === form.confirmPassword ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: Shop Details */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Business Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="e.g. Lucky Coffee & Bakery"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              </div>

              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Business Category
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background py-2.5 px-3.5 text-xs text-foreground outline-none transition focus:border-primary hover:bg-accent/50 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Tag className="size-4 shrink-0 text-primary" />
                    <span className="truncate font-medium">
                      {selectedCategory?.name || "Select Category"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      categoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-popover-foreground">
                    {subCategories.length > 5 && (
                      <div className="relative p-1 mb-1 border-b border-border/60">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search category..."
                          className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    )}
                    <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                      {filteredSubCategories.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                          No category found
                        </div>
                      ) : (
                        filteredSubCategories.map((sub) => {
                          const isSelected = form.businessCategoryId === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, businessCategoryId: sub.id });
                                setCategoryDropdownOpen(false);
                                setCategorySearch("");
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "text-foreground hover:bg-accent"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <Tag
                                  className={`size-3.5 shrink-0 ${
                                    isSelected
                                      ? "text-primary-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {isSelected && <Check className="size-4 shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Address / Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.businessAddress}
                    onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                    placeholder="Street 2004, Sen Sok, Phnom Penh"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
              >
                <ChevronLeft className="size-4" /> Back to Owner
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-medium text-foreground transition hover:bg-accent"
              >
                Cancel
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm"
                >
                  Next: Shop Details <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    "Create Business"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
