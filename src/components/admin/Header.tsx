"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/keycloak";
import { decodeToken } from "@/lib/auth/session";
import { tokenStore } from "@/lib/auth/tokenStore";
import Image from "next/image";

export function AdminHeader() {
  const [open, setOpen] = useState(false);
  const claims = decodeToken(tokenStore.getAccessToken() ?? "");

  const name = claims?.name ?? claims?.preferred_username ?? "Administrator";
  const initials = name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="flex items-center justify-between px-8">
      <Link href="/dashboard" className="flex items-center gap-2">
  <Image
    src="/logo.jpg"
    alt="Logo"
    width={100}
    height={100}
    priority
  />
</Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <Bell className="size-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="flex items-center gap-3 rounded-full border border-neutral-200 py-1.5 pl-1.5 pr-3 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <span className="grid size-9 place-items-center rounded-full bg-green-600 text-sm font-semibold text-white">
              {initials || "AD"}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-semibold text-neutral-900">{name}</span>
              <span className="block text-[11px] uppercase tracking-wide text-neutral-500">
                Super admin
              </span>
            </span>
            <ChevronDown className="size-4 text-neutral-400" />
          </button>

          {open && (
            <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
