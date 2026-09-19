import { loginAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { SlideTextButton } from "@/components/kokonutui/slide-text-button";
import { AuthHeading } from "@/components/auth-heading";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField } from "@/components/ui/form-field";
import { buttonStyles } from "@/components/ui/button";
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

      {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}

      <form action={loginAction} className="auth-form flex flex-col gap-4">
        <InputField label="Email" type="email" name="email" autoComplete="email" required />
        <InputField label="Password" type="password" name="password" autoComplete="current-password" required />
        <SubmitButton
          type="submit"
          pendingLabel="Logging in"
          className={buttonStyles({ className: "mt-2 w-full" })}
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
