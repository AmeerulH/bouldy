import { notFound } from "next/navigation";
import { RouteForm } from "@/components/route-form";
import { RouteFormScreen } from "@/components/route-form-screen";
import { addRouteAction } from "@/lib/actions";
import { ApiError, getGym } from "@/lib/api";

type NewGymRoutePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewGymRoutePage({ params, searchParams }: NewGymRoutePageProps) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const gymId = Number(id);
  if (!Number.isInteger(gymId) || gymId < 1) notFound();
  const gym = await getGym(gymId).catch((issue) => {
    if (issue instanceof ApiError && issue.status === 404) notFound();
    throw issue;
  });

  return (
    <RouteFormScreen backHref={`/gyms/${gymId}`} backLabel={gym.name} title="Add a route" subtitle={`New route at ${gym.name}`} error={error}>
      <RouteForm action={addRouteAction} gymId={gymId} />
    </RouteFormScreen>
  );
}
