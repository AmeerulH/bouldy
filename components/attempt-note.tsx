"use client";
import { useActionState, useEffect, useState } from "react";
import { saveAttemptNoteAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { BottomSheet, SheetTrigger, useSheet } from "@/components/ui/bottom-sheet";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { TextareaField } from "@/components/ui/form-field";
import { buttonStyles } from "@/components/ui/button";

/** Shows a private route note inline; editing happens in a bottom sheet so the card never grows. */
export function AttemptNote({ attemptId, sessionId, notes }: { attemptId: number; sessionId: number; notes: string | null }) {
  const sheetId = `note-${attemptId}`;
  const [draft, setDraft] = useState(notes ?? "");
  const [state, action, pending] = useActionState(saveAttemptNoteAction, { status: "idle" as "idle" | "saved" | "error", message: "", notes: notes ?? "" });
  const { open, close } = useSheet(sheetId);

  // A successful save dismisses the sheet; an error keeps it open with the draft intact.
  useEffect(() => {
    if (state.status === "saved") close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return <section className="mt-4 border-t border-hairline pt-3" aria-label="Private route note">
    <p className="text-xs font-semibold text-ink-muted">Private note · only you</p>
    {state.notes ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{state.notes}</p> : <p className="mt-2 text-sm text-ink-muted">Remember what helped, or come back to this later.</p>}
    {!open && state.status === "saved" && draft === state.notes ? <p role="status" className="mt-1 text-xs font-semibold text-[oklch(0.35_0.14_145)]">{state.message}</p> : null}
    <SheetTrigger id={sheetId} onOpen={() => setDraft(state.notes)} className="mt-1 min-h-11 rounded-xl text-sm font-semibold text-accent-strong underline underline-offset-4">
      {state.notes ? "Edit note" : "Add a note"}
    </SheetTrigger>
    <BottomSheet id={sheetId} title="Private note">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="session_id" value={sessionId} /><input type="hidden" name="attempt_id" value={attemptId} />
        <TextareaField label="Your note" name="notes" rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="That heel hook made the difference…" disabled={pending} />
        {state.status === "error" ? <FeedbackMessage>{state.message}</FeedbackMessage> : null}
        <div className="flex flex-col gap-2">
          <SubmitButton type="submit" pendingLabel="Saving note" className={buttonStyles({ variant: "dark" })}>Save note</SubmitButton>
          <button type="button" disabled={pending} onClick={close} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-ink-muted">Cancel</button>
        </div>
      </form>
    </BottomSheet>
  </section>;
}
