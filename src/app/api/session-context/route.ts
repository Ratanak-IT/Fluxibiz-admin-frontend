import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  persistAuthCookies,
  resolveKeycloakAccessToken,
} from "@/lib/auth/keycloak-token";
import { jwtDecode } from "jwt-decode";
import { SUPER_ADMIN_ROLE } from "@/lib/permissionCatalog";

interface AccessTokenClaims {
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

export async function GET() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return Response.json({ message: "Not authenticated." }, { status: 401 });
  }

  let accessToken: string | null = null;
  let claims: AccessTokenClaims | null = null;

  try {
    const resolved = await resolveKeycloakAccessToken(requestHeaders);
    await persistAuthCookies(resolved.setCookies);
    accessToken = resolved.accessToken;
    if (accessToken) {
      claims = jwtDecode<AccessTokenClaims>(accessToken);
    }
  } catch {
    accessToken = null;
  }

  const realmRoles = claims?.realm_access?.roles ?? [];
  const clientRoles = Object.values(claims?.resource_access ?? {}).flatMap(
    (resource) => resource?.roles ?? []
  );
  const roles = Array.from(new Set([...realmRoles, ...clientRoles]));

  return Response.json(
    {
      accessToken,
      subject: claims?.sub ?? session.user.id,
      username:
        claims?.preferred_username ??
        claims?.email ??
        claims?.name ??
        session.user.name ??
        "Administrator",
      roles,
      isSuperAdmin: roles.includes(SUPER_ADMIN_ROLE),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
