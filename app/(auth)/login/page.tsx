import { loginAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { SlideTextButton } from "@/components/kokonutui/slide-text-button";
import { AuthHeading } from "@/components/auth-heading";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <AuthHeading />

      {error ? (
        <p className="rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent-tint-ink">
          {error}
        </p>
      ) : null}

      <form action={loginAction} className="auth-form flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <SubmitButton
          type="submit"
          pendingLabel="Logging in"
          className="mt-2 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink"
        >
          Log in
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-ink-muted">
        New to Bouldy?{" "}
        <SlideTextButton href="/signup" text="Sign up" hoverText="Let’s go" />
      </p>
      <Link href="/welcome" className="text-center text-xs text-ink-muted underline underline-offset-4">Meet Bouldy</Link>
    </main>
  );
}
