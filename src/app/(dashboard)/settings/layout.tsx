import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [
  { label: "Platform features", href: "/settings/platform-features", icon: "settings" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col border-t border-border lg:flex-row">
      <ModuleSidebar title={"Settings"} icon="settings" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
