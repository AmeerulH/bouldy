"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SlideTextButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  text: string;
  hoverText?: string;
  href: string;
};

export function SlideTextButton({
  text,
  hoverText,
  href,
  className,
  ...props
}: SlideTextButtonProps) {
  const slideText = hoverText ?? text;

  return (
    <motion.span className="inline-flex" initial={false}>
      <Link
        className={cn(
          "group relative inline-flex items-center overflow-hidden font-semibold text-ink transition-colors hover:text-accent focus-visible:outline-none",
          className,
        )}
        href={href}
        {...props}
      >
        <span className="relative inline-block transition-transform duration-200 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          <span className="block">{text}</span>
          <span className="absolute left-0 top-full block whitespace-nowrap">{slideText}</span>
        </span>
      </Link>
    </motion.span>
  );
}
