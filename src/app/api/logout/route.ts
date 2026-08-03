import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { keycloakLogoutUrl } from "@/lib/auth/keycloak-logout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function readIdToken(requestHeaders: Headers) {
  try {
    const tokens = await auth.api.getAccessToken({
      headers: requestHeaders,
      body: { providerId: "keycloak" },
    });
    return tokens.idToken ?? undefined;
  } catch (error) {
    console.error("[logout] getAccessToken failed:", error);
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
  } catch (error) {
    console.error("[logout] signOut failed:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const requestHeaders = await headers();

  const baseUrl =
    process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, "") ||
    request.nextUrl.origin;

  const landingUrl = `${baseUrl}/login`;

  const idToken = await readIdToken(requestHeaders);
  const setCookies = await clearSession(requestHeaders);

  const target =
    (await keycloakLogoutUrl({
      idToken,
      postLogoutRedirectUri: landingUrl,
    })) ?? landingUrl;

  const response = NextResponse.redirect(target, 303);

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  const isHttps = baseUrl.startsWith("https://");
  const namesToClear = new Set<string>([
    "better-auth.session_token",
    "better-auth.session_data",
    "better-auth.dont_remember",
    "__Secure-better-auth.session_token",
    "__Secure-better-auth.session_data",
    "__Secure-better-auth.dont_remember",
    "ipos_welcome",
  ]);

  for (const c of request.cookies.getAll()) {
    if (c.name.includes("better-auth") || c.name.startsWith("ipos")) {
      namesToClear.add(c.name);
    }
  }

  for (const name of namesToClear) {
    response.headers.append(
      "set-cookie",
      `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${isHttps ? "; Secure" : ""}`
    );
    response.headers.append(
      "set-cookie",
      `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    );
  }

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");

  return response;
}

export async function GET(request: NextRequest) {
  return POST(request);
}