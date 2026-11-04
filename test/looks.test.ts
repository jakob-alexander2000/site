import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LOOKS, OPENING, lookCopy, rawProofUrl } from "../lib/looks";
import { REVEAL_MS } from "../lib/reveal";
import { SHELF } from "../lib/shelf";

test("opening line and reveal length are fixed", () => {
  assert.equal(OPENING, "I build AI tools whose answers you can check, sentence by sentence.");
  assert.ok(REVEAL_MS >= 600 && REVEAL_MS <= 900);
});

test("each shown sentence is backed by a proof excerpt", () => {
  assert.deepEqual(
    LOOKS.map((look) => look.id),
    ["citebot", "autopsy", "voice"],
  );
  const page = readFileSync("app/page.tsx", "utf8");
  assert.equal(page.includes("shelf"), false);
  for (const name of SHELF) assert.equal(page.includes(name), false);
  for (const look of LOOKS) {
    const copy = lookCopy(look);
    assert.equal(copy.includes(look.mark), true);
    for (const proof of look.proofs) {
      assert.equal(copy.includes(proof.excerpt), true, `${look.id} missing ${proof.excerpt}`);
    }
  }
});

test("noir css keeps black, white, and one grey", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const allowed = new Set(["000", "000000", "fff", "ffffff", "8c8c8c"]);
  for (const match of css.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    assert.equal(allowed.has(match[1].toLowerCase()), true, match[0]);
  }
  assert.match(css, /--grey:\s*#8c8c8c/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("proof lines still match the repositories", { timeout: 30000 }, async () => {
  const seen = new Set<string>();
  for (const look of LOOKS) {
    seen.add(look.live);
    for (const proof of look.proofs) {
      const response = await fetch(rawProofUrl(proof));
      assert.equal(response.status, 200, rawProofUrl(proof));
      const line = (await response.text()).split(/\r?\n/)[proof.line - 1] ?? "";
      assert.equal(line.includes(proof.excerpt), true, `${proof.file}:${proof.line} was ${line}`);
    }
  }
  for (const url of seen) {
    const response = await fetch(url, { redirect: "follow" });
    assert.equal(response.status, 200, url);
  }
});
