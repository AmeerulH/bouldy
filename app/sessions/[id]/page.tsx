import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getGym,
  getRoutes,
  getSession,
  getSessionAttempts,
  type Attempt,
} from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { endSessionAction, logAttemptAction } from "@/lib/actions";

const RESULTS: { id: "flash" | "zone" | "send" | "project"; label: string }[] = [
  { id: "flash", label: "Flash" },
  { id: "zone", label: "Zone" },
  { id: "send", label: "Send" },
  { id: "project", label: "Project" },
];

const COLOUR_SWATCH: Record<string, string> = {
  red: "#E24B4A",
  blue: "#378ADD",
  green: "#639922",
  yellow: "#EF9F27",
  orange: "#D85A30",
  purple: "#7F77DD",
  pink: "#D4537E",
  black: "#141414",
  white: "#F1EFE8",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionId = Number(id);

  const token = await getSessionToken();
  if (!token) redirect("/login");

  const session = await getSession(token, sessionId);
  const [gym, routes, attempts] = await Promise.all([
    getGym(session.gym_id),
    getRoutes(),
    getSessionAttempts(token, sessionId),
  ]);

  const activeRoutes = routes.filter(
    (route) => route.gym_id === session.gym_id && route.status === "active",
  );
  const attemptByRoute = new Map<number, Attempt>();
  for (const attempt of attempts) attemptByRoute.set(attempt.route_id, attempt);

  const isEnded = session.duration_minutes > 0;

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header>
        <Link href="/gyms" className="text-xs font-medium text-ink-faint">
          ← Gyms
        </Link>
        <h1 className="font-display text-2xl font-extrabold uppercase leading-none text-ink">
          {gym.name}
        </h1>
        <p className="text-xs text-ink-muted">{session.session_date}</p>
      </header>

      {isEnded ? (
        <p className="rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent-tint-ink">
          Session ended · {session.duration_minutes} min
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        {activeRoutes.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No active routes at this gym right now.
          </p>
        ) : (
          activeRoutes.map((route) => {
            const attempt = attemptByRoute.get(route.id);
            const swatch = route.colour
              ? COLOUR_SWATCH[route.colour.toLowerCase()]
              : undefined;

            return (
              <div key={route.id} className="rounded-2xl bg-panel px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {swatch ? (
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: swatch }}
                      />
                    ) : null}
                    <p className="font-display text-base font-bold uppercase text-panel-ink">
                      {route.route_name}
                    </p>
                  </div>
                  <span className="text-xs text-panel-ink-muted">{route.grade}</span>
                </div>

                {attempt ? (
                  <p className="mt-1 text-xs text-panel-ink-muted">
                    {attempt.num_attempts}{" "}
                    {attempt.num_attempts === 1 ? "try" : "tries"} ·{" "}
                    <span
                      className={
                        attempt.result === "send" || attempt.result === "flash"
                          ? "font-semibold text-accent"
                          : ""
                      }
                    >
                      {attempt.result.toUpperCase()}
                    </span>
                  </p>
                ) : null}

                {!isEnded ? (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {RESULTS.map((r) => (
                      <form key={r.id} action={logAttemptAction}>
                        <input type="hidden" name="session_id" value={sessionId} />
                        <input type="hidden" name="route_id" value={route.id} />
                        <input type="hidden" name="result" value={r.id} />
                        {attempt ? (
                          <>
                            <input
                              type="hidden"
                              name="attempt_id"
                              value={attempt.id}
                            />
                            <input
                              type="hidden"
                              name="num_attempts"
                              value={attempt.num_attempts}
                            />
                          </>
                        ) : null}
                        <button
                          type="submit"
                          className="w-full rounded-lg border border-panel-track py-2 text-[11px] font-medium text-panel-ink"
                        >
                          {r.label}
                        </button>
                      </form>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </section>

      {!isEnded ? (
        <form action={endSessionAction} className="flex flex-col gap-3">
          <input type="hidden" name="session_id" value={sessionId} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">
              Session length (minutes)
            </span>
            <input
              type="number"
              name="duration_minutes"
              min={1}
              defaultValue={60}
              className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink"
          >
            End session
          </button>
        </form>
      ) : (
        <Link
          href="/history"
          className="w-full rounded-full bg-accent py-3.5 text-center text-sm font-semibold text-accent-ink"
        >
          Back to history
        </Link>
      )}
    </div>
  );
}
