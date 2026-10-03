/**
 * Gym grades are free text ("V3", "6a+", "3", "Green"). Numeric grades sort by value; grades with no
 * number (colour circuits) have no known order until gyms can define their grading system, so they
 * sort alphabetically after the numeric ones.
 */
export function gradeKey(grade: string) {
  return grade.trim().toLowerCase();
}

function gradeRank(grade: string) {
  const value = gradeKey(grade);
  if (value === "vb") return -1;
  const match = value.match(/(\d+(?:\.\d+)?)\s*([abc])?\s*(\+)?/);
  if (!match) return Number.POSITIVE_INFINITY;
  const letter = match[2] ? (match[2].charCodeAt(0) - 96) * 0.1 : 0;
  return Number(match[1]) + letter + (match[3] ? 0.05 : 0);
}

export function compareGrades(a: string, b: string) {
  const rankA = gradeRank(a);
  const rankB = gradeRank(b);
  if (rankA !== rankB) return rankA < rankB ? -1 : 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/** Every whitespace-separated term must appear somewhere in the route's searchable text. */
export function matchesQuery(haystack: string, query: string) {
  const text = haystack.toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((term) => text.includes(term));
}
