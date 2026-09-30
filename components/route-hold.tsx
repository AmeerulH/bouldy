import Image from "next/image";
import { normaliseRouteColour } from "@/lib/route-options";

type RouteHoldProps = {
  colour?: string | null;
  routeName?: string;
  className?: string;
};

const ASSET_BY_COLOUR: Record<string, string> = {
  red: "/route-holds/red.svg",
  blue: "/route-holds/blue.svg",
  green: "/route-holds/green.svg",
  yellow: "/route-holds/yellow.svg",
  orange: "/route-holds/orange.svg",
  purple: "/route-holds/purple.svg",
  pink: "/route-holds/pink.svg",
  black: "/route-holds/black.svg",
  white: "/route-holds/white.svg",
  teal: "/route-holds/teal.svg",
  mint: "/route-holds/mint.svg",
  grey: "/route-holds/grey.svg",
  brown: "/route-holds/brown.svg",
  transparent: "/route-holds/transparent.svg",
};

/** Detailed, colour-matched local hold assets until route-photo storage exists. */
export function RouteHold({ colour, routeName, className }: RouteHoldProps) {
  const key = normaliseRouteColour(colour) ?? "grey";
  const name = routeName?.toLowerCase() ?? "";
  const src = key === "blue" && /arete|triangle|volume/.test(name)
    ? "/route-holds/blue-triangle.svg"
    : ASSET_BY_COLOUR[key];

  return <Image src={src} alt="" width={96} height={96} className={className} unoptimized />;
}
