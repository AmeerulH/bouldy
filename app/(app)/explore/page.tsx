import Link from "next/link";

const GROUPS = [
  {
    heading: "Climbers",
    rows: [
      { href: "/explore/feed", label: "Climbers' sessions", hint: "Sessions friends choose to share" },
      { href: "/explore/climbers", label: "Find climbers", hint: "Search and view public profiles" },
    ],
  },
  {
    heading: "Compete",
    rows: [
      { href: "/explore/leaderboards", label: "Leaderboards", hint: "Gym, global and friend rankings" },
      { href: "/explore/challenges", label: "Challenges", hint: "Gym and community goals with dates" },
      { href: "/explore/groups", label: "Groups and leagues", hint: "Private crews and seasons" },
    ],
  },
];

export default function ExplorePage() {
  return (
    <main id="main-content" className="flex flex-col gap-7 px-5 pb-8 pt-6">
      <header>
        <p className="text-sm text-ink-muted">Climb with others.</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">Explore</h1>
      </header>

      <section aria-label="Status" className="rounded-2xl bg-panel px-5 py-5 text-panel-ink">
        <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">CLOSED FOR SETTING</p>
        <p className="mt-2 text-sm leading-6">The community side of Bouldy is being built. Everything below is planned, and your journal stays private until sharing exists and you choose it.</p>
      </section>

      {GROUPS.map((group) => (
        <section key={group.heading} aria-labelledby={`group-${group.heading}`}>
          <h2 id={`group-${group.heading}`} className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">{group.heading}</h2>
          <div className="mt-3 divide-y divide-hairline border-y border-hairline">
            {group.rows.map((row) => (
              <Link key={row.href} href={row.href} className="flex min-h-16 items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink">{row.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-muted">{row.hint}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-ink-muted">
                  Planned
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="text-sm leading-6 text-ink-muted">
        Your own history is live now. <Link href="/sessions" className="font-semibold text-ink underline underline-offset-4">Open your sessions</Link>.
      </p>
    </main>
  );
}
