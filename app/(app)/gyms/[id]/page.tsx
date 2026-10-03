import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteHold } from "@/components/route-hold";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { startSessionAction } from "@/lib/actions";
import { ApiError, getGym, getGymRoutes } from "@/lib/api";

type GymDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

const chevron = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
);

export default async function GymDetailPage({ params, searchParams }: GymDetailPageProps) {
  const [{ id }, { error, notice }] = await Promise.all([params, searchParams]);
  const gymId = Number(id);
  if (!Number.isInteger(gymId) || gymId < 1) notFound();

  let gym;
  let routes;
  try {
    [gym, routes] = await Promise.all([getGym(gymId), getGymRoutes(gymId)]);
  } catch (issue) {
    if (issue instanceof ApiError && issue.status === 404) notFound();
    throw issue;
  }
  const activeRoutes = routes.filter((route) => route.status === "active");

  return (
    <>
      <ScreenHeader href="/gyms" label="Gyms" />
      <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-5">
        <header>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">{gym.name}</h1>
          <p className="mt-2 text-sm text-ink-muted">{gym.location}</p>
        </header>

        {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
        {notice ? <FeedbackMessage tone="success">{notice}</FeedbackMessage> : null}

        <form action={startSessionAction}>
          <input type="hidden" name="gym_id" value={gymId} />
          <SubmitButton type="submit" pendingLabel="Starting session" className={buttonStyles({ className: "w-full" })}>Start a session here</SubmitButton>
        </form>

        <section aria-labelledby="gym-routes">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="gym-routes" className="font-display text-2xl font-extrabold uppercase text-ink">Routes on the wall</h2>
              <p className="mt-1 text-xs font-semibold text-ink-muted">{activeRoutes.length} active</p>
            </div>
            <Link href={`/gyms/${gymId}/routes/new`} className={buttonStyles({ variant: "soft", size: "sm", className: "shrink-0 gap-1.5 rounded-full" })}>
              <span aria-hidden="true" className="text-lg leading-none">+</span> Add route
            </Link>
          </div>
          {activeRoutes.length === 0 ? <p className="mt-4 max-w-[34ch] text-sm leading-6 text-ink-muted">No active routes yet. Add the first one to start logging here.</p> : null}
          <div className="mt-4 flex flex-col gap-3">
            {activeRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/gyms/${gymId}/routes/${route.id}/edit`}
                aria-label={`Edit route: ${route.grade}, ${route.route_name}`}
                className="button-feedback flex min-h-20 items-center gap-3 rounded-2xl border border-hairline p-4 hover:bg-accent-tint/30"
              >
                <RouteHold colour={route.colour} routeName={route.route_name} className="h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="break-words font-display text-3xl font-extrabold uppercase leading-none text-ink">{route.grade}</p>
                    <p className="break-words text-xs font-semibold text-ink-muted">{route.colour || "Colour unrecorded"}</p>
                  </div>
                  <p className="mt-1 break-words text-sm font-semibold leading-snug text-ink">{route.route_name}</p>
                  {route.wall ? <p className="mt-1 break-words text-xs text-ink-muted">{route.wall}</p> : null}
                  {route.styles.length > 0 ? <p className="mt-2 text-xs text-ink-muted">{route.styles.join(" · ")}</p> : null}
                  {route.setter ? <p className="mt-1 text-xs text-ink-muted">Set by {route.setter}</p> : null}
                </div>
                <span aria-hidden="true" className="flex shrink-0 items-center gap-1 text-xs font-bold text-accent">Edit {chevron}</span>
              </Link>
            ))}
          </div>
        </section>

        <Link href="/explore/leaderboards" className="flex min-h-14 items-center justify-between gap-3 border-y border-hairline text-sm font-semibold text-ink">
          <span>Gym leaderboard</span>
          <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">Planned {chevron}</span>
        </Link>
      </main>
    </>
  );
}
