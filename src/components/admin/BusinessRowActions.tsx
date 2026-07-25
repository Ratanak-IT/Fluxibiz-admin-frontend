"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
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

type ReasonAction = "suspend" | "disable" | "close";

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
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<ReasonAction | null>(null);

  const [activate] = useActivateBusinessMutation();
  const [enable] = useEnableBusinessMutation();
  const [reopen] = useReopenBusinessMutation();
  const [remove] = useDeleteBusinessMutation();
  const [suspend, suspendState] = useSuspendBusinessMutation();
  const [disable, disableState] = useDisableBusinessMutation();
  const [close, closeState] = useCloseBusinessMutation();

  const busy = suspendState.isLoading || disableState.isLoading || closeState.isLoading;

  const runWithReason = async (reason: string) => {
    const payload = { businessId: business.id, reason };

    if (dialog === "suspend") await suspend(payload);
    if (dialog === "disable") await disable(payload);
    if (dialog === "close") await close(payload);

    setDialog(null);
    setOpen(false);
  };

  const item = (label: string, onClick: () => void, danger = false) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50 ${
        danger ? "text-red-600" : "text-neutral-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label={`Actions for ${business.name}`}
          onClick={() => setOpen((value) => !value)}
          className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <MoreVertical className="size-5 " />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
              {business.status !== "ACTIVE" &&
                item("Activate", async () => {
                  await activate(business.id);
                  setOpen(false);
                })}

              {business.status === "ACTIVE" && item("Suspend", () => setDialog("suspend"))}

              {business.isEnabled
                ? item("Disable features", () => setDialog("disable"))
                : item("Enable features", async () => {
                    await enable(business.id);
                    setOpen(false);
                  })}

              {business.isClosed
                ? item("Reopen shop", async () => {
                    await reopen(business.id);
                    setOpen(false);
                  })
                : item("Close shop", () => setDialog("close"))}

              <div className="my-1 h-px bg-neutral-100" />

              {item(
                "Delete",
                async () => {
                  if (confirm(`Delete ${business.name}? This marks the account as deleted.`)) {
                    await remove(business.id);
                  }
                  setOpen(false);
                },
                true,
              )}
            </div>
          </>
        )}
      </div>

      {dialog && (
        <ReasonDialog
          title={DIALOG_COPY[dialog].title}
          description={DIALOG_COPY[dialog].description}
          confirmLabel={DIALOG_COPY[dialog].confirm}
          busy={busy}
          onCancel={() => setDialog(null)}
          onConfirm={runWithReason}
        />
      )}
    </>
  );
}
