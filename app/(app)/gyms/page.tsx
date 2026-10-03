import Link from "next/link";
import { addGymAction, startSessionAction } from "@/lib/actions";
import { getGyms } from "@/lib/api";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";
import { BottomSheet, SheetTrigger } from "@/components/ui/bottom-sheet";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { InputField } from "@/components/ui/form-field";
import { SectionHeading } from "@/components/ui/section-heading";

type GymsPageProps = {
  searchParams: Promise<{ error?: string; sheet?: string }>;
};

export default async function GymsPage({ searchParams }: GymsPageProps) {
  const [{ error, sheet }, gyms] = await Promise.all([searchParams, getGyms()]);
  const sheetError = sheet === "add-gym" ? error : undefined;
  const pageError = sheetError ? undefined : error;
  const addButton = buttonStyles({ variant: "soft", size: "sm", className: "shrink-0 gap-1.5 rounded-full" });

  return (
    <main id="main-content" className="flex flex-col gap-7 px-5 pb-8 pt-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">Choose your wall.</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">
            Gyms
          </h1>
        </div>
        <SheetTrigger id="add-gym" className={addButton}>
          <span aria-hidden="true" className="text-lg leading-none">+</span> Add gym
        </SheetTrigger>
      </header>

      {pageError ? <FeedbackMessage>{pageError}</FeedbackMessage> : null}

      <section aria-labelledby="gym-list">
        <SectionHeading id="gym-list" aside={`${gyms.length} total`}>All gyms</SectionHeading>
        {gyms.length === 0 ? (
          <p className="mt-4 max-w-[33ch] text-sm leading-6 text-ink-muted">
            Add the first gym and you’ll be ready to start your first session.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-hairline border-y border-hairline">
            {gyms.map((gym) => (
              <div key={gym.id} className="flex items-center gap-3 py-4">
                <Link href={`/gyms/${gym.id}`} className="button-feedback min-w-0 flex-1 py-2">
                  <span className="block truncate font-display text-xl font-bold uppercase leading-none text-ink">{gym.name}</span>
                  <span className="mt-1.5 block truncate text-sm text-ink-muted">{gym.location} · View routes</span>
                </Link>
                <form action={startSessionAction}>
                  <input type="hidden" name="gym_id" value={gym.id} />
                  <SubmitButton type="submit" pendingLabel="Starting" className="min-h-11 rounded-full bg-panel px-4 text-xs font-bold text-panel-ink">Start</SubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/sessions" className="text-center text-sm font-semibold text-ink-muted underline underline-offset-4">
        View your session journal
      </Link>

      <BottomSheet id="add-gym" title="Add a gym">
        <form action={addGymAction} className="flex flex-col gap-4">
          {sheetError ? <FeedbackMessage>{sheetError}</FeedbackMessage> : null}
          <InputField label="Gym name" name="name" required placeholder="e.g. Bump Bouldering" />
          <InputField label="Location" name="location" required placeholder="e.g. Petaling Jaya" />
          <p className="text-sm leading-5 text-ink-muted">
            <span className="font-semibold text-ink">Coming soon:</span> each gym will be able to label its grading system in its own words.
          </p>
          <SubmitButton type="submit" pendingLabel="Adding gym" className={buttonStyles()}>
            Add gym
          </SubmitButton>
        </form>
      </BottomSheet>
    </main>
  );
}
