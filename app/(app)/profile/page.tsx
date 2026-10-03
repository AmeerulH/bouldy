import Link from "next/link";
import { redirect } from "next/navigation";
import { getGyms } from "@/lib/api";
import { getSessionToken, getSessionUser } from "@/lib/session";
import { loadJournal } from "@/lib/journal";
import { summarizeJournal } from "@/lib/journal-summary";
import { JournalWarning } from "@/components/journal-warning";
import { logoutAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";

export default async function ProfilePage() {
  const [user, token] = await Promise.all([getSessionUser(), getSessionToken()]);
  if (!user || !token) redirect("/welcome");
  const [journal, gyms] = await Promise.all([loadJournal(token), getGyms().catch(() => null)]);
  const summary = summarizeJournal(journal);
  const visited = [...new Set(journal.records.map(({ session }) => session.gym_id))];
  return <main id="main-content" className="flex flex-col gap-7 px-5 pb-8 pt-6">
    <header><h1 className="font-display text-4xl font-extrabold uppercase leading-none text-ink">You</h1><p className="mt-3 text-sm leading-6 text-ink-muted">Your account and climbing, in one place. Only you can see this page.</p></header>
    <section aria-label="Account details" className="border-y border-hairline py-5"><h2 className="break-words font-display text-3xl font-extrabold uppercase leading-none text-ink">{user.username}</h2><dl className="mt-4 flex flex-col gap-4 text-sm"><div><dt className="text-ink-muted">Email</dt><dd className="mt-1 break-words font-semibold text-ink">{user.email}</dd></div><div><dt className="text-ink-muted">Current grade</dt><dd className="mt-1 font-semibold text-ink">{user.current_grade || "Not set"}</dd></div></dl></section>
    {!summary.reliable ? <JournalWarning href="/profile" /> : null}
    <section aria-labelledby="profile-progress"><h2 id="profile-progress" className="font-display text-2xl font-extrabold uppercase leading-none text-ink">Your climbing so far</h2><dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl bg-panel p-5 text-panel-ink">{[{ label: "Sessions", value: summary.sessions }, { label: "Gyms visited", value: summary.gyms }, { label: "Sends", value: summary.sends }, { label: "Flashes", value: summary.flashes }].map(({ label, value }) => <div key={label}><dd className="font-display text-3xl font-bold leading-none tabular-nums">{value ?? "—"}</dd><dt className="mt-2 text-xs text-panel-ink-muted">{label}{value === null ? " · unavailable" : ""}</dt></div>)}</dl></section>
    <section aria-labelledby="visited-gyms"><h2 id="visited-gyms" className="font-display text-2xl font-extrabold uppercase leading-none text-ink">Places you climb</h2>{!journal.sessionsLoaded ? <p className="mt-3 text-sm text-ink-muted">Your visited gyms could not be loaded.</p> : visited.length ? <div className="mt-3 divide-y divide-hairline border-y border-hairline">{visited.map((id) => <Link key={id} href={`/gyms/${id}`} className="flex min-h-14 items-center justify-between gap-3 py-3 text-sm font-semibold text-ink"><span className="break-words">{gyms?.find((gym) => gym.id === id)?.name ?? `Gym ${id} · name unavailable`}</span><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></Link>)}</div> : <p className="mt-3 text-sm leading-6 text-ink-muted">Your first gym will appear here after you start a session.</p>}</section>
    <section aria-labelledby="profile-settings"><h2 id="profile-settings" className="font-display text-2xl font-extrabold uppercase leading-none text-ink">Profile and privacy</h2><div className="mt-3 divide-y divide-hairline border-y border-hairline">{[{ href: "/profile/edit", label: "Edit profile", hint: "Display name, bio and photo" }, { href: "/profile/public", label: "Public profile", hint: "What other climbers will see" }, { href: "/profile/privacy", label: "Privacy", hint: "Who can find and follow you" }].map((row) => <Link key={row.href} href={row.href} className="flex min-h-14 items-center justify-between gap-3 py-3"><span className="min-w-0"><span className="block text-sm font-semibold text-ink">{row.label}</span><span className="mt-0.5 block text-xs text-ink-muted">{row.hint}</span></span><span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-ink-muted">Planned<svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="m9 6 6 6-6 6" /></svg></span></Link>)}</div></section>
    <Link href="/sessions" className={buttonStyles({ variant: "dark" })}>Open your journal</Link>
    <form action={logoutAction}><SubmitButton type="submit" pendingLabel="Logging out" className={buttonStyles({ variant: "plain" })}>Log out</SubmitButton></form>
  </main>;
}
