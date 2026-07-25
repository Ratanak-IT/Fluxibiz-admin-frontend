import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function UnitAuditPage() {
  return (
    <AuditLogTable
      title="Unit activity"
      subtitle="Changes to the shared measures every shop uses."
      breadcrumb="Units"
      targetType="UNIT"
    />
  );
}
