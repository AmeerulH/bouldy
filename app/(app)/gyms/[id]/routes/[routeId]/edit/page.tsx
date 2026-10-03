import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteForm } from "@/components/route-form";
import { RouteFormScreen } from "@/components/route-form-screen";
import { editRouteAction } from "@/lib/actions";
import { ApiError, getGym, getRoute } from "@/lib/api";

type EditRoutePageProps = {
  params: Promise<{ id: string; routeId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditRoutePage({ params, searchParams }: EditRoutePageProps) {
  const [{ id, routeId: routeParam }, { error }] = await Promise.all([params, searchParams]);
  const gymId = Number(id);
  const routeId = Number(routeParam);
  if (!Number.isInteger(gymId) || gymId < 1 || !Number.isInteger(routeId) || routeId < 1) notFound();
  const [gym, route] = await Promise.all([getGym(gymId), getRoute(routeId)]).catch((issue) => {
    if (issue instanceof ApiError && issue.status === 404) notFound();
    throw issue;
  });
  // Only active routes of this gym are editable here; history for retired routes stays read-only.
  if (route.gym_id !== gymId || route.status !== "active") notFound();

  return (
    <RouteFormScreen backHref={`/gyms/${gymId}`} backLabel={gym.name} title="Edit route" subtitle={`${route.grade} · ${route.route_name}`} error={error}>
      <Link href={`/routes/${route.id}/beta`} className="flex min-h-14 items-center justify-between gap-3 border-y border-hairline text-sm font-semibold text-ink">
        <span>Beta photos and videos</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
          Planned
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="m9 6 6 6-6 6" /></svg>
        </span>
      </Link>
      <RouteForm action={editRouteAction} gymId={gymId} route={route} />
    </RouteFormScreen>
  );
}
