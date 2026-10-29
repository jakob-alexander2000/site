import { titleFrom, type IndexDoc } from "./desk-index";
import { INDEX_ONCALL, INDEX_REMOTE } from "./sample-notes";

/**
 * Walk order matches Go's filepath.WalkDir: ops/ before remote-work.md.
 * These are two notes from the desk-index sample folder.
 */
export const INDEX_NOTES: IndexDoc[] = [
  {
    path: "ops/oncall.md",
    title: titleFrom("ops/oncall.md", INDEX_ONCALL),
    content: INDEX_ONCALL,
  },
  {
    path: "remote-work.md",
    title: titleFrom("remote-work.md", INDEX_REMOTE),
    content: INDEX_REMOTE,
  },
];
