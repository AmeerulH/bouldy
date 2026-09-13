type RouteMarkProps = {
  colour?: string | null;
  grade: string;
};

const COLOUR_CLASS: Record<string, string> = {
  red: "route-mark--red",
  blue: "route-mark--blue",
  green: "route-mark--green",
  yellow: "route-mark--yellow",
  orange: "route-mark--orange",
  purple: "route-mark--purple",
  pink: "route-mark--pink",
  black: "route-mark--black",
  white: "route-mark--white",
};

export function RouteMark({ colour, grade }: RouteMarkProps) {
  const colourClass = colour ? COLOUR_CLASS[colour.toLowerCase()] : undefined;
  return (
    <span className={`route-mark ${colourClass ?? "route-mark--default"}`} aria-hidden="true">
      {grade}
    </span>
  );
}
