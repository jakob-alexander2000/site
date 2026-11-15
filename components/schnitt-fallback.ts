function rightmostGlyph(node: HTMLElement) {
  const text = node.firstChild;
  if (!text || text.nodeType !== Node.TEXT_NODE || !text.textContent) return node.getBoundingClientRect();
  const range = document.createRange();
  let best = node.getBoundingClientRect();
  let right = -Infinity;
  for (let index = 0; index < text.textContent.length; index += 1) {
    if (!text.textContent[index].trim()) continue;
    range.setStart(text, index);
    range.setEnd(text, index + 1);
    const box = range.getBoundingClientRect();
    if (box.width > 0 && box.right > right) {
      right = box.right;
      best = box;
    }
  }
  return best;
}

export function placeThread(stage: HTMLElement) {
  const svg = stage.querySelector(".tie-svg");
  const from = stage.querySelector("[data-anchor='sentence']");
  const to = stage.querySelector("[data-anchor='passage']");
  const path = svg?.querySelector("path");
  if (!(svg instanceof SVGSVGElement) || !(from instanceof HTMLElement) || !(to instanceof HTMLElement) || !(path instanceof SVGPathElement)) return;
  const root = stage.getBoundingClientRect();
  const a = rightmostGlyph(from);
  const b = rightmostGlyph(to);
  const fromSheet = from.closest(".sheet")?.getBoundingClientRect() ?? a;
  const toSheet = to.closest(".sheet")?.getBoundingClientRect() ?? b;
  const y1 = a.top + a.height / 2 - root.top;
  const x1 = a.right - root.left;
  const x2 = b.right - root.left;
  const above1 = a.top - root.top - 4;
  const above2 = b.top - root.top - 4;
  const phone = stage.clientWidth < 700;
  const gutter = phone
    ? Math.min(stage.clientWidth - 6, Math.max(fromSheet.right, toSheet.right) - root.left + 8)
    : Math.min(stage.clientWidth - 8, Math.max(fromSheet.right, toSheet.right) - root.left + 10);
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, stage.clientWidth)} ${Math.max(1, stage.clientHeight)}`);
  path.setAttribute(
    "d",
    `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x1.toFixed(1)} ${above1.toFixed(1)} L ${gutter.toFixed(1)} ${above1.toFixed(1)} L ${gutter.toFixed(1)} ${above2.toFixed(1)} L ${x2.toFixed(1)} ${above2.toFixed(1)}`,
  );
  stage.dataset.ties = "1";
}

export function showExplodedFallback(stage: HTMLElement) {
  stage.dataset.gl = "off";
  placeThread(stage);
}
