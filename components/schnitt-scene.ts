import {
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

type Card = {
  rig: Group;
  sheet: CSS3DObject;
  card: Mesh;
  edge?: Mesh;
  cssW: number;
  cssH: number;
};

function progressOf(stage: HTMLElement) {
  const section = stage.closest(".schnitt");
  if (!(section instanceof HTMLElement)) return 0;
  const range = section.clientHeight - window.innerHeight;
  if (range <= 1) return 0;
  const start = section.getBoundingClientRect().top + window.scrollY;
  return Math.min(1, Math.max(0, (window.scrollY - start) / range));
}

function placeCallouts(stage: HTMLElement) {
  const svg = stage.querySelector(".leaders");
  if (!(svg instanceof SVGSVGElement)) return;
  const root = stage.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, stage.clientWidth)} ${Math.max(1, stage.clientHeight)}`);
  const parts: string[] = [];
  for (const slot of stage.querySelectorAll<HTMLElement>(".plane-slot")) {
    const peg = stage.querySelector(`.peg[data-peg="${slot.dataset.plane}"]`);
    const callout = stage.querySelector<HTMLElement>(`.callout[data-for="${slot.dataset.plane}"]`);
    if (!(peg instanceof HTMLElement) || !callout) continue;
    const sheet = peg.closest(".sheet");
    if (!(sheet instanceof HTMLElement)) continue;
    const box = sheet.getBoundingClientRect();
    const pr = peg.getBoundingClientRect();
    const width = 132;
    const room = box.left - root.left;
    if (stage.clientWidth < 700) {
      const y = box.top - root.top;
      callout.style.transform = `translate(0px, ${y}px)`;
      const labelRight = callout.offsetWidth;
      const sheetLeft = box.left - root.left;
      const yLine = y + Math.min(11, callout.offsetHeight / 2);
      parts.push(`<path d="M ${labelRight.toFixed(1)} ${yLine.toFixed(1)} L ${Math.max(labelRight + 4, sheetLeft).toFixed(1)} ${yLine.toFixed(1)}" />`);
    } else if (room < width + 18) {
      const lx = Math.max(4, box.left - root.left);
      const ly = box.top - root.top - 34;
      callout.style.transform = `translate(${lx}px, ${ly}px)`;
      parts.push(`<path d="M ${(lx + 10).toFixed(1)} ${(ly + 30).toFixed(1)} L ${(pr.left - root.left).toFixed(1)} ${(pr.top - root.top).toFixed(1)}" />`);
    } else {
      const left = Math.max(4, room - width - 24);
      const y1 = pr.top + pr.height / 2 - root.top;
      callout.style.transform = `translate(${left}px, ${y1 - 16}px)`;
      parts.push(`<path d="M ${(pr.left - root.left).toFixed(1)} ${y1.toFixed(1)} L ${(left + width).toFixed(1)} ${y1.toFixed(1)}" />`);
    }
    if (stage.clientWidth >= 700) {
      const labelW = callout.offsetWidth;
      const labelH = callout.offsetHeight;
      const placed = callout.getBoundingClientRect();
      const hits = !(placed.right < box.left + 1 || placed.left > box.right - 1 || placed.bottom < box.top + 1 || placed.top > box.bottom - 1);
      if (hits) {
        const sheetLeft = box.left - root.left;
        const sheetTop = box.top - root.top;
        const beside = sheetLeft - labelW - 16;
        if (beside >= 4) {
          const y1 = pr.top + pr.height / 2 - root.top;
          const top = Math.max(4, Math.min(y1 - labelH / 2, root.height - labelH - 4));
          callout.style.transform = `translate(${beside}px, ${top}px)`;
          parts[parts.length - 1] = `<path d="M ${(beside + labelW).toFixed(1)} ${(top + labelH / 2).toFixed(1)} L ${sheetLeft.toFixed(1)} ${(top + labelH / 2).toFixed(1)}" />`;
        } else {
          const lx = Math.max(4, sheetLeft);
          const ly = Math.max(4, sheetTop - labelH - 8);
          callout.style.transform = `translate(${lx}px, ${ly}px)`;
          parts[parts.length - 1] = `<path d="M ${(lx + 12).toFixed(1)} ${(ly + labelH).toFixed(1)} L ${(pr.left - root.left).toFixed(1)} ${(pr.top - root.top).toFixed(1)}" />`;
        }
      }
    }
  }
  svg.innerHTML = parts.join("");
}

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

function placeThread(stage: HTMLElement) {
  const svg = stage.querySelector(".tie-svg");
  const from = stage.querySelector("[data-anchor='sentence']");
  const to = stage.querySelector("[data-anchor='passage']");
  const path = svg?.querySelector("path");
  if (!(svg instanceof SVGSVGElement) || !(from instanceof HTMLElement) || !(to instanceof HTMLElement) || !(path instanceof SVGPathElement)) return;
  const root = stage.getBoundingClientRect();
  const a = rightmostGlyph(from);
  const b = rightmostGlyph(to);
  const y1 = a.top + a.height / 2 - root.top;
  const y2 = b.top + b.height / 2 - root.top;
  const phone = stage.clientWidth < 700;
  const limit = stage.clientWidth - 6;
  const x1 = phone ? Math.min(a.right - root.left, limit) : a.right - root.left;
  const x2 = phone ? Math.min(b.right - root.left, limit) : b.right - root.left;
  const gutter = phone ? Math.min(limit, Math.max(x1, x2) + 8) : Math.min(stage.clientWidth - 10, Math.max(a.right, b.right) - root.left + 16);
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, stage.clientWidth)} ${Math.max(1, stage.clientHeight)}`);
  path.setAttribute("d", `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${gutter.toFixed(1)} ${y1.toFixed(1)} L ${gutter.toFixed(1)} ${y2.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  stage.dataset.ties = "1";
}

export function showExplodedFallback(stage: HTMLElement) {
  stage.dataset.gl = "off";
  placeThread(stage);
}

export function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const slots = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  if (slots.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const parents = slots.map((slot) => slot.parentElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 1, 20000);
  const look = new Vector3();
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: true,
    failIfMajorPerformanceCaveat: false,
  });
  if (!renderer.getContext()) throw new Error("WebGL context is missing");
  renderer.setClearColor(0x000000, 0);

  const css = new CSS3DRenderer();
  css.domElement.className = "schnitt-css";
  stage.appendChild(css.domElement);

  const cards: Card[] = [];
  const materials: MeshBasicMaterial[] = [];
  const geometries: BufferGeometry[] = [];

  slots.forEach((slot) => {
    const cssW = Math.max(slot.offsetWidth, 220);
    const cssH = Math.max(slot.offsetHeight, 96);
    const rig = new Group();
    const narrow = stage.clientWidth < 700;
    const sheet = new CSS3DObject(slot);
    sheet.rotation.order = "YXZ";
    sheet.rotation.y = narrow ? Math.PI / 28 : Math.PI / 10;
    sheet.rotation.x = narrow ? -Math.PI / 36 : -Math.PI / 7;
    rig.add(sheet);

    const fill = new MeshBasicMaterial({
      color: slot.classList.contains("verdict") ? 0x111111 : 0xfbfaf7,
      toneMapped: false,
      side: 2,
    });
    const card = new Mesh(new PlaneGeometry(cssW, cssH), fill);
    card.rotation.copy(sheet.rotation);
    card.position.z = -4;
    rig.add(card);
    materials.push(fill);
    geometries.push(card.geometry);

    let edge: Mesh | undefined;
    if (!slot.classList.contains("verdict")) {
      const ink = new MeshBasicMaterial({ color: 0x111111, toneMapped: false });
      edge = new Mesh(new PlaneGeometry(cssW + 8, cssH + 8), ink);
      edge.rotation.copy(sheet.rotation);
      edge.position.z = -8;
      rig.add(edge);
      materials.push(ink);
      geometries.push(edge.geometry);
    }
    scene.add(rig);
    cards.push({ rig, sheet, card, edge, cssW, cssH });
  });

  const resize = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width < 2 || height < 2) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    css.setSize(width, height);
  };

  const render = () => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    const progress = progressOf(stage);
    const phone = width < 700;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const half = (camera.fov * Math.PI) / 360;
    const dist = (height / 2) / Math.tan(half);
    renderer.setSize(width, height, false);
    css.setSize(width, height);

    const sample = cards[0];
    const rawH = sample?.cssH ?? 140;
    const fit = 1;
    const planeH = rawH * fit;
    const gap0 = planeH * 0.95;
    const gap1 = planeH * 1.62;
    const gap = gap0 + progress * (gap1 - gap0);
    const x = phone ? 0 : width * 0.08;

    if (phone) {
      const tilt = 6;
      let pad = 12 + progress * 10;
      let fitPhone = 1;
      const span = () => cards.reduce((sum, item) => sum + item.cssH * fitPhone + tilt, 0) + pad * (cards.length - 1);
      if (span() > height - 6) {
        const cssSum = cards.reduce((sum, item) => sum + item.cssH, 0);
        const room = height - 20 - tilt * cards.length - 12 * (cards.length - 1);
        fitPhone = Math.min(1, room / Math.max(cssSum, 1));
        pad = 12;
      }
      const used = span();
      const inset = Math.max(4, (height - used) / 2);
      const overflow = inset + used - (height - 12);
      const lift = Math.max(0, Math.min(overflow, inset - 4));
      let cursor = inset;
      cards.forEach((item, index) => {
        const box = item.cssH * fitPhone + tilt;
        const center = cursor + (item.cssH * fitPhone) / 2;
        cursor += box + pad;
        item.sheet.scale.set(fitPhone, fitPhone, fitPhone);
        item.card.scale.set(fitPhone, fitPhone, 1);
        item.edge?.scale.set(fitPhone, fitPhone, 1);
        const sheetW = item.cssW * fitPhone;
        const worldX = 132 + sheetW / 2 - width / 2;
        const worldY = height / 2 - center + lift;
        item.rig.position.set(worldX, worldY, (index - 1.5) * (6 + progress * 18));
      });
      camera.position.set(0, 0, dist);
      look.set(0, 0, 0);
    } else {
      cards.forEach((item, index) => {
        const y = (1.5 - index) * gap;
        item.sheet.scale.set(fit, fit, fit);
        item.card.scale.set(fit, fit, 1);
        item.edge?.scale.set(fit, fit, 1);
        item.rig.position.set(x, y, (index - 1.5) * (10 + progress * 48));
      });
      camera.position.set(dist * 0.04, dist * 0.02 + progress * 12, dist);
      look.set(x * 0.35, progress * 8, 0);
    }
    camera.lookAt(look);
    scene.updateMatrixWorld(true);
    renderer.render(scene, camera);
    css.render(scene, camera);
    if (!phone) {
      let fitted = gap;
      let lift = 0;
      for (let pass = 0; pass < 4; pass += 1) {
        const root = stage.getBoundingClientRect();
        const rects = [...stage.querySelectorAll<HTMLElement>(".sheet")].map((sheet) => sheet.getBoundingClientRect());
        if (rects.length !== cards.length) break;
        const below = Math.max(0, ...rects.map((rect) => rect.bottom)) - (root.bottom - 12);
        const above = root.top + 8 - Math.min(...rects.map((rect) => rect.top));
        if (below <= 1 && above <= 1) break;
        if (below > 1 && above < -1) lift += Math.min(below, -above);
        else if (above > 1 && below < -1) lift -= Math.min(above, -below);
        else fitted = Math.max(gap0, fitted - Math.max(below, above) / 1.5);
        cards.forEach((item, index) => {
          item.rig.position.y = (1.5 - index) * fitted + lift;
        });
        scene.updateMatrixWorld(true);
        renderer.render(scene, camera);
        css.render(scene, camera);
      }
    }
    placeCallouts(stage);
    placeThread(stage);
  };

  let frame = 0;
  const draw = () => {
    frame = 0;
    render();
  };
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(draw);
  };
  const onResize = () => {
    resize();
    schedule();
  };

  resize();
  render();
  stage.dataset.gl = "ready";
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", onResize);
    if (frame) window.cancelAnimationFrame(frame);
    slots.forEach((slot, index) => {
      const parent = parents[index];
      if (!parent) return;
      slot.style.position = "";
      slot.style.transform = "";
      slot.style.userSelect = "";
      parent.appendChild(slot);
    });
    for (const material of materials) material.dispose();
    for (const geometry of geometries) geometry.dispose();
    renderer.dispose();
    css.domElement.remove();
    stage.dataset.gl = "off";
  };
}
