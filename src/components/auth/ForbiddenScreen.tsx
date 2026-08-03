"use client";

import { useRef } from "react";
import { ShieldAlert, LogOut } from "lucide-react";

export default function ForbiddenScreen({
  username,
  roles,
}: {
  username: string;
  roles: string[];
}) {
  const signOutForm = useRef<HTMLFormElement>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <ShieldAlert className="size-6" aria-hidden />
        </div>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Not Authorised
        </h1>

        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Signed in as{" "}
          <strong className="text-neutral-800 dark:text-neutral-200">{username}</strong>
        </p>

        <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          This admin console requires the{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-red-600 dark:bg-neutral-800 dark:text-red-400">
            SUPER_ADMIN
          </code>{" "}
          realm role in Keycloak.
        </p>

        {/* {roles.length > 0 && (
          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-left dark:bg-neutral-800/50">
            <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              Your assigned roles
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {roles.map((role) => (
                <span
                  key={role}
                  className="rounded bg-neutral-200/60 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )} */}

        <button
          type="button"
          onClick={() => signOutForm.current?.requestSubmit()}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          <LogOut className="size-4" />
          Sign out / Switch account
        </button>

        <form ref={signOutForm} action="/api/logout" method="post" hidden />
      </div>
    </div>
  );
}