export const SHEETS = [
  { id: "top", index: "00", name: "Hero", label: "00 Hero" },
  { id: "citebot", index: "01", name: "CiteBot", label: "01 CiteBot" },
  { id: "autopsy", index: "02", name: "Retrieval Autopsy", label: "02 Retrieval Autopsy" },
  { id: "style", index: "03", name: "Style Distance", label: "03 Style Distance" },
  { id: "skills", index: "04", name: "Skills", label: "04 Skills" },
  { id: "about", index: "05", name: "About", label: "05 About" },
  { id: "contact", index: "06", name: "Contact", label: "06 Contact" },
  { id: "footer", index: "07", name: "Footer", label: "07 Footer" },
] as const;

/** Footer lists 00–06 and does not link to itself. */
export const FOOTER_SHEETS = SHEETS.filter((sheet) => sheet.index !== "07");
