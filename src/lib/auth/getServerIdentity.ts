import "server-only";

import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { auth } from "./auth";
import { SUPER_ADMIN_ROLE } from "@/lib/permissionCatalog";

interface AccessTokenClaims {
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

export interface ServerIdentity {
  roles: string[];
  username: string;
  isSuperAdmin: boolean;
}


export async function getServerIdentity(): Promise<ServerIdentity | null> {
  try {
    const requestHeaders = await headers();

    const tokens = await auth.api.getAccessToken({
      headers: requestHeaders,
      body: { providerId: "keycloak" },
    });

    if (!tokens?.accessToken) return null;

    const claims = jwtDecode<AccessTokenClaims>(tokens.accessToken);

    const realmRoles = claims.realm_access?.roles ?? [];
    const clientRoles = Object.values(claims.resource_access ?? {}).flatMap(
      (resource) => resource?.roles ?? []
    );

    const roles = Array.from(new Set([...realmRoles, ...clientRoles]));

    return {
      roles,
      username:
        claims.preferred_username ?? claims.email ?? claims.name ?? "Unknown account",
      isSuperAdmin: roles.includes(SUPER_ADMIN_ROLE),
    };
  } catch (error) {
    console.error("[auth] getServerIdentity failed:", error);
    return null;
  }
}