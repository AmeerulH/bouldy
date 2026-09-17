import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getGymRoutes,
  getGyms,
  getRoutes,
  getSessionAttempts,
  listSessions,
  type Attempt,
  type AttemptResult,
  type Route,
  type Session,
} from "@/lib/api";
import { RouteHold } from "@/components/route-hold";
import { getSessionToken } from "@/lib/session";

type SessionWithAttempts = { session: Session; attempts: Attempt[] };

const RESULT_META: Record<AttemptResult, { label: string; className: string }> = {
  flash: { label: "⚡ Flash", className: "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" },
  send: { label: "Send", className: "bg-[oklch(0.92_0.05_255)] text-[oklch(0.39_0.15_255)]" },
  zone: { label: "Zone", className: "bg-[oklch(0.94_0.06_85)] text-[oklch(0.42_0.13_85)]" },
  project: { label: "In progress", className: "bg-accent-tint text-accent-tint-ink" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${value}T12:00:00`),
  );
}

function OutcomeStat({ count, label, colour }: { count: number; label: string; colour: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full ${colour}`} />
        <span className="font-display text-2xl font-bold leading-none text-panel-ink">{count}</span>
      </div>
      <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-panel-ink-muted">{label}</p>
    </div>
  );
}

export default async function SessionsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const [sessionResult, gymResult] = await Promise.allSettled([listSessions(token), getGyms()]);
  const sessions = sessionResult.status === "fulfilled" ? sessionResult.value : [];
  const gyms = gymResult.status === "fulfilled" ? gymResult.value : [];
  const hasLoadError = sessionResult.status === "rejected" || gymResult.status === "rejected";
  const gymById = new Map(gyms.map((gym) => [gym.id, gym]));
  const records: SessionWithAttempts[] = await Promise.all(
    [...sessions].sort((a, b) => b.session_date.localeCompare(a.session_date)).map(async (session) => {
      try {
        return { session, attempts: await getSessionAttempts(token, session.id) };
      } catch {
        return { session, attempts: [] };
      }
    }),
  );

  const featured = records[0];
  const featuredGym = featured ? gymById.get(featured.session.gym_id) : undefined;
  const routeResults = featured
    ? await Promise.allSettled([getGymRoutes(featured.session.gym_id), getRoutes()])
    : [];
  const routeById = new Map<number, Route>();
  for (const result of routeResults) {
    if (result.status === "fulfilled") {
      for (const route of result.value) {
        if (route.gym_id === featured?.session.gym_id) routeById.set(route.id, route);
      }
    }
  }
  const attemptsByRoute = new Map<number, Attempt>();
  for (const attempt of featured?.attempts ?? []) attemptsByRoute.set(attempt.route_id, attempt);
  const featuredRoutes = [...routeById.values()].filter(
    (route) => route.status === "active" || attemptsByRoute.has(route.id),
  );
  const live = featured?.session.duration_minutes === 0;
  const flashes = (featured?.attempts ?? []).filter((attempt) => attempt.result === "flash").length;
  const sends = (featured?.attempts ?? []).filter((attempt) => attempt.result === "send").length;
  const inProgress = (featured?.attempts ?? []).filter(
    (attempt) => attempt.result === "project" || attempt.result === "zone",
  ).length;
  const notLogged = featuredRoutes.filter((route) => !attemptsByRoute.has(route.id)).length;

  return (
    <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">Every attempt has a place.</p>
            <h1 className="mt-2 font-display text-5xl font-extrabold uppercase leading-[0.8] tracking-[-0.035em] text-ink">Sessions</h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-panel font-display text-xl font-bold text-panel-ink">B</span>
            <p className="text-right text-[9px] font-bold uppercase leading-[1.1] tracking-[0.16em] text-ink-faint">Climb<br />Log<br />Improve</p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-ink-muted">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.2]"><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" /></svg>
          <span>{featured ? new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(new Date(`${featured.session.session_date}T12:00:00`)) : "Your journal"}</span>
        </div>
      </header>

      {hasLoadError ? <p role="alert" className="rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent-tint-ink">We couldn&apos;t load all of your journal just now. Reload to try again.</p> : null}

      {!featured ? (
        <section className="rounded-2xl bg-panel px-5 py-6 text-panel-ink">
          <h2 className="font-display text-2xl font-extrabold uppercase leading-none">Your journal is ready.</h2>
          <p className="mt-3 max-w-[32ch] text-sm leading-6 text-panel-ink-muted">Your completed sessions, sends, and flashes will collect here after your first climb.</p>
          <Link href="/gyms" className="button-feedback mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-bold text-accent-ink">Choose a gym</Link>
        </section>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl bg-panel p-4 text-panel-ink" aria-label="Latest session">
            <div className="grid grid-cols-[1fr_auto] gap-x-4">
              <div className="min-w-0">
                <p className="font-display text-3xl font-extrabold uppercase leading-none tracking-[-0.02em]">{formatDate(featured.session.session_date).replace(",", "")}</p>
                <p className="mt-1.5 truncate text-sm font-bold uppercase tracking-[0.1em] text-panel-ink-muted">{featuredGym?.name ?? "Unknown gym"}</p>
              </div>
              <div className="border-l border-panel-track pl-4 text-right">
                <p className="font-display text-3xl font-extrabold uppercase leading-none">{live ? "Live" : `${featured.session.duration_minutes} min`}</p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-panel-ink-muted">{featured.attempts.length} route{featured.attempts.length === 1 ? "" : "s"} · {sends + flashes} send{sends + flashes === 1 ? "" : "s"}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-[oklch(0.17_0.003_0)] px-3 py-3">
              <OutcomeStat count={flashes} label="Flash" colour="bg-[oklch(0.58_0.17_145)]" />
              <OutcomeStat count={sends} label="Send" colour="bg-[oklch(0.56_0.16_250)]" />
              <OutcomeStat count={inProgress} label="In progress" colour="bg-accent" />
              <OutcomeStat count={notLogged} label="Not logged" colour="bg-[oklch(0.6_0.003_0)]" />
            </div>
          </section>

          <section aria-labelledby="latest-routes">
            <div className="flex items-end justify-between gap-3">
              <h2 id="latest-routes" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">Route log</h2>
              <Link href={`/sessions/${featured.session.id}`} className="text-sm font-semibold text-accent underline underline-offset-4">Open session</Link>
            </div>
            {featuredRoutes.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-ink-muted">No routes have been added to this gym yet. Add the first route from this session.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {featuredRoutes.map((route) => {
                  const attempt = attemptsByRoute.get(route.id);
                  return (
                    <Link key={route.id} href={`/sessions/${featured.session.id}`} className="button-feedback grid grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-hairline bg-bg px-3 py-3">
                      <RouteHold colour={route.colour} routeName={route.route_name} className="h-[58px] w-[58px]" />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2"><span className="font-display text-3xl font-extrabold leading-none text-ink">{route.grade}</span><h3 className="truncate font-display text-lg font-bold uppercase leading-none text-ink">{route.route_name}</h3></div>
                        {route.styles.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{route.styles.slice(0, 2).map((style) => <span key={style} className="rounded-full bg-[oklch(0.93_0.002_0)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted">{style}</span>)}</div> : <p className="mt-2 text-xs text-ink-muted">{route.wall || "Route details pending"}</p>}
                      </div>
                      <div className="min-w-[70px] text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">Attempts</p>
                        <p className="mt-0.5 font-display text-2xl font-bold leading-none text-ink">{attempt?.num_attempts ?? "—"}</p>
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${attempt ? RESULT_META[attempt.result].className : "bg-[oklch(0.92_0.002_0)] text-ink-muted"}`}>{attempt ? RESULT_META[attempt.result].label : "Not logged"}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link href={live ? `/sessions/${featured.session.id}#add-route` : "/gyms"} className="button-feedback mt-5 flex min-h-14 items-center justify-center gap-3 rounded-xl bg-accent px-5 text-base font-bold uppercase tracking-[0.08em] text-accent-ink"><span aria-hidden="true" className="text-3xl font-light leading-none">+</span>{live ? "Log route" : "Start a session"}</Link>
          </section>

          <section aria-labelledby="all-sessions" className="pt-2">
            <div className="flex items-baseline justify-between gap-3"><h2 id="all-sessions" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">All sessions</h2><p className="text-xs font-semibold text-ink-muted">{records.length} total</p></div>
            <div className="mt-4 divide-y divide-hairline border-y border-hairline">
              {records.map(({ session, attempts }) => {
                const gym = gymById.get(session.gym_id);
                const sessionSends = attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length;
                const sessionFlashes = attempts.filter((attempt) => attempt.result === "flash").length;
                const active = session.duration_minutes === 0;
                return <Link key={session.id} href={`/sessions/${session.id}`} className="button-feedback group flex min-h-24 items-center gap-4 py-4"><time dateTime={session.session_date} className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-panel px-1 text-center font-display text-base font-bold uppercase leading-none text-panel-ink">{formatDate(session.session_date).replace(",", "")}</time><div className="min-w-0 flex-1"><p className="truncate font-display text-xl font-bold uppercase leading-none text-ink">{gym?.name ?? "Unknown gym"}</p><p className="mt-2 text-sm text-ink-muted">{active ? "In progress" : `${session.duration_minutes} min`}{attempts.length > 0 ? ` · ${attempts.length} routes` : ""}</p></div><div className="shrink-0 text-right"><p className="text-sm font-bold text-ink">{sessionSends} sends</p><p className="mt-1 text-xs font-semibold text-accent">{sessionFlashes > 0 ? `⚡ ${sessionFlashes} flash${sessionFlashes === 1 ? "" : "es"}` : ""}</p></div></Link>;
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
