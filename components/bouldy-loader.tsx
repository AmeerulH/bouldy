import type { CSSProperties } from "react";
import { RouteHold } from "@/components/route-hold";

export type BouldyLoaderVariant = "ascent" | "traverse" | "hold";

/** Decorative indeterminate animation. The containing loading state owns announcements. */
export function BouldyLoader({ variant = "ascent" }: { variant?: BouldyLoaderVariant }) {
  const colours = variant === "hold" ? ["red"] : ["red", "blue", "green"];
  return (
    <span className={`bouldy-loader bouldy-loader--${variant}`} aria-hidden="true">
      {colours.map((colour, index) => (
        <span key={colour} className="bouldy-loader__position" style={{ "--hold-index": index } as CSSProperties}>
          <span className="bouldy-loader__hold">
            <RouteHold colour={colour} className="h-full w-full" />
          </span>
        </span>
      ))}
    </span>
  );
}
