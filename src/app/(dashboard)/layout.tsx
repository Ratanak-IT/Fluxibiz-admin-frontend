import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { auth } from "@/lib/auth/auth";
import { getServerIdentity } from "@/lib/auth/getServerIdentity";
import { hasAnyPlatformPermission } from "@/lib/permissionCatalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const identity = await getServerIdentity();

  // A business/customer/plain-user account must never actually reach the
  // dashboard, not even to see a "you're not allowed" screen while still
  // technically signed in here — that's still a live admin-platform session
  // for an account that was never meant to have one. Ending the session
  // and bouncing them out is the only thing that really blocks it.
  if (!identity || !hasAnyPlatformPermission(identity.roles)) {
    redirect("/api/logout?reason=forbidden");
  }

  return (
    <AppShell managerName={session.user.name || "Administrator"}>
      {children}
    </AppShell>
  );
}