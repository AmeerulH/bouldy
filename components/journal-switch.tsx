import Link from "next/link";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "sessions", label: "Sessions", href: "/sessions" },
  { key: "climbs", label: "Climbs", href: "/climbs" },
] as const;

/** Two views of the same journal: by visit, or by route. */
export function JournalSwitch({ active }: { active: (typeof VIEWS)[number]["key"] }) {
  return (
    <nav aria-label="Journal view" className="grid grid-cols-2 gap-1 rounded-full bg-[oklch(0.94_0.002_0)] p-1">
      {VIEWS.map((view) => (
        <Link
          key={view.key}
          href={view.href}
          aria-current={active === view.key ? "page" : undefined}
          className={cn(
            "button-feedback flex min-h-11 items-center justify-center rounded-full text-sm font-bold",
            active === view.key ? "bg-panel text-panel-ink" : "text-ink-muted",
          )}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
