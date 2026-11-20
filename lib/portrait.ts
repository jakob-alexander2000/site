import { existsSync } from "node:fs";
import { join } from "node:path";

/** The line-drawing portrait. Drop one of these into public/ and the About slot appears. */
export const PORTRAIT_FILES = ["portrait.svg", "portrait.png"] as const;

export function portraitSource(publicDir: string = join(process.cwd(), "public")): string | null {
  for (const file of PORTRAIT_FILES) if (existsSync(join(publicDir, file))) return `/${file}`;
  return null;
}
