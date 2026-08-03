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

  const requestCookies = request.cookies.getAll();
  const cookiesToClear = new Set<string>([
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth.session_data",
    "__Secure-better-auth.session_data",
    "better-auth.account_data",
    "__Secure-better-auth.account_data",
    "better-auth.account_data.0",
    "__Secure-better-auth.account_data.0",
    "better-auth.account_data.1",
    "__Secure-better-auth.account_data.1",
    "better-auth.account_data.2",
    "__Secure-better-auth.account_data.2",
    "better-auth.dont_remember",
    "__Secure-better-auth.dont_remember",
    "ipos_token",
    "ipos_welcome",
  ]);

  for (const c of requestCookies) {
    if (c.name.includes("better-auth") || c.name.includes("ipos")) {
      cookiesToClear.add(c.name);
    }
  }

  for (const cookieName of cookiesToClear) {
    response.headers.append(
      "set-cookie",
      `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
    );
    response.headers.append(
      "set-cookie",
      `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax`
    );
  }

  return response;
}

export async function GET(request: NextRequest) {
  return POST(request);
}
