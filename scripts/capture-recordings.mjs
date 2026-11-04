import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const out = "/tmp/looks";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function record(name, url, run) {
  const context = await browser.newContext({
    viewport: { width: 960, height: 600 },
    deviceScaleFactor: 1,
    recordVideo: { dir: out, size: { width: 960, height: 600 } },
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    console.log(name, "status", response?.status(), page.url());
    await page.waitForTimeout(800);
    await run(page);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}/${name}-end.png` });
    const sample = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 400));
    console.log(name, "text", sample);
  } finally {
    const video = page.video();
    await context.close();
    if (video) console.log(name, "video", await video.path());
  }
}

await record("citebot", "https://citebot-chi.vercel.app/ask", async (page) => {
  await page.getByRole("button", { name: /paid vacation days/i }).click();
  await page.waitForTimeout(4000);
});

await record("autopsy", "https://retrieval-autopsy.vercel.app/", async (page) => {
  await page.getByRole("button", { name: /annual leave/i }).click();
  const drops = page.getByText(/Drops conditions/i).first();
  await drops.click();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.waitForTimeout(2500);
});

await record("style", "https://style-distance.vercel.app/", async (page) => {
  await page.getByRole("button", { name: "Brand-voice demo" }).click();
  await page.waitForTimeout(2000);
});

await browser.close();
