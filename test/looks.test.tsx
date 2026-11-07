import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { FlowDiagram } from "../components/FlowDiagram";
import { MECHANISMS, sourceUrl } from "../lib/mechanisms";
import { BACKGROUND, LOOKS, OPENING, PRODUCT_PAGE_COMING, lookCopy, rawProofUrl, showCiteBotLive, visibleLive } from "../lib/looks";
import { SHELF } from "../lib/shelf";

test("opening line and live flag are fixed", () => {
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

test("the set keeps a restrained monochrome palette", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const allowed = new Set(["000", "000000", "070707", "fff", "ffffff", "8c8c8c"]);
  for (const match of css.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    assert.equal(allowed.has(match[1].toLowerCase()), true, match[0]);
  }
  assert.match(css, /--grey:\s*#8c8c8c/);
  assert.match(css, /--sheet:\s*#070707/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /perspective:\s*var\(--persp\)/);
  assert.match(css, /translate3d/);
  assert.equal(css.includes("grayscale"), false);
  assert.equal(css.includes("<video"), false);
  assert.equal(readFileSync("components/ProductStill.tsx", "utf8").includes("<video"), false);
  assert.equal(readFileSync("components/LookView.tsx", "utf8").includes("<video"), false);
});

test("diagrams render input, mechanism, output, and limits", () => {
  for (const spec of MECHANISMS) {
    const html = renderToStaticMarkup(<FlowDiagram id={spec.id} name={spec.id === "voice" ? "Voice check" : spec.id === "autopsy" ? "Retrieval Autopsy" : "CiteBot"} />);
    assert.equal(html.includes("Input"), true);
    assert.equal(html.includes("Output"), true);
    assert.equal(html.includes(spec.revision), true);
    assert.equal(html.includes(spec.input), true, spec.input);
    for (const step of spec.steps) assert.equal(html.includes(step.text), true, step.text);
    for (const output of spec.outputs) assert.equal(html.includes(output.text), true, output.text);
    for (const limit of spec.limits) assert.equal(html.includes(limit), true, limit);
    assert.equal(html.includes("<canvas"), false);
    assert.equal(html.includes("<video"), false);
  }
});

test("diagram excerpts still match the named revisions", { timeout: 30000 }, async () => {
  for (const spec of MECHANISMS) {
    for (const proof of spec.excerpts) {
      const url = sourceUrl(spec.repo, spec.revision, proof.file);
      const response = await fetch(url);
      assert.equal(response.status, 200, url);
      const body = await response.text();
      assert.equal(body.includes(proof.excerpt), true, `${url} missing ${proof.excerpt}`);
    }
  }
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
