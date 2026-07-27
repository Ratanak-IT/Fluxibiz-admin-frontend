import { AdminHeader } from "@/components/admin/Header";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <AdminHeader />
        {children}
      </div>
    </AuthGuard>
  );
}
