"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound, ChevronDown } from "lucide-react";
import { useGetUserProfileQuery } from "@/services/userProfileApi";
import { tokenStore } from "@/lib/auth/tokenStore";
import { ModeToggle } from "../mode-toggle";

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD"
  );
}

export default function UserMenu({ name }: { name: string }) {
  const signOutForm = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const { data: profile } = useGetUserProfileQuery();

  const profileName =
    [profile?.firstName, profile?.lastName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ") ||
    profile?.username ||
    name;
  const picture = profile?.profilePicture;

  return (
   <div className="relative">
  <button
    type="button"
    onClick={() => setOpen((prev) => !prev)}
    aria-expanded={open}
    aria-label={`Account menu for ${profileName}`}
    className="flex items-center gap-2.5 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span
      aria-hidden="true"
      className="grid size-8 place-items-center overflow-hidden rounded-full bg-primary text-[13px] font-medium text-primary-foreground"
    >
      {picture ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={picture}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        initialsOf(profileName)
      )}
    </span>
    <span className="hidden text-[14px] font-medium text-foreground sm:block">
      {profileName}
    </span>
    <ChevronDown className="size-4 text-muted-foreground" />
  </button>

  {open && (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg sm:w-56 sm:max-w-none">
        <div className="border-b border-border px-3 pt-2 pb-2">
          <p className="text-[12px] text-muted-foreground">Signed in as</p>
          <p className="truncate text-[14px] font-semibold text-foreground">{profileName}</p>
        </div>

        {/* Phone only: theme toggle lives inside this dropdown */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2 sm:hidden">
          <span className="text-[14px] text-foreground">Theme</span>
          <ModeToggle />
        </div>

        <div className="py-1">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-foreground transition-colors hover:bg-accent"
          >
            <UserRound className="size-4 text-muted-foreground" />
            Account Profile
          </Link>
        </div>

        <div className="border-t border-border pt-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              tokenStore.clear();
              signOutForm.current?.requestSubmit();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4 text-destructive" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )}

  <form ref={signOutForm} action="/api/logout" method="post" hidden />
</div>
  );
}