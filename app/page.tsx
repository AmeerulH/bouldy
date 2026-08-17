import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { clearSessionCookie, getSessionUser } from "@/lib/session";

const DAYS = [
  { label: "Mon", date: "03" },
  { label: "Tue", date: "04" },
  { label: "Wed", date: "05" },
  { label: "Thu", date: "06" },
  { label: "Fri", date: "07" },
  { label: "Sat", date: "08" },
  { label: "Sun", date: "09" },
];

const ACTIVE_DAY = "Thu";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    await clearSessionCookie();
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-ink-faint">
            Good morning
          </p>
          <p className="font-display text-2xl font-extrabold uppercase leading-none text-ink">
            {user.username}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-hairline px-3.5 py-2 text-xs font-medium text-ink-muted"
          >
            Log out
          </button>
        </form>
      </header>

      <section className="rounded-2xl bg-panel px-5 py-5">
        <p className="text-xs font-medium text-panel-ink-muted">Level</p>
        <p className="font-display text-xl font-extrabold uppercase text-panel-ink">
          Intermediate
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
          {DAYS.map((day) => {
            const isActive = day.label === ACTIVE_DAY;
            return (
              <button
                key={day.label}
                type="button"
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 ${
                  isActive ? "bg-accent-tint" : ""
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-accent-tint-ink" : "text-ink-faint"
                  }`}
                >
                  {day.label}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-accent-tint-ink" : "text-ink"
                  }`}
                >
                  {day.date}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="overflow-hidden rounded-2xl bg-panel">
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="text-xs font-medium text-panel-ink-muted">
              Thursday 06
            </span>
          </div>
          <div className="px-4 pb-4 pt-8">
            <p className="font-display text-lg font-bold uppercase text-panel-ink">
              Beginner&apos;s class
            </p>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink"
      >
        Start a session
      </button>
    </div>
  );
}
