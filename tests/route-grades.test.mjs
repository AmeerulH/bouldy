import test from "node:test";
import assert from "node:assert/strict";
import { compareGrades, gradeKey, matchesQuery } from "../lib/route-grades.ts";

test("V grades sort by number, with VB first", () => {
  assert.deepEqual(["V10", "V2", "VB", "V0", "V1"].sort(compareGrades), ["VB", "V0", "V1", "V2", "V10"]);
});

test("Font grades sort by number, letter, then plus", () => {
  assert.deepEqual(["6b", "6a+", "7a", "6a", "6c+"].sort(compareGrades), ["6a", "6a+", "6b", "6c+", "7a"]);
});

test("grades without a number sort alphabetically after numbered grades", () => {
  assert.deepEqual(["Red", "3", "Blue", "1"].sort(compareGrades), ["1", "3", "Blue", "Red"]);
});

test("grade keys ignore case and surrounding space", () => {
  assert.equal(gradeKey(" v3 "), gradeKey("V3"));
});

test("every search term must match somewhere", () => {
  assert.equal(matchesQuery("V3 red Patient heel hook Slab", "slab v3"), true);
  assert.equal(matchesQuery("V3 red Patient heel hook Slab", "slab v4"), false);
  assert.equal(matchesQuery("V3 red", "   "), true);
});
