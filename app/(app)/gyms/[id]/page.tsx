import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteBrowser } from "@/components/route-browser";
import { browserItem, GymRouteRow } from "@/components/route-rows";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { startSessionAction } from "@/lib/actions";
import { ApiError, getGym, getGymRoutes } from "@/lib/api";

type GymDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const chevron = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
);

export default async function GymDetailPage({ params, searchParams }: GymDetailPageProps) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
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
          {activeRoutes.length === 0 ? (
            <p className="mt-4 max-w-[34ch] text-sm leading-6 text-ink-muted">No active routes yet. Add the first one to start logging here.</p>
          ) : (
            <div className="mt-3">
              <RouteBrowser items={activeRoutes.map((route) => browserItem(route, <GymRouteRow route={route} gymId={gymId} />))} storageKey={`gym-${gymId}`} />
            </div>
          )}
        </section>

        <Link href="/explore/leaderboards" className="flex min-h-14 items-center justify-between gap-3 border-y border-hairline text-sm font-semibold text-ink">
          <span>Gym leaderboard</span>
          <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">Planned {chevron}</span>
        </Link>
      </main>
    </>
  );
}
