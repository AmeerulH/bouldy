import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getGym,
  getGymRoutes,
  getRoutes,
  getSession,
  getSessionAttempts,
  type Attempt,
  type AttemptResult,
  type Route,
} from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { addRouteAction, correctAttemptAction, endSessionAction, logAttemptAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { RouteHold } from "@/components/route-hold";
import { RouteForm } from "@/components/route-form";
import { buttonStyles } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField, SelectField } from "@/components/ui/form-field";

const RESULT_META: Record<AttemptResult, { label: string; className: string }> = {
  flash: { label: "⚡ Flash", className: "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" },
  send: { label: "Send", className: "bg-[oklch(0.92_0.05_255)] text-[oklch(0.39_0.15_255)]" },
  zone: { label: "Zone", className: "bg-[oklch(0.94_0.06_85)] text-[oklch(0.42_0.13_85)]" },
  project: { label: "In progress", className: "bg-accent-tint text-accent-tint-ink" },
};

type SessionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

function statusSummary(attempt: Attempt | undefined) {
  if (!attempt) return "Not logged";
  return `${attempt.num_attempts} ${attempt.num_attempts === 1 ? "attempt" : "attempts"}`;
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const [{ id }, { error, notice }] = await Promise.all([params, searchParams]);
  const sessionId = Number(id);
  const token = await getSessionToken();
  if (!token) redirect("/welcome");
  if (!Number.isInteger(sessionId) || sessionId < 1) redirect("/sessions");

  const session = await getSession(token, sessionId);
  const isEnded = session.duration_minutes > 0;
  const [gym, gymRoutes, allRoutes, attempts] = await Promise.all([
    getGym(session.gym_id),
    getGymRoutes(session.gym_id),
    isEnded ? getRoutes() : Promise.resolve([] as Route[]),
    getSessionAttempts(token, sessionId),
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
  const sends = attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length;
  const flashes = attempts.filter((attempt) => attempt.result === "flash").length;

  return (
    <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/sessions" className="text-sm font-semibold text-ink-muted underline underline-offset-4">Sessions</Link>
          <h1 className="mt-3 truncate font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">{gym.name}</h1>
          <p className="mt-2 text-sm text-ink-muted">{session.session_date}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${isEnded ? "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" : "bg-accent-tint text-accent-tint-ink"}`}>
          {isEnded ? "Complete" : "Live session"}
        </span>
      </header>

      {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
      {notice ? <FeedbackMessage tone="success">{notice}</FeedbackMessage> : null}

      <section className="rounded-2xl bg-panel px-5 py-5 text-panel-ink" aria-label="Session summary">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">TODAY&apos;S LOG</p>
            <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">{attempts.length} routes</p>
          </div>
          <p className="text-right text-sm text-panel-ink-muted">{isEnded ? `${session.duration_minutes} min` : "Still climbing"}</p>
        </div>
        <dl className="mt-5 flex gap-6 border-t border-panel-track pt-4">
          <div><dd className="font-display text-2xl font-bold leading-none">{sends}</dd><dt className="mt-1 text-xs text-panel-ink-muted">Sends</dt></div>
          <div><dd className="font-display text-2xl font-bold leading-none text-accent">⚡ {flashes}</dd><dt className="mt-1 text-xs text-panel-ink-muted">Flashes</dt></div>
        </dl>
      </section>

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
                <article key={route.id} className="rounded-2xl border border-hairline bg-bg px-4 py-4">
                  <div className="flex items-start gap-3">
                    <RouteHold colour={route.colour} routeName={route.route_name} className="h-16 w-16 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-display text-3xl font-extrabold uppercase leading-none text-ink">{route.grade}</p>
                          <p className="mt-1.5 text-sm font-semibold text-ink-muted">{route.colour || "Colour not recorded"}{route.wall ? ` · ${route.wall}` : ""}{retired ? " · Retired" : ""}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium tracking-wide text-ink-muted">{statusSummary(attempt)}</p>
                          {attempt ? <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${RESULT_META[attempt.result].className}`}>{RESULT_META[attempt.result].label}</span> : null}
                        </div>
                      </div>
                      {route.styles.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {route.styles.map((style) => <span key={style} className="rounded-full bg-[oklch(0.93_0.002_0)] px-2.5 py-1 text-xs font-semibold text-ink-muted">{style}</span>)}
                        </div>
                      ) : null}
                      <h3 className="mt-3 truncate text-sm font-semibold text-ink">{route.route_name}</h3>
                      {route.setter ? <p className="mt-1 text-xs text-ink-muted">Set by {route.setter}</p> : null}
                    </div>
                  </div>

                  {!isEnded && !retired && !completed ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3">
                      {(["attempt", attempt ? "send" : "flash", ...(route.is_competition ? ["zone"] : [])] as const).map((intent) => (
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
                  {attempt && !isEnded ? (
                    <details className="group mt-3 border-t border-hairline pt-3">
                      <summary className="min-h-11 cursor-pointer list-none pt-2 text-sm font-semibold text-ink-muted underline underline-offset-4 marker:content-none">
                        Correct this route log
                      </summary>
                      <form action={correctAttemptAction} className="mt-3 grid grid-cols-2 gap-3">
                        <input type="hidden" name="session_id" value={sessionId} />
                        <input type="hidden" name="attempt_id" value={attempt.id} />
                        <SelectField label="Result" compact name="result" defaultValue={attempt.result}>
                            {Object.entries(RESULT_META).filter(([result]) => result !== "zone" || route.is_competition || attempt.result === "zone").map(([result, meta]) => (
                              <option key={result} value={result}>{meta.label}</option>
                            ))}
                        </SelectField>
                        <InputField label="Attempts" compact type="number" name="num_attempts" min={1} defaultValue={attempt.num_attempts} />
                        <p className="col-span-2 text-xs leading-5 text-ink-muted">
                          A flash is always one attempt. Corrections don&apos;t add another try.
                        </p>
                        <SubmitButton
                          type="submit"
                          pendingLabel="Saving correction"
                          className="col-span-2 min-h-11 rounded-xl bg-panel px-4 text-sm font-bold text-panel-ink"
                        >
                          Save correction
                        </SubmitButton>
                      </form>
                    </details>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {!isEnded ? (
        <details id="add-route" className="group border-y border-hairline py-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-display text-xl font-bold uppercase text-ink marker:content-none">
            Add a route
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-lg leading-none text-accent-ink group-open:rotate-45">+</span>
          </summary>
          <RouteForm action={addRouteAction} gymId={gym.id} sessionId={sessionId} />
        </details>
      ) : null}

      {!isEnded ? (
        <form action={endSessionAction} className="flex flex-col gap-3 border-t border-hairline pt-5">
          <input type="hidden" name="session_id" value={sessionId} />
          <InputField label="Session length (minutes)" type="number" name="duration_minutes" min={1} defaultValue={60} />
          <SubmitButton type="submit" pendingLabel="Ending session" className={buttonStyles({ variant: "dark" })}>End session</SubmitButton>
        </form>
      ) : (
        <Link href="/sessions" className={buttonStyles()}>Back to sessions</Link>
      )}
    </main>
  );
}
