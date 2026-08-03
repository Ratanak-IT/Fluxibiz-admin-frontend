"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import {
  NAVIGATION,
  isLeafActive,
  isSectionActive,
  type NavSection,
} from "@/components/layout/navigation";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/brand/BrandLogo";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const current = NAVIGATION.find((section) => isSectionActive(section, pathname));
  const sections = current ? [current] : [];

  return (
    <>
      {/* Scrim for mobile drawer */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-30 bg-[#16181c]/30 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col bg-[#f7f7f6]",
          "transition-[transform,visibility] duration-200 ease-out",
          "lg:visible lg:sticky lg:top-0 lg:z-auto lg:h-[calc(100dvh-2rem)] lg:translate-x-0 lg:bg-transparent",
          open ? "translate-x-0" : "invisible -translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <Link
            href="/apps"
            onClick={onClose}
            aria-label="FluxiBiz home"
            className="flex h-11 w-32 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#00932a] focus-visible:ring-offset-2"
          >
            <BrandLogo variant="wordmark" alt="FluxiBiz" preload />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-11 place-items-center rounded-full text-[#5c6660] outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#00932a] lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label={current?.app?.label ?? current?.label ?? "App"}
          className="flex-1 overflow-y-auto px-4 pb-6"
        >
          <Link
            href="/apps"
            onClick={onClose}
            className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] text-[#5c6660] outline-none transition-colors hover:bg-black/[.04] hover:text-[#16181c] focus-visible:ring-2 focus-visible:ring-[#00932a]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All apps
          </Link>

          <ul className="flex flex-col gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <SectionItem
                  section={section}
                  pathname={pathname}
                  onNavigate={onClose}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

function SectionItem({
  section,
  pathname,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isSectionActive(section, pathname);
  const Icon = section.icon;

  const rowClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#00932a]";

  if (!section.children) {
    return (
      <Link
        href={section.href ?? "#"}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          rowClass,
          active
            ? "bg-white text-[#16181c] shadow-[0_1px_2px_rgba(22,24,28,.08)] font-medium"
            : "text-[#5c6660] hover:bg-black/[.04] hover:text-[#16181c]"
        )}
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            active && "text-[#00932a]"
          )}
          aria-hidden="true"
        />
        {section.app?.label ?? section.label}
      </Link>
    );
  }

  return (
    <>
      <p className={cn(rowClass, "font-medium text-[#16181c]")}>
        <Icon
          className="size-[18px] shrink-0 text-[#00932a]"
          aria-hidden="true"
        />
        {section.app?.label ?? section.label}
      </p>

      <ul className="mt-1 ml-[26px] flex flex-col gap-1 border-l border-[#dcdcd8] pl-3">
        {section.children.map((leaf) => {
          const leafActive = isLeafActive(leaf, pathname);

          return (
            <li key={leaf.href}>
              <Link
                href={leaf.href}
                onClick={onNavigate}
                aria-current={leafActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#00932a]",
                  leafActive
                    ? "bg-white text-[#16181c] shadow-[0_1px_2px_rgba(22,24,28,.08)] font-medium"
                    : "text-[#8a8f89] hover:text-[#16181c]"
                )}
              >
                <span className="flex-1">{leaf.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
