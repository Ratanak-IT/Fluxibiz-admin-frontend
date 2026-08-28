"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  useActivateBusinessMutation,
  useCloseBusinessMutation,
  useDeleteBusinessMutation,
  useDisableBusinessMutation,
  useEnableBusinessMutation,
  useReopenBusinessMutation,
  useSuspendBusinessMutation,
} from "@/features/businessManagement/businessAdminApi";
import type { BusinessResponse } from "@/lib/types/adminTypes";
import { ReasonDialog } from "./ReasonDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ReasonAction = "suspend" | "disable" | "close";
type DialogAction = ReasonAction | "delete";

const DIALOG_COPY: Record<ReasonAction, { title: string; description: string; confirm: string }> = {
  suspend: {
    title: "Suspend this business",
    description: "The owner keeps their data but cannot trade until you activate them again.",
    confirm: "Suspend",
  },
  disable: {
    title: "Disable this business",
    description: "The account stays active but every feature is switched off.",
    confirm: "Disable",
  },
  close: {
    title: "Close this business",
    description: "The shop is removed from the public directory and marked closed.",
    confirm: "Close",
  },
};

export function BusinessRowActions({ business }: { business: BusinessResponse }) {
  const [dialog, setDialog] = useState<DialogAction | null>(null);

  const [activate] = useActivateBusinessMutation();
  const [enable] = useEnableBusinessMutation();
  const [reopen] = useReopenBusinessMutation();
  const [remove, removeState] = useDeleteBusinessMutation();
  const [suspend, suspendState] = useSuspendBusinessMutation();
  const [disable, disableState] = useDisableBusinessMutation();
  const [close, closeState] = useCloseBusinessMutation();

  const busy = suspendState.isLoading || disableState.isLoading || closeState.isLoading;

  const confirmDelete = async () => {
    try {
      await remove(business.id).unwrap();
      toast.success(`"${business.name}" deleted.`);
    } catch {
      toast.error(`Failed to delete "${business.name}".`);
    }

    setDialog(null);
  };

  const runWithReason = async (reason: string) => {
    const payload = { businessId: business.id, reason };

    try {
      if (dialog === "suspend") { await suspend(payload).unwrap(); toast.success(`"${business.name}" has been suspended.`); }
      if (dialog === "disable") { await disable(payload).unwrap(); toast.success(`Features disabled for "${business.name}".`); }
      if (dialog === "close") { await close(payload).unwrap(); toast.success(`"${business.name}" has been closed.`); }
    } catch {
      toast.error(`Failed to ${dialog} "${business.name}".`);
    }

    setDialog(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${business.name}`}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <MoreVertical className="size-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 text-left">
          {business.status !== "ACTIVE" && (
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await activate(business.id).unwrap();
                  toast.success(`"${business.name}" activated.`);
                } catch {
                  toast.error(`Failed to activate "${business.name}".`);
                }
              }}
            >
              Activate
            </DropdownMenuItem>
          )}

          {business.status === "ACTIVE" && (
            <DropdownMenuItem onClick={() => setDialog("suspend")}>
              Suspend
            </DropdownMenuItem>
          )}

          {business.isEnabled ? (
            <DropdownMenuItem onClick={() => setDialog("disable")}>
              Disable features
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await enable(business.id).unwrap();
                  toast.success(`Features enabled for "${business.name}".`);
                } catch {
                  toast.error(`Failed to enable features for "${business.name}".`);
                }
              }}
            >
              Enable features
            </DropdownMenuItem>
          )}

          {business.isClosed ? (
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await reopen(business.id).unwrap();
                  toast.success(`"${business.name}" has been reopened.`);
                } catch {
                  toast.error(`Failed to reopen "${business.name}".`);
                }
              }}
            >
              Reopen shop
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setDialog("close")}>
              Close shop
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500"
            onClick={() => setDialog("delete")}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog && dialog !== "delete" && (
        <ReasonDialog
          title={DIALOG_COPY[dialog].title}
          description={DIALOG_COPY[dialog].description}
          confirmLabel={DIALOG_COPY[dialog].confirm}
          busy={busy}
          onCancel={() => setDialog(null)}
          onConfirm={runWithReason}
        />
      )}

      {dialog === "delete" && (
        <DeleteConfirmDialog
          title={`Delete ${business.name}?`}
          description={
            <>
              Are you sure you want to delete <strong className="text-foreground">{business.name}</strong>? This
              action cannot be undone.
            </>
          }
          busy={removeState.isLoading}
          onCancel={() => setDialog(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
