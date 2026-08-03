"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/keycloak";
import { decodeToken } from "@/lib/auth/session";
import { tokenStore } from "@/lib/auth/tokenStore";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";

export function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [name] = useState(() => {
    const claims = decodeToken(tokenStore.getAccessToken() ?? "");
    return claims?.name ?? claims?.preferred_username ?? "Administrator";
  });

  const initials = name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-height)] items-center justify-between gap-3 border-b border-border bg-background/90 px-3 backdrop-blur-md sm:px-6 lg:px-8">
      <Link href="/dashboard" className="flex shrink-0 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <Image
          src="/logo.jpg"
          alt="IPOS"
          width={160}
          height={64}
          priority
          className="h-12 w-auto sm:h-14 lg:h-16"
        />
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Bell className="size-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-full border border-border bg-background/60 p-1 transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:gap-3 sm:pl-1.5 sm:pr-3"
          >
            <span className="grid size-8 place-items-center rounded-full bg-brand text-xs font-semibold text-brand-foreground sm:size-9 sm:text-sm">
              {initials || "AD"}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                Super admin
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
              >
                <div className="border-b border-border px-4 py-3 sm:hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    {name}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Super admin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-foreground transition hover:bg-accent"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
