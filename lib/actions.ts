"use server";

import { redirect } from "next/navigation";
import { ApiError, loginUser, registerUser } from "@/lib/api";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

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
