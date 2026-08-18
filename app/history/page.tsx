import Link from "next/link";
import { redirect } from "next/navigation";
import { getGyms, listSessions } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export default async function HistoryPage() {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const [sessions, gyms] = await Promise.all([listSessions(token), getGyms()]);
  const gymById = new Map(gyms.map((gym) => [gym.id, gym]));
  const sorted = [...sessions].sort((a, b) =>
    b.session_date.localeCompare(a.session_date),
  );

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header>
        <Link href="/" className="text-xs font-medium text-ink-faint">
          ← Home
        </Link>
        <h1 className="font-display text-2xl font-extrabold uppercase leading-none text-ink">
          Session history
        </h1>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">No sessions logged yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((session) => {
            const gym = gymById.get(session.gym_id);
            const inProgress = session.duration_minutes === 0;
            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center justify-between rounded-2xl bg-panel px-4 py-4"
              >
                <div>
                  <p className="font-display text-base font-bold uppercase text-panel-ink">
                    {gym?.name ?? "Unknown gym"}
                  </p>
                  <p className="text-xs text-panel-ink-muted">
                    {session.session_date}
                  </p>
                </div>
                <span className="text-xs text-panel-ink-muted">
                  {inProgress ? "In progress" : `${session.duration_minutes} min`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
