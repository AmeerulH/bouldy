import type { Attempt, Session } from "./api";

export type JournalRecord = { session: Session; attempts: Attempt[]; loaded: boolean };
export type Journal = { records: JournalRecord[]; sessionsLoaded: boolean };

export function duplicateRouteIds(attempts: Attempt[]) {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const attempt of attempts) {
    if (seen.has(attempt.route_id)) duplicates.add(attempt.route_id);
    seen.add(attempt.route_id);
  }
  return duplicates;
}

export function journalComplete(journal: Journal) {
  return journal.sessionsLoaded && journal.records.every((record) => record.loaded);
}

export function summarizeJournal(journal: Journal) {
  const reliable = journalComplete(journal) && journal.records.every((record) => duplicateRouteIds(record.attempts).size === 0);
  const attempts = journal.records.flatMap((record) => record.attempts);
  return {
    sessions: journal.sessionsLoaded ? journal.records.length : null,
    gyms: journal.sessionsLoaded ? new Set(journal.records.map((record) => record.session.gym_id)).size : null,
    sends: reliable ? attempts.filter((attempt) => attempt.result === "send" || attempt.result === "flash").length : null,
    flashes: reliable ? attempts.filter((attempt) => attempt.result === "flash").length : null,
    reliable,
  };
}

export function routeProgress(journal: Journal, routeId: number, excludeSessionId?: number) {
  const records = journal.records.filter((record) => record.session.id !== excludeSessionId);
  const entries = records.flatMap((record) => record.attempts.filter((attempt) => attempt.route_id === routeId).map((attempt) => ({ session: record.session, attempt })));
  const complete = journal.sessionsLoaded && records.every((record) => record.loaded);
  const ambiguous = records.some((record) => duplicateRouteIds(record.attempts).has(routeId));
  return {
    entries,
    complete,
    ambiguous,
    total: complete && !ambiguous ? entries.reduce((total, entry) => total + entry.attempt.num_attempts, 0) : null,
    sent: entries.some(({ attempt }) => attempt.result === "send" || attempt.result === "flash"),
    tried: entries.length > 0,
  };
}
