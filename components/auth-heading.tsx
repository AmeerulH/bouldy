import { BrandWordmark } from "@/components/brand-wordmark";
import { RouteHold } from "@/components/route-hold";

export function AuthHeading({ signup = false }: { signup?: boolean }) {
  return (
    <header className="auth-heading">
      <BrandWordmark />
      <div className="auth-heading__story">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
            {signup ? <>Every climb.<br />Your story.</> : <>Back for<br />another try.</>}
          </h1>
          <p className="mt-3 max-w-[25ch] text-sm leading-6 text-ink-muted">{signup ? "Start your journal. Find your next wall." : "Your projects, sends and small wins. All here."}</p>
        </div>
        <RouteHold colour={signup ? "green" : "red"} className="auth-heading__hold" />
      </div>
    </header>
  );
}
