"use client";

import { useState, type ReactNode } from "react";

export type MonthGroup = { key: string; label: string; meta: string; content: ReactNode };

/** Recent months first; older months load in steps instead of one endless list. */
export function MonthGroups({ months, step = 3 }: { months: MonthGroup[]; step?: number }) {
  const [shown, setShown] = useState(step);
  const hidden = months.length - shown;
  return (
    <div className="flex flex-col gap-5">
      {months.slice(0, shown).map((month) => (
        <section key={month.key} aria-labelledby={`month-${month.key}`}>
          <div className="sticky top-0 z-[1] flex items-baseline justify-between gap-3 border-b border-ink bg-bg pb-2 pt-3">
            <h3 id={`month-${month.key}`} className="font-display text-xl font-extrabold uppercase leading-none text-ink">{month.label}</h3>
            <span className="text-xs font-semibold text-ink-muted">{month.meta}</span>
          </div>
          {month.content}
        </section>
      ))}
      {hidden > 0 ? (
        <button type="button" onClick={() => setShown((count) => count + step)} className="button-feedback min-h-12 rounded-full border border-hairline text-sm font-bold text-ink">
          Show earlier months <span className="font-semibold text-ink-muted">({hidden} more)</span>
        </button>
      ) : null}
    </div>
  );
}
