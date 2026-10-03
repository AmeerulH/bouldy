import { cache } from "react";
import { ApiError, getSessionAttempts, listSessions } from "@/lib/api";
import type { Journal, JournalRecord } from "@/lib/journal-summary";

// Bound fan-out; a failed request remains distinct from an empty climbing visit.
export const loadJournal = cache(async (token: string): Promise<Journal> => {
  let sessions;
  try {
    sessions = await listSessions(token);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) throw error;
    return { records: [], sessionsLoaded: false };
  }
  sessions.sort((a, b) => b.session_date.localeCompare(a.session_date));
  const records = new Array<JournalRecord>(sessions.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(6, sessions.length) }, async () => {
    while (cursor < sessions.length) {
      const index = cursor++;
      const session = sessions[index];
      try {
        const attempts = await getSessionAttempts(token, session.id);
        records[index] = { session, attempts, loaded: true };
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) throw error;
        records[index] = { session, attempts: [], loaded: false };
      }
    }
  }));
  return { records, sessionsLoaded: true };
});
