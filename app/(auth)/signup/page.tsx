import { signupAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { SlideTextButton } from "@/components/kokonutui/slide-text-button";
import { AuthHeading } from "@/components/auth-heading";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <AuthHeading signup />

      {error ? (
        <p className="rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent-tint-ink">
          {error}
        </p>
      ) : null}

      <form action={signupAction} className="auth-form flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">Username</span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            required
            className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
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
            autoComplete="new-password"
            required
            className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">
            Current grade <span className="text-ink-faint">(optional)</span>
          </span>
          <input
            type="text"
            name="current_grade"
            placeholder="V4"
            className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
        </label>
        <SubmitButton
          type="submit"
          pendingLabel="Creating account"
          className="mt-2 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink"
        >
          Create account
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-ink-muted">
        Already climbing with us?{" "}
        <SlideTextButton href="/login" text="Log in" hoverText="Welcome back" />
      </p>
    </main>
  );
}
