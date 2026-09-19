import Link from "next/link";
import { addGymAction, startSessionAction } from "@/lib/actions";
import { getGyms } from "@/lib/api";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField } from "@/components/ui/form-field";
import { SectionHeading } from "@/components/ui/section-heading";

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

      {error ? <FeedbackMessage>{error}</FeedbackMessage> : null}
      {notice ? <FeedbackMessage tone="success">{notice}</FeedbackMessage> : null}

      <details className="group border-y border-hairline py-4" open={gyms.length === 0}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-display text-xl font-bold uppercase text-ink marker:content-none">
          Add a gym
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-lg leading-none text-accent-ink group-open:rotate-45">
            +
          </span>
        </summary>
        <form action={addGymAction} className="mt-5 flex flex-col gap-4">
          <InputField label="Gym name" name="name" required placeholder="e.g. Bump Bouldering" />
          <InputField label="Location" name="location" required placeholder="e.g. Petaling Jaya" />
          <p className="text-sm leading-5 text-ink-muted">
            <span className="font-semibold text-ink">Coming soon:</span> each gym will be able to label its grading system in its own words.
          </p>
          <SubmitButton
            type="submit"
            pendingLabel="Adding gym"
            className={buttonStyles()}
          >
            Add gym
          </SubmitButton>
        </form>
      </details>

      <section aria-labelledby="gym-list">
        <SectionHeading id="gym-list" aside={`${gyms.length} total`}>All gyms</SectionHeading>
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
