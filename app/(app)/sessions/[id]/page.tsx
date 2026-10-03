import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getGym,
  getGymRoutes,
  getRoutes,
  getSession,
  getSessionAttempts,
  type Attempt,
  type Route,
} from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { correctAttemptAction, endSessionAction, logAttemptAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { RESULT_META } from "@/components/result-badge";
import { AttemptNote } from "@/components/attempt-note";
import { JournalWarning } from "@/components/journal-warning";
import { RouteHold } from "@/components/route-hold";
import { RouteBrowser, type BrowserItem } from "@/components/route-browser";
import { browserItem, ResultPill, routeMeta, SessionRouteRow, triesLabel } from "@/components/route-rows";
import { loadJournal } from "@/lib/journal";
import { duplicateRouteIds, journalComplete, routeProgress, type Journal } from "@/lib/journal-summary";
import { BottomSheet, SheetTrigger } from "@/components/ui/bottom-sheet";
import { buttonStyles } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField, SelectField } from "@/components/ui/form-field";

type SessionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; route?: string; sheet?: string }>;
};

type RouteState = {
  route: Route;
  attempt?: Attempt;
  ambiguous: boolean;
  previous: ReturnType<typeof routeProgress>;
  project: boolean;
};

function statusText({ route, attempt, ambiguous, previous, project }: RouteState, isEnded: boolean) {
  const retired = route.status === "retired" ? " · Retired" : "";
  if (ambiguous) return "Conflicting logs";
  if (attempt?.result === "flash") return `Flashed${retired}`;
  if (attempt?.result === "send") return `Sent · ${triesLabel(attempt.num_attempts)}${retired}`;
  if (attempt?.result === "zone") return `Zone · ${triesLabel(attempt.num_attempts)}${retired}`;
  if (attempt) return `${triesLabel(attempt.num_attempts)}${isEnded ? "" : " today"}${retired}`;
  if (previous.sent) return "Sent before";
  if (project && previous.total !== null) return `Project · ${triesLabel(previous.total)} before`;
  return routeMeta(route) || "Not tried yet";
}

