import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "dark" | "soft" | "plain";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "rounded-full bg-accent text-accent-ink",
  dark: "rounded-full bg-panel text-panel-ink",
  soft: "rounded-xl bg-accent-tint text-accent-tint-ink",
  plain: "text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-13 px-5 text-sm",
};

/** Shared visual contract for button, link, and submit-button surfaces. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "button-feedback inline-flex items-center justify-center font-bold",
    variants[variant],
    sizes[size],
    className,
  );
}
