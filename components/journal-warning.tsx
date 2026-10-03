import Link from "next/link";
import type { ReactNode } from "react";
import { FeedbackMessage } from "@/components/ui/feedback-message";

export function JournalWarning({ href, children }: { href: string; children?: ReactNode }) {
  return <FeedbackMessage>{children ?? "Some climbing records could not be loaded or have conflicting logs. Affected totals are unavailable."} <Link href={href} prefetch={false} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Try again</Link></FeedbackMessage>;
}
