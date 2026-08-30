"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, FormField, fieldClassName } from "@/components/admin/staffUi";
import { PlatformPermissionPicker } from "./PlatformPermissionPicker";
import type { PlatformRoleResponse } from "@/lib/types/adminTypes";

export interface RoleFormValues {
  name: string;
  permissions: string[];
}

export function RolePanel({
  role,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  role?: PlatformRoleResponse;
  busy: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: RoleFormValues) => void;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);

  const editing = Boolean(role);
  const canSubmit = !busy && name.trim() !== "";

  return (
    <Panel>
      <PanelHeader
        title={editing ? `Edit ${role?.name}` : "Create a role"}
        description="A role is a job in this console, and the things that job is allowed to do."
        action={
          <Button type="button" onClick={onCancel} aria-label="Close the form" variant="ghost" size="icon">
            <X className="size-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-6">
        <div className="max-w-sm">
          <FormField label="Role name" htmlFor="role-name">
            <input
              id="role-name"
              value={name}
              autoFocus
              placeholder="Support agent"
              onChange={(e) => setName(e.target.value)}
              className={fieldClassName}
            />
          </FormField>
        </div>

        <PlatformPermissionPicker selected={permissions} onChange={setPermissions} />
      </div>

      {permissions.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing ticked. Anyone with this role can sign in but do nothing.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit({ name: name.trim(), permissions })}
        >
          {busy ? "Saving…" : editing ? "Save changes" : "Create role"}
        </Button>
      </div>
    </Panel>
  );
}
