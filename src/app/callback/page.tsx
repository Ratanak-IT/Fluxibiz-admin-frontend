"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { exchangeCodeForTokens, redirectToLogin } from "@/lib/auth/keycloak";
import { tokenStore } from "@/lib/auth/tokenStore";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const authError = params.get("error");

    if (authError) {
      setError(params.get("error_description") ?? authError);
      return;
    }

    if (!code || !state) {
      setError("Missing authorization code.");
      return;
    }

    exchangeCodeForTokens(code, state)
      .then((tokens) => {
        tokenStore.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
        const returnTo = tokenStore.getReturnTo();
        router.replace(returnTo && returnTo !== "/callback" ? returnTo : "/dashboard");
      })
      .catch((exception: Error) => setError(exception.message));
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-xl font-semibold">Sign in failed</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          className="rounded-md border px-4 py-2 text-sm"
          onClick={() => redirectToLogin("/dashboard")}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Signing you in...
    </div>
  );
}
