import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

const keycloakClientId =
  process.env.KEYCLOAK_CLIENT_ID ||
  process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ||
  "fluxipos-client";

const keycloakIssuer =
  process.env.KEYCLOAK_ISSUER ||
  (process.env.NEXT_PUBLIC_KEYCLOAK_URL && process.env.NEXT_PUBLIC_KEYCLOAK_REALM
    ? `${process.env.NEXT_PUBLIC_KEYCLOAK_URL.replace(/\/+$/, "")}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM.replace(/^\/+|\/+$/g, "")}`
    : "https://auth.chanchhay.site/realms/istad-fluxipos-auth");

export const auth = betterAuth({
  appName: "IPOS Admin Platform",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "https://administrator.fluxibiz.store",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  secret: process.env.BETTER_AUTH_SECRET || "2e20f532482fdc58c4cd0007433f0e782aee26da25ed49bfbe1e74dd3b130e55",
  plugins: [
    genericOAuth({
      config: [
        // Manual config instead of the keycloak() helper: the helper's
        // KeycloakOptions type doesn't expose `prompt`, but the underlying
        // GenericOAuthConfig does, and providerId "keycloak" must stay the
        // same string the rest of the app (readIdToken, etc.) already uses.
        {
          providerId: "keycloak",
          clientId: keycloakClientId,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
          issuer: keycloakIssuer,
          // The keycloak() helper used to derive this from `issuer`
          // automatically; a manual config needs it spelled out or the
          // plugin can't resolve authorization_endpoint/token_endpoint
          // and throws "Invalid OAuth configuration".
          discoveryUrl: `${keycloakIssuer}/.well-known/openid-configuration`,
       
          scopes: ["openid", "profile", "email"],
          pkce: true,
          prompt: "login",
        },
      ],
    }),
    nextCookies(),
  ],
});