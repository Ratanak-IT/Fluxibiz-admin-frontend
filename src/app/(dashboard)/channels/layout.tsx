import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [
  { label: "Shop Integrations", href: "/channels", icon: "business" },
  { label: "Configure Channels", href: "/channels/manage", icon: "settings" },
];

export default function ChannelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col lg:flex-row">
      <ModuleSidebar title={"Shop\nChannels"} icon="business" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
