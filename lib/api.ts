export const API_BASE = "https://bouldy-api.onrender.com";

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  current_grade: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type Gym = {
  id: number;
  name: string;
  location: string;
};

export type RouteStatus = "active" | "retired";

export type Route = {
  id: number;
  gym_id: number;
  route_name: string;
  grade: string;
  colour: string | null;
  wall: string | null;
  setter: string | null;
  set_date: string | null;
  retired_date: string | null;
  status: RouteStatus;
  styles: string[];
};

export type Session = {
  id: number;
  user_id: number;
  gym_id: number;
  session_date: string;
  duration_minutes: number;
  notes: string | null;
};

export type AttemptResult = "flash" | "zone" | "send" | "project";

export type Attempt = {
  id: number;
  session_id: number;
  route_id: number;
  num_attempts: number;
  result: AttemptResult;
  notes: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((e: { msg: string }) => e.msg).join(", ");
    }
  } catch {
    // fall through to status text
  }
  return res.statusText || "Something went wrong";
}

async function apiFetch<T>(
  path: string,
  opts: {
    method?: string;
    token?: string;
    json?: unknown;
    form?: URLSearchParams;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (opts.json !== undefined) {
    body = JSON.stringify(opts.json);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res));
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  current_grade?: string;
}): Promise<UserResponse> {
  return apiFetch("/auth/register", { method: "POST", json: input });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  // The OAuth2 form field is named "username" but the backend actually
  // authenticates against email — a plain username 401s.
  const form = new URLSearchParams({
    grant_type: "password",
    username: input.email,
    password: input.password,
  });
  return apiFetch("/auth/login", { method: "POST", form });
}

export async function getMe(token: string): Promise<UserResponse> {
  return apiFetch("/auth/me", { token });
}

export async function getGyms(): Promise<Gym[]> {
  return apiFetch("/gyms/");
}

export async function getGym(id: number): Promise<Gym> {
  return apiFetch(`/gyms/${id}`);
}

export async function getRoutes(): Promise<Route[]> {
  return apiFetch("/routes/");
}

export async function listSessions(token: string): Promise<Session[]> {
  return apiFetch("/sessions/", { token });
}

export async function createSession(
  token: string,
  input: {
    user_id: number;
    gym_id: number;
    session_date: string;
    duration_minutes: number;
    notes?: string;
  },
): Promise<Session> {
  // user_id is required by the schema but ignored server-side — the real
  // owner is derived from the bearer token.
  return apiFetch("/sessions/", { method: "POST", token, json: input });
}

export async function getSession(token: string, id: number): Promise<Session> {
  return apiFetch(`/sessions/${id}`, { token });
}

export async function updateSession(
  token: string,
  id: number,
  input: { duration_minutes?: number; notes?: string },
): Promise<Session> {
  return apiFetch(`/sessions/${id}`, { method: "PUT", token, json: input });
}

export async function getSessionAttempts(
  token: string,
  sessionId: number,
): Promise<Attempt[]> {
  return apiFetch(`/sessions/${sessionId}/attempts`, { token });
}

export async function createAttempt(
  token: string,
  sessionId: number,
  input: { route_id: number; num_attempts: number; result: AttemptResult; notes?: string },
): Promise<Attempt> {
  return apiFetch(`/sessions/${sessionId}/attempts`, {
    method: "POST",
    token,
    json: input,
  });
}

export async function updateAttempt(
  token: string,
  attemptId: number,
  input: { num_attempts?: number; result?: AttemptResult; notes?: string },
): Promise<Attempt> {
  return apiFetch(`/attempts/${attemptId}`, { method: "PATCH", token, json: input });
}
