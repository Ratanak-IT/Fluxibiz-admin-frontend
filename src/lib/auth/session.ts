import { refreshAccessToken } from "./keycloak";
import { decodeToken, isTokenValid, tokenStore } from "./tokenStore";

export { hasRole, isTokenValid, decodeToken } from "./tokenStore";

let inflight: Promise<string | null> | null = null;

export async function refreshIfNeeded(): Promise<string | null> {
  const current = tokenStore.getAccessToken();

  if (isTokenValid(current)) {
    return current;
  }

  if (!inflight) {
    inflight = (async () => {
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        tokenStore.clear();
        return null;
      }

      tokenStore.setTokens(refreshed.access_token, refreshed.refresh_token, refreshed.id_token);
      return refreshed.access_token;
    })().finally(() => {
      inflight = null;
    });
  }

  return inflight;
}

export function millisUntilRefresh(leadSeconds = 60): number {
  const claims = decodeToken(tokenStore.getAccessToken() ?? "");
  if (!claims?.exp) return 0;

  const refreshAt = claims.exp * 1000 - leadSeconds * 1000;
  return Math.max(0, refreshAt - Date.now());
}
