import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const PORT = 3456;
const BASE = `http://127.0.0.1:${PORT}`;

const BANNED = [
  { name: "hire", pattern: /\bhire\b/i },
  { name: "hiring", pattern: /\bhiring\b/i },
  { name: "Mittelstand", pattern: /mittelstand/i },
  { name: "Grounded Docs", pattern: /grounded docs/i },
  { name: "income", pattern: /\bincome\b/i },
  { name: "euro sign", pattern: /€/ },
  { name: "salary", pattern: /salary/i },
  { name: "Ledger", pattern: /ledger/i },
];

const CLAIMS = [
  "Full-time employees receive 30 days of paid vacation per calendar year.",
  "Unused vacation carries over until March 31 of the following year.",
  "Full-time employees receive 25 days of paid vacation.",
];

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertClean(html, where) {
  for (const banned of BANNED) {
    assert.equal(banned.pattern.test(html), false, `${where} contains banned word: ${banned.name}`);
  }
  assert.equal(html.includes("example-address"), false, `${where} still contains example-address`);
  assert.equal(EMAIL.test(html), false, `${where} contains an email address`);
  assert.equal(html.includes("mailto:"), false, `${where} contains a mailto link`);
}

function readTree(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) readTree(path, out);
    else out.push(path);
  }
  return out;
}

function anchorsOf(html) {
  const anchors = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = /href="([^"]*)"/.exec(match[1])?.[1] ?? "";
    const withoutAside = match[2].replace(/<span class="sr-only">[\s\S]*?<\/span>/gi, "");
    anchors.push({ href, label: textOf(withoutAside) });
  }
  return anchors;
}

let server;

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Timed out waiting for next start");
}

test.before(async () => {
  assert.equal(existsSync(".next/BUILD_ID"), true, "Run npm run build before npm test");
  server = spawn("npx", ["next", "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    stdio: "ignore",
    detached: true,
  });
  server.unref();
  await waitForServer();
});

test.after(() => {
  if (server?.pid) {
    try {
      process.kill(-server.pid, "SIGKILL");
    } catch {
      // The server has already exited.
    }
  }
});

test("home renders four instruments and hides unfinished decisions", async () => {
  const response = await fetch(`${BASE}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  const text = textOf(html);

  for (const claim of CLAIMS) {
    assert.equal(text.includes(claim), true, `missing claim: ${claim}`);
  }
  assert.equal(text.includes("Planted wrong draft. The page says 30."), true);
  assert.equal(text.includes("paid time off"), true);
  assert.equal(/\bPTO\b/.test(text), false);
  assert.equal(/\bCLI\b/.test(text), false);
  assert.equal(/\bAPI\b/.test(text), false);
  assert.equal(text.includes("sev-1"), false);
  assert.equal((html.match(/>Pass</g) || []).length, 2);
  assert.equal((html.match(/>Fail</g) || []).length, 1);
  assert.match(html, /class="row fail"/);

  for (const name of ["CiteBot", "citebot-evals", "Desk", "desk-index"]) {
    assert.equal(text.includes(name), true, `missing project: ${name}`);
  }
  assert.equal(text.includes("Selected work"), true);
  assert.equal(/\bPortfolio\b/.test(text), false);
  assert.equal(/\bMy work\b/.test(text), false);
  assert.equal(text.includes("TODO"), false);
  assert.equal(text.includes("Jakob:"), false);
  assert.equal(text.includes("Retrieval Autopsy"), false);
  assert.equal(text.includes("Style Distance"), false);
  assert.equal(text.includes("Room for a later tool"), false);
  assert.equal(text.includes("The cost"), true);
  assert.equal(
    text.includes("Set in Inter. Made in Berlin, with a guitar within reach."),
    true,
  );

  const buttons = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((match) =>
    textOf(match[1]),
  );
  assert.equal(buttons.filter((label) => label === "Try it").length, 4);

  const anchors = anchorsOf(html);
  const live = anchors.filter((anchor) => anchor.label === "Live");
  assert.deepEqual(
    live.map((anchor) => anchor.href),
    ["https://citebot-chi.vercel.app/ask"],
  );
  for (const anchor of anchors) {
    if (anchor.href.includes("github.com")) assert.notEqual(anchor.label, "Live");
    assert.notEqual(anchor.label, "Try it");
  }

  const css = readTree(".next/static")
    .filter((path) => path.endsWith(".css"))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.notEqual(css.length, 0, "built CSS missing");
  assert.equal(/gradient\s*\(/i.test(css), false, "CSS contains a gradient");
  assert.equal(/box-shadow\s*:/i.test(css), false, "CSS contains a box-shadow");
  assert.equal(/drop-shadow\s*\(/i.test(css), false, "CSS contains a drop-shadow");
  assert.match(css, /a\s*,\s*button[\s\S]{0,240}min-height:\s*44px/);
  assert.match(css, /a\s*,\s*button[\s\S]{0,240}min-width:\s*44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none/);
  for (const match of css.matchAll(/font-size:\s*([\d.]+)px/g)) {
    assert.ok(Number(match[1]) >= 13, `font-size ${match[1]}px`);
  }
  for (const match of css.matchAll(/border-radius:\s*([^;}{]+)/g)) {
    assert.equal(/%/.test(match[1]), false, match[1]);
    for (const px of match[1].matchAll(/([\d.]+)px/g)) {
      assert.ok(Number(px[1]) <= 4, match[1]);
    }
  }
  for (const match of css.matchAll(/(?:^|[\s{;])animation:\s*[^;]*?(\d+)ms/g)) {
    const duration = Number(match[1]);
    assert.ok(duration >= 150 && duration <= 250, match[0]);
  }
  for (const match of css.matchAll(/(?:^|[\s{;])transition:\s*[^;]*?(\d+)ms/g)) {
    const duration = Number(match[1]);
    assert.ok(duration >= 150 && duration <= 250, match[0]);
  }

  const built = readTree(".next/static")
    .filter((path) => path.endsWith(".js") || path.endsWith(".css"))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.equal(built.includes("TODO(Jakob)"), false);
  assert.equal(built.includes("Jakob: TODO"), false);
  assert.equal(/salary/i.test(html), false);

  assertClean(html, "/");
});

test("about and a missing page stay free of banned words", async () => {
  const about = await fetch(`${BASE}/about`);
  assert.equal(about.status, 200);
  const aboutHtml = await about.text();
  assert.equal(textOf(aboutHtml).includes("github.com/jakob-alexander2000"), true);
  assert.equal(
    textOf(aboutHtml).includes("Set in Inter. Made in Berlin, with a guitar within reach."),
    true,
  );
  assert.equal(/ledger/i.test(aboutHtml), false, "about mentions Ledger");
  assertClean(aboutHtml, "/about");

  const missing = await fetch(`${BASE}/not-a-real-page`);
  assert.equal(missing.status, 404);
  const missingHtml = await missing.text();
  assert.equal(textOf(missingHtml).includes("This page is not on the site."), true);
  assert.equal(/ledger/i.test(missingHtml), false, "404 mentions Ledger");
  assertClean(missingHtml, "404");
});
