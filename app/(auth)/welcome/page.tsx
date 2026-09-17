import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";
import { RouteHold } from "@/components/route-hold";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <BrandWordmark />
      <div className="welcome-holds" aria-hidden="true">
        <RouteHold colour="red" className="welcome-holds__red" />
        <RouteHold colour="blue" className="welcome-holds__blue" />
        <RouteHold colour="green" className="welcome-holds__green" />
      </div>
      <div>
        <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">One more<br />try.</h1>
        <p className="mt-4 max-w-[30ch] text-sm leading-6 text-panel-ink-muted">From your first attempt to that finally-sent feeling. Keep a little of every climb.</p>
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Link href="/signup" className="button-feedback flex min-h-13 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">Start your climbing journal</Link>
        <Link href="/login" className="flex min-h-11 items-center justify-center text-sm font-semibold underline underline-offset-4">Already climbing? Log in</Link>
      </div>
    </main>
  );
}
