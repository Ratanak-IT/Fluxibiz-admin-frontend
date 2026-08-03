import type { BusinessOwnerStatus } from "@/lib/types/adminTypes";

const STYLES: Record<BusinessOwnerStatus, string> = {
  ACTIVE: "bg-success-subtle text-success-subtle-foreground",
  SUSPENDED: "bg-warning-subtle text-warning-subtle-foreground",
  DELETED: "bg-muted text-muted-foreground",
};

const LABELS: Record<BusinessOwnerStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
};

export function StatusPill({ status }: { status: BusinessOwnerStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

export function Flag({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span className={on ? "text-foreground" : "text-muted-foreground/70"}>
      {on ? onLabel : offLabel}
    </span>
  );
}
