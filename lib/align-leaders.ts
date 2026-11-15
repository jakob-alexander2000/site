/**
 * CiteBot: the hairline runs from the [1] mark to the underlined span, and the
 * pen loop sits around the failed sentence. Measured, so the type can wrap.
 */
export function alignCiteLeaders() {
  const frame = document.querySelector("#citebot .drawing-frame");
  const svg = frame?.querySelector("svg.plate-drawing");
  if (frame instanceof HTMLElement && svg instanceof SVGSVGElement && svg.getBoundingClientRect().width >= 2) {
    const span = svg.querySelector<SVGTextElement>("text.cite-span");
    const mark = svg.querySelector<SVGTextElement>("text.cite-mark");
    const line = svg.querySelector<SVGLineElement>("line.cite-line");
    const underline = svg.querySelector<SVGLineElement>("line.cite-underline");
    const word = svg.querySelector<SVGTextElement>(".fail-mark .fail-word");
    const loop = svg.querySelector<SVGEllipseElement>(".fail-mark .pen-loop");
    const label = svg.querySelector<SVGTextElement>("text.cite-fail-label");
    if (span && mark && line && underline) {
      const a = span.getBBox();
      const m = mark.getBBox();
      const y = a.y + a.height / 2;
      underline.setAttribute("x2", (a.x + a.width).toFixed(2));
      line.setAttribute("x1", (m.x - 4).toFixed(2));
      line.setAttribute("y1", y.toFixed(2));
      line.setAttribute("x2", (a.x + a.width + 2).toFixed(2));
      line.setAttribute("y2", y.toFixed(2));
    }
    if (word && loop) {
      const w = word.getBBox();
      const rx = w.width / 2 + 24;
      loop.setAttribute("cx", (w.x + w.width / 2).toFixed(2));
      loop.setAttribute("cy", (w.y + w.height / 2).toFixed(2));
      loop.setAttribute("rx", rx.toFixed(2));
      loop.setAttribute("ry", (w.height / 2 + 10).toFixed(2));
      if (label) label.setAttribute("x", (w.x + w.width / 2 + rx + 16).toFixed(2));
    }
    frame.dataset.leaders = "ready";
  }
  const stack = document.querySelector("#citebot .cite-stack");
  const link = stack?.querySelector("svg.cite-link path");
  const stackSpan = stack?.querySelector(".cite-passage .cite-span");
  const stackMark = stack?.querySelector(".cite-mark");
  if (!(stack instanceof HTMLElement) || !link || !stackSpan || !stackMark) return;
  const root = stack.getBoundingClientRect();
  if (root.width < 2) return;
  const a = stackSpan.getBoundingClientRect();
  const m = stackMark.getBoundingClientRect();
  const gutter = 6;
  const ya = a.top + a.height / 2 - root.top;
  const ym = m.top + m.height / 2 - root.top;
  link.setAttribute(
    "d",
    `M ${(m.left - root.left - 4).toFixed(1)} ${ym.toFixed(1)} H ${gutter} V ${ya.toFixed(1)} H ${(a.left - root.left - 3).toFixed(1)}`,
  );
  stack.dataset.leaders = "ready";
}

/** Keep the Answer label on the first answer line, including when the row wraps. */
export function alignAutopsyLabels() {
  const rail = document.querySelector("#autopsy .label-rail");
  const line = document.querySelector("#autopsy .word-align .answer-line");
  const answer = rail?.querySelectorAll<HTMLElement>(".leader-name")[1];
  if (!(rail instanceof HTMLElement) || !(line instanceof HTMLElement) || !(answer instanceof HTMLElement)) return;
  answer.style.marginTop = "0";
  // On phones the drawn row is display:none and reports top 0. Measuring it
  // against a scrolled label grew the rail by the scroll offset on every resize.
  const lineBox = line.getBoundingClientRect();
  if (lineBox.width < 2 || lineBox.height < 2) return;
  const delta = lineBox.top - answer.getBoundingClientRect().top;
  answer.style.marginTop = `${Math.max(0, Math.round(delta))}px`;
}
