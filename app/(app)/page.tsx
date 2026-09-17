import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { getGyms, getSessionAttempts, listSessions, type Attempt, type Session } from "@/lib/api";
import { SubmitButton } from "@/components/submit-button";
import { BrandWordmark } from "@/components/brand-wordmark";
import { RouteHold } from "@/components/route-hold";

type SessionActivity = {
  session: Session;
  attempts: Attempt[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/welcome");
  }

  const token = await getSessionToken();
  const [sessions, gyms] = token
    ? await Promise.all([listSessions(token), getGyms()])
    : [[], []];
  const gymById = new Map(gyms.map((gym) => [gym.id, gym]));
  const sorted = [...sessions].sort((a, b) => b.session_date.localeCompare(a.session_date));
  const activity: SessionActivity[] = token
    ? await Promise.all(
        sorted.map(async (session) => {
          try {
            return { session, attempts: await getSessionAttempts(token, session.id) };
          } catch {
            return { session, attempts: [] };
          }
        }),
      )
    : [];

  const allAttempts = activity.flatMap((record) => record.attempts);
  const sends = allAttempts.filter(
    (attempt) => attempt.result === "send" || attempt.result === "flash",
  ).length;
  const flashes = allAttempts.filter((attempt) => attempt.result === "flash").length;
  const gymsVisited = new Set(sessions.map((session) => session.gym_id)).size;
  const latest = activity[0];

  return (
    <main id="main-content" className="flex flex-col gap-7 px-5 pb-8 pt-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <BrandWordmark />
          <form action={logoutAction}>
            <SubmitButton
              type="submit"
              pendingLabel="Logging out"
              className="min-h-10 shrink-0 whitespace-nowrap rounded-full border border-hairline px-3.5 text-xs font-semibold text-ink"
            >
              Log out
            </SubmitButton>
          </form>
        </div>
        <div className="home-greeting">
          <div className="min-w-0">
            <p className="mb-3 truncate text-sm text-ink-muted" title={user.username}>Good to see you, {user.username}.</p>
            <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">Keep<br />showing up.</h1>
          </div>
          <RouteHold colour="red" className="home-greeting__hold" />
        </div>
      </header>

      <section className="rounded-2xl bg-panel px-5 py-5 text-panel-ink">
        {latest ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">
                  LAST SESSION
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em]">
                  {gymById.get(latest.session.gym_id)?.name ?? "Unknown gym"}
                </h2>
                <p className="mt-2 text-sm text-panel-ink-muted">
                  {formatDate(latest.session.session_date)}
                  {latest.session.duration_minutes > 0
                    ? ` · ${latest.session.duration_minutes} min`
                    : " · In progress"}
                </p>
              </div>
              <span className="shrink-0 text-right text-xs font-medium text-panel-ink-muted">
                {latest.attempts.length} {latest.attempts.length === 1 ? "route" : "routes"}
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-panel-track pt-4">
              <div className="flex gap-5">
                <div>
                  <p className="font-display text-2xl font-bold leading-none">
                    {
                      latest.attempts.filter(
                        (attempt) => attempt.result === "send" || attempt.result === "flash",
                      ).length
                    }
                  </p>
                  <p className="mt-1 text-xs text-panel-ink-muted">Sends</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold leading-none text-accent">
                    ⚡ {latest.attempts.filter((attempt) => attempt.result === "flash").length}
                  </p>
                  <p className="mt-1 text-xs text-panel-ink-muted">Flashes</p>
                </div>
              </div>
              <Link
                href={`/sessions/${latest.session.id}`}
                className="text-sm font-semibold text-panel-ink underline decoration-panel-ink-muted underline-offset-4"
              >
                Open
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">YOUR CLIMBING LOG</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-none">
              Your next session starts here.
            </h2>
            <p className="mt-3 max-w-[31ch] text-sm leading-6 text-panel-ink-muted">
              Pick a gym, log the routes you try, and build a history worth returning to.
            </p>
          </>
        )}
      </section>

      <Link
        href="/gyms"
        className="button-feedback flex min-h-13 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-accent-ink"
      >
        Start a session
      </Link>

      <section aria-labelledby="month-summary">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="month-summary" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
            Your progress
          </h2>
          <p className="text-xs text-ink-muted">All time</p>
        </div>
        <dl className="mt-4 grid grid-cols-4 divide-x divide-hairline border-y border-hairline py-4">
          {[
            { label: "Sessions", value: sessions.length },
            { label: "Sends", value: sends },
            { label: "Flashes", value: flashes },
            { label: "Gyms", value: gymsVisited },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 px-2 first:pl-0 last:pr-0">
              <dd className="font-display text-2xl font-bold leading-none tabular-nums text-ink">
                {stat.label === "Flashes" && stat.value > 0 ? "⚡ " : ""}
                {stat.value}
              </dd>
              <dt className="mt-1.5 truncate text-xs text-ink-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="recent-sessions">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="recent-sessions" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
            Recent sessions
          </h2>
          {activity.length > 0 ? (
            <Link href="/sessions" className="text-sm font-semibold text-accent underline underline-offset-4">
              See all
            </Link>
          ) : null}
        </div>
        {activity.length === 0 ? (
          <p className="mt-4 max-w-[34ch] text-sm leading-6 text-ink-muted">
            No sessions yet. Start at a gym and your climbing story will show up here.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-hairline border-y border-hairline">
            {activity.slice(0, 3).map(({ session, attempts }) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold uppercase leading-none text-ink">
                    {gymById.get(session.gym_id)?.name ?? "Unknown gym"}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">{formatDate(session.session_date)}</p>
                </div>
                <p className="shrink-0 text-right text-sm font-semibold text-ink">
                  {attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length} sends
                  {attempts.some((attempt) => attempt.result === "flash") ? " · ⚡" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
