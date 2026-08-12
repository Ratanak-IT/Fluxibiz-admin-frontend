"use client";

import Link from "next/link";
import { ADMIN_MODULES, type AdminModule } from "@/lib/adminModules";
import { decodeToken, tokenStore } from "@/lib/auth/tokenStore";
import { SUPER_ADMIN_ROLE } from "@/lib/permissionCatalog";

function ModuleTile({ module }: { module: AdminModule }) {
  const Icon = module.icon;

  const tile = (
    <span
      className={[
        "grid size-[100px] place-items-center rounded-[28px] transition",
        module.available
          ? "bg-gradient-to-br from-[#00932A] to-[#007a23] to-[72%] text-white group-hover:-translate-y-1 group-hover:shadow-lg"
          : "bg-neutral-100 text-[#00932A]",
      ].join(" ")}
    >
      <Icon className="size-11" strokeWidth={1.6} aria-hidden />
    </span>
  );

  const label = (
    <span className="mt-3 block whitespace-pre-line text-center text-[15px] dark:text-gray-300 leading-snug text-neutral-800">
      {module.label}
    </span>
  );

  if (!module.available) {
    return (
      <div className="flex flex-col items-center opacity-60" title="Not available yet">
        {tile}
        {label}
        <span className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400">Soon</span>
      </div>
    );
  }

  return (
    <Link
      href={module.href}
      title={module.hint}
      className="group flex flex-col items-center rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-600"
    >
      {tile}
      {label}
    </Link>
  );
}

export default function DashboardPage() {
  const roles = decodeToken(tokenStore.getAccessToken() ?? "")?.realm_access?.roles ?? [];
const isSuperAdmin = roles.includes(SUPER_ADMIN_ROLE);

const visibleModules = ADMIN_MODULES.filter(
  (module) => !module.requires || isSuperAdmin || roles.includes(module.requires),
);
  return (
    <main className="mx-auto max-w-5xl px-8 pb-16 pt-6">
      <div className="mt-12 grid grid-cols-2 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {visibleModules.map((module) => (
          <ModuleTile key={module.key} module={module} />
        ))}
      </div>
    </main>
  );
}