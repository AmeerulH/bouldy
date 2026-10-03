import { notFound, redirect } from "next/navigation";
import { RouteForm } from "@/components/route-form";
import { RouteFormScreen } from "@/components/route-form-screen";
import { addRouteAction } from "@/lib/actions";
import { ApiError, getGym, getSession } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

type NewSessionRoutePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewSessionRoutePage({ params, searchParams }: NewSessionRoutePageProps) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const token = await getSessionToken();
  if (!token) redirect("/welcome");
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId) || sessionId < 1) notFound();
  const session = await getSession(token, sessionId).catch((issue) => {
    if (issue instanceof ApiError && (issue.status === 404 || issue.status === 403)) notFound();
    throw issue;
  });
  if (session.duration_minutes > 0) redirect(`/sessions/${sessionId}`);
  const gym = await getGym(session.gym_id);

  return (
    <RouteFormScreen backHref={`/sessions/${sessionId}`} backLabel="Session" title="Add a route" subtitle={`It will be added to ${gym.name}, ready to log.`} error={error}>
      <RouteForm action={addRouteAction} gymId={gym.id} sessionId={sessionId} />
    </RouteFormScreen>
  );
}
