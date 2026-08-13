"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { getPageTitle } from "@/components/layout/navigation";
import { NotificationBell } from "@/components/layout/NotificationBell";
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
    <>
      <header className="flex flex-nowrap items-center gap-2 px-5 py-5 sm:gap-4 lg:px-8 border-b border-border/40 bg-background dark:bg-background">
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
          {/* Hidden on mobile — moved into UserMenu's dropdown for that breakpoint */}
          <div className="hidden sm:block">
            <ModeToggle />
          </div>

          {/* Real-time STOMP & API Notification Bell */}
          <NotificationBell />

          <UserMenu name={managerName} />
        </div>
      </header>
    </>
  );
}
