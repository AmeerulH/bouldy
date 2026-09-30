import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteForm } from "@/components/route-form";
import { RouteHold } from "@/components/route-hold";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { addRouteAction, editRouteAction, startSessionAction } from "@/lib/actions";
import { ApiError, getGym, getGymRoutes } from "@/lib/api";

type GymDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

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
    <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header>
        <Link href="/gyms" className="text-sm font-semibold text-ink-muted underline underline-offset-4">Gyms</Link>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">{gym.name}</h1>
        <p className="mt-2 text-sm text-ink-muted">{gym.location}</p>
      </header>

      {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
      {notice ? <FeedbackMessage tone="success">{notice}</FeedbackMessage> : null}

      <form action={startSessionAction}>
        <input type="hidden" name="gym_id" value={gymId} />
        <SubmitButton type="submit" pendingLabel="Starting session" className={buttonStyles()}>Start a session here</SubmitButton>
      </form>

      <section aria-labelledby="gym-routes">
        <div className="flex items-end justify-between gap-3">
          <h2 id="gym-routes" className="font-display text-2xl font-extrabold uppercase text-ink">Routes on the wall</h2>
          <p className="text-xs font-semibold text-ink-muted">{activeRoutes.length} active</p>
        </div>
        {activeRoutes.length === 0 ? <p className="mt-3 text-sm text-ink-muted">No active routes yet. Add the first one below.</p> : null}
        <div className="mt-4 flex flex-col gap-3">
          {activeRoutes.map((route) => (
            <article key={route.id} className="rounded-2xl border border-hairline p-4">
              <div className="flex items-start gap-3">
                <RouteHold colour={route.colour} routeName={route.route_name} className="h-16 w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-3xl font-extrabold uppercase leading-none text-ink">{route.grade}</p>
                  <p className="mt-1 text-sm font-semibold text-ink-muted">{route.colour || "Colour unrecorded"}{route.wall ? ` · ${route.wall}` : ""}</p>
                  {route.styles.length > 0 ? <p className="mt-2 text-xs text-ink-muted">{route.styles.join(" · ")}</p> : null}
                  <p className="mt-2 truncate text-sm font-semibold text-ink">{route.route_name}</p>
                  {route.setter ? <p className="mt-1 text-xs text-ink-muted">Set by {route.setter}</p> : null}
                </div>
              </div>
              <details className="group mt-4 border-t border-hairline pt-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-accent marker:content-none">
                  Edit route <span aria-hidden="true" className="text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <RouteForm action={editRouteAction} gymId={gymId} route={route} />
              </details>
            </article>
          ))}
        </div>
      </section>

      <details className="group border-y border-hairline py-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-display text-xl font-bold uppercase text-ink marker:content-none">
          Add a route <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-accent text-lg text-accent-ink transition-transform group-open:rotate-45">+</span>
        </summary>
        <RouteForm action={addRouteAction} gymId={gymId} />
      </details>
    </main>
  );
}
