import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApiError, getGym, getRoute } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { loadJournal } from "@/lib/journal";
import { routeProgress } from "@/lib/journal-summary";
import { RouteHold } from "@/components/route-hold";
import { ResultBadge } from "@/components/result-badge";
import { JournalWarning } from "@/components/journal-warning";
import { ScreenHeader } from "@/components/ui/screen-header";
import { AttemptNote } from "@/components/attempt-note";

export default async function RouteHistoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const token = await getSessionToken();
  if (!token) redirect("/welcome");
  const routeId = Number(id);
  if (!Number.isInteger(routeId) || routeId < 1) notFound();
  const route = await getRoute(routeId).catch((error) => { if (error instanceof ApiError && error.status === 404) notFound(); throw error; });
  const [journal, gym] = await Promise.all([loadJournal(token), getGym(route.gym_id).catch(() => null)]);
  const progress = routeProgress(journal, routeId);
  const fromId = Number(from);
  const back = journal.records.some(({ session }) => session.id === fromId) ? `/sessions/${fromId}` : "/sessions";
  return <><ScreenHeader href={back} label={back === "/sessions" ? "Sessions" : "Session"} /><main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-5">
    <header><h1 className="font-display text-4xl font-extrabold uppercase leading-none text-ink">Your route history</h1></header>
    <section className="flex items-center gap-4 border-y border-hairline py-5" aria-label="Route details"><RouteHold colour={route.colour} className="h-16 w-16 shrink-0" /><div className="min-w-0"><h2 className="font-display text-3xl font-extrabold uppercase leading-none text-ink">{route.grade} · {route.colour}</h2><p className="mt-2 break-words text-sm font-semibold text-ink">{route.route_name}</p><p className="mt-1 text-xs text-ink-muted">{gym?.name ?? "Gym name unavailable"}{route.status === "retired" ? " · Retired route" : ""}</p></div></section>
    <div className="rounded-2xl bg-panel p-5 text-panel-ink"><p className="text-sm font-semibold">{progress.total === null ? "Total unavailable" : `${progress.total} ${progress.total === 1 ? "try" : "tries"} across ${new Set(progress.entries.map(({ session }) => session.id)).size} ${new Set(progress.entries.map(({ session }) => session.id)).size === 1 ? "visit" : "visits"}`}</p><p className="mt-2 text-sm leading-6 text-panel-ink-muted">{progress.sent ? "A send is recorded in your journal." : progress.complete && !progress.ambiguous ? "No send recorded yet." : "Your complete send history could not be confirmed."}</p></div>
    {!progress.complete || progress.ambiguous ? <JournalWarning href={`/routes/${routeId}`}>{progress.ambiguous ? "More than one log exists for this route in a visit. Source records are shown separately; the total is unavailable." : "Some visits could not be loaded. Available records are shown below; the total is unavailable."}</JournalWarning> : null}
    <section aria-labelledby="route-visits"><h2 id="route-visits" className="font-display text-2xl font-extrabold uppercase leading-none text-ink">Visit by visit</h2><p className="mt-2 text-xs leading-5 text-ink-muted">Each entry is a session summary, not a timeline of individual tries. Visits on the same date have no recorded order.</p>
      {progress.entries.length ? <div className="mt-4 divide-y divide-hairline border-y border-hairline">{progress.entries.map(({ session, attempt }) => <article key={attempt.id} className="py-5"><div className="flex items-center justify-between gap-3"><Link href={`/sessions/${session.id}#route-${routeId}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline underline-offset-4"><time dateTime={session.session_date}>{new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${session.session_date}T12:00:00`))}</time></Link><ResultBadge result={attempt.result} /></div><p className="mt-1 text-sm tabular-nums text-ink-muted">{attempt.num_attempts} {attempt.num_attempts === 1 ? "try" : "tries"}{session.duration_minutes > 0 ? ` · ${session.duration_minutes} min session` : " · Session in progress"}</p><AttemptNote attemptId={attempt.id} sessionId={session.id} notes={attempt.notes} /></article>)}</div> : <p className="mt-4 text-sm leading-6 text-ink-muted">{progress.complete ? "You haven’t logged this route yet. Its history will start with your first try." : "No records were available to show. Try loading your history again."}</p>}
    </section>
  </main></>;
}
