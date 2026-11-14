export type SchnittSentence = {
  id: "pass" | "fail";
  text: string;
  verdict: "pass" | "fail";
  evidence: string;
  citationId: string | null;
  tied: boolean;
};

export type SchnittRun = {
  question: string;
  handbook: { file: string; title: string; lines: readonly string[] };
  passage: { id: string; text: string; span: string };
  sentences: readonly SchnittSentence[];
  recordedLabel: string;
  pinned: string;
  evalCount: { passed: number; total: number; dated: string; caption: string };
};

type VerifyCase = {
  name: string;
  raw: string;
};

type Claim = {
  claim?: string;
  verdict?: string;
  evidence?: string;
  citationId?: string;
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

function claimsFrom(raw: string): Claim[] {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) return [];
  const parsed = JSON.parse(raw.slice(start, end + 1)) as { claims?: Claim[] };
  return Array.isArray(parsed.claims) ? parsed.claims : [];
}

function firstClaim(cases: VerifyCase[], name: string): Claim {
  const found = cases.find((entry) => entry.name === name);
  const claim = found ? claimsFrom(found.raw)[0] : undefined;
  if (!claim?.claim || !claim.verdict || !claim.evidence) {
    throw new Error(`Missing verify case: ${name}`);
  }
  return claim;
}

/** Keep the paid-time-off section and drop the clause that names a place. */
export function handbookLines(markdown: string): { title: string; lines: string[] } {
  const rows = markdown.split(/\r?\n/);
  const start = rows.findIndex((row) => row.trim() === "## Paid time off");
  if (start < 0) throw new Error("Paid time off section is missing");
  const rest = rows.slice(start + 1);
  const next = rest.findIndex((row) => row.startsWith("## "));
  const body = (next === -1 ? rest : rest.slice(0, next)).join("\n");
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\*\*/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => {
      const cut = paragraph.split(", plus ")[0] ?? paragraph;
      if (cut === paragraph) return paragraph;
      return cut.endsWith(".") ? cut : `${cut}.`;
    });
  const lines = paragraphs.slice(0, 2);
  if (lines.length < 2) throw new Error("Handbook section did not yield two lines");
  return { title: "Paid time off", lines };
}

function pinLabel(pinned: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pinned);
  if (!match) throw new Error(`Bad pin date: ${pinned}`);
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) throw new Error(`Bad pin date: ${pinned}`);
  return `${Number(match[3])} ${month} ${match[1]}`;
}

function evalCount(report: string): SchnittRun["evalCount"] {
  const score = /(\d+)\/(\d+) passed/.exec(report);
  if (!score || score[1] !== score[2]) throw new Error("Offline eval score is missing");
  const started = /Started:\*\*\s+(\d{1,2}) ([A-Za-z]+) (\d{4})/.exec(report);
  if (!started) throw new Error("Offline eval date is missing");
  const month = started[2]?.slice(0, 3).toUpperCase();
  const dated = `${started[1]} ${month} ${started[3]}`;
  const passed = Number(score[1]);
  return { passed, total: Number(score[2]), dated, caption: `${passed} of ${passed}` };
}

export function extractSchnittRun(input: {
  verifyCases: string;
  handbook: string;
  golden: string;
  sampleReport: string;
  pinned: string;
}): SchnittRun {
  const cases = JSON.parse(input.verifyCases) as VerifyCase[];
  const pass = firstClaim(cases, "all pass is grounded");
  const fail = firstClaim(cases, "all fail is ungrounded");
  if (pass.verdict !== "pass" || fail.verdict !== "fail") {
    throw new Error("Verify verdicts are not the paid-leave pair");
  }
  const golden = JSON.parse(input.golden) as { cases?: Array<{ id?: string; question?: string }> };
  const question = golden.cases?.find((entry) => entry.id === "pto-days")?.question;
  if (!question) throw new Error("Paid-leave question is missing");
  const handbook = handbookLines(input.handbook);
  const span = pass.evidence ?? "";
  const passage = handbook.lines[0] ?? "";
  if (!passage.includes(span)) throw new Error("Passage does not contain the pass evidence");
  const pinned = pinLabel(input.pinned);
  const count = evalCount(input.sampleReport);
  return {
    question,
    handbook: { file: "pto-and-leave.md", title: handbook.title, lines: handbook.lines },
    passage: { id: pass.citationId ?? "", text: passage, span },
    sentences: [
      {
        id: "pass",
        text: pass.claim ?? "",
        verdict: "pass",
        evidence: pass.evidence ?? "",
        citationId: pass.citationId ?? null,
        tied: true,
      },
      {
        id: "fail",
        text: fail.claim ?? "",
        verdict: "fail",
        evidence: fail.evidence ?? "",
        citationId: fail.citationId ?? null,
        tied: false,
      },
    ],
    recordedLabel: `DATA FROM A RECORDED RUN, ${pinned}`,
    pinned,
    evalCount: count,
  };
}
