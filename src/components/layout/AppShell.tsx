"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { AdminPlatformTourModal } from "@/components/admin/AdminPlatformTourModal";
import { NAVIGATION, isSectionActive } from "@/components/layout/navigation";
import { canAccessSection } from "@/lib/permissionCatalog";
import { useSessionContext } from "@/lib/auth/session-context";

function SectionForbidden({ sectionLabel }: { sectionLabel: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">Not authorised</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn&apos;t have permission for <strong className="text-foreground">{sectionLabel}</strong>.
        </p>
        <Link
          href="/apps"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back to apps
        </Link>
      </div>
    </div>
  );
}

export default function AppShell({
  managerName,
  children,
}: {
  managerName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const session = useSessionContext();

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

  const activeSection = NAVIGATION.find((section) => isSectionActive(section, pathname));
  const forbidden =
    session !== null && activeSection !== undefined && !canAccessSection(session.roles, activeSection.id);

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
              {forbidden ? (
                <SectionForbidden sectionLabel={activeSection?.app?.label ?? activeSection?.label ?? "this section"} />
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </div>
      <CommandPalette />
      <AdminPlatformTourModal />
    </div>
  );
}
