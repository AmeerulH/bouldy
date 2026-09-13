import Link from "next/link";
import { addGymAction, startSessionAction } from "@/lib/actions";
import { getGyms } from "@/lib/api";
import { SubmitButton } from "@/components/submit-button";

type GymsPageProps = {
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default async function GymsPage({ searchParams }: GymsPageProps) {
  const [{ error, notice }, gyms] = await Promise.all([searchParams, getGyms()]);

  return (
    <main id="main-content" className="flex flex-col gap-7 px-5 pb-8 pt-6">
      <header>
        <p className="text-sm text-ink-muted">Choose your wall.</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">
          Gyms
        </h1>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent-tint-ink">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-xl bg-[oklch(0.93_0.05_145)] px-4 py-3 text-sm font-medium text-[oklch(0.34_0.13_145)]">
          {notice}
        </p>
      ) : null}

      <details className="group border-y border-hairline py-4" open={gyms.length === 0}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-display text-xl font-bold uppercase text-ink marker:content-none">
          Add a gym
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-lg leading-none text-accent-ink group-open:rotate-45">
            +
          </span>
        </summary>
        <form action={addGymAction} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Gym name
            <input
              name="name"
              required
              placeholder="e.g. Bump Bouldering"
              className="min-h-12 rounded-xl border border-hairline bg-transparent px-3.5 text-base font-normal text-ink outline-none placeholder:text-ink-faint focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Location
            <input
              name="location"
              required
              placeholder="e.g. Petaling Jaya"
              className="min-h-12 rounded-xl border border-hairline bg-transparent px-3.5 text-base font-normal text-ink outline-none placeholder:text-ink-faint focus:border-accent"
            />
          </label>
          <p className="text-sm leading-5 text-ink-muted">
            <span className="font-semibold text-ink">Coming soon:</span> each gym will be able to label its grading system in its own words.
          </p>
          <SubmitButton
            type="submit"
            pendingLabel="Adding gym"
            className="min-h-12 rounded-full bg-accent px-5 text-sm font-bold text-accent-ink"
          >
            Add gym
          </SubmitButton>
        </form>
      </details>

      <section aria-labelledby="gym-list">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="gym-list" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
            All gyms
          </h2>
          <p className="text-sm text-ink-muted">{gyms.length} total</p>
        </div>
        {gyms.length === 0 ? (
          <p className="mt-4 max-w-[33ch] text-sm leading-6 text-ink-muted">
            Add the first gym and you’ll be ready to start your first session.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-hairline border-y border-hairline">
            {gyms.map((gym) => (
              <form key={gym.id} action={startSessionAction} className="py-4">
                <input type="hidden" name="gym_id" value={gym.id} />
                <SubmitButton
                  type="submit"
                  pendingLabel="Starting session"
                  className="flex min-h-13 w-full items-center justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display text-xl font-bold uppercase leading-none text-ink">
                      {gym.name}
                    </span>
                    <span className="mt-1.5 block truncate text-sm text-ink-muted">{gym.location}</span>
                  </span>
                  <span aria-hidden="true" className="text-xl text-accent">→</span>
                </SubmitButton>
              </form>
            ))}
          </div>
        )}
      </section>

      <Link href="/sessions" className="text-center text-sm font-semibold text-ink-muted underline underline-offset-4">
        View your session journal
      </Link>
    </main>
  );
}
