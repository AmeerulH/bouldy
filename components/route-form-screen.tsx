import type { ReactNode } from "react";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { ScreenHeader } from "@/components/ui/screen-header";

type RouteFormScreenProps = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle: string;
  error?: string;
  children: ReactNode;
};

/** Full-screen page chrome for route forms. The form supplies its own sticky Save bar. */
export function RouteFormScreen({ backHref, backLabel, title, subtitle, error, children }: RouteFormScreenProps) {
  return (
    <>
      <ScreenHeader href={backHref} label={backLabel} />
      <main id="main-content" className="flex flex-col gap-5 px-5 pt-5">
        <header>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">{title}</h1>
          <p className="mt-2 break-words text-sm text-ink-muted">{subtitle}</p>
        </header>
        {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
        {children}
      </main>
    </>
  );
}
