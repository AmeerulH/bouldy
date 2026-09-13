"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-col justify-center gap-5 px-5 py-8">
      <p className="text-sm text-ink-muted">Bouldy</p>
      <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink">
        This page couldn&apos;t load.
      </h1>
      <p className="max-w-[32ch] text-base leading-6 text-ink-muted">
        The climbing data didn&apos;t come through. Reload to try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="button-feedback min-h-12 rounded-full bg-accent px-5 text-sm font-bold text-accent-ink"
      >
        Reload page
      </button>
    </main>
  );
}
