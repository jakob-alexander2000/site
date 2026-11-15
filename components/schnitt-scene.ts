import { CanvasTexture } from "three/src/textures/CanvasTexture.js";
import { Group } from "three/src/objects/Group.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry.js";
import { Scene } from "three/src/scenes/Scene.js";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
import { placeThread } from "@/components/schnitt-fallback";
import { STYLE_DISTANCE } from "@/lib/diagrams";

const PLATES = ["citebot", "autopsy", "style", "skills"] as const;
const DEPTHS = [-1600, -3200, -4800, -6400];

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** The frame callback only queues the timer. The next step runs in that timer. */
function yieldTurn(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 0);
    });
  });
}

function railProgress() {
  const skills = document.getElementById("skills");
  if (!skills) return 0;
  const end = skills.offsetTop + skills.offsetHeight - window.innerHeight;
  if (end <= 1) return 0;
  return Math.min(1, Math.max(0, window.scrollY / end));
}

function sectionProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  return clamp01((window.innerHeight - rect.top) / (rect.height + window.innerHeight));
}

function layoutPlates() {
  if (document.documentElement.dataset.schnitt !== "gl") return;
  const rail = railProgress();
  document.documentElement.dataset.rail = rail.toFixed(4);
  const cite = document.getElementById("citebot");
  const sheets = [...document.querySelectorAll<SVGElement>("#citebot .draw-sheet")];
  if (cite && sheets.length) {
    const progress = sectionProgress(cite);
    sheets.forEach((sheet, index) => {
      const lift = Math.round(progress * (sheets.length - 1)) === index ? -10 : 0;
      sheet.setAttribute("transform", `translate(0 ${lift.toFixed(1)})`);
    });
  }
  const autopsy = document.getElementById("autopsy");
  if (autopsy) {
    const drop = sectionProgress(autopsy) * 28;
    autopsy.querySelectorAll<HTMLElement>(".offcut").forEach((node) => {
      node.style.transform = `translateY(${drop.toFixed(1)}px)`;
    });
  }
  const style = document.getElementById("style");
  if (style) {
    const progress = sectionProgress(style);
    const shift = progress * 16;
    style.querySelectorAll<HTMLElement>(".draft-sheet").forEach((draft) => {
      if (draft.tagName.toLowerCase() === "g") draft.setAttribute("transform", `translate(0 ${shift.toFixed(1)})`);
      else draft.style.transform = `translateY(${shift.toFixed(1)}px)`;
    });
    const figure = progress < 0.5 ? STYLE_DISTANCE.heldOut : STYLE_DISTANCE.drifted;
    style.querySelectorAll(".depth-read").forEach((read) => {
      read.textContent = figure;
    });
  }
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
    const label = callout.getBoundingClientRect();
    const face = sheet.getBoundingClientRect();
    const y = label.top + label.height / 2 - root.top;
    const xStart = label.right - root.left;
    const xEnd = face.left - root.left;
    if (xEnd - xStart < 4) continue;
    parts.push(`<path d="M ${xStart.toFixed(1)} ${y.toFixed(1)} L ${xEnd.toFixed(1)} ${y.toFixed(1)}" />`);
  }
  svg.innerHTML = parts.join("");
}

function pastHero() {
  const hero = document.querySelector(".schnitt");
  if (!(hero instanceof HTMLElement)) return false;
  return hero.getBoundingClientRect().bottom <= 1;
}

function drawingOf(id: string) {
  const plate = document.getElementById(id);
  if (!plate) return null;
  const svg = plate.querySelector("svg.plate-drawing");
  if (svg instanceof SVGSVGElement && svg.getBoundingClientRect().height > 2) return svg;
  const words = plate.querySelector(".word-align");
  if (words instanceof HTMLElement && words.getBoundingClientRect().height > 2) return words;
  return null;
}

function onScreen() {
  let best: { id: string; node: Element; visible: number; height: number } | null = null;
  for (const id of PLATES) {
    const node = drawingOf(id);
    if (!node) continue;
    const box = node.getBoundingClientRect();
    const visible = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
    if (visible > 24 && (!best || visible > best.visible)) best = { id, node, visible, height: box.height };
  }
  return best;
}

