import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [
  { label: "All businesses", href: "/businesses", icon: "business" },
];

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col border-t border-border lg:flex-row">
      <ModuleSidebar title={"Business\nManagement"} icon="business" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
