import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import test from "node:test";
import { chromium } from "playwright";

const PORT = 3456;
const BASE = `http://127.0.0.1:${PORT}`;
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const BANNED = [
  { name: "hire", pattern: /\bhire\b/i },
  { name: "hiring", pattern: /\bhiring\b/i },
  { name: "Mittelstand", pattern: /mittelstand/i },
  { name: "Grounded Docs", pattern: /grounded docs/i },
  { name: "income", pattern: /\bincome\b/i },
  { name: "euro sign", pattern: /€/ },
  { name: "salary", pattern: /\bsalary\b/i },
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
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function anchors(html) {
  const out = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const href = /href="([^"]*)"/.exec(match[1])?.[1] ?? "";
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    out.push({ href, label });
  }
  return out;
}

function assertClean(html, where) {
  for (const banned of BANNED) {
    assert.equal(
      banned.pattern.test(html),
      false,
      `${where} contains banned word: ${banned.name}`,
    );
  }
  assert.equal(EMAIL.test(html), false, `${where} contains an email address`);
  assert.equal(/mailto:/i.test(html), false, `${where} contains a mailto link`);
}

let server;
let browser;

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
  assert.equal(existsSync(CHROME), true, `Chrome not found at ${CHROME}`);
  server = spawn("npx", ["next", "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    stdio: "ignore",
    detached: true,
  });
  server.unref();
  await waitForServer();
  browser = await chromium.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
});

test.after(async () => {
  await browser?.close();
  if (server?.pid) {
    try {
      process.kill(-server.pid, "SIGKILL");
    } catch {
      // The server has already exited.
    }
  }
});

