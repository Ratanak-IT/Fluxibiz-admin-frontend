const DISCOVERY_PATH = "/.well-known/openid-configuration";

let cachedEndSessionEndpoint: string | undefined;

function issuerUrl() {
  return process.env.KEYCLOAK_ISSUER?.trim().replace(/\/+$/, "");
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

  if (idToken) {
    url.searchParams.set("id_token_hint", idToken);
  } else if (process.env.KEYCLOAK_CLIENT_ID) {
    url.searchParams.set("client_id", process.env.KEYCLOAK_CLIENT_ID);
  }

  return url.toString();
}
