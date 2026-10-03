"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { BottomSheet, SheetTrigger, useSheet } from "@/components/ui/bottom-sheet";
import { compareGrades, gradeKey, matchesQuery } from "@/lib/route-grades";
import { cn } from "@/lib/utils";

export type BrowserItem = {
  id: number;
  grade: string;
  colour: string | null;
  name: string;
  wall: string | null;
  setter: string | null;
  styles: string[];
  status?: string;
  gym?: { id: number; name: string };
  /** Pinned items sit above the grade groups (for example, routes touched this session). */
  pinned?: boolean;
  row: ReactNode;
};

export type BrowserOption = { value: string; label: string };

type RouteBrowserProps = {
  items: BrowserItem[];
  /** Scopes remembered filters, so a redirect after logging keeps the climber's place. */
  storageKey: string;
  statusOptions?: BrowserOption[];
  /** Statuses counted as "sent" in group headers. */
  doneStatuses?: string[];
  pinnedTitle?: string;
  pinnedHint?: string;
  /** Group by gym first; grades only compare within one gym. */
  groupByGym?: boolean;
  /** Pushed screens have a 56px sticky header above the toolbar. */
  belowHeader?: boolean;
  noun?: [string, string];
};

const FILTER_KEYS = ["q", "grade", "status", "colour", "wall", "gym"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];
type Filters = Record<FilterKey, string>;
const SHEET_ID = "route-filters";
const COLLAPSE_ABOVE = 12;

function storageName(key: string) {
  return `bouldy:routes:${key}`;
}

function writeFilters(storageKey: string, patch: Partial<Filters>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(patch)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  const stored = Object.fromEntries(FILTER_KEYS.map((key) => [key, url.searchParams.get(key) ?? ""]).filter(([, value]) => value));
  try {
    window.sessionStorage.setItem(storageName(storageKey), JSON.stringify(stored));
  } catch {
    // Private browsing can block storage; the URL still holds the filters.
  }
}

function haystack(item: BrowserItem) {
  return [item.grade, item.colour, item.name, item.wall, item.setter, ...item.styles, item.gym?.name].filter(Boolean).join(" ");
}

function matches(item: BrowserItem, filters: Filters, skip?: FilterKey) {
  if (skip !== "grade" && filters.grade && gradeKey(item.grade) !== filters.grade) return false;
  if (skip !== "status" && filters.status && item.status !== filters.status) return false;
  if (skip !== "colour" && filters.colour && (item.colour ?? "").trim().toLowerCase() !== filters.colour) return false;
  if (skip !== "wall" && filters.wall && (item.wall ?? "").trim() !== filters.wall) return false;
  if (skip !== "gym" && filters.gym && String(item.gym?.id ?? "") !== filters.gym) return false;
  if (filters.q && !matchesQuery(haystack(item), filters.q)) return false;
  return true;
}

type Group = { key: string; label: string; items: BrowserItem[] };

function byName(a: BrowserItem, b: BrowserItem) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });
}

function groupByGrade(items: BrowserItem[]): Group[] {
  const groups = new Map<string, Group>();
  for (const item of items) {
    const key = gradeKey(item.grade);
    const group = groups.get(key) ?? { key, label: item.grade.trim(), items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => compareGrades(a.label, b.label)).map((group) => ({ ...group, items: group.items.sort(byName) }));
}

function optionsFrom(items: BrowserItem[], pick: (item: BrowserItem) => [string, string] | null) {
  const options = new Map<string, string>();
  for (const item of items) {
    const option = pick(item);
    if (option && !options.has(option[0])) options.set(option[0], option[1]);
  }
  return [...options].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}

const chevron = (open: boolean) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-muted transition-transform duration-200", open && "rotate-180")}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function RowList({ items }: { items: BrowserItem[] }) {
  return (
    <ul className="divide-y divide-hairline">
      {items.map((item) => <li key={item.id}>{item.row}</li>)}
    </ul>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "button-feedback inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold",
        pressed ? "border-panel bg-panel text-panel-ink" : "border-hairline bg-bg text-ink",
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, options, value, onChange }: { title: string; options: BrowserOption[]; value: string; onChange: (value: string) => void }) {
  if (options.length < 2 && !value) return null;
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">{title}</legend>
      <div className="flex flex-wrap gap-2">
        <Chip pressed={!value} onClick={() => onChange("")}>Any</Chip>
        {options.map((option) => (
          <Chip key={option.value} pressed={value === option.value} onClick={() => onChange(value === option.value ? "" : option.value)}>{option.label}</Chip>
        ))}
      </div>
    </fieldset>
  );
}

