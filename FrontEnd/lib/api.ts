const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  headers.set("ngrok-skip-browser-warning", "true");
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
}

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    super(`API ${status}`);
    this.status = status;
    this.body = body;
  }
}

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  is_onboarded: boolean;
};

export type ApiOnboarding = {
  userName: string;
  foxNickname: string;
  hobbies: string[];
  targetCourse: {
    grade: string;
    subject: string;
  };
  completedAt: string;
};

async function request(path: string, options: RequestInit = {}, retry = true) {
  const res = await apiFetch(path, options);

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (res.status === 401 && retry && !path.endsWith("/refresh")) {
    try {
      await request("/api/v1/auth/refresh", { method: "POST" }, false);
      return request(path, options, false);
    } catch {
      throw new ApiError(401, body);
    }
  }

  if (!res.ok) throw new ApiError(res.status, body);

  return body;
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, data?: any) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  patch: (path: string, data?: any) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  put: (path: string, data?: any) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (path: string) => request(path, { method: "DELETE" }),
};
