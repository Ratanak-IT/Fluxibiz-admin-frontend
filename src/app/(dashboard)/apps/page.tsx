import { cookies, headers } from "next/headers";
import AppLauncher from "@/components/dashboard/AppLauncher";
import WelcomeIntro from "@/components/dashboard/WelcomeIntro";
import { auth } from "@/lib/auth/auth";

export default async function AppsPage() {
  const [cookieStore, session] = await Promise.all([
    cookies(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <div className="min-h-dvh" >
      {cookieStore.get("ipos_welcome")?.value === "1" && <WelcomeIntro />}
      <AppLauncher managerName={session?.user.name || "Administrator"} />
    </div>

    
      
    
  );
}
