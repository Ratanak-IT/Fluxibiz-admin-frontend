"use client";

import { Button } from "@/components/ui/button";
import { PERMISSION_GROUPS } from "@/lib/permissionCatalog";

export function PlatformPermissionPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  const toggle = (role: string) => {
    onChange(selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role]);
  };

  const toggleGroup = (roles: string[]) => {
    const allOn = roles.every((role) => selected.includes(role));
    onChange(
      allOn
        ? selected.filter((role) => !roles.includes(role))
        : Array.from(new Set([...selected, ...roles])),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] font-semibold text-foreground">
        Permissions
        <span className="ml-2 font-normal text-muted-foreground">{selected.length} selected</span>
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => {
          const roles = group.options.map((option) => option.role);
          const allOn = roles.every((role) => selected.includes(role));

          return (
            <fieldset key={group.key} className="rounded-2xl border border-border bg-muted/40 p-4 shadow-xs">
              <legend className="px-2 text-sm font-bold text-foreground">{group.title}</legend>

              <Button
                type="button"
                size="xs"
                variant={allOn ? "outline" : "default"}
                onClick={() => toggleGroup(roles)}
                className="mb-3.5 rounded-lg"
              >
                {allOn ? "Clear all" : "Select all"}
              </Button>

              <div className="space-y-1">
                {group.options.map((option) => (
                  <label
                    key={option.role}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 transition hover:bg-background/60"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option.role)}
                      onChange={() => toggle(option.role)}
                      className="mt-0.5 size-4 shrink-0 rounded accent-primary"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm text-foreground">{option.label}</span>
                      <span className="block text-xs text-muted-foreground">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
