import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function BusinessAuditPage() {
  return (
    <AuditLogTable
      title="Business activity"
      subtitle="Suspensions, closures and other moderation actions on shops."
      breadcrumb="Businesses"
      targetType="BUSINESS"
    />
  );
}
