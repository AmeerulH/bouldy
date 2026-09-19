import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeedbackMessage({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-medium",
        tone === "error"
          ? "bg-accent-tint text-accent-tint-ink"
          : "bg-[oklch(0.93_0.05_145)] text-[oklch(0.34_0.13_145)]",
      )}
    >
      {children}
    </p>
  );
}
