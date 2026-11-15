import { loadThree } from "@/components/load-three";
import { bandForWidth, type PlateBand } from "@/lib/plate-bake";
import { SECTION_RAIL } from "@/lib/section-rail";
import type { Group } from "three/src/objects/Group.js";
import type { Mesh } from "three/src/objects/Mesh.js";
import { placeThread } from "@/components/schnitt-fallback";
import { alignCiteLeaders } from "@/lib/align-leaders";
import { STYLE_DISTANCE } from "@/lib/diagrams";

const PLATES = ["citebot", "autopsy", "style", "skills"] as const;
const DEPTHS = [-1600, -3200, -4800, -6400];
const STAND = 480;
/** Sheet crops in each drawing's viewBox. They start stacked and move into these boxes. */
const SHEETS: Record<string, { view: [number, number]; rects: [number, number, number, number][] }> = {
  citebot: {
    view: [1280, 520],
    rects: [0, 1, 2, 3, 4, 5].map((index) => {
      const x = 150 + index * 156;
      const y = 28 + index * 56;
      return [x, y, 340, index === 5 ? 168 : 68];
    }),
  },
  style: {
    view: [1120, 360],
    rects: [
      [150, 28, 160, 120],
      [310, 20, 560, 160],
      [868, 44, 200, 108],
      [16, 208, 1088, 132],
    ],
  },
};