test("home shows the check, the four projects, and no banned words", async () => {
  const response = await fetch(`${BASE}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  const text = textOf(html);

  for (const claim of CLAIMS) {
    assert.equal(text.includes(claim), true, `missing claim: ${claim}`);
  }
  assert.equal(text.includes("Planted wrong draft. The page says 30."), true);
  assert.equal(text.includes("Hand-written example"), true);
  assert.equal(text.includes("Live CiteBot run"), true);
  assert.equal((html.match(/>Pass</g) || []).length, 2);
  assert.equal((html.match(/>Fail</g) || []).length, 2);

  for (const name of ["CiteBot", "citebot-evals", "Desk", "desk-index"]) {
    assert.equal(text.includes(name), true, `missing project: ${name}`);
  }
  assert.equal(text.includes("Live demo"), true);
  assert.equal(text.includes("Recorded run"), true);
  assert.equal(text.includes("18 of 18 example answers"), true);
  assert.equal(text.includes("18/18"), false);
  assert.equal(
    text.includes(
      "Tools that answer from sources you can check: question answering with a visible check, a fixed test set for it, answers from a local folder, and Markdown search without a model.",
    ),
    true,
  );
  assert.equal(
    text.includes(
      "Without fixed questions, a change to CiteBot can't be checked the same way twice.",
    ),
    true,
  );
  assert.equal(text.includes("does not score CiteBot's live answers"), true);
  assert.equal(/score the loop|grounding/i.test(text), false);
  assert.equal(/\bloop\b/i.test(text), false);
  assert.equal(
    /citation chips|agent loop|black-box|black box|\bharness\b|\bUI\b/i.test(text),
    false,
  );
  assert.equal(text.includes("not from files a visitor brings"), true);
  assert.equal(text.includes("only when a passage matches"), true);
  assert.equal(/saved answers|saved replies/i.test(text), false);
  assert.equal(/\bPTO\b/.test(text), false);
  assert.equal(/\bUTC\b/.test(text), false);
  assert.equal(/localhost/i.test(text), false);
  assert.equal(/adv-pto|pto-days/i.test(text), false);
  assert.equal(text.includes("TODO"), false);
  assert.equal(text.includes("Jakob decided"), false);
  assert.equal(text.includes("Retrieval Autopsy"), false);
  assert.equal(text.includes("Style Distance"), false);
  assert.equal(text.includes("Left open"), false);
  assert.equal((text.match(/Try it/g) || []).length, 4);
  assert.equal(text.includes("Read the check again"), true);
  assert.equal(text.includes("Selected work"), true);
  assert.equal(text.includes("Software that cites its sources."), true);
  assert.equal(text.includes("paid time off"), true);
  assert.equal(text.includes("Berlin time"), true);
  assert.equal(text.includes("books the wrong leave"), true);
  assert.equal(text.includes("Desk does not use desk-index."), true);
  assert.equal(text.includes("src/retrieve.ts"), true);
  assert.equal(text.includes("does not write a report"), true);
  assert.equal((text.match(/write a report/gi) || []).length, 1);
  assert.equal(
    text.includes("A small Go search service for Markdown notes"),
    true,
  );
  assert.equal(text.includes("does not power Desk"), true);
  assert.equal(text.includes("does not sit under Desk"), true);
  assert.equal(/underneath/i.test(text), false);
  assert.equal(text.includes("github.com/jakob-alexander2000"), true);
  assert.equal(text.includes("Colophon"), false);

  const live = anchors(html).filter((link) => link.label === "Live");
  assert.ok(live.length >= 1, "expected a Live link for CiteBot");
  for (const link of live) {
    assert.equal(link.href, "https://citebot-chi.vercel.app/ask", link.href);
  }
  for (const link of anchors(html)) {
    if (link.href.includes("github.com")) {
      assert.notEqual(link.label, "Live", link.href);
    }
  }

  const sheets = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((match) => match[1]);
  assert.ok(sheets.length > 0, "missing stylesheet");
  let css = "";
  for (const href of sheets) {
    const file = await fetch(new URL(href, BASE));
    css += await file.text();
  }
  assert.match(css, /size-adjust:/);
  assert.match(css, /ascent-override:/);
  assert.match(css, /descent-override:/);
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /min-height:\s*44px/);

  const preloads = [...html.matchAll(/<link\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => /rel="preload"/.test(tag) && /as="font"/.test(tag));
  assert.equal(preloads.length, 1, `expected one body-font preload, got ${preloads.length}`);
  assertClean(html, "/");
});

test("targets, type size, and the first Try it", async () => {
  const page = await browser.newPage();
  try {
    async function openAt(width, height) {
      await page.setViewportSize({ width, height });
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
    }

    async function box(selector) {
      const value = await page.locator(selector).boundingBox();
      assert.ok(value, `missing ${selector}`);
      return value;
    }

    await openAt(390, 844);
    const phoneTry = await box("#first-try");
    assert.ok(
      phoneTry.y + phoneTry.height <= 640,
      `390x844 Try it bottom ${phoneTry.y + phoneTry.height}`,
    );
    const phoneClaim = await box(".proof .wrong");
    const phoneNote = await box("#note-wrong-open");
    assert.ok(phoneClaim.y + phoneClaim.height <= 844, "claim below the 390x844 screen");
    assert.ok(phoneNote.y + phoneNote.height <= 844, "note below the 390x844 screen");

    await openAt(360, 740);
    const narrowTry = await box("#first-try");
    assert.ok(
      narrowTry.y + narrowTry.height <= 560,
      `360x740 Try it bottom ${narrowTry.y + narrowTry.height}`,
    );
    const narrow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert.ok(
      narrow.scrollWidth <= narrow.clientWidth + 1,
      `horizontal scroll ${narrow.scrollWidth} > ${narrow.clientWidth}`,
    );
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "20.8px";
    });
    const scaledTry = await box("#first-try");
    assert.ok(
      scaledTry.y + scaledTry.height <= 740,
      `360x740 at 130% text Try it bottom ${scaledTry.y + scaledTry.height}`,
    );

    await openAt(1440, 900);
    const deskClaim = await box(".proof .wrong");
    const deskNote = await box("#note-wrong-open");
    assert.ok(deskClaim.y >= 0 && deskClaim.y + deskClaim.height <= 900, "desktop claim");
    assert.ok(deskNote.y >= 0 && deskNote.y + deskNote.height <= 900, "desktop note");

    const smallText = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll("body *")) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const hasText = [...el.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        );
        if (!hasText) continue;
        const size = Number.parseFloat(style.fontSize);
        if (size < 16) bad.push(`${size}px ${el.textContent.trim().slice(0, 48)}`);
      }
      return bad;
    });
    assert.deepEqual(smallText, []);

    const smallTargets = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll("a, button")) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          bad.push(
            `${Math.round(rect.width)}x${Math.round(rect.height)} ${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40)}`,
          );
        }
      }
      return bad;
    });
    assert.deepEqual(smallTargets, []);
  } finally {
    await page.close();
  }
});

test("a missing page stays free of banned words", async () => {
  const missing = await fetch(`${BASE}/not-a-real-page`);
  assert.equal(missing.status, 404);
  const html = await missing.text();
  assert.equal(textOf(html).includes("This page is not on the site."), true);
  assertClean(html, "404");
});
