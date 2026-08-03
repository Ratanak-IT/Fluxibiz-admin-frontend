"use client";

import { PERMISSION_GROUPS, SUPER_ADMIN_ROLE } from "@/lib/permissionCatalog";

export function PermissionPicker({
  selected,
  availableRoles,
  onChange,
}: {
  selected: string[];
  availableRoles: string[];
  onChange: (roles: string[]) => void;
}) {
  const isSuperAdmin = selected.includes(SUPER_ADMIN_ROLE);

  const toggle = (role: string) => {
    onChange(selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role]);
  };

  const toggleSuperAdmin = () => {

    onChange(isSuperAdmin ? [] : [SUPER_ADMIN_ROLE]);
  };

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
        <input
          type="checkbox"
          checked={isSuperAdmin}
          onChange={toggleSuperAdmin}
          className="mt-0.5 size-4 accent-green-600"
        />
        <span>
          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-50">
            Full access
          </span>
          <span className="block text-xs text-neutral-500 dark:text-neutral-400">
            Everything below, plus anything added later
          </span>
        </span>
      </label>

      <div className={isSuperAdmin ? "pointer-events-none opacity-40" : ""}>
        {PERMISSION_GROUPS.map((group) => (
          <fieldset key={group.key} className="mt-5 first:mt-0">
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {group.title}
            </legend>

            <div className="space-y-1">
              {group.options.map((option) => {
                const missing = !availableRoles.includes(option.role);

                return (
                  <label
                    key={option.role}
                    className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option.role)}
                      onChange={() => toggle(option.role)}
                      disabled={missing}
                      className="mt-0.5 size-4 accent-green-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm text-neutral-900 dark:text-neutral-50">
                        {option.label}
                        {missing && (
                          <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                            not created in Keycloak yet
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
