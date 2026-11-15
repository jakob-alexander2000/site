import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const plates = ["citebot", "autopsy", "style"] as const;
const positions = ["scroll-0", "mid-scroll", "end-scroll"] as const;

test("desktop plate stills at scroll 0, mid and end differ", () => {
  const recorded = JSON.parse(readFileSync("docs/evidence/stop2/still-hashes.json", "utf8")) as Record<string, Record<string, string>>;
  for (const plate of plates) {
    const hashes = positions.map((position) => {
      const file = `docs/evidence/stop2/1440x900/${plate}-${position}.png`;
      const hash = createHash("md5").update(readFileSync(file)).digest("hex");
      assert.equal(hash, recorded[plate]?.[position], file);
      return hash;
    });
    assert.equal(new Set(hashes).size, 3, plate);
  }
});

test("stop 4 evidence stills are not byte-identical", () => {
  const dir = "docs/evidence/stop4";
  const files = readdirSync(dir).filter((name) => name.endsWith(".png")).sort();
  const byHash = new Map<string, string>();
  for (const name of files) {
    const hash = createHash("sha256").update(readFileSync(join(dir, name))).digest("hex");
    const previous = byHash.get(hash);
    assert.equal(previous, undefined, `${name} is byte-identical to ${previous}`);
    byHash.set(hash, name);
  }
  assert.ok(files.length >= 12);
});
