import { BouldyLoader } from "@/components/bouldy-loader";
import { LoadingPatience } from "@/components/page-loader";

export type SkeletonPage = "home" | "sessions" | "session" | "gyms" | "login" | "signup";

export function skeletonPageForPath(path: string): SkeletonPage | undefined {
  if (path === "/") return "home";
  if (path === "/sessions" || path === "/history") return "sessions";
  if (/^\/sessions\/[^/]+\/?$/.test(path)) return "session";
  if (path === "/gyms") return "gyms";
  if (path === "/login" || path === "/signup") return path.slice(1) as "login" | "signup";
}

function Bone({ className = "" }: { className?: string }) {
  return <span className={`skeleton-bone ${className}`} />;
}

function Summary() {
  return (
    <div className="skeleton-summary">
      <Bone className="h-3 w-24" /><Bone className="mt-3 h-7 w-3/4" />
      <Bone className="mt-3 h-3 w-1/2" />
      <div className="mt-5 flex gap-5 border-t border-panel-track pt-4">
        {[0, 1, 2].map((i) => <div key={i} className="flex-1"><Bone className="h-6 w-6" /><Bone className="mt-2 h-2 w-full" /></div>)}
      </div>
    </div>
  );
}

function RouteRows({ editable }: { editable: boolean }) {
  return <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => (
    <div key={i} className="rounded-2xl border border-hairline p-4">
      <div className="flex items-center gap-3">
        <Bone className="h-14 w-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1"><Bone className="h-5 w-4/5" /><Bone className="mt-3 h-3 w-3/5" /></div>
        {!editable && <Bone className="h-6 w-16 rounded-full" />}
      </div>
      {editable && <div className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3">{[0, 1, 2, 3].map((n) => <Bone key={n} className="h-11 rounded-xl" />)}</div>}
    </div>
  ))}</div>;
}

const labels: Record<SkeletonPage, string> = {
  home: "Loading your progress…", sessions: "Opening your journal…", session: "Getting your routes ready…",
  gyms: "Finding your next wall…", login: "Preparing your login…", signup: "Getting you started…",
};

/** Static page geometry streams immediately; only the small status motif moves. */
export function PageSkeleton({ page }: { page: SkeletonPage }) {
  const auth = page === "login" || page === "signup";
  return (
    <div className={`page-skeleton${auth ? " page-skeleton--auth" : ""}`} aria-busy="true" aria-label={labels[page]}>
      <div className="skeleton-status" role="status">
        <BouldyLoader variant={auth ? "hold" : "traverse"} />
        <span>{labels[page]}</span>
      </div>
      <div aria-hidden="true" className="flex flex-col gap-6">
        {auth ? <div><Bone className="h-8 w-24" /><div className="mt-7 flex items-center gap-4"><div className="flex-1"><Bone className="h-16 w-full" /><Bone className="mt-3 h-3 w-4/5" /></div><Bone className="h-20 w-20 rounded-2xl" /></div></div> : page === "home" ? <div><Bone className="h-8 w-24" /><Bone className="mt-6 h-3 w-3/5" /><Bone className="mt-3 h-20 w-3/5" /></div> : <div><Bone className="h-3 w-32" /><Bone className="mt-3 h-9 w-3/5" /></div>}
        {auth ? (
          <>
            <div className="flex flex-col gap-4">{Array.from({ length: page === "signup" ? 4 : 2 }, (_, i) => (
              <div key={i}><Bone className="mb-2 h-3 w-20" /><Bone className="h-12 w-full rounded-xl" /></div>
            ))}</div>
            <Bone className="h-13 rounded-full" /><Bone className="mx-auto h-4 w-3/4" />
          </>
        ) : page === "gyms" ? (
          <>
            <div className="border-y border-hairline py-5"><Bone className="h-6 w-32" /></div>
            <Bone className="h-6 w-28" />
            <div className="divide-y divide-hairline border-y border-hairline">{[0, 1, 2, 3].map((i) => <div key={i} className="py-5"><Bone className="h-5 w-3/5" /><Bone className="mt-3 h-3 w-2/5" /></div>)}</div>
          </>
        ) : (
          <>
            {page === "sessions" && <Bone className="h-5 w-1/2" />}
            <Summary />
            {page === "home" ? (
              <>
                <Bone className="h-13 rounded-full" />
                <Bone className="h-6 w-1/2" />
                <div className="grid grid-cols-4 gap-4 border-y border-hairline py-4">{[0, 1, 2, 3].map((i) => <div key={i}><Bone className="h-7 w-7" /><Bone className="mt-2 h-3" /></div>)}</div>
                <Bone className="h-6 w-3/5" />
                {[0, 1].map((i) => <div key={i} className="border-t border-hairline pt-4"><Bone className="h-5 w-3/5" /><Bone className="mt-2 h-3 w-1/3" /></div>)}
              </>
            ) : <><Bone className="h-6 w-1/3" /><RouteRows editable={page === "session"} /><Bone className="h-12 rounded-xl" /></>}
          </>
        )}
      </div>
      <LoadingPatience />
    </div>
  );
}
