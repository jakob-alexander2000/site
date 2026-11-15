/** Put each CiteBot leader on its label's row and on the left edge of its sheet. */
export function alignCiteLeaders() {
  const frame = document.querySelector("#citebot .drawing-frame");
  const svg = frame?.querySelector("svg.plate-drawing");
  if (!(frame instanceof HTMLElement) || !(svg instanceof SVGSVGElement)) return;
  if (svg.getBoundingClientRect().width < 2) return;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const inverse = ctm.inverse();
  const point = svg.createSVGPoint();
  const toUser = (x: number, y: number) => {
    point.x = x;
    point.y = y;
    const mapped = point.matrixTransform(inverse);
    return { x: mapped.x, y: mapped.y };
  };
  for (const line of svg.querySelectorAll<SVGLineElement>("line.leader-line[data-for]")) {
    const id = line.dataset.for ?? "";
    const label = frame.querySelector<HTMLElement>(`.leader-name[data-for="${id}"]`);
    const face = svg.querySelector<SVGGraphicsElement>(`.draw-sheet[data-step="${id}"] > rect.sheet-face`);
    if (!label || !(face instanceof SVGGraphicsElement)) continue;
    const labelBox = label.getBoundingClientRect();
    const faceBox = face.getBoundingClientRect();
    if (labelBox.width < 2 || faceBox.width < 2) continue;
    const y = (labelBox.top + labelBox.bottom) / 2;
    const start = toUser(labelBox.right, y);
    const end = toUser(faceBox.left, y);
    line.setAttribute("x1", start.x.toFixed(2));
    line.setAttribute("y1", start.y.toFixed(2));
    line.setAttribute("x2", end.x.toFixed(2));
    line.setAttribute("y2", end.y.toFixed(2));
  }
  frame.dataset.leaders = "ready";
}

/** Keep the Answer label on the first answer line, including when the row wraps. */
export function alignAutopsyLabels() {
  const rail = document.querySelector("#autopsy .label-rail");
  const line = document.querySelector("#autopsy .word-align .answer-line");
  const answer = rail?.querySelectorAll<HTMLElement>(".leader-name")[1];
  if (!(rail instanceof HTMLElement) || !(line instanceof HTMLElement) || !(answer instanceof HTMLElement)) return;
  answer.style.marginTop = "0";
  const delta = line.getBoundingClientRect().top - answer.getBoundingClientRect().top;
  answer.style.marginTop = `${Math.round(delta)}px`;
}
