"use client";
import { useActionState, useEffect, useState } from "react";
import { saveAttemptNoteAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { BottomSheet, SheetTrigger, useSheet } from "@/components/ui/bottom-sheet";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { showSnackbar } from "@/components/ui/snackbar";
import { TextareaField } from "@/components/ui/form-field";
import { buttonStyles } from "@/components/ui/button";

type AttemptNoteProps = {
  attemptId: number;
  sessionId: number;
  notes: string | null;
  /** Already inside a sheet: edit in place instead of opening a second sheet. */
  inline?: boolean;
};

/** Shows a private route note; editing happens in a bottom sheet, or in place when already inside one. */
export function AttemptNote({ attemptId, sessionId, notes, inline = false }: AttemptNoteProps) {
  const sheetId = `note-${attemptId}`;
  const [draft, setDraft] = useState(notes ?? "");
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(saveAttemptNoteAction, { status: "idle" as "idle" | "saved" | "error", message: "", notes: notes ?? "" });
  const { close } = useSheet(sheetId);

  // A successful save dismisses the editor; an error keeps it open with the draft intact.
  useEffect(() => {
    if (state.status !== "saved") return;
    showSnackbar(state.message);
    if (inline) setEditing(false);
    else close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const form = (cancel: () => void) => (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="session_id" value={sessionId} /><input type="hidden" name="attempt_id" value={attemptId} />
      <TextareaField label="Your note" name="notes" rows={inline ? 3 : 4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="That heel hook made the difference…" disabled={pending} />
      {state.status === "error" ? <FeedbackMessage>{state.message}</FeedbackMessage> : null}
      <div className={inline ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
        <SubmitButton type="submit" pendingLabel="Saving note" className={buttonStyles({ variant: "dark" })}>Save note</SubmitButton>
        <button type="button" disabled={pending} onClick={cancel} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-ink-muted">Cancel</button>
      </div>
    </form>
  );

  return <section className={`${inline ? "" : "mt-4 "}border-t border-hairline pt-3`} aria-label="Private route note">
    <p className="text-xs font-semibold text-ink-muted">Private note · only you</p>
    {inline && editing ? <div className="mt-3">{form(() => setEditing(false))}</div> : <>
      {state.notes ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{state.notes}</p> : <p className="mt-2 text-sm text-ink-muted">Remember what helped, or come back to this later.</p>}
      {inline ? (
        <button type="button" onClick={() => { setDraft(state.notes); setEditing(true); }} className="mt-1 min-h-11 rounded-xl text-sm font-semibold text-accent-strong underline underline-offset-4">
          {state.notes ? "Edit note" : "Add a note"}
        </button>
      ) : (
        <SheetTrigger id={sheetId} onOpen={() => setDraft(state.notes)} className="mt-1 min-h-11 rounded-xl text-sm font-semibold text-accent-strong underline underline-offset-4">
          {state.notes ? "Edit note" : "Add a note"}
        </SheetTrigger>
      )}
    </>}
    {inline ? null : <BottomSheet id={sheetId} title="Private note">{form(close)}</BottomSheet>}
  </section>;
}
