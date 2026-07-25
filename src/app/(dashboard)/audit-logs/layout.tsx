import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

// Sub pages narrow the same log by target, so the module stays about auditing
// only rather than borrowing navigation from other modules.
const ITEMS: SidebarItem[] = [
  { label: "All activity", href: "/audit-logs", icon: "audit" },
  { label: "Businesses", href: "/audit-logs/businesses", icon: "business" },
  { label: "Categories", href: "/audit-logs/categories", icon: "category" },
  { label: "Units", href: "/audit-logs/units", icon: "unit" },
];

export default function AuditLogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-76px)] border-t border-neutral-200">
      <ModuleSidebar title={"Audit\nLog"} icon="audit" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
