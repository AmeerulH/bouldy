import { signupAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { SlideTextButton } from "@/components/kokonutui/slide-text-button";
import { AuthHeading } from "@/components/auth-heading";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField } from "@/components/ui/form-field";
import { buttonStyles } from "@/components/ui/button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <AuthHeading signup />

      {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}

      <form action={signupAction} className="auth-form flex flex-col gap-4">
        <InputField label="Username" type="text" name="username" autoComplete="username" required />
        <InputField label="Email" type="email" name="email" autoComplete="email" required />
        <InputField label="Password" type="password" name="password" autoComplete="new-password" required />
        <InputField label={<>Current grade <span className="text-ink-faint">(optional)</span></>} type="text" name="current_grade" placeholder="V4" />
        <SubmitButton
          type="submit"
          pendingLabel="Creating account"
          className={buttonStyles({ className: "mt-2 w-full" })}
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
