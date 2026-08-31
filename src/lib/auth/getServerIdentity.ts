import "server-only";

import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { resolveKeycloakAccessToken } from "./keycloak-token";
import { FULL_ACCESS_ROLES } from "@/lib/permissionCatalog";

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

    const { accessToken } = await resolveKeycloakAccessToken(requestHeaders);

    if (!accessToken) return null;

    const claims = jwtDecode<AccessTokenClaims>(accessToken);

    const realmRoles = claims.realm_access?.roles ?? [];
    const clientRoles = Object.values(claims.resource_access ?? {}).flatMap(
      (resource) => resource?.roles ?? []
    );

    const roles = Array.from(new Set([...realmRoles, ...clientRoles]));

    return {
      roles,
      username:
        claims.preferred_username ?? claims.email ?? claims.name ?? "Unknown account",
      isSuperAdmin: roles.some((role) => FULL_ACCESS_ROLES.includes(role)),
    };
  } catch (error) {
    console.error("[auth] getServerIdentity failed:", error);
    return null;
  }
}