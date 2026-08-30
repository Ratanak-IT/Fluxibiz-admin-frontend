import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function StaffAuditsPage() {
  return (
    <AuditLogTable
      title="Audits"
      subtitle="Administrative changes recorded across the platform."
      breadcrumb="Audits"
    />
  );
}