function croppedPlane(T: Awaited<ReturnType<typeof loadThree>>, rect: [number, number, number, number], viewW: number, viewH: number) {
  const geo = new T.PlaneGeometry(1, 1);
  const uv = geo.attributes.uv;
  const [x, y, w, h] = rect;
  const u0 = x / viewW;
  const u1 = (x + w) / viewW;
  const v0 = 1 - (y + h) / viewH;
  const v1 = 1 - y / viewH;
  for (let index = 0; index < uv.count; index += 1) {
    const u = uv.getX(index);
    const v = uv.getY(index);
    uv.setXY(index, u0 + u * (u1 - u0), v0 + v * (v1 - v0));
  }
  uv.needsUpdate = true;
  return geo;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** One step per frame, so resumed loader work cannot pile into a single long frame. */
function yieldTurn(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

/** Wall-clock budget for one resumed loader turn. A single upload or compile stays inside it. */
const FRAME_BUDGET_MS = 8;

function openBudget(maxUnits: number) {
  let spent = 0;
  let units = 0;
  return async function account(used: number): Promise<void> {
    units += 1;
    // A frozen clock reports 0. Count that as a share of the budget so units still stop.
    spent += used > 0 ? used : FRAME_BUDGET_MS / maxUnits;
    if (spent < FRAME_BUDGET_MS && units < maxUnits) return;
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
    spent = 0;
    units = 0;
  };
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
  // HTML figures stay HTML: an SVG foreignObject taints the canvas and the upload paints black.
  return null;
}

/** Plates whose texture painted. A plate that failed to paint keeps its SVG on the page. */
const painted = new Set<string>();

function onScreen() {
  let best: { id: string; node: Element; visible: number; height: number } | null = null;
  for (const id of PLATES) {
    if (!painted.has(id)) continue;
    const node = drawingOf(id);
    if (!node) continue;
    const box = node.getBoundingClientRect();
    const visible = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
    if (visible > 24 && (!best || visible > best.visible)) best = { id, node, visible, height: box.height };
  }
  return best;
}

void onScreen;

const PAPER = 0xf7f7f5;

const PLATE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CARD_FRAG = `
uniform vec3 diffuse;
void main() {
  gl_FragColor = vec4(diffuse, 1.0);
}
`;

const PLATE_FRAG = `
uniform sampler2D map;
uniform float opacity;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(map, vUv);
  gl_FragColor.a *= opacity;
}
`;

function byteColor(T: Awaited<ReturnType<typeof loadThree>>, color: number) {
  return new T.Vector3(((color >> 16) & 255) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255);
}

function cardMaterial(T: Awaited<ReturnType<typeof loadThree>>, color: number) {
  return new T.ShaderMaterial({
    uniforms: { diffuse: { value: byteColor(T, color) } },
    vertexShader: PLATE_VERT,
    fragmentShader: CARD_FRAG,
    toneMapped: false,
  });
}

function figureMaterial(T: Awaited<ReturnType<typeof loadThree>>) {
  return new T.ShaderMaterial({
    uniforms: {
      map: { value: null },
      opacity: { value: 1 },
    },
    vertexShader: PLATE_VERT,
    fragmentShader: PLATE_FRAG,
    toneMapped: false,
    transparent: true,
    depthWrite: true,
    side: 2,
  });
}

let plateFaces: Promise<string> | null = null;

function tick() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

async function inlineFontSrc(src: string, base: string) {
  let next = src;
  for (const match of src.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    const url = match[2];
    if (!url || url.startsWith("data:")) continue;
    const abs = new URL(url, base).href;
    if (!abs.includes(".woff2")) continue;
    const response = await fetch(abs);
    if (!response.ok) continue;
    await tick();
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let index = 0; index < bytes.length; index += 4096) {
      const slice = bytes.subarray(index, index + 4096);
      binary += String.fromCharCode.apply(null, slice as unknown as number[]);
    }
    next = next.replaceAll(url, `data:font/woff2;base64,${btoa(binary)}`);
  }
  return next;
}

function pageFaces() {
  if (!plateFaces) {
    plateFaces = (async () => {
      await document.fonts.ready;
      await tick();
      const rules: string[] = [];
      for (const sheet of [...document.styleSheets]) {
        let list: CSSRuleList;
        try {
          list = sheet.cssRules;
        } catch {
          continue;
        }
        if (!sheet.href) continue;
        const base = sheet.href;
        for (const rule of list) {
          if (!(rule instanceof CSSFontFaceRule)) continue;
          const family = rule.style.getPropertyValue("font-family");
          const range = rule.style.getPropertyValue("unicode-range");
          if (!/Geist/i.test(family) || !range.includes("U+0-FF")) continue;
          const inlined = await inlineFontSrc(rule.cssText, base);
          if (!inlined.includes("data:font")) continue;
          rules.push(inlined);
          await tick();
        }
      }
      return rules.join("\n");
    })();
  }
  return plateFaces;
}

async function raster(node: Element, faces: string) {
  if (node instanceof SVGSVGElement) alignCiteLeaders();
  const rect = node.getBoundingClientRect();
  const ratio = Math.max(window.devicePixelRatio || 1, 2);
  let width = Math.max(2, Math.round(Math.max(rect.width, 2) * ratio));
  let height = Math.max(2, Math.round(Math.max(rect.height, 2) * ratio));
  const longest = Math.max(width, height);
  if (longest > 4096) {
    const scale = 4096 / longest;
    width = Math.max(2, Math.round(width * scale));
    height = Math.max(2, Math.round(height * scale));
  }
  await yieldTurn();
  const paint = document.createElement("canvas");
  paint.width = width;
  paint.height = height;
  const ctx = paint.getContext("2d");
  if (!ctx) throw new Error("texture surface is missing");
  ctx.fillStyle = "#F7F7F5";
  ctx.fillRect(0, 0, width, height);
  await yieldTurn();
  const clone = node.cloneNode(true) as Element;
  if (clone instanceof SVGSVGElement) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    if (faces.includes("data:font")) {
      const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      style.textContent = faces;
      clone.insertBefore(style, clone.firstChild);
    }
  }
  await yieldTurn();
  const xml = new XMLSerializer().serializeToString(clone);
  await yieldTurn();
  const markup = clone instanceof SVGSVGElement
    ? xml
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${xml}</div></foreignObject></svg>`;
  const image = new Image();
  image.src = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
  try {
    await image.decode();
    await yieldTurn();
    ctx.drawImage(image, 0, 0, width, height);
    // A tainted surface cannot be uploaded; reading one pixel throws first.
    ctx.getImageData(0, 0, 1, 1);
  } catch {
    URL.revokeObjectURL(image.src);
    return null;
  }
  URL.revokeObjectURL(image.src);
  return paint;
}

function plateBand(id: string): PlateBand {
  const frame = document.querySelector(`#${id} .drawing-frame`);
  const width = frame instanceof HTMLElement ? frame.getBoundingClientRect().width : window.innerWidth;
  return bandForWidth(width > 2 ? width : window.innerWidth);
}

