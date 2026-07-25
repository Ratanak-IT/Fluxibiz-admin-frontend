import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function CategoryAuditPage() {
  return (
    <AuditLogTable
      title="Category activity"
      subtitle="Changes to the category list shop owners choose from."
      breadcrumb="Categories"
      targetType="BUSINESS_CATEGORY"
    />
  );
}
