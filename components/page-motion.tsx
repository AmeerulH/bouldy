"use client";

import { useEffect, useRef, type ReactNode, type TouchEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

const TABS = ["/", "/sessions", "/gyms"];

export function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const element = useRef<HTMLDivElement>(null);
  const previous = useRef(pathname);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const from = previous.current;
    previous.current = pathname;
    touch.current = null;
    if (from === pathname || !element.current) return;
    element.current.closest(".app-shell__scroll")?.scrollTo({ top: 0 });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const direction = TABS.indexOf(pathname) < TABS.indexOf(from) ? -1 : 1;
    const animation = element.current.animate(
      [{ transform: `translateX(${direction * 18}px)`, opacity: 0.75 }, { transform: "translateX(0)", opacity: 1 }],
      { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => animation.cancel();
  }, [pathname]);

  function start(event: TouchEvent) {
    touch.current = null;
    if (event.touches.length !== 1 || !TABS.includes(pathname)) return;
    if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, summary, [data-no-swipe]")) return;
    const point = event.touches[0];
    // Leave screen edges to the browser's back/forward gestures.
    if (point.clientX < 28 || point.clientX > window.innerWidth - 28) return;
    touch.current = { x: point.clientX, y: point.clientY };
  }
  function end(event: TouchEvent) {
    const origin = touch.current;
    touch.current = null;
    if (!origin) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - origin.x;
    const dy = point.clientY - origin.y;
    if (Math.abs(dx) < 90 || Math.abs(dx) < Math.abs(dy) * 2) return;
    const next = TABS[TABS.indexOf(pathname) + (dx < 0 ? 1 : -1)];
    if (next) router.push(next);
  }
  return <div ref={element} className="page-motion" onTouchStart={start} onTouchEnd={end} onTouchCancel={() => { touch.current = null; }}>{children}</div>;
}
