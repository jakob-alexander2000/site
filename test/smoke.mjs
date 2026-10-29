import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
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
    .replace(/\s+/g, " ");
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

test("home shows the check, the four projects, and no banned words", async () => {
  const response = await fetch(`${BASE}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  const text = textOf(html);

  for (const claim of CLAIMS) {
    assert.equal(text.includes(claim), true, `missing claim: ${claim}`);
  }
  assert.equal(text.includes("Planted wrong draft. The page says 30."), true);
  assert.equal((html.match(/>Pass</g) || []).length, 2);
  assert.equal((html.match(/>Fail</g) || []).length, 1);

  for (const name of ["CiteBot", "citebot-evals", "Desk", "desk-index"]) {
    assert.equal(text.includes(name), true, `missing project: ${name}`);
  }
  assert.equal(text.includes("Live demo"), true);
  assert.equal(text.includes("Recorded run"), true);
  assert.equal(text.includes("18 of 18"), true);
  assert.equal((text.match(/Try it/g) || []).length, 4);
  assert.equal((text.match(/TODO\(Jakob\)/g) || []).length, 4);
  assert.equal(text.includes("Retrieval Autopsy"), true);
  assert.equal(text.includes("Style Distance"), true);
  assert.equal(text.includes("Selected work"), true);
  assert.equal(text.includes("github.com/jakob-alexander2000"), true);
  assertClean(html, "/");
});

test("a missing page stays free of banned words", async () => {
  const missing = await fetch(`${BASE}/not-a-real-page`);
  assert.equal(missing.status, 404);
  const html = await missing.text();
  assert.equal(textOf(html).includes("This page is not on the site."), true);
  assertClean(html, "404");
});