/** A plate baked at build time. Decoding happens off the main thread. */
async function loadBuiltPlate(id: string) {
  const scale = (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1;
  const band = plateBand(id);
  let response: Response;
  try {
    response = await fetch(`/plates/${id}@${band}@${scale}.webp`);
  } catch {
    return null;
  }
  if (!response.ok) return null;
  const blob = await response.blob();
  await yieldTurn();
  try {
    return await createImageBitmap(blob, { imageOrientation: "flipY" });
  } catch {
    return null;
  }
}

/**
 * Upload a plate in short row bands. initTexture only allocates; each band is a
 * few rows, and a frame stops once 8ms have passed so one callback cannot grow
 * into the 55ms turn.
 */
async function uploadPlate(
  renderer: { initTexture(texture: unknown): void; properties: { get(texture: unknown): unknown }; getContext(): WebGLRenderingContext | WebGL2RenderingContext },
  texture: { image: ImageBitmap; source: { dataReady: boolean }; needsUpdate: boolean; flipY: boolean; generateMipmaps: boolean; minFilter: number; magFilter: number },
  bitmap: ImageBitmap,
  filters: { min: number; mag: number },
) {
  texture.image = bitmap;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = filters.min;
  texture.magFilter = filters.mag;
  texture.source.dataReady = false;
  texture.needsUpdate = true;
  await yieldTurn();
  renderer.initTexture(texture);
  texture.source.dataReady = true;
  const gl = renderer.getContext();
  const handle = (renderer.properties.get(texture) as { __webglTexture?: WebGLTexture }).__webglTexture;
  if (!handle || !(gl instanceof WebGL2RenderingContext)) return;
  const bandRows = 8;
  const account = openBudget(2);
  for (let y = 0; y < bitmap.height; y += bandRows) {
    const height = Math.min(bandRows, bitmap.height - y);
    const started = performance.now();
    const strip = await createImageBitmap(bitmap, 0, y, bitmap.width, height);
    gl.bindTexture(gl.TEXTURE_2D, handle);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y, gl.RGBA, gl.UNSIGNED_BYTE, strip);
    strip.close();
    await account(performance.now() - started);
  }
  texture.needsUpdate = false;
}

// The runtime raster stays in the file for the paint-failure path it documents.
void pageFaces;
void raster;