async function raster(node: Element) {
  const rect = node.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(2, Math.round(Math.max(rect.width, 2) * ratio));
  const height = Math.max(2, Math.round(Math.max(rect.height, 2) * ratio));
  const paint = document.createElement("canvas");
  paint.width = width;
  paint.height = height;
  const ctx = paint.getContext("2d");
  if (!ctx) throw new Error("texture surface is missing");
  ctx.fillStyle = "#FBFAF7";
  ctx.fillRect(0, 0, width, height);
  const clone = node.cloneNode(true) as Element;
  if (clone instanceof SVGSVGElement) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
  }
  const xml = new XMLSerializer().serializeToString(clone);
  const markup = clone instanceof SVGSVGElement
    ? xml
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${xml}</div></foreignObject></svg>`;
  const image = new Image();
  image.src = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
  try {
    await image.decode();
    await yieldTurn();
    ctx.drawImage(image, 0, 0, width, height);
  } catch {
    // The paper fill stays when the markup will not paint.
  }
  URL.revokeObjectURL(image.src);
  return paint;
}

export async function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  await yieldTurn();
  const sheets = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  if (sheets.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL2 context is missing");
  const renderer = new WebGLRenderer({
    canvas,
    context: gl,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: true,
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 1, 20000);
  await yieldTurn();

  const world = document.createElement("div");
  world.className = "schnitt-world";
  const view = document.createElement("div");
  view.className = "schnitt-view";
  const rig = document.createElement("div");
  rig.className = "schnitt-rig";
  view.appendChild(rig);
  world.appendChild(view);
  stage.appendChild(world);
  const labels = document.createElement("div");
  labels.className = "schnitt-labels";
  stage.appendChild(labels);

  const cards = sheets.map((sheet) => {
    const slot = sheet.closest(".plane-slot");
    const callout = slot?.querySelector<HTMLElement>(".callout") ?? null;
    if (callout) labels.appendChild(callout);
    const width = Math.max(sheet.offsetWidth, 180);
    const height = Math.max(sheet.offsetHeight, 72);
    sheet.style.width = `${width}px`;
    sheet.style.height = `${height}px`;
    rig.appendChild(sheet);
    const group = new Group();
    group.add(new Mesh(
      new PlaneGeometry(width, height),
      new MeshBasicMaterial({ color: sheet.classList.contains("verdict") ? 0x111111 : 0xfbfaf7, toneMapped: false }),
    ));
    scene.add(group);
    return { sheet, group, width, height, callout };
  });
  await yieldTurn();

  const figures = PLATES.map((id, index) => {
    const mesh = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({ color: 0xfbfaf7, toneMapped: false, side: 2 }),
    );
    mesh.position.z = DEPTHS[index] ?? 0;
    mesh.visible = false;
    scene.add(mesh);
    return { id, mesh };
  });

  let cameraZ = 6;
  const exposed = {
    get cameraZ() {
      return cameraZ;
    },
    get planeZ() {
      return DEPTHS;
    },
  };
  (stage as HTMLElement & { schnittView?: typeof exposed }).schnittView = exposed;

  await yieldTurn();
  await renderer.compileAsync(scene, camera);
  await yieldTurn();
  const warmup = new CanvasTexture(document.createElement("canvas"));
  renderer.initTexture(warmup);
  await yieldTurn();
  warmup.dispose();

  for (const figure of figures) {
    await yieldTurn();
    const node = drawingOf(figure.id);
    if (!node) continue;
    const paint = await raster(node);
    const map = new CanvasTexture(paint);
    map.colorSpace = "srgb";
    map.needsUpdate = true;
    const material = figure.mesh.material;
    if (material instanceof MeshBasicMaterial) {
      material.map = map;
      material.needsUpdate = true;
    }
    await yieldTurn();
  }

  let drawn = 0;
  let sized = "";
  let laidWidth = 0;
  let polishFrame = 0;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const laid = cards.map(() => 96);

  const placeHero = () => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    const half = (camera.fov * Math.PI) / 360;
    const dist = (height / 2) / Math.tan(half);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    cameraZ = dist;
    const hero = document.querySelector(".schnitt");
    const start = hero instanceof HTMLElement ? hero.getBoundingClientRect().top + window.scrollY : 0;
    const range = hero instanceof HTMLElement ? Math.max(1, hero.clientHeight - window.innerHeight) : 1;
    const progress = clamp01((window.scrollY - start) / range);
    const lane = Math.min(156, Math.max(108, width * 0.3));
    const sheetW = Math.max(160, width - lane - 28);
    if (laidWidth !== width) {
      cards.forEach((card, index) => {
        card.sheet.style.width = `${sheetW}px`;
        card.sheet.style.height = "auto";
        card.sheet.style.transform = "none";
        laid[index] = Math.max(72, card.sheet.offsetHeight);
      });
      laidWidth = width;
    }
    const extra = progress * 52;
    const natural = laid.reduce((sum, item) => sum + item, 0) + 14 * (cards.length - 1) + 28;
    const fit = Math.min(1, (height - 24) / Math.max(natural, 1));
    let cursor = 8;
    figures.forEach((figure) => {
      figure.mesh.visible = false;
    });
    cards.forEach((card, index) => {
      const boxH = (laid[index] ?? 96) * fit;
      const top = cursor + extra * index * fit;
      const depth = (index - 1.5) * 18;
      card.sheet.style.left = `${lane + 10}px`;
      card.sheet.style.top = `${top}px`;
      card.sheet.style.width = `${sheetW}px`;
      card.sheet.style.transformOrigin = "center top";
      card.sheet.style.transform = `scale(${fit}) rotateX(-5deg) translateZ(${depth}px)`;
      card.group.position.set(lane + 10 + sheetW / 2 - width / 2, height / 2 - (top + boxH / 2), 0);
      card.group.rotation.set(0, 0, 0);
      const mesh = card.group.children[0];
      if (mesh instanceof Mesh) {
        mesh.visible = true;
        mesh.scale.set((sheetW * fit) / card.width, boxH / card.height, 1);
      }
      if (card.callout) {
        card.callout.style.position = "absolute";
        card.callout.style.width = `${lane - 18}px`;
        card.callout.style.left = "0px";
        card.callout.style.top = `${top + 4}px`;
      }
      cursor += boxH + 14 * fit;
    });
    rig.style.transform = "";
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  };

  const render = () => {
    const past = pastHero();
    document.documentElement.classList.toggle("is-past", past);
    const shown = past ? onScreen() : null;
    world.style.visibility = past ? "hidden" : "visible";
    if (!past) {
      canvas.style.position = "";
      canvas.style.left = "";
      canvas.style.top = "";
      canvas.style.width = "";
      canvas.style.height = "";
      canvas.style.display = "";
      canvas.style.zIndex = "0";
      document.documentElement.classList.remove("is-figure");
      placeHero();
      if (!polishFrame) {
        polishFrame = window.setTimeout(() => {
          polishFrame = 0;
          placeCallouts(stage);
          placeThread(stage);
          layoutPlates();
        }, 0);
      }
    } else if (shown) {
      const box = shown.node.getBoundingClientRect();
      canvas.style.position = "fixed";
      canvas.style.left = `${box.left}px`;
      canvas.style.top = `${box.top}px`;
      canvas.style.width = `${Math.max(2, box.width)}px`;
      canvas.style.height = `${Math.max(2, box.height)}px`;
      canvas.style.display = "";
      canvas.style.zIndex = "1";
      canvas.style.pointerEvents = "none";
      document.documentElement.classList.add("is-figure");
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      const key = `${width}x${height}`;
      renderer.setClearColor(0xfbfaf7, 1);
      renderer.setPixelRatio(ratio);
      if (key !== sized) {
        renderer.setSize(width, height, false);
        sized = key;
      }
      const half = (camera.fov * Math.PI) / 360;
      const dist = (height / 2) / Math.tan(half);
      const index = Math.max(0, PLATES.indexOf(shown.id as (typeof PLATES)[number]));
      const depth = DEPTHS[index] ?? 0;
      const next = DEPTHS[Math.min(PLATES.length - 1, index + 1)] ?? depth;
      const leaving = clamp01(1 - shown.visible / Math.max(shown.height, 1));
      cameraZ = depth + dist + (next - depth) * leaving * 0.65;
      camera.aspect = width / height;
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(0, 0, cameraZ - dist);
      camera.updateProjectionMatrix();
      cards.forEach((card) => {
        const mesh = card.group.children[0];
        if (mesh instanceof Mesh) mesh.visible = false;
      });
      figures.forEach((figure, figureIndex) => {
        const plane = DEPTHS[figureIndex] ?? 0;
        const distance = Math.max(cameraZ - plane, 1);
        figure.mesh.visible = figureIndex === index;
        figure.mesh.position.z = plane;
        const visibleH = 2 * Math.tan(half) * distance;
        figure.mesh.scale.set(visibleH * camera.aspect * 0.92, visibleH * 0.84, 1);
        figure.mesh.rotation.y = figureIndex === index ? Math.min(1.05, leaving * 1.35) : 0;
      });
      renderer.render(scene, camera);
    } else {
      canvas.style.display = "none";
      document.documentElement.classList.remove("is-figure");
      const travel = clamp01((railProgress() - 0.04) / 0.9);
      const end = (DEPTHS[DEPTHS.length - 1] ?? 0) - 200;
      cameraZ = (DEPTHS[0] ?? 0) + ((end - (DEPTHS[0] ?? 0)) * travel);
    }
    layoutPlates();
    drawn += 1;
    stage.dataset.draws = String(renderer.info.render.calls);
    stage.dataset.triangles = String(renderer.info.render.triangles);
    stage.dataset.ratio = String(renderer.getPixelRatio());
    stage.dataset.frames = String(drawn);
    stage.dataset.engine = "WebGLRenderer";
  };

  let frame = 0;
  const draw = () => {
    frame = 0;
    render();
  };
  stage.dataset.gl = "ready";
  render();
  await yieldTurn();
  render();
  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(draw);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    document.documentElement.classList.remove("is-past", "is-figure");
    if (frame) window.cancelAnimationFrame(frame);
    const stack = stage.querySelector(".stack");
    if (stack) {
      for (const card of cards) {
        const slot = stage.querySelector(`.plane-slot[data-plane="${card.sheet.querySelector(".peg")?.getAttribute("data-peg") ?? ""}"]`);
        if (slot) slot.appendChild(card.sheet);
        if (card.callout) slot?.prepend(card.callout);
      }
    }
    labels.remove();
    world.remove();
    renderer.dispose();
    stage.dataset.gl = "off";
  };
}
