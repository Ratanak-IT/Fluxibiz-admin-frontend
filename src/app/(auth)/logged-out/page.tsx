"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import { tokenStore } from "@/lib/auth/tokenStore";

function LoggedOutContent() {
  const searchParams = useSearchParams();
  const isForbidden = searchParams.get("reason") === "forbidden";

  useEffect(() => {
    tokenStore.clear();
    try {
      sessionStorage.clear();
      localStorage.removeItem("ipos.admin.accessToken");
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="w-full max-w-sm space-y-5 text-center">
      <BrandLogo variant="stacked" className="mx-auto w-40" preload />
      <h1 className="text-xl font-semibold text-[#16181c]">
        {isForbidden ? "This account can't access the Admin Platform" : "You are signed out"}
      </h1>
      <p className="text-sm text-[#5c6660]">
        {isForbidden
          ? "Contact your administrator if you believe this is a mistake."
          : "Your admin session has ended. Sign in again to continue."}
      </p>
      <a
        href="/login"
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#00932a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#007d23]"
      >
        Sign in again
      </a>
    </div>
  );
}

export default function LoggedOutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6">
      <Suspense fallback={null}>
        <LoggedOutContent />
      </Suspense>
    </main>
  );
}
