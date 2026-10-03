import Link from "next/link";
import { redirect } from "next/navigation";
import { getGymRoutes, getGyms, getRoutes, type Route } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { JournalSwitch } from "@/components/journal-switch";
import { MonthGroups, type MonthGroup } from "@/components/month-groups";
import { buttonStyles } from "@/components/ui/button";
import { loadJournal } from "@/lib/journal";
import { duplicateRouteIds, summarizeJournal, type JournalRecord } from "@/lib/journal-summary";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${value}T12:00:00`),
  );
}

function OutcomeStat({ count, label, colour }: { count: number | null; label: string; colour: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full ${colour}`} />
        <span className="font-display text-2xl font-bold leading-none text-panel-ink">{count ?? "—"}</span>
      </div>
      <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-panel-ink-muted">{label}</p>
    </div>
  );
}

function sendCounts(record: JournalRecord) {
  const reliable = record.loaded && !duplicateRouteIds(record.attempts).size;
  return {
    reliable,
    sends: record.attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length,
    flashes: record.attempts.filter((attempt) => attempt.result === "flash").length,
  };
}

export default async function SessionsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const [journal, gymResult] = await Promise.all([loadJournal(token), getGyms().catch(() => null)]);
  const gyms = gymResult ?? [];
  const records = journal.records;
  const hasLoadError = !summarizeJournal(journal).reliable || !gymResult;
  const gymById = new Map(gyms.map((gym) => [gym.id, gym]));
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
  const loggedIds = new Set((featured?.attempts ?? []).map((attempt) => attempt.route_id));
  const routesLoaded = routeResults.some((result) => result.status === "fulfilled");
  const notLogged = [...routeById.values()].filter((route) => route.status === "active" && !loggedIds.has(route.id)).length;
  const featuredReliable = featured?.loaded && !duplicateRouteIds(featured.attempts).size;
  const live = featured?.session.duration_minutes === 0;
  const flashes = (featured?.attempts ?? []).filter((attempt) => attempt.result === "flash").length;
  const sends = (featured?.attempts ?? []).filter((attempt) => attempt.result === "send").length;
  const inProgress = (featured?.attempts ?? []).filter(
    (attempt) => attempt.result === "project" || attempt.result === "zone",
  ).length;

  const byMonth = new Map<string, JournalRecord[]>();
  for (const record of records) {
    const key = record.session.session_date.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), record]);
  }
  const months: MonthGroup[] = [...byMonth].map(([key, monthRecords]) => {
    const counts = monthRecords.map(sendCounts);
    const monthSends = counts.every((count) => count.reliable) ? counts.reduce((total, count) => total + count.sends, 0) : null;
    return {
      key,
      label: new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(new Date(`${key}-15T12:00:00`)),
      meta: `${monthRecords.length} ${monthRecords.length === 1 ? "session" : "sessions"}${monthSends === null ? "" : ` · ${monthSends} sends`}`,
      content: (
        <div className="divide-y divide-hairline">
          {monthRecords.map((record) => {
            const { session, attempts } = record;
            const gym = gymById.get(session.gym_id);
            const count = sendCounts(record);
            const active = session.duration_minutes === 0;
            return (
              <Link key={session.id} href={`/sessions/${session.id}`} className="button-feedback flex min-h-20 items-center gap-4 py-3">
                <time dateTime={session.session_date} className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-panel px-1 text-center font-display text-base font-bold uppercase leading-none text-panel-ink">{formatDate(session.session_date).replace(",", "")}</time>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-bold uppercase leading-none text-ink">{gym?.name ?? "Unknown gym"}</p>
                  <p className="mt-2 text-sm text-ink-muted">{active ? "In progress" : `${session.duration_minutes} min`}{attempts.length > 0 ? ` · ${attempts.length} routes` : ""}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ink">{count.reliable ? `${count.sends} sends` : "Unavailable"}</p>
                  <p className="mt-1 text-xs font-semibold text-accent">{count.reliable && count.flashes > 0 ? `⚡ ${count.flashes} flash${count.flashes === 1 ? "" : "es"}` : ""}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ),
    };
  });

  return (
    <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header className="flex flex-col gap-5">
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
        <JournalSwitch active="sessions" />
      </header>

      {hasLoadError ? <p role="alert" className="rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent-tint-ink">We couldn&apos;t load all of your journal just now. Reload to try again.</p> : null}

      {!featured ? (
        <section className="rounded-2xl bg-panel px-5 py-6 text-panel-ink">
          <h2 className="font-display text-2xl font-extrabold uppercase leading-none">{journal.sessionsLoaded ? "Your journal is ready." : "Your journal is unavailable."}</h2>
          <p className="mt-3 max-w-[32ch] text-sm leading-6 text-panel-ink-muted">Your completed sessions, sends, and flashes will collect here after your first climb.</p>
          <Link href="/gyms" className="button-feedback mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-bold text-accent-ink">Choose a gym</Link>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-3" aria-label="Latest session">
            <Link href={`/sessions/${featured.session.id}`} className="button-feedback overflow-hidden rounded-2xl bg-panel p-4 text-panel-ink">
              <div className="grid grid-cols-[1fr_auto] gap-x-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-panel-ink-muted">{live ? "Climbing now" : "Latest session"}</p>
                  <p className="mt-1.5 font-display text-3xl font-extrabold uppercase leading-none tracking-[-0.02em]">{formatDate(featured.session.session_date).replace(",", "")}</p>
                  <p className="mt-1.5 truncate text-sm font-bold uppercase tracking-[0.1em] text-panel-ink-muted">{featuredGym?.name ?? "Unknown gym"}</p>
                </div>
                <div className="border-l border-panel-track pl-4 text-right">
                  <p className="font-display text-3xl font-extrabold uppercase leading-none">{live ? "Live" : `${featured.session.duration_minutes} min`}</p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-panel-ink-muted">{featuredReliable ? `${featured.attempts.length} routes · ${sends + flashes} sends` : "Summary unavailable"}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-[oklch(0.17_0.003_0)] px-3 py-3">
                <OutcomeStat count={featuredReliable ? flashes : null} label="Flash" colour="bg-[oklch(0.58_0.17_145)]" />
                <OutcomeStat count={featuredReliable ? sends : null} label="Send" colour="bg-[oklch(0.56_0.16_250)]" />
                <OutcomeStat count={featuredReliable ? inProgress : null} label="In progress" colour="bg-accent" />
                <OutcomeStat count={featuredReliable && routesLoaded ? notLogged : null} label="Not tried" colour="bg-[oklch(0.6_0.003_0)]" />
              </div>
            </Link>
            {live ? (
              <Link href={`/sessions/${featured.session.id}`} className="button-feedback flex min-h-14 items-center justify-center gap-3 rounded-xl bg-accent px-5 text-base font-bold uppercase tracking-[0.08em] text-accent-ink"><span aria-hidden="true" className="text-3xl font-light leading-none">+</span>Log route</Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/sessions/${featured.session.id}`} className={buttonStyles({ variant: "dark" })}>Review session</Link>
                <Link href="/gyms" className={buttonStyles()}>Start a session</Link>
              </div>
            )}
          </section>

          <section aria-labelledby="all-sessions">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="all-sessions" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">All sessions</h2>
              <p className="text-xs font-semibold text-ink-muted">{records.length} total</p>
            </div>
            <div className="mt-1">
              <MonthGroups months={months} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
