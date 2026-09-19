import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";
import { RouteHold } from "@/components/route-hold";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <BrandWordmark />

      <div className="not-found-route" aria-hidden="true">
        <span>4</span>
        <RouteHold colour="red" className="not-found-route__hold" />
        <span>4</span>
      </div>

      <div className="not-found-copy">
        <p className="not-found-kicker">Looks like this one was reset.</p>
        <h1>That route is off the wall.</h1>
        <p>
          The page may have moved, retired, or never existed. Head back and pick
          up where you left off.
        </p>
      </div>

      <Link href="/" className="button-feedback not-found-action">
        Back to Bouldy
      </Link>
    </main>
  );
}
