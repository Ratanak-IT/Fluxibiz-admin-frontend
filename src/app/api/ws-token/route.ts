import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  persistAuthCookies,
  resolveKeycloakAccessToken,
} from "@/lib/auth/keycloak-token";

/**
 * Mints a short-lived access token for the realtime notifications socket to
 * present at STOMP CONNECT. That connection goes straight from the browser
 * to the backend and can't be proxied through our own route handlers, so the
 * token has to reach the client somehow — but only this once, only in
 * memory. The caller must not persist it (no sessionStorage/localStorage);
 * every other API call goes through `/api/v1/...`, which never exposes a
 * token to the browser at all.
 */
export async function GET() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return Response.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    const resolved = await resolveKeycloakAccessToken(requestHeaders);
    await persistAuthCookies(resolved.setCookies);

    if (!resolved.accessToken) {
      return Response.json({ message: "Not authenticated." }, { status: 401 });
    }

    return Response.json(
      { accessToken: resolved.accessToken },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ message: "Not authenticated." }, { status: 401 });
  }
}
