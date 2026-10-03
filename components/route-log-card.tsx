"use client";
import { useState, type ReactNode } from "react";
import type { Attempt, Route } from "@/lib/api";
import { RouteHold } from "@/components/route-hold";
import { ResultBadge } from "@/components/result-badge";

export function RouteLogCard({ route, attempt, forceOpen = false, ambiguous = false, children }: { route: Route; attempt?: Attempt; forceOpen?: boolean; ambiguous?: boolean; children: ReactNode }) {
  const completed = attempt?.result === "send" || attempt?.result === "flash";
  const [expanded, setExpanded] = useState(forceOpen);
  const open = !completed || expanded;
  const detailsId = `route-details-${route.id}`;
  const identity = <>
    <RouteHold colour={route.colour} routeName={route.route_name} className={completed ? "h-11 w-11 shrink-0" : "h-16 w-16 shrink-0"} />
    <div className="min-w-0 flex-1 text-left">
      <h3 className="font-display text-2xl font-extrabold uppercase leading-none text-ink">{route.grade}<span className="ml-2 font-sans text-xs font-semibold normal-case text-ink-muted">{route.colour || "Colour unknown"}</span></h3>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{route.route_name}</p>
    </div>
    <div className="shrink-0 text-right">
      {attempt ? <ResultBadge result={attempt.result} /> : <span className="text-xs text-ink-muted">{ambiguous ? "Conflicting logs" : "Not logged"}</span>}
      {attempt ? <p className="mt-1 text-xs tabular-nums text-ink-muted">{attempt.num_attempts} {attempt.num_attempts === 1 ? "try" : "tries"}</p> : null}
    </div>
  </>;
  return <article id={`route-${route.id}`} className="scroll-mt-5 rounded-2xl border border-hairline bg-bg p-4">
    {completed ? <button type="button" aria-expanded={open} aria-controls={detailsId} aria-label={`${open ? "Collapse" : "Expand"} ${route.route_name}, grade ${route.grade}, ${route.colour || "colour unknown"}, ${attempt?.result}, ${attempt?.num_attempts} ${attempt?.num_attempts === 1 ? "try" : "tries"}`} onClick={() => setExpanded(!expanded)} className="flex min-h-11 w-full items-center gap-3 rounded-xl">
      {identity}<svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-muted ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
    </button> : <div className="flex items-center gap-3">{identity}</div>}
    <div id={detailsId} hidden={!open}>
      {route.wall || route.status === "retired" ? <p className="mt-3 text-xs text-ink-muted">{route.wall}{route.status === "retired" ? " · Retired route" : ""}</p> : null}
      {route.styles.length ? <div className="mt-3 flex flex-wrap gap-1.5">{route.styles.map((style) => <span key={style} className="rounded-full bg-[oklch(0.93_0.002_0)] px-2.5 py-1 text-xs font-semibold text-ink-muted">{style}</span>)}</div> : null}
      {route.setter ? <p className="mt-2 text-xs text-ink-muted">Set by {route.setter}</p> : null}
      {children}
    </div>
  </article>;
}
