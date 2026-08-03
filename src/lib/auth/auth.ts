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

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
if (!betterAuthSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Set it as an environment variable " +
      "(never hardcode it in source) before starting the app."
  );
}

export const auth = betterAuth({
  appName: "IPOS Admin Platform",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "https://administrator.fluxibiz.store",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  secret: betterAuthSecret,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "keycloak",
          clientId: keycloakClientId,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
          issuer: keycloakIssuer,
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