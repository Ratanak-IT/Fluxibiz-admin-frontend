import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [{ label: "Overview", href: "/overview", icon: "overview" }];

export default function OverviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col border-t border-border lg:flex-row">
      <ModuleSidebar title={"Overview\nDashboard"} icon="overview" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
