"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { getPageTitle } from "@/components/layout/navigation";
import UserMenu from "@/components/layout/UserMenu";
import { ModeToggle } from "../mode-toggle";

export default function Header({
  managerName,
  onOpenNav,
}: {
  managerName: string;
  onOpenNav: () => void;
}) {
  const pathname = usePathname();
  const { app, page } = getPageTitle(pathname);

  return (
    <header className="flex flex-nowrap items-center gap-2 px-4 pt-4 pb-5 sm:gap-4 sm:px-8 sm:pt-6 sm:pb-8 dark:bg-background ">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid size-10 sm:size-11 shrink-0 place-items-center rounded-xl text-[#5c6660] outline-none hover:bg-black/[.04] focus-visible:ring-2 focus-visible:ring-[#00932a] dark:text-muted-foreground dark:hover:bg-white/[.06] lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-xl leading-tight text-[#16181c] sm:text-[24px] dark:text-foreground">
        <span className="font-semibold">{app}</span>
        {page && (
          <span className="hidden lg:inline">
            <span
              aria-hidden="true"
              className="mx-2 text-[#c4c9c3] dark:text-muted-foreground"
            >
              /
            </span>
            <span className="text-[#5c6660] dark:text-muted-foreground">
              {page}
            </span>
          </span>
        )}
      </h1>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="relative hidden md:block">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a8f89] dark:text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search"
            className="h-11 w-56 rounded-xl border border-[#e2e2de] bg-white pr-3 pl-9 text-[14px] text-[#16181c] outline-none placeholder:text-[#8a8f89] focus-visible:border-[#00932a] focus-visible:ring-2 focus-visible:ring-[#00932a]/25 dark:border-input dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
          />
        </label>

        {/* Hidden on mobile — moved into UserMenu's dropdown for that breakpoint */}
        <div className="hidden sm:block">
          <ModeToggle />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-10 sm:size-11 place-items-center rounded-xl border border-[#e2e2de] bg-white text-[#16181c] outline-none transition-colors hover:bg-[#f7f7f6] focus-visible:ring-2 focus-visible:ring-[#00932a] dark:border-input dark:bg-card dark:text-foreground dark:hover:bg-accent"
        >
          <Bell className="size-[18px]" aria-hidden="true" />
        </button>

        <UserMenu name={managerName} />
      </div>
    </header>
  );
}
