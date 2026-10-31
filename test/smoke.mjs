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
  "Unused days can carry past June.",
  "Full-time employees receive 25 days of paid vacation per calendar year.",
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

test("home renders six instruments", async () => {
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
  assert.equal((html.match(/>Pass</g) || []).length, 4);
  assert.equal((html.match(/>Fail</g) || []).length, 3);
  assert.match(html, /class="row fail"/);

  for (const name of [
    "CiteBot",
    "citebot-evals",
    "Retrieval Autopsy",
    "Style Distance",
    "Desk",
    "desk-index",
  ]) {
    assert.equal(text.includes(name), true, `missing project: ${name}`);
  }
  assert.equal(text.includes("Selected work"), true);
  assert.equal(/\bPortfolio\b/.test(text), false);
  assert.equal(/\bMy work\b/.test(text), false);
  assert.equal(text.includes("TODO"), false);
  assert.equal(text.includes("Jakob:"), false);
  assert.equal(text.includes("How many days of annual leave do employees get?"), true);
  assert.equal(text.includes("In practice, employees receive 30 days of paid annual leave."), true);
  assert.equal(text.includes("full-time employees only"), true);
  assert.equal(text.includes("Conditions were stripped on purpose."), true);
  assert.equal(text.includes("Synthetic sample. Not a real policy."), true);
  assert.equal(text.includes("You tie the boots before the kettle boils."), true);
  assert.equal(
    text.includes(
      "The securing of footwear is ordinarily completed before the heating of water has begun.",
    ),
    true,
  );
  assert.equal(text.includes("1.33"), true);
  assert.equal(text.includes("0.64"), true);
  assert.equal(text.includes("off-voice"), true);
  assert.equal(text.includes("over-used"), true);
  assert.equal(text.includes("under-used"), true);
  assert.equal(
    text.includes(
      "Close is 0.79 or less, the middle score of a chapter measured against its own novelist. Off-voice is 1.27 or more, the middle score against the other novelist. Anything between reads as drifting.",
    ),
    true,
  );
  assert.equal(text.includes("Room for a later tool"), false);
  assert.equal(text.includes("The cost"), true);
  assert.equal(text.includes("18 of 18 example answers"), true);
  assert.equal(text.includes("18/18"), false);
  assert.equal(/saved answers/i.test(text), false);
  assert.equal(/saved replies/i.test(text), false);
  assert.equal(text.includes("The sample notes are adapted examples."), true);
  assert.equal(
    text.includes("Set in Inter. Made in Berlin, with a guitar within reach."),
    true,
  );

  const buttons = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((match) =>
    textOf(match[1]),
  );
  assert.equal(buttons.filter((label) => label === "Try it").length, 6);

  const anchors = anchorsOf(html);
  const live = anchors.filter((anchor) => anchor.label === "Live");
  assert.deepEqual(
    live.map((anchor) => anchor.href),
    [
      "https://citebot-chi.vercel.app/ask",
      "https://retrieval-autopsy.vercel.app",
      "https://style-distance.vercel.app",
    ],
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

test("the first Try it fits above the phone browser chrome", async () => {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const viewports = [
    { width: 390, height: 844, maxBottom: 640 },
    { width: 360, height: 740, maxBottom: 560 },
  ];
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      const box = await page.locator("#citebot [data-try='citebot']").boundingBox();
      assert.ok(box, `${viewport.width}x${viewport.height} has no Try it box`);
      const bottom = box.y + box.height;
      assert.ok(
        bottom <= viewport.maxBottom,
        `${viewport.width}x${viewport.height} Try it bottom ${bottom}px exceeds ${viewport.maxBottom}px`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
