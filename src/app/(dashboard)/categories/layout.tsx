import { ModuleSidebar, type SidebarItem } from "@/components/admin/ModuleSidebar";

const ITEMS: SidebarItem[] = [
  { label: "Categories", href: "/categories", icon: "category" },
];

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-76px)] border-t border-neutral-200">
      <ModuleSidebar title={"Business\nCategories"} icon="category" items={ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
