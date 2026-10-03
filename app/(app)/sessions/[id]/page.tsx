import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getGym,
  getGymRoutes,
  getRoutes,
  getSession,
  getSessionAttempts,
  type Attempt,
} from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { correctAttemptAction, endSessionAction, logAttemptAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { RouteLogCard } from "@/components/route-log-card";
import { RESULT_META } from "@/components/result-badge";
import { AttemptNote } from "@/components/attempt-note";
import { JournalWarning } from "@/components/journal-warning";
import { loadJournal } from "@/lib/journal";
import { duplicateRouteIds, journalComplete, routeProgress } from "@/lib/journal-summary";
import { BottomSheet, SheetTrigger } from "@/components/ui/bottom-sheet";
import { buttonStyles } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField, SelectField } from "@/components/ui/form-field";

type SessionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string; route?: string; sheet?: string }>;
};

function statusSummary(attempt: Attempt | undefined) {
  if (!attempt) return "Not logged";
  return `${attempt.num_attempts} ${attempt.num_attempts === 1 ? "attempt" : "attempts"}`;
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const [{ id }, { error, notice, route: errorRoute, sheet }] = await Promise.all([params, searchParams]);
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
  const attemptByRoute = new Map<number, Attempt>();
  for (const attempt of attempts) attemptByRoute.set(attempt.route_id, attempt);

  const routeById = new Map(gymRoutes.map((route) => [route.id, route]));
  for (const route of allRoutes) {
    if (route.gym_id === session.gym_id) routeById.set(route.id, route);
  }
  const visibleRoutes = [...routeById.values()].filter(
    (route) => route.status === "active" || attemptByRoute.has(route.id),
  );
  const duplicateIds = duplicateRouteIds(attempts);
  const projects = journalComplete(journal) ? visibleRoutes.filter((route) => {
    const previous = routeProgress(journal, route.id, sessionId);
    return route.status === "active" && previous.tried && !previous.sent && !previous.ambiguous && !["send", "flash"].includes(attemptByRoute.get(route.id)?.result ?? "");
  }) : [];
  const sends = attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length;
  const flashes = attempts.filter((attempt) => attempt.result === "flash").length;

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
      {notice ? <FeedbackMessage tone="success">{notice}</FeedbackMessage> : null}

      <section className="rounded-2xl bg-panel px-5 py-5 text-panel-ink" aria-label="Session summary">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">TODAY&apos;S LOG</p>
            <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">{new Set(attempts.map((attempt) => attempt.route_id)).size} route{new Set(attempts.map((attempt) => attempt.route_id)).size === 1 ? "" : "s"}</p>
          </div>
          <p className="text-right text-sm text-panel-ink-muted">{isEnded ? `${session.duration_minutes} min` : "Still climbing"}</p>
        </div>
        <dl className="mt-5 flex gap-6 border-t border-panel-track pt-4">
          <div><dd className="font-display text-2xl font-bold leading-none">{duplicateIds.size ? "—" : sends}</dd><dt className="mt-1 text-xs text-panel-ink-muted">Sends</dt></div>
          <div><dd className="font-display text-2xl font-bold leading-none text-accent">⚡ {duplicateIds.size ? "—" : flashes}</dd><dt className="mt-1 text-xs text-panel-ink-muted">Flashes</dt></div>
        </dl>
      </section>

      {!journalComplete(journal) ? <JournalWarning href={`/sessions/${sessionId}`}>Earlier visits could not all be loaded. Project suggestions and lifetime flash eligibility are unavailable.</JournalWarning> : null}
      {!isEnded && projects.length ? <section aria-labelledby="continue-projects">
        <h2 id="continue-projects" className="font-display text-2xl font-extrabold uppercase leading-none text-ink">Pick up where you left off</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">Previous tries stay in your journal. Log only new tries today.</p>
        <div className="mt-3 divide-y divide-hairline border-y border-hairline">{projects.map((route) => <a key={route.id} href={`#route-${route.id}`} className="flex min-h-14 items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0 truncate font-semibold text-ink">{route.grade} · {route.route_name}</span><span className="shrink-0 tabular-nums text-ink-muted">{routeProgress(journal, route.id, sessionId).total} previous tries</span></a>)}</div>
      </section> : null}

      <section aria-labelledby="route-list">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-ink-muted">Active routes at {gym.name}</p>
            <h2 id="route-list" className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">Route log</h2>
          </div>
          {!isEnded ? <span className="text-xs font-semibold text-accent">Track each try</span> : null}
        </div>

        {visibleRoutes.length === 0 ? (
          <p className="mt-4 max-w-[34ch] text-sm leading-6 text-ink-muted">No active routes are listed for this gym yet. Add one below to start logging it.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {visibleRoutes.map((route) => {
              const attempt = attemptByRoute.get(route.id);
              const completed = attempt?.result === "flash" || attempt?.result === "send";
              const retired = route.status === "retired";
              return (
                <RouteLogCard key={`${route.id}-${attempt?.result ?? "new"}-${errorRoute === String(route.id) ? error : ""}`} route={route} attempt={duplicateIds.has(route.id) ? undefined : attempt} ambiguous={duplicateIds.has(route.id)} forceOpen={errorRoute === String(route.id)}>
                  <Link href={`/routes/${route.id}?from=${sessionId}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent-strong underline underline-offset-4">Your route history</Link>
                  {routeProgress(journal, route.id, sessionId).tried ? <p className="text-xs leading-5 text-ink-muted">Previous visits: {routeProgress(journal, route.id, sessionId).total ?? "total unavailable"} tries · this session: {duplicateIds.has(route.id) ? "unavailable" : attempt?.num_attempts ?? 0} tries</p> : null}
                  {duplicateIds.has(route.id) ? <p role="alert" className="mt-3 text-sm leading-6 text-accent-strong">Conflicting logs for this route. Review the source records in route history; logging and corrections are paused.</p> : null}
                  {!isEnded && !retired && !completed && !duplicateIds.has(route.id) ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3">
                      {(["attempt", attempt || !routeProgress(journal, route.id, sessionId).complete || routeProgress(journal, route.id, sessionId).ambiguous || routeProgress(journal, route.id, sessionId).tried ? "send" : "flash", ...(route.is_competition ? ["zone"] : [])] as const).map((intent) => (
                        <form key={intent} action={logAttemptAction}>
                          <input type="hidden" name="session_id" value={sessionId} />
                          <input type="hidden" name="route_id" value={route.id} />
                          <input type="hidden" name="intent" value={intent} />
                          {attempt ? <input type="hidden" name="attempt_id" value={attempt.id} /> : null}
                          <SubmitButton
                            type="submit"
                            pendingLabel="Saving"
                            className={`min-h-11 w-full rounded-xl px-3 text-sm font-bold ${intent === "flash" ? "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" : intent === "send" ? "bg-panel text-panel-ink" : "bg-[oklch(0.93_0.002_0)] text-ink"}`}
                          >
                            {intent === "flash" ? "⚡ Flash" : intent === "send" ? "Sent" : intent === "zone" ? "Reached zone" : "Log attempt"}
                          </SubmitButton>
                        </form>
                      ))}
                    </div>
                  ) : null}
                  {attempt && !isEnded && completed ? <p className="mt-4 border-t border-hairline pt-3 text-xs text-ink-muted">Route complete · {statusSummary(attempt)}</p> : null}
                  {attempt && !isEnded && !duplicateIds.has(route.id) ? (
                    <div className="mt-3 border-t border-hairline pt-1">
                      <SheetTrigger id={`correct-${route.id}`} className="min-h-11 text-sm font-semibold text-ink-muted underline underline-offset-4">
                        Correct this route log
                      </SheetTrigger>
                    </div>
                  ) : null}
                  {attempt && !duplicateIds.has(route.id) ? <AttemptNote attemptId={attempt.id} sessionId={sessionId} notes={attempt.notes} /> : null}
                </RouteLogCard>
              );
            })}
          </div>
        )}
      </section>

      {!isEnded ? (
        <Link href={`/sessions/${sessionId}/routes/new`} className="flex min-h-14 items-center justify-between gap-3 border-y border-hairline font-display text-xl font-bold uppercase text-ink">
          Add a route
          <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-accent text-lg leading-none text-accent-ink">+</span>
        </Link>
      ) : null}

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

      {!isEnded ? visibleRoutes.filter((route) => attemptByRoute.has(route.id) && !duplicateIds.has(route.id)).map((route) => {
        const attempt = attemptByRoute.get(route.id)!;
        const history = routeProgress(journal, route.id, sessionId);
        const flashAllowed = (history.complete && !history.ambiguous && !history.tried) || attempt.result === "flash";
        return (
          <BottomSheet key={route.id} id={`correct-${route.id}`} title="Correct route log">
            <form action={correctAttemptAction} className="flex flex-col gap-4">
              {sheet === `correct-${route.id}` && error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
              <p className="text-sm font-semibold text-ink">{route.grade} · {route.route_name}</p>
              <input type="hidden" name="session_id" value={sessionId} />
              <input type="hidden" name="attempt_id" value={attempt.id} />
              <input type="hidden" name="route_id" value={route.id} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Result" compact name="result" defaultValue={attempt.result}>
                  {Object.entries(RESULT_META).filter(([result]) => (result !== "zone" || route.is_competition || attempt.result === "zone") && (result !== "flash" || flashAllowed)).map(([result, meta]) => (
                    <option key={result} value={result}>{meta.label}</option>
                  ))}
                </SelectField>
                <InputField label="Attempts" compact type="number" name="num_attempts" min={1} defaultValue={attempt.num_attempts} />
              </div>
              <p className="text-xs leading-5 text-ink-muted">A flash is always one attempt. Corrections don&apos;t add another try.</p>
              <SubmitButton type="submit" pendingLabel="Saving correction" className={buttonStyles({ variant: "dark" })}>Save correction</SubmitButton>
            </form>
          </BottomSheet>
        );
      }) : null}
    </main>
    </>
  );
}
