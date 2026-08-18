"use server";

import { redirect } from "next/navigation";
import {
  ApiError,
  createAttempt,
  createSession,
  getMe,
  loginUser,
  registerUser,
  updateAttempt,
  updateSession,
  type AttemptResult,
} from "@/lib/api";
import {
  clearSessionCookie,
  getSessionToken,
  setSessionCookie,
} from "@/lib/session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Enter your email and password.")}`);
  }

  try {
    const token = await loginUser({ email, password });
    await setSessionCookie(token.access_token);
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Couldn't sign in. Try again.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/");
}

export async function signupAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const currentGrade = String(formData.get("current_grade") ?? "").trim();

  if (!username || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Fill in username, email, and password.")}`);
  }

  try {
    await registerUser({
      username,
      email,
      password,
      current_grade: currentGrade || undefined,
    });
    const token = await loginUser({ email, password });
    await setSessionCookie(token.access_token);
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Couldn't create your account. Try again.";
    redirect(`/signup?error=${encodeURIComponent(message)}`);
  }

  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function startSessionAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const gymId = Number(formData.get("gym_id"));
  const today = new Date().toISOString().slice(0, 10);
  const user = await getMe(token);
  const session = await createSession(token, {
    user_id: user.id,
    gym_id: gymId,
    session_date: today,
    duration_minutes: 0,
  });
  redirect(`/sessions/${session.id}`);
}

export async function logAttemptAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const sessionId = Number(formData.get("session_id"));
  const routeId = Number(formData.get("route_id"));
  const result = String(formData.get("result")) as AttemptResult;
  const existingAttemptId = formData.get("attempt_id");
  const existingNumAttempts = Number(formData.get("num_attempts") ?? 0);

  if (existingAttemptId) {
    await updateAttempt(token, Number(existingAttemptId), {
      num_attempts: existingNumAttempts + 1,
      result,
    });
  } else {
    await createAttempt(token, sessionId, { route_id: routeId, num_attempts: 1, result });
  }

  redirect(`/sessions/${sessionId}`);
}

export async function endSessionAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const sessionId = Number(formData.get("session_id"));
  const durationMinutes = Number(formData.get("duration_minutes") ?? 0);
  await updateSession(token, sessionId, {
    duration_minutes: durationMinutes > 0 ? durationMinutes : 1,
  });
  redirect("/history");
}
