"use server";

import { revalidatePath } from "next/cache";
import { loadJournal } from "@/lib/journal";
import { duplicateRouteIds, routeProgress } from "@/lib/journal-summary";
import { redirect, RedirectType } from "next/navigation";
import {
  ApiError,
  createAttempt,
  createGym,
  createRoute,
  createSession,
  getAttempt,
  getMe,
  getRoute,
  getSession,
  getSessionAttempts,
  loginUser,
  registerUser,
  updateAttempt,
  updateRoute,
  updateSession,
  type AttemptResult,
} from "@/lib/api";
import {
  clearSessionCookie,
  getSessionToken,
  setSessionCookie,
} from "@/lib/session";
import { ROUTE_COLOURS, ROUTE_STYLES } from "@/lib/route-options";

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
  // Sheet actions replace the current history entry so Back never reopens a finished sheet.
  if (!name || !location) {
    redirect(`/gyms?sheet=add-gym&error=${encodeURIComponent("Enter a gym name and location.")}`, RedirectType.replace);
  }

  try {
    await createGym({ name, location });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't add that gym. Try again.";
    redirect(`/gyms?sheet=add-gym&error=${encodeURIComponent(message)}`, RedirectType.replace);
  }
  redirect(`/gyms?notice=${encodeURIComponent("Gym added. You can start a session now.")}`, RedirectType.replace);
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
  const styles = readRouteStyles(formData);
  const fromSession = Number.isInteger(sessionId) && sessionId > 0;
  const destination = fromSession ? `/sessions/${sessionId}` : `/gyms/${gymId}`;
  // Errors return to the full-screen form; success returns to the list it was opened from.
  const formPath = `${destination}/routes/new`;

  if (!Number.isInteger(gymId) || gymId < 1 || !routeName || !grade || !isRouteColour(colour)) {
    redirect(`${formPath}?error=${encodeURIComponent("Add the gym grade, route colour, and route name.")}`);
  }

  try {
    await createRoute({
      gym_id: gymId,
      route_name: routeName,
      grade,
      colour,
      wall,
      setter,
      set_date: new Date().toISOString().slice(0, 10),
      styles,
    });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't add that route. Try again.";
    redirect(`${formPath}?error=${encodeURIComponent(message)}`, RedirectType.replace);
  }
  redirect(`${destination}?notice=${encodeURIComponent("Route added to this gym.")}`);
}

function isRouteColour(colour: string) {
  return ROUTE_COLOURS.some((option) => option.toLowerCase() === colour.toLowerCase());
}

function readRouteStyles(formData: FormData) {
  const requested = [formData.get("main_style"), ...formData.getAll("style")].map(String);
  return [...new Set(requested)].filter((style) =>
    ROUTE_STYLES.some((option) => option === style),
  );
}

export async function editRouteAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const gymId = Number(formData.get("gym_id"));
  const routeId = Number(formData.get("route_id"));
  const destination = `/gyms/${gymId}`;
  const formPath = `${destination}/routes/${routeId}/edit`;
  const routeName = String(formData.get("route_name") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const colour = String(formData.get("colour") ?? "").trim();

  if (!Number.isInteger(gymId) || gymId < 1 || !Number.isInteger(routeId) || routeId < 1 || !routeName || !grade || !isRouteColour(colour)) {
    redirect(`${Number.isInteger(gymId) && gymId > 0 && Number.isInteger(routeId) && routeId > 0 ? formPath : "/gyms"}?error=${encodeURIComponent("Add the gym grade, route colour, and route name.")}`);
  }

  try {
    const current = await getRoute(routeId);
    if (current.gym_id !== gymId) {
      throw new ApiError(400, "That route does not belong to this gym.");
    }
    await updateRoute(routeId, {
      route_name: routeName,
      grade,
      colour,
      wall: String(formData.get("wall") ?? "").trim(),
      setter: String(formData.get("setter") ?? "").trim(),
      styles: readRouteStyles(formData),
    });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "We couldn't save that route. Try again.";
    redirect(`${formPath}?error=${encodeURIComponent(message)}`, RedirectType.replace);
  }
  redirect(`${destination}?notice=${encodeURIComponent("Route updated.")}`);
}

