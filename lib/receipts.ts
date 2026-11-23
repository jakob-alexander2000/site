import { cacheLife } from "next/cache";

/** The weekly eval receipts in the studio repo. The site shows only what a receipt says. */
export const RECEIPTS_HOME = "https://github.com/jakob-alexander2000/studio/tree/main/checks/receipts";
const RAW = `https://raw.githubusercontent.com/jakob-alexander2000/studio/${process.env.RECEIPTS_REF ?? "main"}/checks/receipts/`;
const BLOB = "https://github.com/jakob-alexander2000/studio/blob/main/checks/receipts/";

export type ReceiptLine = {
  project: string;
  eval: string | null;
  passed: number;
  total: number;
  file: string;
  worse: boolean;
};

export type Receipts = { date: string; lines: readonly ReceiptLine[] };

/** Accepts only a well-formed latest.json; anything else means "no receipt", never a guess. */
export function parseReceipts(raw: unknown): Receipts | null {
  if (!raw || typeof raw !== "object") return null;
  const { date, receipts } = raw as { date?: unknown; receipts?: unknown };
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(receipts)) return null;
  const lines: ReceiptLine[] = [];
  for (const item of receipts) {
    const r = item as Record<string, unknown>;
    if (
      typeof r.project !== "string" ||
      typeof r.file !== "string" ||
      !/^[\w.-]+\.json$/.test(r.file) ||
      !Number.isInteger(r.passed) ||
      !Number.isInteger(r.total) ||
      (r.total as number) <= 0 ||
      (r.passed as number) < 0 ||
      (r.passed as number) > (r.total as number)
    ) {
      return null;
    }
    if (r.eval !== undefined && typeof r.eval !== "string") return null;
    lines.push({
      project: r.project,
      eval: (r.eval as string | undefined) ?? null,
      passed: r.passed as number,
      total: r.total as number,
      file: r.file,
      worse: Boolean(r.worse_than),
    });
  }
  return lines.length ? { date, lines } : null;
}

export async function getReceipts(): Promise<Receipts | null> {
  "use cache";
  cacheLife("hours");
  try {
    const response = await fetch(`${RAW}latest.json`);
    if (!response.ok) return null;
    return parseReceipts(await response.json());
  } catch {
    return null;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(iso: string): string {
  return `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
}

export function receiptHref(line: ReceiptLine): string {
  return `${BLOB}${line.file}`;
}

/** What a specimen panel shows in place of "recorded": the last check, linked to its receipt. */
export type Stamp = { label: string; href: string; fault: boolean };

/** What each test set counts, so a stamp says "81 of 81 tests", not a bare fraction. */
const UNITS: Record<string, string> = { unit: "tests", "handbook-samples": "sample answers" };

export function stampFor(receipts: Receipts | null, project: string, evalName?: string): Stamp | null {
  const line = receipts?.lines.find((item) => item.project === project && (evalName === undefined || item.eval === evalName));
  if (!receipts || !line) return null;
  const failed = line.passed < line.total;
  const unit = line.eval ? UNITS[line.eval] : undefined;
  return {
    label: `checked ${shortDate(receipts.date)} · ${line.passed} of ${line.total}${unit ? ` ${unit}` : ""}${failed ? " pass" : ""}`,
    href: receiptHref(line),
    fault: failed || line.worse,
  };
}
