import Link from "next/link";
import type { ReactNode } from "react";
import type { Attempt, AttemptResult, Route } from "@/lib/api";
import { RouteHold } from "@/components/route-hold";
import { RESULT_META } from "@/components/result-badge";
import { SubmitButton } from "@/components/submit-button";
import { SheetTrigger } from "@/components/ui/bottom-sheet";
import type { BrowserItem } from "@/components/route-browser";

const chevron = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
);

export function routeMeta(route: Route) {
  return [route.wall, ...route.styles.slice(0, 2)].filter(Boolean).join(" · ");
}

export function browserItem(route: Route, row: ReactNode, extra: Partial<BrowserItem> = {}): BrowserItem {
  return {
    id: route.id,
    grade: route.grade,
    colour: route.colour,
    name: route.route_name,
    wall: route.wall,
    setter: route.setter,
    styles: route.styles,
    row,
    ...extra,
  };
}

export function triesLabel(count: number) {
  return `${count} ${count === 1 ? "try" : "tries"}`;
}

/** Compact 64px route identity: hold, grade, colour, name, one line of context. */
export function RouteIdentity({ route, meta }: { route: Route; meta?: ReactNode }) {
  return (
    <>
      <RouteHold colour={route.colour} routeName={route.route_name} className="h-10 w-10 shrink-0" />
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-baseline gap-2">
          <span className="shrink-0 font-display text-xl font-extrabold uppercase leading-none text-ink">{route.grade}</span>
          <span className="truncate text-xs font-semibold text-ink-muted">{route.colour || "Colour unrecorded"}</span>
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-ink">{route.route_name}</span>
        {meta ? <span className="block truncate text-xs text-ink-muted">{meta}</span> : null}
      </span>
    </>
  );
}

export function ResultPill({ result, className = "" }: { result: AttemptResult; className?: string }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${RESULT_META[result].className} ${className}`}>{RESULT_META[result].label}</span>;
}

export function GymRouteRow({ route, gymId }: { route: Route; gymId: number }) {
  return (
    <Link
      href={`/gyms/${gymId}/routes/${route.id}/edit`}
      aria-label={`Edit route: ${route.grade}, ${route.route_name}`}
      className="button-feedback flex min-h-16 items-center gap-3 py-2.5"
    >
      <RouteIdentity route={route} meta={routeMeta(route) || (route.setter ? `Set by ${route.setter}` : null)} />
      <span aria-hidden="true" className="flex shrink-0 items-center gap-1 text-xs font-bold text-accent">Edit {chevron}</span>
    </Link>
  );
}

type SessionRouteRowProps = {
  route: Route;
  sessionId: number;
  attempt?: Attempt;
  status: ReactNode;
  /** Server action for the quick "+1"; omitted when the route can't be logged. */
  logAction?: (formData: FormData) => void | Promise<void>;
};

/** Tap the row for the route sheet; the trailing button logs one more try without leaving the list. */
export function SessionRouteRow({ route, sessionId, attempt, status, logAction }: SessionRouteRowProps) {
  const completed = attempt?.result === "send" || attempt?.result === "flash";
  return (
    <div id={`route-${route.id}`} className="flex scroll-mt-44 items-center gap-2">
      <SheetTrigger id={`route-${route.id}`} className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5">
        <RouteIdentity route={route} meta={status} />
      </SheetTrigger>
      {completed && attempt ? <ResultPill result={attempt.result} /> : null}
      {logAction ? (
        <form action={logAction} className="shrink-0">
          <input type="hidden" name="session_id" value={sessionId} />
          <input type="hidden" name="route_id" value={route.id} />
          <input type="hidden" name="intent" value="attempt" />
          {attempt ? <input type="hidden" name="attempt_id" value={attempt.id} /> : null}
          <SubmitButton
            type="submit"
            pendingLabel=""
            aria-label={`Log a try on ${route.grade} ${route.route_name}`}
            className="relative grid h-11 min-w-14 place-items-center rounded-full bg-[oklch(0.94_0.002_0)] px-3 font-display text-lg font-bold leading-none text-ink"
          >
            +1
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

type ClimbRowProps = {
  route: Route;
  best: AttemptResult;
  tries: number | null;
  visits: number;
};

export function ClimbRow({ route, best, tries, visits }: ClimbRowProps) {
  const detail = [tries === null ? "Tries unavailable" : triesLabel(tries), `${visits} ${visits === 1 ? "visit" : "visits"}`, route.status === "retired" ? "Retired" : null].filter(Boolean).join(" · ");
  return (
    <Link href={`/routes/${route.id}?from=climbs`} className="button-feedback flex min-h-16 items-center gap-3 py-2.5">
      <RouteIdentity route={route} meta={detail} />
      <ResultPill result={best} />
      {chevron}
    </Link>
  );
}