type GymListProps = {
  items: BrowserItem[];
  doneStatuses: string[];
  countLabel: (count: number) => string;
  onPick: (gymId: string) => void;
};

/** Grades only compare within a gym, so the gym list drills in rather than nesting grade groups. */
function GymList({ items, doneStatuses, countLabel, onPick }: GymListProps) {
  const gyms = new Map<string, { id: string; label: string; items: BrowserItem[] }>();
  for (const item of items) {
    const id = String(item.gym?.id ?? "");
    const group = gyms.get(id) ?? { id, label: item.gym?.name ?? "Unknown gym", items: [] };
    group.items.push(item);
    gyms.set(id, group);
  }
  const groups = [...gyms.values()].sort((a, b) => a.label.localeCompare(b.label));
  return (
    <ul className="divide-y divide-hairline border-b border-hairline">
      {groups.map((group) => {
        const done = doneStatuses.length ? group.items.filter((item) => item.status && doneStatuses.includes(item.status)).length : null;
        const grades = groupByGrade(group.items);
        const range = grades.length > 1 ? `${grades[0].label} to ${grades[grades.length - 1].label}` : grades[0]?.label;
        return (
          <li key={group.id}>
            <button type="button" onClick={() => onPick(group.id)} className="button-feedback flex min-h-18 w-full items-center gap-3 py-3 text-left">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-xl font-extrabold uppercase leading-none text-ink">{group.label}</span>
                <span className="mt-1.5 block truncate text-xs font-semibold text-ink-muted">{countLabel(group.items.length)}{done !== null ? ` · ${done} sent` : ""}{range ? ` · ${range}` : ""}</span>
              </span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-ink-faint"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Searchable, grade-grouped route list. Rows are rendered by the server page and passed in, so
 * each screen keeps its own row actions while sharing search, filters, and grouping.
 */
export function RouteBrowser({
  items,
  storageKey,
  statusOptions,
  doneStatuses = [],
  pinnedTitle = "Today",
  pinnedHint,
  groupByGym = false,
  belowHeader = true,
  noun = ["route", "routes"],
}: RouteBrowserProps) {
  const params = useSearchParams();
  const filters = useMemo(() => Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? ""])) as Filters, [params]);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const { close: closeFilters } = useSheet(SHEET_ID);

  // Action redirects drop the query without remounting, so restore whenever the filters vanish.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (FILTER_KEYS.some((key) => url.searchParams.has(key))) return;
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(storageName(storageKey)) ?? "{}") as Partial<Filters>;
      if (!Object.keys(stored).length) return;
      writeFilters(storageKey, stored);
      if (inputRef.current) inputRef.current.value = stored.q ?? "";
    } catch {
      // Ignore unreadable stored filters.
    }
  }, [storageKey, params]);

  const setFilters = (patch: Partial<Filters>) => {
    writeFilters(storageKey, patch);
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) sectionRef.current?.scrollIntoView({ block: "start" });
  };
  const clearAll = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFilters({ q: "", grade: "", status: "", colour: "", wall: "", gym: "" });
  };

  const searching = filters.q.trim() !== "";
  const visible = items.filter((item) => matches(item, filters));
  const pinned = searching ? [] : visible.filter((item) => item.pinned);
  const rest = searching ? [...visible].sort((a, b) => compareGrades(a.grade, b.grade) || byName(a, b)) : visible.filter((item) => !item.pinned);
  const showGymGroups = groupByGym && !filters.gym && !searching;
  const showGradeRail = !groupByGym || Boolean(filters.gym);
  const gradeOptions = showGradeRail ? groupByGrade(items.filter((item) => matches(item, filters, "grade"))) : [];
  const filterCount = (["status", "colour", "wall", "gym"] as const).filter((key) => filters[key]).length;
  const anyFilter = filterCount > 0 || searching || Boolean(filters.grade);
  const collapseByDefault = rest.length > COLLAPSE_ABOVE;

  const statusFiltered = items.filter((item) => matches(item, filters, "status"));
  const colourOptions = optionsFrom(items.filter((item) => matches(item, filters, "colour")), (item) => {
    const colour = item.colour?.trim();
    return colour ? [colour.toLowerCase(), colour.charAt(0).toUpperCase() + colour.slice(1)] : null;
  });
  const wallOptions = optionsFrom(items.filter((item) => matches(item, filters, "wall")), (item) => (item.wall?.trim() ? [item.wall.trim(), item.wall.trim()] : null));
  const gymOptions = groupByGym ? optionsFrom(items.filter((item) => matches(item, filters, "gym")), (item) => (item.gym ? [String(item.gym.id), item.gym.name] : null)) : [];

  const isOpen = (key: string, forced: boolean) => forced || (collapseByDefault ? toggled.has(key) : !toggled.has(key));
  const toggle = (key: string) =>
    setToggled((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const doneCount = (group: BrowserItem[]) => group.filter((item) => item.status && doneStatuses.includes(item.status)).length;
  const countLabel = (count: number) => `${count} ${count === 1 ? noun[0] : noun[1]}`;

  const groupHeader = (group: Group, open: boolean, forced: boolean) => {
    const done = doneStatuses.length && !filters.status ? doneCount(group.items) : null;
    const meta = `${countLabel(group.items.length)}${done !== null ? ` · ${done} sent` : ""}`;
    if (forced) {
      return (
        <h3 className="flex min-h-12 items-baseline gap-3 border-b border-hairline pt-3 pb-2">
          <span className="font-display text-2xl font-extrabold uppercase leading-none text-ink">{group.label}</span>
          <span className="text-xs font-semibold text-ink-muted">{meta}</span>
        </h3>
      );
    }
    return (
      <h3>
        <button type="button" aria-expanded={open} onClick={() => toggle(group.key)} className="flex min-h-13 w-full items-center gap-3 border-b border-hairline text-left">
          <span className="min-w-0 truncate font-display text-2xl font-extrabold uppercase leading-none text-ink">{group.label}</span>
          <span className="shrink-0 text-xs font-semibold text-ink-muted">{meta}</span>
          <span className="ml-auto">{chevron(open)}</span>
        </button>
      </h3>
    );
  };

  const gradeGroups = (list: BrowserItem[]) => {
    const groups = groupByGrade(list);
    const forced = Boolean(filters.grade) || groups.length === 1;
    const prefix = filters.gym ? `${filters.gym}:` : "";
    return groups.map((group) => {
      const key = `${prefix}${group.key}`;
      const open = isOpen(key, forced);
      return (
        <section key={key} aria-label={`Grade ${group.label}`}>
          {groupHeader({ ...group, key }, open, forced)}
          {open ? <RowList items={group.items} /> : null}
        </section>
      );
    });
  };

  const activeGym = groupByGym && filters.gym ? items.find((item) => String(item.gym?.id) === filters.gym)?.gym : undefined;

  return (
    <section ref={sectionRef} aria-label={`Browse ${noun[1]}`} className={cn(belowHeader ? "scroll-mt-14" : "scroll-mt-0")}>
      <div className={cn("sticky z-[5] -mx-5 border-b border-hairline bg-bg px-5 pb-2 pt-2", belowHeader ? "top-14" : "top-0")}>
        <div className="flex gap-2">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Search {noun[1]}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 h-4 w-4 fill-none stroke-current stroke-2 text-ink-muted">
              <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              defaultValue={filters.q}
              placeholder="Grade, name or wall"
              onChange={(event) => setFilters({ q: event.target.value })}
              className="min-h-11 w-full rounded-full border border-hairline bg-bg pl-10 pr-4 text-[16px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searching ? (
              <button type="button" aria-label="Clear search" onClick={() => { if (inputRef.current) inputRef.current.value = ""; setFilters({ q: "" }); inputRef.current?.focus(); }} className="absolute right-0 grid h-11 w-11 place-items-center rounded-full text-ink-muted">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round"><path d="m7 7 10 10M17 7 7 17" /></svg>
              </button>
            ) : null}
          </label>
          <SheetTrigger id={SHEET_ID} className={cn("button-feedback inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold", filterCount ? "border-panel bg-panel text-panel-ink" : "border-hairline text-ink")}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
            Filter{filterCount ? <span className="sr-only">, {filterCount} active</span> : null}
            {filterCount ? <span aria-hidden="true" className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-ink">{filterCount}</span> : null}
          </SheetTrigger>
        </div>
        {activeGym ? (
          <div className="mt-1 flex items-center gap-2">
            <button type="button" onClick={() => setFilters({ gym: "", grade: "" })} className="-ml-2 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full pl-1 pr-2 text-sm font-semibold text-ink-muted">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
              All gyms
            </button>
            <span className="min-w-0 truncate font-display text-lg font-extrabold uppercase leading-none text-ink">{activeGym.name}</span>
          </div>
        ) : null}
        {showGradeRail && gradeOptions.length > 1 ? (
          <div data-no-swipe className={cn("chip-rail -mx-5 flex gap-1.5 overflow-x-auto px-5", activeGym ? "mt-1" : "mt-2")} role="group" aria-label="Jump to grade">
            <button type="button" aria-pressed={!filters.grade} onClick={() => setFilters({ grade: "" })} className={cn("button-feedback inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold", !filters.grade ? "bg-panel text-panel-ink" : "bg-[oklch(0.95_0.002_0)] text-ink")}>All</button>
            {gradeOptions.map((grade) => {
              const pressed = filters.grade === grade.key;
              return (
                <button key={grade.key} type="button" aria-pressed={pressed} aria-label={`${grade.label}, ${countLabel(grade.items.length)}`} onClick={() => setFilters({ grade: pressed ? "" : grade.key })} className={cn("button-feedback inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm", pressed ? "bg-panel text-panel-ink" : "bg-[oklch(0.95_0.002_0)] text-ink")}>
                  <span className="pt-0.5 font-display text-base font-bold uppercase leading-none">{grade.label}</span>
                  <span className={cn("text-xs tabular-nums", pressed ? "text-panel-ink-muted" : "text-ink-muted")}>{grade.items.length}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {anyFilter ? (
        <div className="flex min-h-11 items-center justify-between gap-3 pt-1" aria-live="polite">
          <p className="text-xs font-semibold text-ink-muted">{visible.length} of {countLabel(items.length)}</p>
          <button type="button" onClick={clearAll} className="min-h-11 text-xs font-bold text-accent-strong underline underline-offset-4">Clear all</button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-display text-2xl font-extrabold uppercase text-ink">No {noun[1]} match</p>
          <p className="mx-auto mt-2 max-w-[30ch] text-sm leading-6 text-ink-muted">Try another grade or fewer filters.</p>
          <button type="button" onClick={clearAll} className="mt-4 min-h-11 rounded-full bg-panel px-5 text-sm font-bold text-panel-ink">Clear filters</button>
        </div>
      ) : null}

      {pinned.length ? (
        <section aria-labelledby="pinned-routes" className="mt-3">
          <div className="flex items-baseline justify-between gap-3 border-b border-ink pb-2">
            <h3 id="pinned-routes" className="font-display text-2xl font-extrabold uppercase leading-none text-ink">{pinnedTitle}</h3>
            <span className="text-xs font-semibold text-ink-muted">{countLabel(pinned.length)}</span>
          </div>
          {pinnedHint ? <p className="pt-2 text-xs leading-5 text-ink-muted">{pinnedHint}</p> : null}
          <RowList items={pinned} />
        </section>
      ) : null}

      {rest.length ? (
        <div className={cn(pinned.length && "mt-6")}>
          {pinned.length && !searching ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">All {noun[1]} by grade</p> : null}
          {searching ? <RowList items={rest} /> : showGymGroups ? (
            <GymList items={rest} doneStatuses={doneStatuses} countLabel={countLabel} onPick={(gym) => setFilters({ gym, grade: "" })} />
          ) : gradeGroups(rest)}
        </div>
      ) : null}

      <BottomSheet id={SHEET_ID} title="Filter">
        <div className="flex flex-col gap-6">
          {statusOptions ? (
            <FilterGroup
              title="Progress"
              options={statusOptions.map((option) => ({ ...option, label: `${option.label} · ${statusFiltered.filter((item) => item.status === option.value).length}` }))}
              value={filters.status}
              onChange={(status) => setFilters({ status })}
            />
          ) : null}
          {groupByGym ? <FilterGroup title="Gym" options={gymOptions} value={filters.gym} onChange={(gym) => setFilters({ gym, grade: "" })} /> : null}
          <FilterGroup title="Hold colour" options={colourOptions} value={filters.colour} onChange={(colour) => setFilters({ colour })} />
          <FilterGroup title="Wall" options={wallOptions} value={filters.wall} onChange={(wall) => setFilters({ wall })} />
          <div className="sticky bottom-0 -mx-5 flex gap-2 border-t border-hairline bg-bg px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
            <button type="button" onClick={clearAll} disabled={!anyFilter} className="min-h-12 rounded-full px-4 text-sm font-bold text-ink disabled:text-ink-faint">Clear all</button>
            <button type="button" onClick={closeFilters} className="button-feedback min-h-12 flex-1 rounded-full bg-panel px-5 text-sm font-bold text-panel-ink">Show {countLabel(visible.length)}</button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
