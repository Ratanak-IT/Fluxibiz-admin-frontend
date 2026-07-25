import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function AuditLogsPage() {
  return (
    <AuditLogTable
      title="All activity"
      subtitle="Every action an administrator took, who took it, and the reason they gave."
      breadcrumb="All activity"
    />
  );
}