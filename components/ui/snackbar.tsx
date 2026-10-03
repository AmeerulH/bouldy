"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const VISIBLE_MS = 5000;
const EXIT_MS = 180;
const EVENT = "bouldy:snackbar";

/** Show a snackbar from client code (for example after a note saves without leaving the page). */
export function showSnackbar(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

/** Presentational snackbar: one tappable bar. Tapping anywhere on it dismisses. */
export function Snackbar({ message, leaving = false, onDismiss }: { message: string; leaving?: boolean; onDismiss: () => void }) {
  return (
    <button type="button" className="snackbar" data-leaving={leaving ? "" : undefined} onClick={onDismiss} aria-label={`${message}. Tap to dismiss.`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="snackbar__icon">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
      <span className="snackbar__text" aria-hidden="true">{message}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="snackbar__close">
        <path d="m7 7 10 10M17 7 7 17" />
      </svg>
    </button>
  );
}

/**
 * Shows the one-off success message that a Server Action passes back as `?notice=`.
 * It floats over the top of the screen (never pushes content), removes `notice` from the URL so a
 * refresh or Back does not replay it, auto-dismisses, and dismisses on tap. Errors are not shown
 * here: they stay inline next to the thing that failed.
 */
export function SnackbarHost() {
  const params = useSearchParams();
  const notice = params.get("notice");
  const [shown, setShown] = useState<{ message: string; leaving: boolean } | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const dismiss = useCallback(() => {
    clearTimers();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(null);
      return;
    }
    setShown((current) => (current ? { ...current, leaving: true } : current));
    timers.current.push(window.setTimeout(() => setShown(null), EXIT_MS));
  }, []);

  const show = useCallback((message: string) => {
    clearTimers();
    setShown({ message, leaving: false });
    timers.current.push(window.setTimeout(dismiss, VISIBLE_MS));
  }, [dismiss]);

  useEffect(() => {
    const listener = (event: Event) => show(String((event as CustomEvent).detail));
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  }, [show]);

  useEffect(() => {
    if (!notice) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external signal (URL) becomes local display state
    show(notice);
    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice, show]);

  useEffect(() => clearTimers, []);

  // The live region stays mounted so assistive tech announces the text when it appears.
  return (
    <div className="snackbar-region" role="status" aria-live="polite">
      {shown ? <Snackbar message={shown.message} leaving={shown.leaving} onDismiss={dismiss} /> : null}
    </div>
  );
}
