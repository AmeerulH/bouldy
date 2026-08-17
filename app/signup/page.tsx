import Link from "next/link";
import { signupAction } from "@/lib/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-col justify-center gap-8 px-6 py-10">
      <div>
        <p className="text-xs font-medium tracking-wide text-ink-faint">
          Bouldy
        </p>
        <h1 className="font-display text-3xl font-extrabold uppercase leading-none text-ink">
          Climb your limits
        </h1>
      </div>

      {error ? (
        <p className="rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent-tint-ink">
          {error}
        </p>
      ) : null}

      <form action={signupAction} className="flex flex-col gap-4">
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
        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink"
        >
          Create account
        </button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        Already climbing with us?{" "}
        <Link href="/login" className="font-semibold text-ink">
          Log in
        </Link>
      </p>
    </div>
  );
}
