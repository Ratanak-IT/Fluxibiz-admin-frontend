"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LogIn, ShieldCheck, ArrowRight, LoaderCircle } from "lucide-react";
import { redirectToLogin } from "@/lib/auth/keycloak";
import { isTokenValid, tokenStore } from "@/lib/auth/tokenStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const token = tokenStore.getAccessToken();
    if (isTokenValid(token)) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleKeycloakLogin = () => {
    setRedirecting(true);
    redirectToLogin("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_48%,#eefbf3_100%)] px-4 dark:bg-[linear-gradient(135deg,#07120b_0%,#0a0a0a_48%,#102016_100%)]">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/90 p-8 text-center shadow-[0_28px_80px_rgba(15,118,63,0.12)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/50">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-lime-400 via-green-600 to-emerald-400" />

        <div className="mx-auto flex justify-center">
          <Image
            src="/logo.jpg"
            alt="IPOS Admin Platform"
            width={180}
            height={72}
            priority
            className="h-14 w-auto sm:h-16"
          />
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Welcome to IPOS Admin
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in with your Keycloak single sign-on (SSO) account to access the administration platform.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            disabled={redirecting}
            onClick={handleKeycloakLogin}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition hover:from-green-700 hover:to-emerald-700 active:scale-[0.99] disabled:opacity-75"
          >
            {redirecting ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                Connecting to Keycloak...
              </>
            ) : (
              <>
                <LogIn className="size-5" />
                Sign in with Keycloak
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-neutral-100 pt-5 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          <ShieldCheck className="size-4 text-green-600 dark:text-green-400" />
          <span>Secured via Keycloak OAuth2 / OpenID Connect PKCE</span>
        </div>
      </div>
    </main>
  );
}
