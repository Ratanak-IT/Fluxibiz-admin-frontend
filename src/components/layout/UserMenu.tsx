"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound, ChevronDown } from "lucide-react";
import { useGetUserProfileQuery } from "@/services/userProfileApi";

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
        className="flex items-center gap-2.5 rounded-full border border-[#e2e2de] bg-white py-1.5 pl-1.5 pr-4 outline-none transition-colors hover:bg-[#f5f8f4] focus-visible:ring-2 focus-visible:ring-[#00932a]"
      >
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center overflow-hidden rounded-full border border-[#00932a] bg-[#00932a] text-[13px] font-medium text-white"
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
        <span className="hidden text-[14px] font-medium text-[#16181c] sm:block">
          {profileName}
        </span>
        <ChevronDown className="size-4 text-[#8a8f89]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#e2e2de] bg-white p-1 text-[#16181c] shadow-lg">
            <div className="border-b border-[#e2e2de] px-3 pt-2 pb-2">
              <p className="text-[12px] text-[#5c6660]">Signed in as</p>
              <p className="truncate text-[14px] font-semibold text-[#16181c]">{profileName}</p>
            </div>

            <div className="py-1">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-[#16181c] transition-colors hover:bg-black/[.04]"
              >
                <UserRound className="size-4 text-[#5c6660]" />
                Account Profile
              </Link>
            </div>

            <div className="border-t border-[#e2e2de] pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOutForm.current?.requestSubmit();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium text-[#d14341] transition-colors hover:bg-[#fdeceb]"
              >
                <LogOut className="size-4 text-[#d14341]" />
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
