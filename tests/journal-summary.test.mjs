import test from "node:test";
import assert from "node:assert/strict";
import { duplicateRouteIds, routeProgress, summarizeJournal } from "../lib/journal-summary.ts";
const session = (id) => ({ id, user_id: 1, gym_id: 1, session_date: "2026-10-03", duration_minutes: 60, notes: null });
const attempt = (id, session_id, route_id, num_attempts, result = "project") => ({ id, session_id, route_id, num_attempts, result, notes: null });
const record = (id, attempts, loaded = true) => ({ session: session(id), attempts, loaded });
test("four old plus two new tries remain separate and total six", () => {
  const old = attempt(1, 1, 7, 4); const today = attempt(2, 2, 7, 2, "send");
  const journal = { sessionsLoaded: true, records: [record(2, [today]), record(1, [old])] };
  assert.equal(routeProgress(journal, 7).total, 6);
  assert.equal(routeProgress(journal, 7, 2).total, 4);
  assert.equal(routeProgress(journal, 7).sent, true);
  assert.equal(old.num_attempts, 4); assert.equal(today.num_attempts, 2);
});
test("duplicate records remain visible but cannot inflate a total", () => {
  const journal = { sessionsLoaded: true, records: [record(1, [attempt(1, 1, 7, 4), attempt(2, 1, 7, 4)])] };
  assert.deepEqual([...duplicateRouteIds(journal.records[0].attempts)], [7]);
  assert.equal(routeProgress(journal, 7).entries.length, 2);
  assert.equal(routeProgress(journal, 7).total, null);
  assert.equal(summarizeJournal(journal).sends, null);
});
test("failed reads do not become empty visits or proof of no send", () => {
  const journal = { sessionsLoaded: true, records: [record(1, [attempt(1, 1, 7, 4)]), record(2, [], false)] };
  assert.equal(routeProgress(journal, 7).complete, false);
  assert.equal(routeProgress(journal, 7).total, null);
  assert.equal(summarizeJournal(journal).sends, null);
  assert.equal(summarizeJournal(journal).sessions, 2);
});
test("reset route IDs stay distinct regardless of grade or colour", () => {
  const journal = { sessionsLoaded: true, records: [record(1, [attempt(1, 1, 7, 4), attempt(2, 1, 8, 1, "flash")])] };
  assert.equal(routeProgress(journal, 7).sent, false);
  assert.equal(routeProgress(journal, 8).total, 1);
});
test("empty and unavailable journals are different states", () => {
  assert.equal(summarizeJournal({ sessionsLoaded: true, records: [] }).sends, 0);
  assert.equal(summarizeJournal({ sessionsLoaded: false, records: [] }).sessions, null);
});
