"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/page-loader";
import { PageSkeleton, skeletonPageForPath } from "@/components/page-skeleton";

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [destinationPath, setDestinationPath] = useState("");
  const navigationSource = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!navigationSource.current || navigationSource.current === pathname) return;
    const frame = window.requestAnimationFrame(() => {
      navigationSource.current = undefined;
      setIsNavigating(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    let safetyTimer: number | undefined;

    function stopLoading() {
      if (safetyTimer) window.clearTimeout(safetyTimer);
      setIsNavigating(false);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const source = event.target;
      const link = source instanceof Element ? source.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      // Same-page query changes are handled by the submitting form's own pending state.
      if (destination.pathname === window.location.pathname) return;

      navigationSource.current = window.location.pathname;
      setDestinationPath(destination.pathname);
      setIsNavigating(true);
      if (safetyTimer) window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(stopLoading, 45_000);
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("error", stopLoading);
    window.addEventListener("unhandledrejection", stopLoading);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("error", stopLoading);
      window.removeEventListener("unhandledrejection", stopLoading);
      if (safetyTimer) window.clearTimeout(safetyTimer);
    };
  }, []);

  if (!isNavigating) return null;
  const page = skeletonPageForPath(destinationPath);

  return (
    <div className="route-loading-overlay">
      {page ? <PageSkeleton page={page} /> : <PageLoader />}
    </div>
  );
}