function RouteSheet({ state, sessionId, isEnded, error, sheet }: { state: RouteState; sessionId: number; isEnded: boolean; error?: string; sheet?: string }) {
  const { route, attempt, ambiguous, previous } = state;
  const id = `route-${route.id}`;
  const completed = attempt?.result === "flash" || attempt?.result === "send";
  const loggable = !isEnded && route.status === "active" && !completed && !ambiguous;
  const flashAllowed = previous.complete && !previous.ambiguous && !previous.tried;
  const completeIntent = attempt || !flashAllowed ? "send" : "flash";
  const intents = ["attempt", completeIntent, ...(route.is_competition ? ["zone"] : [])] as const;
  const correctable = attempt && !isEnded && !ambiguous;

  return (
    <BottomSheet id={id} title={`${route.grade} · ${route.colour || "Route"}`}>
      <div className="flex flex-col gap-4">
        {sheet === id && error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
        <div className="flex items-center gap-3">
          <RouteHold colour={route.colour} routeName={route.route_name} className="h-14 w-14 shrink-0" />
          <div className="min-w-0">
            <p className="break-words text-base font-semibold leading-snug text-ink">{route.route_name}</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">{[route.wall, route.setter ? `Set by ${route.setter}` : null, route.status === "retired" ? "Retired route" : null].filter(Boolean).join(" · ") || "No wall or setter recorded"}</p>
          </div>
        </div>
        {route.styles.length ? <div className="-mt-1 flex flex-wrap gap-1.5">{route.styles.map((style) => <span key={style} className="rounded-full bg-[oklch(0.94_0.002_0)] px-2.5 py-1 text-xs font-semibold text-ink-muted">{style}</span>)}</div> : null}

        <dl className="grid grid-cols-2 gap-3 border-y border-hairline py-3">
          <div>
            <dt className="text-xs font-semibold text-ink-muted">{isEnded ? "This visit" : "Today"}</dt>
            <dd className="mt-1 flex items-center gap-2 font-display text-2xl font-bold leading-none text-ink">
              {ambiguous ? "—" : attempt?.num_attempts ?? 0}
              {attempt && !ambiguous ? <ResultPill result={attempt.result} className="font-sans" /> : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-muted">Earlier visits</dt>
            <dd className="mt-1 font-display text-2xl font-bold leading-none text-ink">{previous.total ?? "—"}<span className="ml-1.5 font-sans text-xs font-semibold text-ink-muted">{previous.total === null ? "unavailable" : previous.sent ? "sent before" : previous.tried ? "tries" : "new to you"}</span></dd>
          </div>
        </dl>

        {ambiguous ? <p role="alert" className="text-sm leading-6 text-accent-strong">Conflicting logs for this route. Review the source records in route history; logging and corrections are paused.</p> : null}

        {loggable ? (
          <div className={`grid gap-2 ${intents.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {intents.map((intent) => (
              <form key={intent} action={logAttemptAction}>
                <input type="hidden" name="session_id" value={sessionId} />
                <input type="hidden" name="route_id" value={route.id} />
                <input type="hidden" name="intent" value={intent} />
                {attempt ? <input type="hidden" name="attempt_id" value={attempt.id} /> : null}
                <SubmitButton
                  type="submit"
                  pendingLabel="Saving"
                  className={`min-h-12 w-full rounded-xl px-3 text-sm font-bold ${intent === "flash" ? "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" : intent === "send" ? "bg-panel text-panel-ink" : "bg-[oklch(0.94_0.002_0)] text-ink"}`}
                >
                  {intent === "flash" ? "⚡ Flash" : intent === "send" ? "Sent" : intent === "zone" ? "Zone" : "+1 try"}
                </SubmitButton>
              </form>
            ))}
          </div>
        ) : null}
        {loggable && !attempt ? <p className="-mt-2 text-xs leading-5 text-ink-muted">{flashAllowed ? "Flash is only offered on your first ever try." : previous.complete ? "You've tried this before, so a first-go send counts as Sent." : "Flash is unavailable until your full history loads."}</p> : null}
        {!isEnded && completed ? <p className="text-sm text-ink-muted">Route complete. Use Correct this log to change the result.</p> : null}

        {correctable ? (
          <details className="group border-t border-hairline pt-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              Correct this log
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2 text-ink-muted group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <form action={correctAttemptAction} className="flex flex-col gap-3 pb-1 pt-2">
              <input type="hidden" name="session_id" value={sessionId} />
              <input type="hidden" name="attempt_id" value={attempt.id} />
              <input type="hidden" name="route_id" value={route.id} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Result" compact name="result" defaultValue={attempt.result}>
                  {Object.entries(RESULT_META).filter(([result]) => (result !== "zone" || route.is_competition || attempt.result === "zone") && (result !== "flash" || flashAllowed || attempt.result === "flash")).map(([result, meta]) => (
                    <option key={result} value={result}>{meta.label}</option>
                  ))}
                </SelectField>
                <InputField label="Attempts" compact type="number" name="num_attempts" min={1} defaultValue={attempt.num_attempts} />
              </div>
              <p className="text-xs leading-5 text-ink-muted">A flash is always one attempt. Corrections don&apos;t add another try.</p>
              <SubmitButton type="submit" pendingLabel="Saving correction" className={buttonStyles({ variant: "dark" })}>Save correction</SubmitButton>
            </form>
          </details>
        ) : null}

        {attempt && !ambiguous ? <AttemptNote attemptId={attempt.id} sessionId={sessionId} notes={attempt.notes} inline /> : null}

        <Link href={`/routes/${route.id}?from=${sessionId}`} className="flex min-h-12 items-center justify-between border-t border-hairline pt-1 text-sm font-semibold text-ink">
          Your route history
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
        </Link>
      </div>
    </BottomSheet>
  );
}

function routeStates(routes: Route[], attempts: Attempt[], journal: Journal, sessionId: number, isEnded: boolean): RouteState[] {
  const duplicateIds = duplicateRouteIds(attempts);
  const attemptByRoute = new Map(attempts.map((attempt) => [attempt.route_id, attempt]));
  const historyLoaded = journalComplete(journal);
  return routes.map((route) => {
    const attempt = attemptByRoute.get(route.id);
    const ambiguous = duplicateIds.has(route.id);
    const previous = routeProgress(journal, route.id, sessionId);
    const completed = attempt?.result === "send" || attempt?.result === "flash";
    const project = !isEnded && historyLoaded && route.status === "active" && previous.tried && !previous.sent && !previous.ambiguous && !completed;
    return { route, attempt: ambiguous ? undefined : attempt, ambiguous, previous, project };
  });
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const [{ id }, { error, sheet }] = await Promise.all([params, searchParams]);
  const sessionId = Number(id);
  const token = await getSessionToken();
  if (!token) redirect("/welcome");
  if (!Number.isInteger(sessionId) || sessionId < 1) redirect("/sessions");

  const session = await getSession(token, sessionId);
  const isEnded = session.duration_minutes > 0;
  const [gym, gymRoutes, allRoutes, attempts, journal] = await Promise.all([
    getGym(session.gym_id),
    getGymRoutes(session.gym_id),
    getRoutes(),
    getSessionAttempts(token, sessionId),
    loadJournal(token),
  ]);
  const loggedIds = new Set(attempts.map((attempt) => attempt.route_id));
  const routeById = new Map(gymRoutes.map((route) => [route.id, route]));
  for (const route of allRoutes) {
    if (route.gym_id === session.gym_id) routeById.set(route.id, route);
  }
  // A finished visit is reviewed by what was logged; a live one shows the whole wall.
  const visibleRoutes = [...routeById.values()].filter((route) => (isEnded ? loggedIds.has(route.id) : route.status === "active" || loggedIds.has(route.id)));
  const states = routeStates(visibleRoutes, attempts, journal, sessionId, isEnded);
  const duplicateIds = duplicateRouteIds(attempts);
  const sends = attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length;
  const flashes = attempts.filter((attempt) => attempt.result === "flash").length;

  const items: BrowserItem[] = states.map((state) => {
    const { route, attempt, ambiguous, previous } = state;
    const completed = attempt?.result === "send" || attempt?.result === "flash";
    // Live filters are lifetime progress: "new" routes are the flash candidates.
    const status = isEnded
      ? attempt?.result === "flash" ? "flash" : attempt?.result === "send" ? "sent" : "progress"
      : completed || previous.sent ? "sent" : attempt || ambiguous || previous.tried ? "project" : "new";
    return browserItem(
      route,
      <SessionRouteRow
        route={route}
        sessionId={sessionId}
        attempt={attempt}
        status={statusText(state, isEnded)}
        logAction={!isEnded && route.status === "active" && !completed && !ambiguous ? logAttemptAction : undefined}
      />,
      { status, pinned: !isEnded && loggedIds.has(route.id) },
    );
  });

  return (
    <>
    <ScreenHeader href="/sessions" label="Sessions" />
    <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">{gym.name}</h1>
          <p className="mt-2 text-sm text-ink-muted">{session.session_date}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${isEnded ? "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" : "bg-accent-tint text-accent-tint-ink"}`}>
          {isEnded ? "Complete" : "Live session"}
        </span>
      </header>

      {error && !sheet ? <FeedbackMessage>{error}</FeedbackMessage> : null}

      <section className="rounded-2xl bg-panel px-5 py-5 text-panel-ink" aria-label="Session summary">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">{isEnded ? "THIS VISIT" : "TODAY'S LOG"}</p>
            <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">{loggedIds.size} route{loggedIds.size === 1 ? "" : "s"}</p>
          </div>
          <p className="text-right text-sm text-panel-ink-muted">{isEnded ? `${session.duration_minutes} min` : "Still climbing"}</p>
        </div>
        <dl className="mt-5 flex gap-6 border-t border-panel-track pt-4">
          <div><dd className="font-display text-2xl font-bold leading-none">{duplicateIds.size ? "—" : sends}</dd><dt className="mt-1 text-xs text-panel-ink-muted">Sends</dt></div>
          <div><dd className="font-display text-2xl font-bold leading-none text-accent">⚡ {duplicateIds.size ? "—" : flashes}</dd><dt className="mt-1 text-xs text-panel-ink-muted">Flashes</dt></div>
        </dl>
      </section>

      {!journalComplete(journal) ? <JournalWarning href={`/sessions/${sessionId}`}>Earlier visits could not all be loaded. Project suggestions and lifetime flash eligibility are unavailable.</JournalWarning> : null}

      <section aria-labelledby="route-list">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-ink-muted">{isEnded ? "Logged this visit" : `${items.length} routes at ${gym.name}`}</p>
            <h2 id="route-list" className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">{isEnded ? "Session review" : "Route log"}</h2>
          </div>
          {!isEnded ? (
            <Link href={`/sessions/${sessionId}/routes/new`} className={buttonStyles({ variant: "soft", size: "sm", className: "shrink-0 gap-1.5 rounded-full" })}>
              <span aria-hidden="true" className="text-lg leading-none">+</span> Add route
            </Link>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="mt-4 max-w-[34ch] text-sm leading-6 text-ink-muted">{isEnded ? "No routes were logged in this visit." : "No active routes are listed for this gym yet. Add one to start logging it."}</p>
        ) : (
          <div className="mt-3">
            <RouteBrowser
              items={items}
              storageKey={`session-${sessionId}`}
              statusOptions={isEnded
                ? [{ value: "flash", label: "Flash" }, { value: "sent", label: "Sent" }, { value: "progress", label: "Project" }]
                : [{ value: "new", label: "New to you" }, { value: "project", label: "Projects" }, { value: "sent", label: "Sent" }]}
              doneStatuses={["sent", "flash"]}
              pinnedTitle="Today"
            />
          </div>
        )}
      </section>

      {!isEnded ? (
        <SheetTrigger id="end-session" className={buttonStyles({ variant: "dark", className: "w-full" })}>End session</SheetTrigger>
      ) : (
        <Link href="/sessions" className={buttonStyles()}>Back to sessions</Link>
      )}

      {!isEnded ? (
        <BottomSheet id="end-session" title="End session">
          <form action={endSessionAction} className="flex flex-col gap-4">
            {sheet === "end-session" && error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
            <p className="text-sm leading-6 text-ink-muted">{sends} {sends === 1 ? "send" : "sends"} logged so far. Ending locks the session length.</p>
            <input type="hidden" name="session_id" value={sessionId} />
            <InputField label="Session length (minutes)" type="number" name="duration_minutes" min={1} defaultValue={60} />
            <SubmitButton type="submit" pendingLabel="Ending session" className={buttonStyles({ variant: "dark" })}>End session</SubmitButton>
          </form>
        </BottomSheet>
      ) : null}

      {states.map((state) => (
        <RouteSheet key={`${state.route.id}-${state.attempt?.id ?? "new"}-${state.attempt?.num_attempts ?? 0}-${state.attempt?.result ?? ""}`} state={state} sessionId={sessionId} isEnded={isEnded} error={error} sheet={sheet} />
      ))}
    </main>
    </>
  );
}