/** The baked still for each painted section. A failed image leaves the SVG figure. */
function mountSectionStills() {
  const scale = (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1;
  for (const id of ["citebot", "style"] as const) {
    const frame = document.querySelector(`#${id} .drawing-frame`);
    if (!(frame instanceof HTMLElement) || frame.querySelector(".plate-still")) continue;
    const width = frame.getBoundingClientRect().width;
    const band = bandForWidth(width > 2 ? width : window.innerWidth);
    const img = new Image();
    img.className = "plate-still";
    img.alt = "";
    img.decoding = "sync";
    img.src = `/plates/${id}@${band}@${scale}.webp`;
    img.addEventListener("load", () => {
      frame.dataset.still = id;
      const svg = frame.querySelector("svg.plate-drawing");
      if (svg instanceof HTMLElement) svg.style.visibility = "hidden";
      const labels = frame.querySelector(".sheet-labels");
      if (labels instanceof HTMLElement) labels.style.visibility = "hidden";
    });
    img.addEventListener("error", () => {
      img.remove();
      frame.dataset.still = "figure";
    });
    frame.appendChild(img);
  }
}

export async function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  painted.clear();
  const plateLoads = new Map<string, Promise<ImageBitmap | null>>();
  if (SECTION_RAIL) {
    for (const id of ["citebot", "style"]) plateLoads.set(id, loadBuiltPlate(id));
  }
  await yieldTurn();
  const T = await loadThree();
  await yieldTurn();
  const sheets = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  if (sheets.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL2 context is missing");
  gl.getExtension("KHR_parallel_shader_compile");
  const renderer = new T.WebGLRenderer({
    canvas,
    context: gl,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: true,
    failIfMajorPerformanceCaveat: false,
  });
  await (renderer as unknown as { ready: Promise<void> }).ready;
  renderer.debug.checkShaderErrors = false;
  await yieldTurn();
  renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 1, 20000);
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

  const cards: { sheet: HTMLElement; group: Group; width: number; height: number; callout: HTMLElement | null }[] = [];
  for (const sheet of sheets) {
    await yieldTurn();
    const slot = sheet.closest(".plane-slot");
    const callout = slot?.querySelector<HTMLElement>(".callout") ?? null;
    if (callout) labels.appendChild(callout);
    const width = Math.max(sheet.offsetWidth, 180);
    const height = Math.max(sheet.offsetHeight, 72);
    sheet.style.width = `${width}px`;
    sheet.style.height = `${height}px`;
    rig.appendChild(sheet);
    await yieldTurn();
    const group = new T.Group();
    group.add(new T.Mesh(
      new T.PlaneGeometry(width, height),
        cardMaterial(T, sheet.classList.contains("verdict") ? 0x111111 : 0xfbfaf7),
    ));
    scene.add(group);
    cards.push({ sheet, group, width, height, callout });
  }
  await yieldTurn();

  const figures: { id: (typeof PLATES)[number]; mesh: Mesh; sheets: Mesh[]; worldH: number }[] = [];
  if (!SECTION_RAIL) {
    // The hero is the last three.js work. Section plates stay baked stills.
  } else for (const [index, id] of PLATES.entries()) {
    await yieldTurn();
    const mesh = new T.Mesh(
      new T.PlaneGeometry(1, 1),
      figureMaterial(T),
    );
    mesh.position.z = DEPTHS[index] ?? 0;
    mesh.visible = false;
    scene.add(mesh);
    const sheets: Mesh[] = [];
    const layout = SHEETS[id];
    if (layout) {
      const material = figureMaterial(T);
      for (const rect of layout.rects) {
        await yieldTurn();
        const sheet = new T.Mesh(croppedPlane(T, rect, layout.view[0], layout.view[1]), material);
        sheet.visible = false;
        sheet.userData.rect = rect;
        scene.add(sheet);
        sheets.push(sheet);
      }
    }
    figures.push({ id, mesh, sheets, worldH: 1 });
  }

  let cameraZ = 6;
  let shownFigure = false;
  const exposed = {
    get cameraZ() {
      return shownFigure ? camera.position.z : cameraZ;
    },
    get planeZ() {
      return DEPTHS;
    },
  };
  (stage as HTMLElement & { schnittView?: typeof exposed }).schnittView = exposed;

  await yieldTurn();
  const warmup = new T.CanvasTexture(document.createElement("canvas"));
  renderer.initTexture(warmup);
  await yieldTurn();
  warmup.dispose();
  stage.dataset.plateFont = "embedded";

  for (const figure of figures) {
    await yieldTurn();
    if (!drawingOf(figure.id)) continue;
    const bitmap = await (plateLoads.get(figure.id) ?? Promise.resolve(null));
    if (!bitmap) continue;
    painted.add(figure.id);
    const svg = document.querySelector(`#${figure.id} svg.plate-drawing`);
    if (svg instanceof HTMLElement) svg.style.visibility = "hidden";
    const labels = document.querySelector(`#${figure.id} .sheet-labels`);
    if (labels instanceof HTMLElement) labels.style.visibility = "hidden";
    await yieldTurn();
    const map = new T.Texture(bitmap);
    map.colorSpace = "";
    map.generateMipmaps = false;
    map.flipY = false;
    map.minFilter = T.LinearFilter as typeof map.minFilter;
    map.magFilter = T.LinearFilter as typeof map.magFilter;
    map.anisotropy = 1;
    const material = figure.mesh.material;
    if (material instanceof T.ShaderMaterial) material.uniforms.map.value = map;
    const sheetMaterial = figure.sheets[0]?.material;
    if (sheetMaterial instanceof T.ShaderMaterial) sheetMaterial.uniforms.map.value = map;
    await uploadPlate(renderer, map, bitmap, { min: T.LinearFilter, mag: T.LinearFilter });
  }
  const parallel = renderer.extensions.has("KHR_parallel_shader_compile");
  const meshes = [
    ...cards.flatMap((card) => card.group.children),
    ...figures.map((figure) => figure.mesh),
    ...figures.flatMap((figure) => figure.sheets),
  ];
  const account = openBudget(1);
  for (const mesh of meshes) {
    const started = performance.now();
    const solo = new T.Scene();
    const parent = mesh.parent;
    if (mesh instanceof T.Mesh) mesh.visible = true;
    solo.add(mesh);
    if (parallel) await renderer.compileAsync(solo, camera);
    else renderer.compile(solo, camera);
    await account(performance.now() - started);
    parent?.add(mesh);
    if (mesh instanceof T.Mesh && figures.some((figure) => figure.mesh === mesh)) mesh.visible = false;
  }
  await yieldTurn();

  let drawn = 0;
  let sized = "";
  let proseTops: number[] | null = null;
  let laidWidth = 0;
  let polishFrame = 0;
  let docWidth = -1;
  const docBoxes = new Map<string, { top: number; left: number; width: number; height: number }>();
  let heroReady = false;
  let heroStart = 0;
  let heroRange = 1;
  let cropBottom = 21;
  let cropRight = 21;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const laid = cards.map(() => 96);

  const placeHero = (paint = true) => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    const half = (camera.fov * Math.PI) / 360;
    const dist = (height / 2) / Math.tan(half);
    camera.near = 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    cameraZ = dist;
    if (!heroReady || laidWidth !== width) {
      const hero = document.querySelector(".schnitt");
      heroStart = hero instanceof HTMLElement ? hero.getBoundingClientRect().top + window.scrollY : 0;
      heroRange = hero instanceof HTMLElement ? Math.max(1, hero.clientHeight - window.innerHeight) : 1;
      heroReady = true;
    }
    const progress = clamp01((window.scrollY - heroStart) / heroRange);
    const lane = Math.min(156, Math.max(108, width * 0.3));
    const sheetW = Math.max(160, width - lane - 28);
    if (laidWidth !== width) {
      cards.forEach((card, index) => {
        card.sheet.style.width = `${sheetW}px`;
        card.sheet.style.height = "auto";
        card.sheet.style.transform = "none";
        laid[index] = Math.max(72, card.sheet.offsetHeight);
      });
      const crop = stage.querySelector(".crops span");
      const stageBox = stage.getBoundingClientRect();
      cropBottom = crop ? crop.getBoundingClientRect().bottom - stageBox.top : 21;
      cropRight = crop ? crop.getBoundingClientRect().right - stageBox.left : 21;
      laidWidth = width;
    }
    const extra = progress * 52;
    const natural = laid.reduce((sum, item) => sum + item, 0) + 14 * (cards.length - 1) + 28;
    const fit = Math.min(1, (height - 24) / Math.max(natural, 1));
    let cursor = cropBottom + 18;
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
      if (mesh instanceof T.Mesh) {
        mesh.visible = true;
        mesh.scale.set((sheetW * fit) / card.width, boxH / card.height, 1);
      }
      if (card.callout) {
        card.callout.style.position = "absolute";
        card.callout.style.left = `${cropRight + 10}px`;
        card.callout.style.width = `${Math.max(88, lane - cropRight - 16)}px`;
        card.callout.style.top = `${top + 6}px`;
      }
      cursor += boxH + 14 * fit;
    });
    rig.style.transform = "";
    if (!paint) return;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  };

  const measureDocs = () => {
    if (docWidth === window.innerWidth && docBoxes.size > 0) return;
    docWidth = window.innerWidth;
    docBoxes.clear();
    const remember = (key: string, node: Element) => {
      const rect = node.getBoundingClientRect();
      docBoxes.set(key, {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };
    for (const figure of figures) {
      const frame = document.querySelector(`#${figure.id} .drawing-frame`);
      if (frame) remember(figure.id, frame);
    }
    for (const section of document.querySelectorAll("section.plate")) remember(`section:${section.id}`, section);
  };
  const viewBox = (key: string) => {
    const box = docBoxes.get(key);
    if (!box || box.height < 2) return null;
    return new DOMRect(box.left - window.scrollX, box.top - window.scrollY, box.width, box.height);
  };
  const plateMetrics = () => {
    measureDocs();
    const order = figures.filter((figure) => painted.has(figure.id));
    return order.map((figure, index) => {
      const rect = viewBox(figure.id);
      const past = rect ? clamp01(-rect.top / rect.height) : 0;
      return { figure, rect, past, depth: DEPTHS[index] ?? 0 };
    });
  };
  const lookAlong = (metrics: ReturnType<typeof plateMetrics>) => {
    let look = metrics[0]?.depth ?? 0;
    for (const item of metrics) {
      const next = metrics[metrics.indexOf(item) + 1]?.depth ?? item.depth;
      if (item.past >= 1) {
        look = next;
        continue;
      }
      return item.depth + (next - item.depth) * item.past;
    }
    return look;
  };

  const render = (paint = true) => {
    const past = pastHero();
    document.documentElement.classList.toggle("is-past", past);
    world.style.visibility = past ? "hidden" : "visible";
    if (!past) {
      shownFigure = false;
      canvas.style.position = "";
      canvas.style.left = "";
      canvas.style.top = "";
      canvas.style.width = "";
      canvas.style.height = "";
      canvas.style.display = "";
      canvas.style.zIndex = "0";
      document.documentElement.classList.remove("is-figure");
      placeHero(paint);
      if (!polishFrame) {
        polishFrame = window.setTimeout(() => {
          polishFrame = 0;
          placeCallouts(stage);
          placeThread(stage);
          layoutPlates();
        }, 0);
      }
    } else if (SECTION_RAIL) {
      const metrics = plateMetrics();
      const pinTop = Math.round(window.innerHeight * 0.16);
      const runwayOf = (rect: DOMRect) => {
        const start = rect.top + window.scrollY - pinTop;
        const runway = Math.max(rect.height * 1.35, 360);
        return { start, runway, progress: clamp01((window.scrollY - start) / runway) };
      };
      let mode: "pin" | "follow" | "rest" = "rest";
      let current = metrics.find((item) => item.rect) ?? null;
      let progress = 0;
      for (const item of metrics) {
        if (!item.rect) continue;
        const run = runwayOf(item.rect);
        if (run.progress > 0 && run.progress < 1) {
          mode = "pin";
          current = item;
          progress = run.progress;
          break;
        }
      }
      if (mode === "rest") {
        const visible = metrics.find((item) => item.rect && item.rect.bottom > 24 && item.rect.top < window.innerHeight - 24);
        if (visible?.rect && runwayOf(visible.rect).progress <= 0) {
          mode = "follow";
          current = visible;
          progress = 0;
        }
      }
      const sectionIds = ["citebot", "autopsy", "style", "skills"] as const;
      let owner: (typeof sectionIds)[number] = sectionIds[0];
      for (const id of sectionIds) {
        const section = viewBox(`section:${id}`);
        if (section && section.top < pinTop + 120) owner = id;
      }
      const styleBox = viewBox("style");
      const styleRun = styleBox ? runwayOf(styleBox) : null;
      const citebotPin = mode === "pin" && current?.figure.id === "citebot";
      const styleArriving = !citebotPin && Boolean(styleBox && styleRun && painted.has("style") && styleRun.progress > 0.02 && styleRun.progress < 0.4);
      const assemblingId = styleArriving ? "style" : citebotPin ? "autopsy" : (sectionIds[sectionIds.indexOf(owner) + 1] ?? "");
      stage.dataset.cut = styleArriving ? "autopsy" : owner;
      stage.dataset.assembling = assemblingId;
      const inStyleSlot = styleArriving;
      if (inStyleSlot && styleRun) {
        mode = "pin";
        progress = clamp01((styleRun.progress - 0.02) / 0.38);
        current = metrics.find((item) => item.figure.id === "style") ?? current;
      }
      if ((mode === "pin" || mode === "follow") && current?.rect) {
        shownFigure = true;
        const next = metrics[metrics.indexOf(current) + 1];
        const depthHere = current.depth;
        const depthNext = next?.depth ?? depthHere;
        const look = depthHere + (depthNext - depthHere) * (mode === "pin" ? progress : 0);
        const box = inStyleSlot && styleBox ? styleBox : current.rect;
        const viewTop = inStyleSlot ? box.top : mode === "pin" ? pinTop : box.top;
        let viewHeight = inStyleSlot ? box.height : mode === "pin" ? Math.min(box.height, window.innerHeight * 0.68) : box.height;
        if (mode === "pin" && !inStyleSlot) {
          if (!proseTops) {
            proseTops = [...document.querySelectorAll(".plate h2, .plate h3, .plate figcaption, .plate li, .plate p.body")]
              .filter((node) => node instanceof HTMLElement && !node.closest("svg, .sheet-labels, .cite-steps"))
              .map((node) => node.getBoundingClientRect().top + window.scrollY);
          }
          for (const docTop of proseTops) {
            const top = docTop - window.scrollY;
            if (top > viewTop + 4) viewHeight = Math.min(viewHeight, top - viewTop - 8);
          }
        }
        const blocked = !inStyleSlot && mode === "pin" && viewHeight < 140;
        canvas.style.position = "fixed";
        canvas.style.left = `${box.left}px`;
        canvas.style.top = `${viewTop}px`;
        canvas.style.width = `${Math.max(2, box.width)}px`;
        canvas.style.height = `${Math.max(2, viewHeight)}px`;
        canvas.style.display = blocked ? "none" : "";
        canvas.style.zIndex = "1";
        canvas.style.pointerEvents = "none";
        document.documentElement.classList.toggle("is-figure", !blocked);
        const width = Math.max(box.width, 1);
        const height = Math.max(viewHeight, 1);
        const key = `${width}x${height}`;
        renderer.setClearColor(PAPER, 1);
        renderer.setPixelRatio(ratio);
        if (key !== sized) {
          renderer.setSize(width, height, false);
          sized = key;
        }
        const half = (camera.fov * Math.PI) / 360;
        camera.near = 24;
        cameraZ = look + STAND;
        camera.aspect = width / height;
        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, look);
        camera.updateProjectionMatrix();
        const front = cameraZ - 420;
        const angle = mode === "pin" ? Math.min(Math.PI / 2, (progress / 0.7) * (Math.PI / 2)) : 0;
        const assemble = mode === "pin" ? clamp01((progress - 0.05) / 0.7) : 0;
        const worldH = 2 * Math.tan(half) * 420;
        const worldW = worldH * (box.width / Math.max(box.height, 1));
        cards.forEach((card) => {
          const mesh = card.group.children[0];
          if (mesh instanceof T.Mesh) mesh.visible = false;
        });
        figures.forEach((figure) => {
          figure.mesh.visible = false;
          figure.sheets.forEach((sheet) => {
            sheet.visible = false;
          });
        });
        const fade = angle < 1.05 ? 1 : Math.max(0, 1 - (angle - 1.05) / 0.32);
        const edgeOn = !inStyleSlot && fade < 0.04;
        const leaving = current.figure.mesh;
        const plateSvg = document.querySelector(`#${current.figure.id} svg.plate-drawing`);
        if (edgeOn) {
          leaving.visible = false;
          canvas.style.display = "none";
          if (plateSvg instanceof HTMLElement) plateSvg.style.visibility = "";
        } else if (!inStyleSlot) {
          leaving.visible = true;
          if (plateSvg instanceof HTMLElement && painted.has(current.figure.id)) plateSvg.style.visibility = "hidden";
          leaving.scale.set(worldW, worldH, 1);
          const pivot = worldH / 2;
          leaving.rotation.set(-angle, 0, 0);
          leaving.position.set(0, pivot * (1 - Math.cos(angle)), front - pivot * Math.sin(angle));
          const leavingMaterial = leaving.material;
          if (leavingMaterial instanceof T.ShaderMaterial) {
            leavingMaterial.uniforms.opacity.value = fade;
            leavingMaterial.transparent = fade < 0.99;
            leavingMaterial.depthWrite = fade > 0.9;
          }
        }
        const assembling = inStyleSlot ? figures.find((figure) => figure.id === "style") : undefined;
        const layout = assembling ? SHEETS[assembling.id] : undefined;
        if (assembling && layout) {
          const depth = front - 180 * (1 - progress * 0.55);
          assembling.sheets.forEach((sheet, index) => {
            const rect = sheet.userData.rect as [number, number, number, number] | undefined;
            if (!rect) return;
            const [x, y, w, h] = rect;
            const verdict = y > 160 && h > 100;
            if (verdict && assemble < 0.82) return;
            const local = verdict ? 1 : assemble;
            const homeX = ((x + w / 2) / layout.view[0] - 0.5) * worldW;
            const homeY = (0.5 - (y + h / 2) / layout.view[1]) * worldH;
            const sheetW = (w / layout.view[0]) * worldW;
            const sheetH = (h / layout.view[1]) * worldH;
            sheet.visible = true;
            sheet.rotation.set(0, 0, 0);
            sheet.renderOrder = 2;
            const pile = (1 - local) * worldH * 0.34;
            const step = (1 - local) * worldH * 0.07 * index;
            sheet.position.set(homeX * local, homeY * local - pile + step, depth - index * (1 - local) * 24);
            const grow = 0.58 + 0.42 * local;
            sheet.scale.set(sheetW * grow, sheetH * grow, 1);
          });
          const sheetMaterial = assembling.sheets[0]?.material;
          if (sheetMaterial instanceof T.ShaderMaterial) {
            sheetMaterial.uniforms.opacity.value = 1;
            sheetMaterial.transparent = false;
            sheetMaterial.depthWrite = true;
          }
        }
        const view = { left: box.left, top: viewTop, width, height };
        const corner = new T.Vector3();
        const areaOf = (mesh: Mesh) => {
          if (!mesh.visible) return 0;
          mesh.updateWorldMatrix(true, false);
          const xs = [-0.5, 0.5, 0.5, -0.5];
          const ys = [0.5, 0.5, -0.5, -0.5];
          const points = xs.map((x, index) => {
            const projected = corner.set(x, ys[index] ?? 0, 0).applyMatrix4(mesh.matrixWorld).project(camera);
            return {
              x: Math.min(window.innerWidth, Math.max(0, (projected.x * 0.5 + 0.5) * view.width + view.left)),
              y: Math.min(window.innerHeight, Math.max(0, (-projected.y * 0.5 + 0.5) * view.height + view.top)),
              outside: projected.z < -1 || projected.z > 1,
            };
          });
          if (points.some((point) => point.outside)) return 0;
          let sum = 0;
          for (let index = 0; index < points.length; index += 1) {
            const a = points[index];
            const b = points[(index + 1) % points.length];
            if (!a || !b) continue;
            sum += a.x * b.y - b.x * a.y;
          }
          return Math.abs(sum) / 2;
        };
        const sheetArea = assembling ? Math.max(...assembling.sheets.map(areaOf), 0) : 0;
        const gap = Math.max(Math.abs(camera.position.z - depthHere), 0.001);
        stage.dataset.projected = (leaving.scale.y / gap).toFixed(5);
        stage.dataset.spin = angle.toFixed(3);
        stage.dataset.assemble = assemble.toFixed(3);
        stage.dataset.progress = progress.toFixed(3);
        stage.dataset.areas = `${Math.round(areaOf(leaving))},${Math.round(sheetArea)}`;
        stage.dataset.shown = [leaving.visible ? current.figure.id : "", assembling?.sheets.some((sheet) => sheet.visible) ? assembling.id : ""].filter(Boolean).join(",");
        stage.dataset.planes = String((leaving.visible ? 1 : 0) + (assembling?.sheets.some((sheet) => sheet.visible) ? 1 : 0));
        stage.dataset.depths = [depthHere, depthHere + (depthNext - depthHere) * (mode === "pin" ? progress : 0)].map((depth) => depth.toFixed(1)).join(",");
        if (!blocked) {
          renderer.setScissorTest(true);
          renderer.setScissor(0, 0, Math.round(width * ratio), Math.round(height * ratio));
          renderer.render(scene, camera);
          renderer.setScissorTest(false);
        }
      } else {
        for (const figure of figures) {
          const svg = document.querySelector(`#${figure.id} svg.plate-drawing`);
          if (svg instanceof HTMLElement) svg.style.visibility = "";
        }
        canvas.style.display = "none";
        document.documentElement.classList.remove("is-figure");
        const look = lookAlong(metrics);
        camera.position.set(0, 0, look + STAND);
        cameraZ = camera.position.z;
        shownFigure = true;
        stage.dataset.spin = "0.000";
        stage.dataset.assemble = "1.000";
        stage.dataset.areas = "0,0";
      }
    } else {
      document.documentElement.classList.remove("is-figure");
    }
    if (!polishFrame) {
      polishFrame = window.setTimeout(() => {
        polishFrame = 0;
        placeCallouts(stage);
        placeThread(stage);
        layoutPlates();
      }, 0);
    }
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
  const stageWidth = Math.max(stage.clientWidth, 1);
  const lane = Math.min(156, Math.max(108, stageWidth * 0.3));
  const sheetW = Math.max(160, stageWidth - lane - 28);
  for (let index = 0; index < cards.length; index += 1) {
    await yieldTurn();
    const card = cards[index];
    if (!card) continue;
    card.sheet.style.width = `${sheetW}px`;
    card.sheet.style.height = "auto";
    card.sheet.style.transform = "none";
    laid[index] = Math.max(72, card.sheet.offsetHeight);
  }
  laidWidth = stageWidth;
  await yieldTurn();
  render(false);
  await yieldTurn();
  renderer.setPixelRatio(ratio);
  renderer.setSize(Math.max(stage.clientWidth, 1), Math.max(stage.clientHeight, 1), false);
  await yieldTurn();
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  const driverProgram = gl.createProgram();
  if (vertex && fragment && driverProgram) {
    gl.shaderSource(vertex, "#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}");
    gl.shaderSource(fragment, "#version 300 es\nprecision highp float;out vec4 o;void main(){o=vec4(0.0,0.0,0.0,1.0);}");
    gl.compileShader(vertex);
    gl.compileShader(fragment);
    await yieldTurn();
    gl.attachShader(driverProgram, vertex);
    gl.attachShader(driverProgram, fragment);
    gl.linkProgram(driverProgram);
    if (gl.getProgramParameter(driverProgram, gl.LINK_STATUS)) {
      gl.useProgram(driverProgram);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(driverProgram, "p");
      const vao = gl.createVertexArray();
      if (loc >= 0 && vao) {
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
        gl.deleteVertexArray(vao);
      }
      gl.deleteBuffer(buffer);
    }
    gl.deleteProgram(driverProgram);
    renderer.resetState();
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  }
  await yieldTurn();
  for (const card of cards) card.group.visible = false;
  if (cards[0]) cards[0].group.visible = true;
  renderer.setSize(2, 2, false);
  await yieldTurn();
  renderer.render(scene, camera);
  await yieldTurn();
  for (const card of cards) card.group.visible = true;
  renderer.setSize(Math.max(stage.clientWidth, 1), Math.max(stage.clientHeight, 1), false);
  renderer.render(scene, camera);
  await yieldTurn();
  for (const figure of figures) {
    await yieldTurn();
    figure.mesh.visible = true;
    renderer.render(scene, camera);
    figure.mesh.visible = false;
  }
  await yieldTurn();
  render(true);
  stage.dataset.rail = SECTION_RAIL ? "on" : "off";
  if (!SECTION_RAIL) mountSectionStills();
  stage.dataset.gl = "ready";
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
