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

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  current_grade?: string;
}): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res));
  return res.json();
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  // The OAuth2 form field is named "username" but the backend actually
  // authenticates against email — a plain username 401s.
  const body = new URLSearchParams({
    grant_type: "password",
    username: input.email,
    password: input.password,
  });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res));
  return res.json();
}

export async function getMe(token: string): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res));
  return res.json();
}
