import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { clearSessionCookie, getSessionToken, getSessionUser } from "@/lib/session";
import { getGyms, listSessions } from "@/lib/api";

function currentWeek() {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label,
      date: String(d.getDate()).padStart(2, "0"),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    await clearSessionCookie();
    redirect("/login");
  }

  const token = await getSessionToken();
  const [sessions, gyms] = token
    ? await Promise.all([listSessions(token), getGyms()])
    : [[], []];
  const gymById = new Map(gyms.map((gym) => [gym.id, gym]));
  const lastSession = [...sessions].sort((a, b) =>
    b.session_date.localeCompare(a.session_date),
  )[0];

  const days = currentWeek();

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-ink-faint">
            Good morning
          </p>
          <p className="truncate font-display text-2xl font-extrabold uppercase leading-none text-ink">
            {user.username}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/history"
            className="rounded-full border border-hairline px-3 py-2 text-xs font-medium text-ink-muted"
          >
            History
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-hairline px-3 py-2 text-xs font-medium text-ink-muted"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <section className="rounded-2xl bg-panel px-5 py-5">
        <p className="text-xs font-medium text-panel-ink-muted">Level</p>
        <p className="font-display text-xl font-extrabold uppercase text-panel-ink">
          {user.current_grade ?? "Unranked"}
        </p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-panel-track">
          <div className="h-full w-3/5 rounded-full bg-accent" />
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            { label: "Boulders", value: 15 },
            { label: "Check-ins", value: 40 },
            { label: "Badges", value: 6 },
            { label: "Streak", value: 10 },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-lg font-bold text-panel-ink">
                {stat.value}
              </p>
              <p className="text-[11px] leading-tight text-panel-ink-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold uppercase text-ink">
          Plan your week
        </h2>
        <div className="mt-3 flex justify-between gap-1.5">
          {days.map((day) => (
            <button
              key={day.label}
              type="button"
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 ${
                day.isToday ? "bg-accent-tint" : ""
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  day.isToday ? "text-accent-tint-ink" : "text-ink-faint"
                }`}
              >
                {day.label}
              </span>
              <span
                className={`text-sm font-semibold ${
                  day.isToday ? "text-accent-tint-ink" : "text-ink"
                }`}
              >
                {day.date}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="overflow-hidden rounded-2xl bg-panel px-4 py-4">
          <span className="text-xs font-medium text-panel-ink-muted">
            Last session
          </span>
          {lastSession ? (
            <Link href={`/sessions/${lastSession.id}`} className="mt-2 block">
              <p className="font-display text-lg font-bold uppercase text-panel-ink">
                {gymById.get(lastSession.gym_id)?.name ?? "Unknown gym"}
              </p>
              <p className="text-xs text-panel-ink-muted">
                {lastSession.session_date}
              </p>
            </Link>
          ) : (
            <p className="mt-2 text-sm text-panel-ink-muted">
              No sessions yet — start one below.
            </p>
          )}
        </div>
      </section>

      <Link
        href="/gyms"
        className="w-full rounded-full bg-accent py-3.5 text-center text-sm font-semibold text-accent-ink"
      >
        Start a session
      </Link>
    </div>
  );
}
