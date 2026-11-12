import { readFileSync } from "node:fs";
import { join } from "node:path";
import { extractSchnittRun, type SchnittRun } from "@/lib/schnitt-extract";

type Manifest = {
  pinned: string;
  citebot: { commit: string; files: Record<string, string> };
  citebotEvals: { commit: string; files: Record<string, string> };
};

export function loadManifest(): Manifest {
  return JSON.parse(readFileSync(join(process.cwd(), "content/fixtures/manifest.json"), "utf8")) as Manifest;
}

export function loadSchnittRun(): SchnittRun {
  const root = process.cwd();
  const manifest = JSON.parse(readFileSync(join(root, "content/fixtures/manifest.json"), "utf8")) as Manifest;
  return extractSchnittRun({
    verifyCases: readFileSync(join(root, "content/fixtures/citebot/tests/fixtures/verify-cases.json"), "utf8"),
    handbook: readFileSync(join(root, "content/fixtures/citebot/examples/nordlicht-corpus/pto-and-leave.md"), "utf8"),
    golden: readFileSync(join(root, "content/fixtures/citebot/evals/golden.json"), "utf8"),
    sampleReport: readFileSync(join(root, "content/fixtures/citebot-evals/reports/SAMPLE.md"), "utf8"),
    pinned: manifest.pinned,
  });
}
