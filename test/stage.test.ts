import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const needles = [
  "DPR_CAP = 2",
  "MAX_PLANES = 4",
  "MAX_DRAW_CALLS = 50",
  "function handleContextLost",
  "function pauseWhenHidden",
  "function renderOnDemand",
];

test("the phone renderer caps DPR and handles context loss", () => {
  const source = existsSync("lib/stage.ts") ? readFileSync("lib/stage.ts", "utf8") : "";
  const missing = needles.filter((needle) => !source.includes(needle));
  assert.deepEqual(missing, [], "phone renderer is not built");
});
