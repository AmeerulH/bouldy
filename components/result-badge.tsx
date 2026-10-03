import type { AttemptResult } from "@/lib/api";

export const RESULT_META: Record<AttemptResult, { label: string; className: string }> = {
  flash: { label: "⚡ Flash", className: "bg-[oklch(0.92_0.07_145)] text-[oklch(0.35_0.14_145)]" },
  send: { label: "Send", className: "bg-[oklch(0.92_0.05_255)] text-[oklch(0.39_0.15_255)]" },
  zone: { label: "Zone", className: "bg-[oklch(0.94_0.06_85)] text-[oklch(0.42_0.13_85)]" },
  project: { label: "In progress", className: "bg-accent-tint text-accent-tint-ink" },
};
export function ResultBadge({ result }: { result: AttemptResult }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${RESULT_META[result].className}`}>{RESULT_META[result].label}</span>;
}
