import { notFound } from "next/navigation";
import { RouteHold } from "@/components/route-hold";
import { UnderConstruction } from "@/components/under-construction";
import { ApiError, getGym, getRoute } from "@/lib/api";

export default async function RouteBetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routeId = Number(id);
  if (!Number.isInteger(routeId) || routeId < 1) notFound();
  const route = await getRoute(routeId).catch((issue) => {
    if (issue instanceof ApiError && issue.status === 404) notFound();
    throw issue;
  });
  const gym = await getGym(route.gym_id).catch(() => null);

  return (
    <UnderConstruction
      back={{ href: gym ? `/gyms/${gym.id}` : "/gyms", label: gym?.name ?? "Gyms" }}
      eyebrow="Route"
      title="Beta"
      summary="Photos and short videos of how a route is climbed, hidden until you choose to reveal them."
      coming={[
        "Route photos, with a cover image so you can recognise the line.",
        "Beta videos from climbers, covered until you tap to reveal.",
        "Credit to the climber who shared each clip, and a way to report it.",
      ]}
      blocker="Needs media storage, authorised uploads, processing and moderation. Photos and videos are not saved anywhere today."
      holds={[route.colour ?? "grey", "grey"]}
    >
      <section aria-label="Route" className="flex items-center gap-4 border-y border-hairline py-4">
        <RouteHold colour={route.colour} routeName={route.route_name} className="h-14 w-14 shrink-0" />
        <div className="min-w-0">
          <p className="break-words font-display text-3xl font-extrabold uppercase leading-none text-ink">{route.grade}</p>
          <p className="mt-1 break-words text-sm font-semibold text-ink">{route.route_name}</p>
        </div>
      </section>
    </UnderConstruction>
  );
}
