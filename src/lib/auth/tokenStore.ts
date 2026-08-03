import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "ipos.admin.accessToken";
const REFRESH_TOKEN_KEY = "ipos.admin.refreshToken";
const ID_TOKEN_KEY = "ipos.admin.idToken";
const VERIFIER_KEY = "ipos.admin.codeVerifier";
const STATE_KEY = "ipos.admin.authState";
const RETURN_TO_KEY = "ipos.admin.returnTo";

export interface KeycloakClaims {
  sub: string;
  exp: number;
  preferred_username?: string;
  email?: string;
  name?: string;
  realm_access?: { roles: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

const isBrowser = () => typeof window !== "undefined";

export const tokenStore = {
  getAccessToken: () => (isBrowser() ? sessionStorage.getItem(ACCESS_TOKEN_KEY) : null),
  getRefreshToken: () => (isBrowser() ? sessionStorage.getItem(REFRESH_TOKEN_KEY) : null),

  getIdToken: () => (isBrowser() ? sessionStorage.getItem(ID_TOKEN_KEY) : null),

  setTokens(accessToken: string, refreshToken: string, idToken?: string) {
    if (!isBrowser()) return;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (idToken) {
      sessionStorage.setItem(ID_TOKEN_KEY, idToken);
    }
  },

  clear() {
    if (!isBrowser()) return;
    [
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      ID_TOKEN_KEY,
      VERIFIER_KEY,
      STATE_KEY,
      RETURN_TO_KEY,
    ].forEach((key) => sessionStorage.removeItem(key));
  },

  setVerifier: (value: string) => isBrowser() && sessionStorage.setItem(VERIFIER_KEY, value),
  getVerifier: () => (isBrowser() ? sessionStorage.getItem(VERIFIER_KEY) : null),
  setState: (value: string) => isBrowser() && sessionStorage.setItem(STATE_KEY, value),
  getState: () => (isBrowser() ? sessionStorage.getItem(STATE_KEY) : null),
  setReturnTo: (value: string) => isBrowser() && sessionStorage.setItem(RETURN_TO_KEY, value),
  getReturnTo: () => (isBrowser() ? sessionStorage.getItem(RETURN_TO_KEY) : null),
};

export function decodeToken(token: string): KeycloakClaims | null {
  try {
    return jwtDecode<KeycloakClaims>(token);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null, skewSeconds = 30): boolean {
  if (!token) return false;
  const claims = decodeToken(token);
  if (!claims?.exp) return false;
  return claims.exp * 1000 > Date.now() + skewSeconds * 1000;
}

export function hasRole(token: string | null, role: string): boolean {
  if (!token) return false;
  return decodeToken(token)?.realm_access?.roles?.includes(role) ?? false;
}