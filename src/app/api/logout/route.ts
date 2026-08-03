import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { keycloakLogoutUrl } from "@/lib/auth/keycloak-logout";

async function readIdToken(requestHeaders: Headers) {
  try {
    const tokens = await auth.api.getAccessToken({
      headers: requestHeaders,
      body: { providerId: "keycloak" },
    });

    return tokens.idToken ?? undefined;
  } catch {
    return undefined;
  }
}

async function clearSession(requestHeaders: Headers) {
  try {
    const { headers: responseHeaders } = await auth.api.signOut({
      headers: requestHeaders,
      returnHeaders: true,
    });

    return responseHeaders.getSetCookie();
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const requestHeaders = await headers();

  const baseUrl =
    process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, "") ||
    request.nextUrl.origin;
  const loginUrl = `${baseUrl}/login`;

  const idToken = await readIdToken(requestHeaders);
  const setCookies = await clearSession(requestHeaders);

  const target =
    (await keycloakLogoutUrl({
      idToken,
      postLogoutRedirectUri: loginUrl,
    })) ?? loginUrl;

  const response = NextResponse.redirect(target, 303);

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}
