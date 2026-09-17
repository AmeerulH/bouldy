"use server";

import { redirect } from "next/navigation";
import {
  ApiError,
  createAttempt,
  createGym,
  createRoute,
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
  redirect("/welcome");
}

export async function startSessionAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const gymId = Number(formData.get("gym_id"));
  if (!Number.isInteger(gymId) || gymId < 1) {
    redirect(`/gyms?error=${encodeURIComponent("Choose a gym before starting a session.")}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  let session;
  try {
    const user = await getMe(token);
    session = await createSession(token, {
      user_id: user.id,
      gym_id: gymId,
      session_date: today,
      duration_minutes: 0,
    });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't start that session. Try again.";
    redirect(`/gyms?error=${encodeURIComponent(message)}`);
  }
  redirect(`/sessions/${session.id}`);
}

export async function addGymAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  if (!name || !location) {
    redirect(`/gyms?error=${encodeURIComponent("Enter a gym name and location.")}`);
  }

  try {
    await createGym({ name, location });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't add that gym. Try again.";
    redirect(`/gyms?error=${encodeURIComponent(message)}`);
  }
  redirect(`/gyms?notice=${encodeURIComponent("Gym added. You can start a session now.")}`);
}

export async function addRouteAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const sessionId = Number(formData.get("session_id"));
  const gymId = Number(formData.get("gym_id"));
  const routeName = String(formData.get("route_name") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const colour = String(formData.get("colour") ?? "").trim();
  const wall = String(formData.get("wall") ?? "").trim();
  const setter = String(formData.get("setter") ?? "").trim();
  const style = String(formData.get("style") ?? "").trim();

  if (!Number.isInteger(sessionId) || !Number.isInteger(gymId) || !routeName || !grade) {
    redirect(
      `/sessions/${sessionId}?error=${encodeURIComponent("Add a route name and the gym's grade.")}`,
    );
  }

  try {
    await createRoute({
      gym_id: gymId,
      route_name: routeName,
      grade,
      colour: colour || "Unspecified",
      wall,
      setter,
      set_date: new Date().toISOString().slice(0, 10),
      styles: style ? [style] : [],
    });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't add that route. Try again.";
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent(message)}`);
  }
  redirect(`/sessions/${sessionId}?notice=${encodeURIComponent("Route added to this gym.")}`);
}

export async function logAttemptAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const sessionId = Number(formData.get("session_id"));
  const routeId = Number(formData.get("route_id"));
  const result = String(formData.get("result")) as AttemptResult;
  const existingAttemptId = formData.get("attempt_id");
  const existingNumAttempts = Number(formData.get("num_attempts") ?? 0);

  if (!Number.isInteger(sessionId) || !Number.isInteger(routeId)) {
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent("Choose a route before logging an attempt.")}`);
  }

  if (existingAttemptId && result === "flash") {
    redirect(
      `/sessions/${sessionId}?error=${encodeURIComponent("A flash can only be recorded on the first attempt.")}`,
    );
  }

  try {
    if (existingAttemptId) {
      await updateAttempt(token, Number(existingAttemptId), {
        num_attempts: existingNumAttempts + 1,
        result,
      });
    } else {
      await createAttempt(token, sessionId, { route_id: routeId, num_attempts: 1, result });
    }
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't save that attempt. Try again.";
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/sessions/${sessionId}`);
}

export async function correctAttemptAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const sessionId = Number(formData.get("session_id"));
  const attemptId = Number(formData.get("attempt_id"));
  const result = String(formData.get("result")) as AttemptResult;
  const numAttempts = Number(formData.get("num_attempts"));
  const validResults: AttemptResult[] = ["flash", "zone", "send", "project"];

  if (
    !Number.isInteger(sessionId) ||
    !Number.isInteger(attemptId) ||
    !Number.isInteger(numAttempts) ||
    numAttempts < 1 ||
    !validResults.includes(result)
  ) {
    redirect(
      `/sessions/${sessionId}?error=${encodeURIComponent("Choose a valid result and at least one attempt.")}`,
    );
  }

  if (result === "flash" && numAttempts !== 1) {
    redirect(
      `/sessions/${sessionId}?error=${encodeURIComponent("A flash must have exactly one attempt.")}`,
    );
  }

  try {
    await updateAttempt(token, attemptId, {
      num_attempts: numAttempts,
      result,
    });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't save that correction. Try again.";
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/sessions/${sessionId}?notice=${encodeURIComponent("Route log corrected.")}`);
}

export async function endSessionAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const sessionId = Number(formData.get("session_id"));
  const durationMinutes = Number(formData.get("duration_minutes") ?? 0);
  try {
    await updateSession(token, sessionId, {
      duration_minutes: durationMinutes > 0 ? durationMinutes : 1,
    });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't end that session. Try again.";
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent(message)}`);
  }
  redirect("/sessions");
}
