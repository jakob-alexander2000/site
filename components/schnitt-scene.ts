import {
  BufferGeometry,
  CatmullRomCurve3,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

type Anchor = { dx: number; dy: number; object: CSS3DObject };

type Card = {
  rig: Group;
  sheet: CSS3DObject;
  cssW: number;
  cssH: number;
  card: Mesh;
  edge?: Mesh;
};

function offsetIn(node: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let current: HTMLElement | null = node;
  while (current && current !== root) {
    x += current.offsetLeft;
    y += current.offsetTop;
    const next: Element | null = current.offsetParent;
    if (!(next instanceof HTMLElement) || (next !== root && !root.contains(next))) break;
    current = next;
  }
  return {
    dx: x + node.offsetWidth / 2 - root.offsetWidth / 2,
    dy: y + node.offsetHeight / 2 - root.offsetHeight / 2,
  };
}

function drawThread(stage: HTMLElement) {
  const svg = stage.querySelector(".tie-svg");
  const from = stage.querySelector("[data-anchor='sentence']");
  const to = stage.querySelector("[data-anchor='passage']");
  if (!(svg instanceof SVGSVGElement) || !(from instanceof HTMLElement) || !(to instanceof HTMLElement)) return;
  const root = stage.getBoundingClientRect();
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const x1 = a.left + a.width / 2 - root.left;
  const y1 = a.top + a.height / 2 - root.top;
  const x2 = b.left + b.width / 2 - root.left;
  const y2 = b.top + b.height / 2 - root.top;
  const path = svg.querySelector("path");
  if (!(path instanceof SVGPathElement)) return;
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, stage.clientWidth)} ${Math.max(1, stage.clientHeight)}`);
  path.setAttribute("d", `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  stage.dataset.ties = "1";
}

export function placeFlatThread(stage: HTMLElement) {
  drawThread(stage);
}

