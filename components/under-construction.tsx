import Link from "next/link";
import type { ReactNode } from "react";
import { RouteHold } from "@/components/route-hold";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SectionHeading } from "@/components/ui/section-heading";

export type RelatedLink = { href: string; label: string; hint: string };

type UnderConstructionProps = {
  /** Parent screen. Omit for a primary tab root. */
  back?: { href: string; label: string };
  eyebrow: string;
  title: string;
  /** One honest sentence about what this screen will be for. */
  summary: string;
  /** What is planned, taken from the product specs. */
  coming: string[];
  /** Why it is not live yet (backend contract, privacy, scoring, media). */
  blocker: string;
  holds?: [string, string];
  related?: RelatedLink[];
  /** Real, already-live content shown above the plan, such as a route header. */
  children?: ReactNode;
};

/**
 * Shared template for planned features. It shows intent only: no sample climbers, scores or
 * activity, and no controls that look actionable.
 */
export function UnderConstruction({ back, eyebrow, title, summary, coming, blocker, holds = ["red", "blue"], related, children }: UnderConstructionProps) {
  return (
    <>
      {back ? <ScreenHeader href={back.href} label={back.label} /> : null}
      <main id="main-content" className={`flex flex-col gap-7 px-5 pb-8 ${back ? "pt-5" : "pt-6"}`}>
        <header>
          <div className="flex items-center gap-2">
            <p className="text-sm text-ink-muted">{eyebrow}</p>
            <span className="rounded-full bg-accent-tint px-2.5 py-1 text-xs font-bold text-accent-tint-ink">Planned</span>
          </div>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">{title}</h1>
        </header>

        {children}

        <section aria-label="Status" className="flex items-center gap-4 rounded-2xl bg-panel px-5 py-5 text-panel-ink">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.12em] text-panel-ink-muted">CLOSED FOR SETTING</p>
            <p className="mt-2 text-sm leading-6">{summary}</p>
            <p className="mt-2 text-xs leading-5 text-panel-ink-muted">Nothing on this screen is real activity. No climbs, names or scores are shown until it ships.</p>
          </div>
          <div aria-hidden="true" className="relative h-20 w-16 shrink-0">
            <RouteHold colour={holds[0]} className="absolute left-0 top-0 h-14 w-14 -rotate-12" />
            <RouteHold colour={holds[1]} className="absolute bottom-0 right-0 h-12 w-12 rotate-12" />
          </div>
        </section>

        <section aria-labelledby="coming">
          <SectionHeading id="coming">What&apos;s coming</SectionHeading>
          <ol className="mt-3 divide-y divide-hairline border-y border-hairline">
            {coming.map((item, index) => (
              <li key={item} className="flex items-start gap-4 py-3.5">
                <span aria-hidden="true" className="w-4 shrink-0 font-display text-xl font-extrabold leading-6 text-ink-faint">{index + 1}</span>
                <span className="text-sm leading-6 text-ink">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="blocker">
          <SectionHeading id="blocker">Why it isn&apos;t live</SectionHeading>
          <p className="mt-3 max-w-[60ch] text-sm leading-6 text-ink-muted">{blocker}</p>
        </section>

        {related?.length ? (
          <nav aria-label="Related" className="divide-y divide-hairline border-y border-hairline">
            {related.map((link) => (
              <Link key={link.href} href={link.href} className="flex min-h-14 items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{link.hint}</span>
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
              </Link>
            ))}
          </nav>
        ) : null}
      </main>
    </>
  );
}
