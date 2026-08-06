"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  NAVIGATION,
  sectionEntryHref,
  type NavSection,
} from "@/components/layout/navigation";
import UserMenu from "@/components/layout/UserMenu";
import BrandLogo from "@/components/brand/BrandLogo";
import { ModeToggle } from "../mode-toggle";

const OPEN_MS = 620;

type Opening = {
  section: NavSection;
  cx: number;
  cy: number;
  size: number;
};

export default function AppLauncher({ managerName }: { managerName: string }) {
  const router = useRouter();
  const [opening, setOpening] = useState<Opening | null>(null);

  const apps = NAVIGATION.filter((section) => section.app);

  useEffect(() => {
    if (!opening) return;
    const go = setTimeout(
      () => router.push(sectionEntryHref(opening.section)),
      OPEN_MS - 80,
    );
    return () => clearTimeout(go);
  }, [opening, router]);

  return (
   <div className="min-h-dvh bg-background text-foreground transition-colors">
  <header className="flex h-16 sm:h-20 lg:h-[88px] items-center justify-between border-b border-border bg-background px-4 sm:px-5 lg:px-8">
    <Link
      href="/apps"
      aria-label="FluxiBiz home"
      className="flex h-9 w-24 sm:h-10 sm:w-28 lg:h-11 lg:w-32 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <BrandLogo
        variant="wordmark"
        alt="FluxiBiz"
        preload
        className="block dark:hidden"
      />
      <BrandLogo
        variant="darkmode"
        alt="FluxiBiz"
        preload
        className="hidden dark:block"
      />
    </Link>

   <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
  {/* Tablet & desktop only — on phone, ModeToggle lives inside UserMenu's dropdown */}
  <span className="hidden sm:block">
    <ModeToggle />
  </span>
  <button
    type="button"
    aria-label="Notifications"
    className="relative grid size-8 place-items-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    <Bell className="size-5" aria-hidden="true" />
    <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary" />
  </button>
  <UserMenu name={managerName} />
</div>
  </header>

  <main className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-12">
    <header className="mb-6 sm:mb-8 lg:mb-10">
      <h1 className="text-2xl sm:text-[28px] lg:text-[32px] leading-tight text-foreground">
        <span className="font-semibold">Hello,</span>{" "}
        {managerName.split(" ")[0]}
      </h1>
      <p className="mt-1.5 text-sm sm:text-[16px] text-muted-foreground">
        Choose an app to open.
      </p>
    </header>

    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {apps.map((section) => (
        <li key={section.id}>
          <AppTile
            section={section}
            onOpen={setOpening}
            busy={opening !== null}
          />
        </li>
      ))}
    </ul>
  </main>

  {opening && <AppOpen {...opening} />}
</div>
  );
}

function AppTile({
  section,
  onOpen,
  busy,
}: {
  section: NavSection;
  onOpen: (opening: Opening) => void;
  busy: boolean;
}) {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const Icon = section.icon;
  const app = section.app!;

  return (
  <Link
  href={sectionEntryHref(section)}
  onClick={(event) => {
    const badge = badgeRef.current?.getBoundingClientRect();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || busy || !badge) return;

    event.preventDefault();
    onOpen({
      section,
      cx: badge.left + badge.width / 2,
      cy: badge.top + badge.height / 2,
      size: badge.width,
    });
  }}
  className="group flex h-full select-none flex-col items-center gap-5 rounded-[30px] px-7 pt-10 pb-9 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
>
  <span
    ref={badgeRef}
    aria-hidden="true"
    className="grid size-24 place-items-center rounded-[26px] transition-transform duration-200 ease-out group-hover:scale-110"
    style={{ background: app.fill, color: app.ink }}
  >
    <Icon className="size-11" strokeWidth={1.8} />
  </span>
  <span className="text-[21px] leading-[30px] text-foreground">
    {app.label.split(" ").map((word) => (
      <span key={word} className="block">
        {word}
      </span>
    ))}
  </span>
</Link>
  );
}

function AppOpen({ section, cx, cy, size }: Opening) {
  const [grown, setGrown] = useState(false);
  const Icon = section.icon;
  const app = section.app!;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const reach = Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy),
  );
  const scale = ((reach * 2) / size) * 1.05;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <div
        className="absolute rounded-full"
        style={{
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          background: app.fill,
          transform: `scale(${grown ? scale : 1})`,
          transition: `transform ${OPEN_MS}ms cubic-bezier(.5,0,.2,1)`,
          willChange: "transform",
        }}
      />
      <div
        className="absolute grid place-items-center"
        style={{
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          color: app.ink,
          opacity: grown ? 0 : 1,
          transform: `scale(${grown ? 1.6 : 1})`,
          transition: `transform ${OPEN_MS}ms cubic-bezier(.5,0,.2,1), opacity ${OPEN_MS * 0.7}ms linear`,
          willChange: "transform, opacity",
        }}
      >
        <Icon className="size-11" strokeWidth={1.8} />
      </div>
    </div>
  );
}
