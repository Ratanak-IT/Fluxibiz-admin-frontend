import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [{ label: "Profile", href: "/account", icon: "account" }];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col lg:flex-row">
      <ModuleSidebar title="Account" icon="account" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}