import Link from "next/link";
import type { ReactNode } from "react";

type ScreenHeaderProps = {
  /** Explicit parent route; back navigation is deterministic after saves and redirects. */
  href: string;
  /** Name of the parent screen, shown beside the chevron. */
  label: string;
  action?: ReactNode;
};

/** Sticky top bar for pushed screens. Primary tabs do not use it. */
export function ScreenHeader({ href, label, action }: ScreenHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex min-h-14 items-center justify-between gap-2 border-b border-hairline bg-bg px-3">
      <Link href={href} aria-label={`Back to ${label}`} className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-full pr-3 text-sm font-semibold text-ink">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 6-6 6 6 6" />
        </svg>
        <span className="truncate">{label}</span>
      </Link>
      {action}
    </div>
  );
}
