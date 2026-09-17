"use client";

import { useEffect, useState } from "react";
import { BouldyLoader, type BouldyLoaderVariant } from "@/components/bouldy-loader";

type PageLoaderProps = {
  label?: string;
  variant?: BouldyLoaderVariant;
};

export function LoadingPatience() {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setIsSlow(true), 8_000);
    return () => window.clearTimeout(timer);
  }, []);
  return <p className="loading-patience" role="status">{isSlow ? "Taking a little longer. We’re still fetching your data." : ""}</p>;
}

export function PageLoader({ label = "Finding your next hold…", variant = "ascent" }: PageLoaderProps) {
  return (
    <div className="page-loader" aria-busy="true">
      <div className="page-loader__content">
        <BouldyLoader variant={variant} />
        <p className="font-display text-2xl uppercase text-ink" role="status">{label}</p>
        <LoadingPatience />
      </div>
    </div>
  );
}