export async function logAttemptAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const sessionId = Number(formData.get("session_id"));
  const routeId = Number(formData.get("route_id"));
  const intent = String(formData.get("intent") ?? "");
  const existingAttemptId = formData.get("attempt_id");

  if (!Number.isInteger(sessionId) || !Number.isInteger(routeId)) {
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent("Choose a route before logging an attempt.")}`);
  }

  if (!["attempt", "flash", "send", "zone"].includes(intent)) {
    redirect(`/sessions/${sessionId}?error=${encodeURIComponent("Choose an attempt action.")}`);
  }

  try {
    const [session, route, attempts] = await Promise.all([getSession(token, sessionId), getRoute(routeId), getSessionAttempts(token, sessionId)]);
    if (session.duration_minutes > 0 || route.status !== "active" || route.gym_id !== session.gym_id) {
      throw new ApiError(400, "This route can no longer be logged in this session.");
    }
    if (duplicateRouteIds(attempts).has(routeId)) throw new ApiError(409, "This route has conflicting logs. Please leave the records unchanged until they are resolved.");
    if (intent === "zone" && !route.is_competition) throw new ApiError(400, "Zone is only available for competition routes.");
    const current = attempts.find((attempt) => attempt.route_id === routeId);
    if (existingAttemptId && current?.id !== Number(existingAttemptId)) throw new ApiError(400, "That route log changed. Reload and try again.");
    if (intent === "flash") {
      const previous = routeProgress(await loadJournal(token), routeId, sessionId);
      if (!previous.complete || previous.ambiguous || previous.tried) throw new ApiError(400, "Flash eligibility could not be confirmed. Record this completion as a send instead.");
    }
    if (current) {
      if (intent === "flash" || current.result === "flash" || current.result === "send") throw new ApiError(400, "This route is already complete. Use correction to change its result.");
      await updateAttempt(token, current.id, intent === "send"
        ? { result: "send" }
        : { num_attempts: current.num_attempts + 1, result: intent === "zone" ? "zone" : current.result === "zone" ? "zone" : "project" });
    } else {
      await createAttempt(token, sessionId, { route_id: routeId, num_attempts: 1, result: intent === "flash" ? "flash" : intent === "send" ? "send" : intent === "zone" ? "zone" : "project" });
    }
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't save that attempt. Try again.";
    redirect(`/sessions/${sessionId}?route=${routeId}&error=${encodeURIComponent(message)}#route-${routeId}`);
  }

  revalidatePath("/", "layout");
  redirect(`/sessions/${sessionId}#route-${routeId}`);
}

export async function correctAttemptAction(formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const sessionId = Number(formData.get("session_id"));
  const routeId = Number(formData.get("route_id"));
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
      `/sessions/${sessionId}?route=${routeId}&sheet=correct-${routeId}&error=${encodeURIComponent("Choose a valid result and at least one attempt.")}`,
      RedirectType.replace,
    );
  }

  if (result === "flash" && numAttempts !== 1) {
    redirect(
      `/sessions/${sessionId}?route=${routeId}&sheet=correct-${routeId}&error=${encodeURIComponent("A flash must have exactly one attempt.")}`,
      RedirectType.replace,
    );
  }

  try {
    const current = await getAttempt(token, attemptId);
    const session = await getSession(token, sessionId);
    if (session.duration_minutes > 0) throw new ApiError(400, "Completed session results cannot be corrected here.");
    if (duplicateRouteIds(await getSessionAttempts(token, sessionId)).has(current.route_id)) throw new ApiError(409, "This route has conflicting logs. Please leave the records unchanged until they are resolved.");
    if (result === "flash") {
      const previous = routeProgress(await loadJournal(token), current.route_id, sessionId);
      if (!previous.complete || previous.ambiguous || previous.tried) throw new ApiError(400, "Earlier route history does not confirm a lifetime flash. Choose Send instead.");
    }
    if (current.session_id !== sessionId) {
      throw new ApiError(400, "That route log no longer matches this session. Reload and try again.");
    }
    if (result === "zone" && current.result !== "zone") {
      const route = await getRoute(current.route_id);
      if (!route.is_competition) throw new ApiError(400, "Zone is only available for competition routes.");
    }
    await updateAttempt(token, attemptId, {
      num_attempts: numAttempts,
      result,
    });
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "We couldn't save that correction. Try again.";
    redirect(`/sessions/${sessionId}?route=${routeId}&sheet=correct-${routeId}&error=${encodeURIComponent(message)}`, RedirectType.replace);
  }

  redirect(`/sessions/${sessionId}?notice=${encodeURIComponent("Route log corrected.")}`, RedirectType.replace);
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
    redirect(`/sessions/${sessionId}?sheet=end-session&error=${encodeURIComponent(message)}`, RedirectType.replace);
  }
  redirect("/sessions");
}

export async function saveAttemptNoteAction(previous: { status: "idle" | "saved" | "error"; message: string; notes: string }, formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");
  const sessionId = Number(formData.get("session_id"));
  const attemptId = Number(formData.get("attempt_id"));
  const notes = formData.get("notes");
  if (!Number.isInteger(sessionId) || sessionId < 1 || !Number.isInteger(attemptId) || attemptId < 1 || typeof notes !== "string") return { ...previous, status: "error" as const, message: "The note could not be saved. Reload this route and try again." };
  try {
    const current = await getAttempt(token, attemptId);
    await getSession(token, sessionId);
    if (current.session_id !== sessionId) throw new ApiError(400, "That route note does not belong to this session.");
    await updateAttempt(token, attemptId, { notes });
    revalidatePath("/", "layout");
    return { status: "saved" as const, message: "Private note saved.", notes };
  } catch (error) {
    return { ...previous, status: "error" as const, message: error instanceof ApiError ? error.message : "Your climb is saved, but the note could not be saved. Try again." };
  }
}
