import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readdirSync } from "node:fs";
import { existsSync } from "node:fs";
import { BACKGROUND, LOOKS, OPENING, PRODUCT_PAGE_COMING, lookCopy, rawProofUrl, showCiteBotLive, visibleLive } from "../lib/looks";
import { SHELF } from "../lib/shelf";

test("opening line and reveal length are fixed", () => {
  assert.equal(OPENING, "I build AI tools whose answers you can check, sentence by sentence.");
  assert.equal(
    BACKGROUND,
    "I came into software through a coding bootcamp and am finishing a distance-learning degree in computer science.",
  );
  assert.equal(showCiteBotLive, false);
  assert.equal(visibleLive(LOOKS[0]), null);
  assert.equal(visibleLive(LOOKS[1]), LOOKS[1].live);
  assert.equal(visibleLive(LOOKS[2]), LOOKS[2].live);
  assert.equal(PRODUCT_PAGE_COMING, "The product page is coming.");
  assert.equal(LOOKS[0].caption, "Checks each claim against the handbook passage. Development build, no AI model.");
  assert.deepEqual(
    readdirSync("public/recordings").filter((name) => name.endsWith(".mp4") || name.endsWith(".webm")),
    [],
  );
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

test("the lookbook files are gone", () => {
  assert.equal(existsSync("components/LookView.tsx"), false);
  assert.equal(existsSync("components/ProductStill.tsx"), false);
  assert.equal(existsSync("test/noir.spec.ts"), false);
  const page = readFileSync("app/page.tsx", "utf8");
  assert.equal(page.includes("LookView"), false);
  assert.equal(page.includes("quiet"), false);
  assert.equal(page.includes("ProductStill"), false);
  assert.equal(readFileSync("DESIGN.md", "utf8").includes("Noir"), false);
});

test("proof lines still match the repositories", { timeout: 30000 }, async () => {
  for (const look of LOOKS) {
    for (const proof of look.proofs) {
      const response = await fetch(rawProofUrl(proof));
      assert.equal(response.status, 200, rawProofUrl(proof));
      const line = (await response.text()).split(/\r?\n/)[proof.line - 1] ?? "";
      assert.equal(line.includes(proof.excerpt), true, `${proof.file}:${proof.line} was ${line}`);
    }
    const live = visibleLive(look);
    if (!live) continue;
    const response = await fetch(live, { redirect: "follow" });
    assert.equal(response.status, 200, live);
  }
});
