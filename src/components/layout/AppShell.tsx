"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { AdminPlatformTourModal } from "@/components/admin/AdminPlatformTourModal";

export default function AppShell({
  managerName,
  children,
}: {
  managerName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  const chromeless = pathname === "/apps";

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    if (!navOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

  if (chromeless) {
    return <div className="min-h-dvh bg-[#f5f5f5]">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-background lg:p-4">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-white px-4 py-2 text-[14px] text-[#16181c] focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50"
      >
        Skip to content
      </a>

      <div className="overflow-hidden bg-[#f7f7f6] lg:min-h-[calc(100dvh-2rem)] lg:rounded-[28px]">
        <div className="flex min-h-dvh gap-0 lg:min-h-[calc(100dvh-2rem)]">
          <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

          <div className="flex min-w-0 flex-1 flex-col lg:h-[calc(100dvh-2rem)] lg:overflow-y-auto">
            <Header
              managerName={managerName}
              onOpenNav={() => setNavOpen(true)}
            />

            <main id="main-content" className="flex-1 px-5 pb-8 lg:px-8 dark:bg-background">
              {children}
            </main>
          </div>
        </div>
      </div>
      <CommandPalette />
      <AdminPlatformTourModal />
    </div>
  );
}
