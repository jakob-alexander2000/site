import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { PortraitSlot } from "../components/PortraitSlot";
import { portraitSource } from "../lib/portrait";

test("no portrait file means no slot", () => {
  const dir = mkdtempSync(join(tmpdir(), "portrait-"));
  assert.equal(portraitSource(dir), null);
  assert.equal(renderToStaticMarkup(createElement(PortraitSlot, { src: null })), "");
});

test("a portrait file in public shows the slot with the drawing", () => {
  const dir = mkdtempSync(join(tmpdir(), "portrait-"));
  writeFileSync(join(dir, "portrait.svg"), "<svg xmlns='http://www.w3.org/2000/svg'/>");
  assert.equal(portraitSource(dir), "/portrait.svg");
  const html = renderToStaticMarkup(createElement(PortraitSlot, { src: "/portrait.svg" }));
  assert.match(html, /data-portrait-slot/);
  assert.match(html, /src="\/portrait.svg"/);
  const png = mkdtempSync(join(tmpdir(), "portrait-"));
  writeFileSync(join(png, "portrait.png"), "x");
  assert.equal(portraitSource(png), "/portrait.png");
});

test("the dead plate code is gone and the scene no longer looks up plate ids", () => {
  for (const gone of ["public/plates", "scripts/raster-plates.mjs", "lib/plate-bake.ts"]) {
    assert.equal(existsSync(join(process.cwd(), gone)), false, gone);
  }
  const scene = readFileSync(join(process.cwd(), "components/schnitt-scene.ts"), "utf8");
  for (const id of ['getElementById("citebot")', 'getElementById("autopsy")', 'getElementById("style")', "mountSectionStills", "plate-bake"]) {
    assert.equal(scene.includes(id), false, id);
  }
});

test("HANDOFF.md documents the portrait path", () => {
  const text = readFileSync(join(process.cwd(), "HANDOFF.md"), "utf8");
  assert.match(text, /public\/portrait\.(svg|png)/);
});
