import Link from "next/link";
import { redirect } from "next/navigation";
import { getGyms, getRoutes, type AttemptResult } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { loadJournal } from "@/lib/journal";
import { journalComplete, routeProgress } from "@/lib/journal-summary";
import { JournalSwitch } from "@/components/journal-switch";
import { JournalWarning } from "@/components/journal-warning";
import { RouteBrowser, type BrowserItem } from "@/components/route-browser";
import { browserItem, ClimbRow } from "@/components/route-rows";

const BEST_ORDER: AttemptResult[] = ["flash", "send", "zone", "project"];

export default async function ClimbsPage() {
  const token = await getSessionToken();
  if (!token) redirect("/welcome");

  const [journal, gymResult, routeResult] = await Promise.all([
    loadJournal(token),
    getGyms().catch(() => null),
    getRoutes().catch(() => null),
  ]);
  const gymById = new Map((gymResult ?? []).map((gym) => [gym.id, gym]));
  const routeById = new Map((routeResult ?? []).map((route) => [route.id, route]));
  const loggedIds = new Set(journal.records.flatMap((record) => record.attempts.map((attempt) => attempt.route_id)));

  const items: BrowserItem[] = [...loggedIds].flatMap((routeId) => {
    const route = routeById.get(routeId);
    if (!route) return [];
    const progress = routeProgress(journal, routeId);
    const results = new Set(progress.entries.map(({ attempt }) => attempt.result));
    const best = BEST_ORDER.find((result) => results.has(result)) ?? "project";
    const visits = new Set(progress.entries.map(({ session }) => session.id)).size;
    return [browserItem(route, <ClimbRow route={route} best={best} tries={progress.total} visits={visits} />, {
      status: best === "flash" ? "flash" : best === "send" ? "sent" : "project",
      gym: { id: route.gym_id, name: gymById.get(route.gym_id)?.name ?? "Unknown gym" },
    })];
  });
  const sent = items.filter((item) => item.status === "sent" || item.status === "flash").length;
  const gymCount = new Set(items.map((item) => item.gym?.id)).size;
  const missingRoutes = !routeResult || items.length < loggedIds.size;

  return (
    <main id="main-content" className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-ink-muted">Every route you&apos;ve logged.</p>
          <h1 className="mt-2 font-display text-5xl font-extrabold uppercase leading-[0.8] tracking-[-0.035em] text-ink">Climbs</h1>
        </div>
        <JournalSwitch active="climbs" />
      </header>

      {!journalComplete(journal) || missingRoutes ? (
        <JournalWarning href="/climbs">Some of your journal could not be loaded, so this collection may be missing routes or totals.</JournalWarning>
      ) : null}

      {items.length === 0 ? (
        <section className="rounded-2xl bg-panel px-5 py-6 text-panel-ink">
          <h2 className="font-display text-2xl font-extrabold uppercase leading-none">No climbs yet</h2>
          <p className="mt-3 max-w-[32ch] text-sm leading-6 text-panel-ink-muted">Each route you log collects here, grouped by gym and grade, with your best result.</p>
          <Link href="/gyms" className="button-feedback mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-bold text-accent-ink">Choose a gym</Link>
        </section>
      ) : (
        <>
          <dl className="grid grid-cols-3 border-y border-hairline py-4">
            <div><dd className="font-display text-3xl font-bold leading-none text-ink">{items.length}</dd><dt className="mt-1 text-xs font-semibold text-ink-muted">Routes</dt></div>
            <div><dd className="font-display text-3xl font-bold leading-none text-ink">{sent}</dd><dt className="mt-1 text-xs font-semibold text-ink-muted">Sent</dt></div>
            <div><dd className="font-display text-3xl font-bold leading-none text-ink">{gymCount}</dd><dt className="mt-1 text-xs font-semibold text-ink-muted">{gymCount === 1 ? "Gym" : "Gyms"}</dt></div>
          </dl>
          <RouteBrowser
            items={items}
            storageKey="climbs"
            groupByGym
            belowHeader={false}
            statusOptions={[{ value: "flash", label: "Flash" }, { value: "sent", label: "Sent" }, { value: "project", label: "Project" }]}
            doneStatuses={["sent", "flash"]}
          />
        </>
      )}
    </main>
  );
}
