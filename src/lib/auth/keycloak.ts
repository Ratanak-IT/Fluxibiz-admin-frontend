import { createCodeChallenge, createCodeVerifier, createState } from "./pkce";
import { tokenStore } from "./tokenStore";

const KEYCLOAK_URL = (process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "").replace(/\/+$/, "");
const REALM = (process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "").replace(/^\/+|\/+$/g, "");
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "";

const realmBase = () => `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect`;
const redirectUri = () => `${window.location.origin}/callback`;

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}

export async function redirectToLogin(returnTo?: string) {
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const state = createState();

  tokenStore.setVerifier(verifier);
  tokenStore.setState(state);
  tokenStore.setReturnTo(returnTo ?? window.location.pathname + window.location.search);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid profile email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  window.location.assign(`${realmBase()}/auth?${params.toString()}`);
}

export async function exchangeCodeForTokens(code: string, state: string): Promise<TokenResponse> {
  const expectedState = tokenStore.getState();
  const verifier = tokenStore.getVerifier();

  if (!expectedState || state !== expectedState) {
    throw new Error("State mismatch. Please start the login again.");
  }
  if (!verifier) {
    throw new Error("Missing PKCE verifier. Please start the login again.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
  });

  const response = await fetch(`${realmBase()}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed (${response.status})`);
  }

  return response.json();
}

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${realmBase()}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) return null;
  return response.json();
}

export function logout() {
  const idToken = tokenStore.getIdToken();
  tokenStore.clear();

  const params = new URLSearchParams({
    post_logout_redirect_uri: window.location.origin,
  });

  if (idToken) {
    params.set("id_token_hint", idToken);
  } else {
    params.set("client_id", CLIENT_ID);
  }

  window.location.assign(`${realmBase()}/logout?${params.toString()}`);
}