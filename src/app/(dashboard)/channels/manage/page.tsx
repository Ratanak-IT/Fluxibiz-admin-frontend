"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSalesChannelsQuery,
  useCreateSalesChannelMutation,
  useUpdateSalesChannelMutation,
  useDeleteSalesChannelMutation,
} from "@/features/businessManagement/businessAdminApi";
import type { SalesChannelResponse } from "@/lib/types/adminTypes";
import { PageShell } from "@/components/ui-kit/PageShell";
import { DataTable, EmptyRow } from "@/components/ui-kit/DataTable";

interface EditorState {
  mode: "create" | "edit";
  id?: string;
  name: string;
  code: string;
  isActive: boolean;
}

export default function ConfigureChannelsPage() {
  const { data: channels = [], isLoading, error } = useGetSalesChannelsQuery();
  const [create, createState] = useCreateSalesChannelMutation();
  const [update, updateState] = useUpdateSalesChannelMutation();
  const [remove] = useDeleteSalesChannelMutation();

  const [editor, setEditor] = useState<EditorState | null>(null);
  const busy = createState.isLoading || updateState.isLoading;

  const save = async () => {
    if (!editor?.name.trim() || !editor?.code.trim()) return;

    try {
      if (editor.mode === "create") {
        await create({
          name: editor.name.trim(),
          code: editor.code.trim().toUpperCase(),
          isActive: editor.isActive,
        }).unwrap();
        toast.success(`Sales channel "${editor.name}" created.`);
      } else if (editor.id) {
        await update({
          id: editor.id,
          name: editor.name.trim(),
          code: editor.code.trim().toUpperCase(),
          isActive: editor.isActive,
        }).unwrap();
        toast.success(`Sales channel "${editor.name}" updated.`);
      }
      setEditor(null);
    } catch (err) {
      toast.error("Failed to save channel. Please ensure the code is unique.");
    }
  };

  const confirmDelete = (id: string, name: string) => {
    toast(`Delete "${name}" sales channel?`, {
      description: "Businesses using this channel won't be able to sell items on it anymore.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await remove(id).unwrap();
            toast.success(`"${name}" channel deleted.`);
          } catch (err) {
            toast.error("Failed to delete channel.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Channels", href: "/channels" },
    { label: "Configure" },
  ];

  const headers = (
    <tr>
      <th className="px-6 py-4">Channel Name</th>
      <th className="px-6 py-4">Unique Code</th>
      <th className="px-6 py-4">Status</th>
      <th className="px-6 py-4 text-right">Actions</th>
    </tr>
  );

  return (
    <PageShell
      crumbs={crumbs}
      title="Configure Channels"
      subtitle="Define and configure dynamic sales channels for businesses on the platform."
      action={
        <button
          type="button"
          onClick={() =>
            setEditor({
              mode: "create",
              name: "",
              code: "",
              isActive: true,
            })
          }
          className="flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
        >
          <Plus className="size-4" />
          Add Channel
        </button>
      }
    >
      {isLoading && <p className="text-sm text-muted-foreground">Loading sales channels...</p>}
      
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2.5">
          <ShieldAlert className="size-5" />
          <span>Failed to load sales channels. Admin permissions may be required.</span>
        </div>
      )}

      {!isLoading && !error && (
        <DataTable headers={headers}>
          {channels.length === 0 ? (
            <EmptyRow colSpan={4}>
              No sales channels defined yet. Click "Add Channel" to create the first one.
            </EmptyRow>
          ) : (
            channels.map((channel) => (
              <tr key={channel.id} className="hover:bg-muted/40 transition">
                <td className="px-6 py-4 font-medium text-foreground">{channel.name}</td>
                <td className="px-6 py-4">
                  <code className="rounded bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {channel.code}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      channel.isActive
                        ? "bg-green-50 text-green-700 dark:bg-green-950/70 dark:text-green-400"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
                    ].join(" ")}
                  >
                    {channel.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() =>
                        setEditor({
                          mode: "edit",
                          id: channel.id,
                          name: channel.name,
                          code: channel.code,
                          isActive: channel.isActive,
                        })
                      }
                      className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => confirmDelete(channel.id, channel.name)}
                      className="rounded-full p-2 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">
              {editor.mode === "create" ? "Add Sales Channel" : "Edit Sales Channel"}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="channelName">
                  Channel Name
                </label>
                <input
                  id="channelName"
                  value={editor.name}
                  placeholder="e.g. Telegram Bot"
                  onChange={(event) => setEditor({ ...editor, name: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="channelCode">
                  Unique Code
                </label>
                <input
                  id="channelCode"
                  value={editor.code}
                  placeholder="e.g. TELEGRAM"
                  onChange={(event) => setEditor({ ...editor, code: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-600 uppercase"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Alphanumeric code used to match application logic.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editor.isActive}
                  onChange={(event) => setEditor({ ...editor, isActive: event.target.checked })}
                  className="size-4 rounded border-border bg-background text-green-600 accent-green-600"
                />
                <label className="text-sm font-medium text-foreground select-none" htmlFor="isActive">
                  Active (enabled for shops to assign products)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editor.name.trim() || !editor.code.trim() || busy}
                onClick={save}
                className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
