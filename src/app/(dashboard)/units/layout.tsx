import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [{ label: "Units", href: "/units", icon: "unit" }];

export default function UnitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col lg:flex-row">
      <ModuleSidebar title="Units" icon="unit" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}