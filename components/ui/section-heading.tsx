import type { ReactNode } from "react";

export function SectionHeading({
  id,
  children,
  aside,
}: {
  id?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
        {children}
      </h2>
      {aside ? <div className="shrink-0 text-sm text-ink-muted">{aside}</div> : null}
    </div>
  );
}
