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
import { placeThread } from "@/components/schnitt-fallback";

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

function intersects(a: DOMRect, b: DOMRect) {
  return a.width > 0 && b.width > 0 && a.left < b.right + 2 && a.right > b.left - 2 && a.top < b.bottom + 2 && a.bottom > b.top - 2;
}

function placeCallouts(stage: HTMLElement) {
  const svg = stage.querySelector(".leaders");
  if (!(svg instanceof SVGSVGElement)) return;
  const root = stage.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, stage.clientWidth)} ${Math.max(1, stage.clientHeight)}`);
  const sheets = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  const parked: DOMRect[] = [];
  const parts: string[] = [];
  const gap = 20;
  for (const slot of stage.querySelectorAll<HTMLElement>(".plane-slot")) {
    const peg = stage.querySelector(`.peg[data-peg="${slot.dataset.plane}"]`);
    const callout = stage.querySelector<HTMLElement>(`.callout[data-for="${slot.dataset.plane}"]`);
    if (!(peg instanceof HTMLElement) || !callout) continue;
    const sheet = peg.closest(".sheet");
    if (!(sheet instanceof HTMLElement)) continue;
    const box = sheet.getBoundingClientRect();
    const pr = peg.getBoundingClientRect();
    const labelW = callout.offsetWidth;
    const labelH = callout.offsetHeight;
    const pegY = pr.top + pr.height / 2 - root.top;
    let x = box.left - root.left - labelW - gap;
    let y = pegY - labelH / 2;
    if (x < 4) {
      x = Math.max(4, box.left - root.left);
      y = box.top - root.top - labelH - gap;
    }
    x = Math.max(4, Math.min(x, stage.clientWidth - labelW - 4));
    y = Math.max(4, Math.min(y, stage.clientHeight - labelH - 4));
    for (let pass = 0; pass < 6; pass += 1) {
      callout.style.transform = `translate(${x}px, ${y}px)`;
      const placed = callout.getBoundingClientRect();
      const hitSheet = sheets.find((item) => intersects(placed, item.getBoundingClientRect()));
      const hitLabel = parked.find((item) => intersects(placed, item));
      if (!hitSheet && !hitLabel) break;
      if (hitSheet) {
        const hit = hitSheet.getBoundingClientRect();
        const beside = hit.left - root.left - labelW - gap;
        if (beside >= 4) {
          x = beside;
          y = Math.max(4, Math.min(pegY - labelH / 2, stage.clientHeight - labelH - 4));
        } else {
          y = Math.max(4, hit.top - root.top - labelH - gap);
        }
      } else if (hitLabel) {
        y = Math.max(4, hitLabel.top - root.top - labelH - 6);
      }
    }
    callout.style.transform = `translate(${x}px, ${y}px)`;
    const placed = callout.getBoundingClientRect();
    parked.push(placed);
    const yLine = placed.top + placed.height / 2 - root.top;
    const xStart = placed.right - root.left;
    const xEnd = pr.left - root.left;
    const yEnd = pr.top + pr.height / 2 - root.top;
    parts.push(`<path d="M ${xStart.toFixed(1)} ${yLine.toFixed(1)} L ${xEnd.toFixed(1)} ${yEnd.toFixed(1)}" />`);
  }
  svg.innerHTML = parts.join("");
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

  const labelLane = 188;
  const maxSheet = Math.max(280, stage.clientWidth - labelLane - 28);
  slots.forEach((slot) => {
    slot.style.boxSizing = "border-box";
    slot.style.transformOrigin = "center center";
    if (stage.clientWidth >= 700) slot.style.width = `${Math.min(slot.offsetWidth, maxSheet)}px`;
    const cssW = Math.max(slot.offsetWidth, 220);
    const cssH = Math.max(slot.offsetHeight, 96);
    const rig = new Group();
    const narrow = stage.clientWidth < 700;
    const sheet = new CSS3DObject(slot);
    sheet.rotation.order = "YXZ";
    sheet.rotation.y = narrow ? Math.PI / 28 : Math.PI / 14;
    sheet.rotation.x = narrow ? -Math.PI / 36 : -Math.PI / 12;
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
      const placeDesktop = (gapValue: number) => {
        cards.forEach((item, index) => {
          const y = (1.5 - index) * gapValue;
          item.sheet.scale.set(fit, fit, fit);
          item.card.scale.set(fit, fit, 1);
          item.edge?.scale.set(fit, fit, 1);
          const worldX = labelLane + item.cssW / 2 - width / 2;
          item.rig.position.set(worldX, y, (index - 1.5) * 12);
        });
        const anchorX = labelLane + (sample?.cssW ?? 0) / 2 - width / 2;
        camera.position.set(anchorX * 0.04, 0, dist);
        look.set(anchorX * 0.15, 0, 0);
        camera.lookAt(look);
        scene.updateMatrixWorld(true);
        renderer.render(scene, camera);
        css.render(scene, camera);
      };
      const overflow = () => {
        const root = stage.getBoundingClientRect();
        const rects = [...stage.querySelectorAll<HTMLElement>(".sheet")].map((sheet) => sheet.getBoundingClientRect());
        if (rects.length !== cards.length) return 0;
        const below = Math.max(0, ...rects.map((rect) => rect.bottom)) - (root.bottom - 16);
        const above = root.top + 12 - Math.min(...rects.map((rect) => rect.top));
        return Math.max(below, above, 0);
      };
      let maxGap = planeH * 1.7;
      placeDesktop(maxGap);
      for (let pass = 0; pass < 8 && overflow() > 1; pass += 1) {
        maxGap = Math.max(planeH * 0.9, maxGap - overflow() / 2.2);
        placeDesktop(maxGap);
      }
      const gap = maxGap * (0.7 + 0.3 * progress);
      placeDesktop(gap);
    }
    if (phone) {
      camera.lookAt(look);
      scene.updateMatrixWorld(true);
      renderer.render(scene, camera);
      css.render(scene, camera);
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
  stage.dataset.gl = "ready";
  render();
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
      slot.style.width = "";
      slot.style.transformOrigin = "";
      slot.style.boxSizing = "";
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
