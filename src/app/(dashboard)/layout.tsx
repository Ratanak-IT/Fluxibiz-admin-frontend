import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { auth } from "@/lib/auth/auth";
import { getServerIdentity } from "@/lib/auth/getServerIdentity";
import ForbiddenScreen from "@/components/auth/ForbiddenScreen";

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

  if (!identity?.isSuperAdmin) {
    return (
      <ForbiddenScreen
        username={identity?.username ?? session.user.email ?? "Unknown account"}
        roles={identity?.roles ?? []}
      />
    );
  }

  return (
    <AppShell managerName={session.user.name || "Administrator"}>
      {children}
    </AppShell>
  );
}