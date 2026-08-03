import { headers } from "next/headers";
import AppShell from "@/components/layout/AppShell";
import { auth } from "@/lib/auth/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <AppShell managerName={session?.user.name || "Administrator"}>
      {children}
    </AppShell>
  );
}
