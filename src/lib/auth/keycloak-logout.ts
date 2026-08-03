const DISCOVERY_PATH = "/.well-known/openid-configuration";

let cachedEndSessionEndpoint: string | undefined;

function issuerUrl() {
  const issuer =
    process.env.KEYCLOAK_ISSUER ||
    (process.env.NEXT_PUBLIC_KEYCLOAK_URL && process.env.NEXT_PUBLIC_KEYCLOAK_REALM
      ? `${process.env.NEXT_PUBLIC_KEYCLOAK_URL.replace(/\/+$/, "")}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM.replace(/^\/+|\/+$/g, "")}`
      : "https://auth.chanchhay.site/realms/istad-fluxipos-auth");
  return issuer.replace(/\/+$/, "");
}

async function endSessionEndpoint(issuer: string) {
  if (cachedEndSessionEndpoint) return cachedEndSessionEndpoint;

  try {
    const response = await fetch(`${issuer}${DISCOVERY_PATH}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const document = (await response.json()) as {
        end_session_endpoint?: string;
      };

      if (document.end_session_endpoint) {
        cachedEndSessionEndpoint = document.end_session_endpoint;
        return cachedEndSessionEndpoint;
      }
    }
  } catch {
    // Discovery is optional
  }

  return `${issuer}/protocol/openid-connect/logout`;
}

export async function keycloakLogoutUrl({
  idToken,
  postLogoutRedirectUri,
}: {
  idToken?: string;
  postLogoutRedirectUri: string;
}) {
  const issuer = issuerUrl();
  if (!issuer) return null;

  const url = new URL(await endSessionEndpoint(issuer));
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ||
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ||
    "fluxipos-client";

  if (idToken) {
    url.searchParams.set("id_token_hint", idToken);
  } else {
    url.searchParams.set("client_id", clientId);
  }

  return url.toString();
}
