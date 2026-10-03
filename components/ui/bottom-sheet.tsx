"use client";

import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Sheet state lives in the URL as `?sheet=<id>`. Opening pushes a history entry so the phone's
 * back gesture closes the sheet; server actions can reopen it with an error by redirecting back
 * with the same `sheet` value.
 */
let pushedSheet: string | null = null;

export function openSheet(id: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete("error");
  url.searchParams.delete("notice");
  url.searchParams.set("sheet", id);
  window.history.pushState(null, "", `${url.pathname}${url.search}`);
  pushedSheet = id;
}

export function useSheet(id: string) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const open = params.get("sheet") === id;
  const paramString = params.toString();

  const close = useCallback(() => {
    if (pushedSheet === id) {
      pushedSheet = null;
      window.history.back();
      return;
    }
    const next = new URLSearchParams(paramString);
    next.delete("sheet");
    next.delete("error");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [id, paramString, pathname, router]);

  return { open, close };
}

type SheetTriggerProps = {
  id: string;
  children: ReactNode;
  className?: string;
  onOpen?: () => void;
};

export function SheetTrigger({ id, children, className, onOpen }: SheetTriggerProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className={className}
      onClick={() => {
        onOpen?.();
        openSheet(id);
      }}
    >
      {children}
    </button>
  );
}

type BottomSheetProps = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function BottomSheet({ id, title, children, className }: BottomSheetProps) {
  const { open, close } = useSheet(id);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (pushedSheet === id) pushedSheet = null;
    if (!dialog.open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    dialog.setAttribute("data-closing", "");
    const timer = window.setTimeout(() => {
      dialog.close();
      dialog.removeAttribute("data-closing");
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open, id]);

  function dragDown(event: PointerEvent<HTMLDivElement>) {
    dragStart.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function dragMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null || !dialogRef.current) return;
    const delta = Math.max(0, event.clientY - dragStart.current);
    dialogRef.current.style.transition = "none";
    dialogRef.current.style.transform = `translateY(${delta}px)`;
  }
  function dragEnd(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null || !dialogRef.current) return;
    const delta = event.clientY - dragStart.current;
    dragStart.current = null;
    dialogRef.current.style.transition = "";
    dialogRef.current.style.transform = "";
    if (delta > 80) close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      data-no-swipe
      className={cn("bottom-sheet", className)}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="bottom-sheet__panel">
        <div className="bottom-sheet__head">
          <div
            className="bottom-sheet__grab"
            onPointerDown={dragDown}
            onPointerMove={dragMove}
            onPointerUp={dragEnd}
            onPointerCancel={dragEnd}
          >
            <span className="bottom-sheet__handle" aria-hidden="true" />
            <h2 id={`${id}-title`} className="font-display text-2xl font-extrabold uppercase leading-none text-ink">
              {title}
            </h2>
          </div>
          <button type="button" aria-label={`Close ${title}`} onClick={close} className="bottom-sheet__close">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="bottom-sheet__body">{children}</div>
      </div>
    </dialog>
  );
}