export function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const rows = [...stage.querySelectorAll<HTMLElement>(".plane-row")];
  if (rows.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const parents = rows.map((row) => row.parentElement);
  const fromNode = stage.querySelector("[data-anchor='sentence']");
  const toNode = stage.querySelector("[data-anchor='passage']");
  if (!(fromNode instanceof HTMLElement) || !(toNode instanceof HTMLElement)) throw new Error("Thread anchors are missing");

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 40);
  const look = new Vector3(0.12, 0, 0);
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

  const sheets: CSS3DObject[] = [];
  const materials: MeshBasicMaterial[] = [];
  const geometries: BufferGeometry[] = [];
  const saved = new Map<HTMLElement, { dx: number; dy: number }>();
  for (const node of [fromNode, toNode]) {
    const root = node.closest(".plane-row");
    if (root instanceof HTMLElement) saved.set(node, offsetIn(node, root));
  }

  const cards: Card[] = [];

  rows.forEach((row) => {
    const cssW = Math.max(row.offsetWidth, 280);
    const cssH = Math.max(row.offsetHeight, 120);
    const rig = new Group();
    const sheet = new CSS3DObject(row);
    rig.add(sheet);

    const fill = new MeshBasicMaterial({
      color: row.dataset.plane === "verdict" ? 0x111111 : 0xfbfaf7,
      toneMapped: false,
    });
    const card = new Mesh(new PlaneGeometry(1, 1), fill);
    card.position.z = -0.03;
    rig.add(card);
    materials.push(fill);
    geometries.push(card.geometry);

    let edge: Mesh | undefined;
    if (row.dataset.plane !== "verdict") {
      const ink = new MeshBasicMaterial({ color: 0x111111, toneMapped: false });
      edge = new Mesh(new PlaneGeometry(1, 1), ink);
      edge.position.z = -0.05;
      rig.add(edge);
      materials.push(ink);
      geometries.push(edge.geometry);
    }

    scene.add(rig);
    sheets.push(sheet);
    cards.push({ rig, sheet, cssW, cssH, card, edge });
  });

  const fromSheet = sheets[rows.indexOf(fromNode.closest(".plane-row") as HTMLElement)];
  const toSheet = sheets[rows.indexOf(toNode.closest(".plane-row") as HTMLElement)];
  if (!fromSheet || !toSheet) throw new Error("Thread sheets are missing");
  const fromSaved = saved.get(fromNode);
  const toSaved = saved.get(toNode);
  if (!fromSaved || !toSaved) throw new Error("Thread anchors were not measured");
  const fromAnchor: Anchor = { ...fromSaved, object: fromSheet };
  const toAnchor: Anchor = { ...toSaved, object: toSheet };

  const lineMaterial = new LineBasicMaterial({ color: 0x111111, toneMapped: false });
  const line = new Line(new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]), lineMaterial);
  scene.add(line);

  const world = (anchor: Anchor) => anchor.object.localToWorld(new Vector3(anchor.dx, -anchor.dy, 0));

  const resize = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width < 2 || height < 2) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 800 ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    css.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.fov = width < 800 ? 30 : 24;
    camera.updateProjectionMatrix();
  };

  const render = () => {
    const section = stage.closest(".schnitt");
    const range = section ? section.clientHeight - window.innerHeight : 0;
    const start = section ? section.getBoundingClientRect().top + window.scrollY : 0;
    const progress = range <= 0 ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / range));
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    const phone = width < 520;
    const camZ = phone ? 5.4 : 6.3;
    const fov = phone ? 30 : 24;
    const visible = 2 * Math.tan((fov * Math.PI) / 360) * camZ;
    const worldPerPx = visible / height;
    const sample = cards[0];
    const cssGap = (phone ? 10 : 16) * (1 + progress * 0.85);
    const cssTotal = cards.reduce((sum, card) => sum + card.cssH, 0) + cssGap * Math.max(cards.length - 1, 0);
    const widthScale = (phone ? width * 0.94 : Math.min(420, width * 0.7)) / (sample?.cssW ?? 1);
    const heightScale = (height * 0.84) / Math.max(cssTotal, 1);
    const screenScale = Math.min(widthScale, heightScale);
    const objectScale = screenScale * worldPerPx;
    let cursor = (-cssTotal * screenScale) / 2;
    cards.forEach((card, index) => {
      const screenH = card.cssH * screenScale;
      const yScreen = cursor + screenH / 2;
      cursor += screenH + cssGap * screenScale;
      const yWorld = yScreen * worldPerPx;
      const xWorld = phone ? 0 : 0.05 + (index - 1.5) * 0.028;
      card.sheet.scale.set(objectScale, objectScale, objectScale);
      card.rig.position.set(xWorld, yWorld, (index - 1.5) * (0.16 + progress * 0.72));
      card.card.scale.set(card.cssW * objectScale, card.cssH * objectScale, 1);
      card.edge?.scale.set(card.cssW * objectScale * 1.012, card.cssH * objectScale * 1.018, 1);
    });
    camera.fov = fov;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.set(phone ? 0 : 0.18, 0, camZ);
    camera.lookAt(look);
    scene.updateMatrixWorld(true);

    const startPoint = world(fromAnchor);
    const endPoint = world(toAnchor);
    const mid = startPoint.clone().lerp(endPoint, 0.5);
    mid.z += 0.62;
    const points = new CatmullRomCurve3([startPoint, mid, endPoint]).getPoints(12);
    line.geometry.dispose();
    line.geometry = new BufferGeometry().setFromPoints(points);

    renderer.render(scene, camera);
    css.render(scene, camera);
    drawThread(stage);
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
    rows.forEach((row, index) => {
      const parent = parents[index];
      if (!parent) return;
      row.style.position = "";
      row.style.transform = "";
      row.style.userSelect = "";
      parent.appendChild(row);
    });
    line.geometry.dispose();
    lineMaterial.dispose();
    for (const material of materials) material.dispose();
    for (const geometry of geometries) geometry.dispose();
    renderer.dispose();
    css.domElement.remove();
  };
}
