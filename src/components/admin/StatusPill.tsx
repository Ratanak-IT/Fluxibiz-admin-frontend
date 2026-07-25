import type { BusinessOwnerStatus } from "@/lib/types/adminTypes";

const STYLES: Record<BusinessOwnerStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-amber-100 text-amber-800",
  DELETED: "bg-neutral-200 text-neutral-600",
};

const LABELS: Record<BusinessOwnerStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
};

export function StatusPill({ status }: { status: BusinessOwnerStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}

export function Flag({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span className={`text-sm ${on ? "text-neutral-700" : "text-neutral-400"}`}>
      {on ? onLabel : offLabel}
    </span>
  );
}
