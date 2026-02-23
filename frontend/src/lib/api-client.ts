// =============================================================================
// API Client — fetch wrapper with JWT token management & auto-refresh
// =============================================================================

const API_BASE = "/api";

// ---------------------------------------------------------------------------
// Token storage (in-memory — survives page navigation, cleared on tab close)
// ---------------------------------------------------------------------------

let accessToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  // Persist refresh token so we can restore sessions after page reload
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", refresh);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("refreshToken");
  }
}

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refreshToken")
      : null;

  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });

    if (!res.ok) return false;

    const json = await res.json();
    setTokens(json.accessToken, json.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Handle 401 — attempt token refresh once
  if (res.status === 401 && !url.includes("/auth/")) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await (refreshPromise ?? Promise.resolve(false));
    if (refreshed) {
      // Retry the original request with the new token
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${accessToken}`);
      if (
        !retryHeaders.has("Content-Type") &&
        !(options.body instanceof FormData)
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }

      const retryRes = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });

      if (!retryRes.ok) {
        const errBody = await retryRes.json().catch(() => ({}));
        throw new ApiError(
          retryRes.status,
          errBody.message || retryRes.statusText,
          errBody
        );
      }

      // Handle 204 No Content
      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    }

    // Refresh failed — clear tokens
    clearTokens();
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errBody.message || res.statusText, errBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

export const api = {
  get<T>(url: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let queryString = "";
    if (params) {
      const filtered = Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== ""
      );
      if (filtered.length > 0) {
        queryString =
          "?" + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString();
      }
    }
    return request<T>(`${url}${queryString}`);
  },

  post<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string): Promise<T> {
    return request<T>(url, { method: "DELETE" });
  },

  upload<T>(url: string, formData: FormData): Promise<T> {
    return request<T>(url, {
      method: "POST",
      body: formData,
      // Don't set Content-Type — browser will set it with boundary
    });
  },
};
