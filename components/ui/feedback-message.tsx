import type { ReactNode } from "react";

/**
 * Inline message for problems the climber must act on (validation, failed saves, partial data).
 * It sits in the page flow next to what failed and stays until the problem is fixed.
 * Passing successes ("Route added") belong in the Snackbar, not here.
 */
export function FeedbackMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent-tint-ink">
      {children}
    </p>
  );
}
