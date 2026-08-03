const ACCESS_TOKEN_KEY = 'sirix_access_token';
const REFRESH_TOKEN_KEY = 'sirix_refresh_token';

/**
 * Framework-agnostic token storage so the Axios interceptor (which runs outside
 * React) can read/write tokens without importing the Zustand store directly.
 * "Remember me" controls whether tokens persist in localStorage or only for the tab
 * (sessionStorage) — default is localStorage since most carrier-ops users stay logged in.
 */
class TokenService {
  private storage: Storage = localStorage;

  setStorageMode(rememberMe: boolean) {
    this.storage = rememberMe ? localStorage : sessionStorage;
  }

  private getPreferredStorage(): Storage {
    if (localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY)) {
      return localStorage;
    }
    if (sessionStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
      return sessionStorage;
    }
    return this.storage;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string) {
    const target = this.getPreferredStorage();
    target.setItem(ACCESS_TOKEN_KEY, accessToken);
    target.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  updateAccessToken(accessToken: string) {
    const target = this.getPreferredStorage();
    target.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export const tokenService = new TokenService();
