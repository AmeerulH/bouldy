import { notFound } from "next/navigation";
import { BouldyLoader } from "@/components/bouldy-loader";
import { PageSkeleton, type SkeletonPage } from "@/components/page-skeleton";

/** Local design review only. Never expose the preview in production. */
export default function LoadingPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const pages: SkeletonPage[] = ["home", "sessions", "session", "gyms", "login", "signup"];
  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-3xl uppercase">A little hang time.</h1>
      <p className="mt-2 text-sm text-ink-muted">Bouldy’s loading states. Local preview only.</p>
      <div className="my-8 flex flex-col gap-6">
        {(["ascent", "traverse", "hold"] as const).map((variant) => (
          <section key={variant} className="flex items-center justify-between border-b border-hairline pb-5">
            <div><h2 className="font-semibold capitalize">{variant}</h2><p className="text-xs text-ink-muted">{variant === "ascent" ? "Full-screen waits" : variant === "traverse" ? "Page loading" : "Small areas & account screens"}</p></div>
            <BouldyLoader variant={variant} />
          </section>
        ))}
      </div>
      <h2 className="font-display text-2xl uppercase">Page skeletons</h2>
      {pages.map((page) => (
        <details key={page} className="border-b border-hairline py-4">
          <summary className="cursor-pointer py-2 font-semibold capitalize">{page}</summary>
          <PageSkeleton page={page} />
        </details>
      ))}
    </main>
  );
}
