import { loadThree } from "@/components/load-three";
import type { Group } from "three/src/objects/Group.js";
import type { Mesh } from "three/src/objects/Mesh.js";
import { placeThread } from "@/components/schnitt-fallback";
import { alignCiteLeaders } from "@/lib/align-leaders";
import { STYLE_DISTANCE } from "@/lib/diagrams";

const PLATES = ["citebot", "autopsy", "style", "skills"] as const;
const DEPTHS = [-1600, -3200, -4800, -6400];
const STAND = 480;

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
  // HTML figures stay HTML: an SVG foreignObject taints the canvas and the upload paints black.
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
  } catch {
    // The paper fill stays when the markup will not paint.
  }
  URL.revokeObjectURL(image.src);
  return paint;
}

export async function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  await yieldTurn();
  const T = await loadThree();
  await yieldTurn();
  const sheets = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  if (sheets.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL2 context is missing");
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

  const figures: { id: (typeof PLATES)[number]; mesh: Mesh; worldH: number }[] = [];
  for (const [index, id] of PLATES.entries()) {
    await yieldTurn();
    const mesh = new T.Mesh(
      new T.PlaneGeometry(1, 1),
      figureMaterial(T),
    );
    mesh.position.z = DEPTHS[index] ?? 0;
    mesh.visible = false;
    scene.add(mesh);
    figures.push({ id, mesh, worldH: 1 });
  }

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
  const warmup = new T.CanvasTexture(document.createElement("canvas"));
  renderer.initTexture(warmup);
  await yieldTurn();
  warmup.dispose();
  const faces = await pageFaces();
  if (faces.includes("data:font")) stage.dataset.plateFont = "embedded";

  for (const figure of figures) {
    await yieldTurn();
    const node = drawingOf(figure.id);
    if (!node) continue;
    const paint = await raster(node, faces);
    await yieldTurn();
    const map = new T.CanvasTexture(paint);
    map.colorSpace = "";
    map.generateMipmaps = false;
    map.minFilter = T.LinearFilter as typeof map.minFilter;
    map.magFilter = T.LinearFilter as typeof map.magFilter;
    map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    map.needsUpdate = true;
    const material = figure.mesh.material;
    if (material instanceof T.ShaderMaterial) {
      material.uniforms.map.value = map;
    }
    await yieldTurn();
    renderer.initTexture(map);
  }
  const parallel = renderer.extensions.has("KHR_parallel_shader_compile");
  const meshes = [
    ...cards.flatMap((card) => card.group.children),
    ...figures.map((figure) => figure.mesh),
  ];
  for (const mesh of meshes) {
    await yieldTurn();
    const solo = new T.Scene();
    const parent = mesh.parent;
    if (mesh instanceof T.Mesh) mesh.visible = true;
    solo.add(mesh);
    if (parallel) await renderer.compileAsync(solo, camera);
    else {
      renderer.compile(solo, camera);
      await yieldTurn();
    }
    parent?.add(mesh);
    if (mesh instanceof T.Mesh && figures.some((figure) => figure.mesh === mesh)) mesh.visible = false;
  }
  await yieldTurn();

  let drawn = 0;
  let sized = "";
  let figureKey = "";
  let laidWidth = 0;
  let polishFrame = 0;
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
    const crop = stage.querySelector(".crops span");
    const stageBox = stage.getBoundingClientRect();
    const cropBottom = crop ? crop.getBoundingClientRect().bottom - stageBox.top : 21;
    const cropRight = crop ? crop.getBoundingClientRect().right - stageBox.left : 21;
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

  const render = (paint = true) => {
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
      placeHero(paint);
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
      renderer.setClearColor(PAPER, 1);
      renderer.setPixelRatio(ratio);
      if (key !== sized) {
        renderer.setSize(width, height, false);
        sized = key;
      }
      const half = (camera.fov * Math.PI) / 360;
      const index = Math.max(0, PLATES.indexOf(shown.id as (typeof PLATES)[number]));
      const plane = DEPTHS[index] ?? 0;
      const leaving = clamp01(1 - shown.visible / Math.max(shown.height, 1));
      const travel = Math.min(1, leaving / 0.85);
      // Reach a true edge before the dolly can magnify the sheet. The standing
      // distance stays close to STAND so the edge is a hairline inside the drawing.
      const angle = Math.min(Math.PI / 2, (travel * (Math.PI / 2)) / 0.45);
      const stand = STAND * (1 - travel * 0.34);
      camera.near = Math.max(24, stand * 0.12);
      cameraZ = plane + stand;
      camera.aspect = width / height;
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(0, 0, plane);
      camera.updateProjectionMatrix();
      const boxKey = `${Math.round(box.width)}x${Math.round(box.height)}`;
      if (boxKey !== figureKey) {
        const worldH = 2 * Math.tan(half) * STAND;
        figures.forEach((figure) => {
          const node = drawingOf(figure.id);
          const face = node?.getBoundingClientRect();
          const aspect = face && face.height > 2 ? face.width / face.height : box.width / Math.max(box.height, 1);
          figure.worldH = worldH;
          figure.mesh.scale.set(worldH * aspect, worldH, 1);
        });
        figureKey = boxKey;
      }
      cards.forEach((card) => {
        const mesh = card.group.children[0];
        if (mesh instanceof T.Mesh) mesh.visible = false;
      });
      figures.forEach((figure, figureIndex) => {
        const depth = DEPTHS[figureIndex] ?? 0;
        figure.mesh.visible = figureIndex === index;
        figure.mesh.position.z = depth;
        const gap = Math.max(Math.abs(cameraZ - depth), 0.001);
        const spin = figureIndex === index ? angle : 0;
        figure.mesh.rotation.y = spin;
        if (figureIndex === index) stage.dataset.projected = (figure.mesh.scale.y / gap).toFixed(5);
        const material = figure.mesh.material;
        if (material instanceof T.ShaderMaterial) {
          const fade = spin < 1.35 ? 1 : Math.max(0.35, 1 - ((spin - 1.35) / (Math.PI / 2 - 1.35)) * 0.65);
          material.uniforms.opacity.value = fade;
          material.transparent = true;
          material.depthWrite = fade > 0.9;
          const map = material.uniforms.map.value;
          if (map && "minFilter" in map) {
            map.generateMipmaps = false;
            map.minFilter = T.LinearFilter;
            map.magFilter = T.LinearFilter;
          }
        }
      });
      stage.dataset.spin = (figures[index]?.mesh.rotation.y ?? 0).toFixed(3);
      renderer.render(scene, camera);
    } else {
      canvas.style.display = "none";
      document.documentElement.classList.remove("is-figure");
      const travel = clamp01((railProgress() - 0.04) / 0.9);
      const end = (DEPTHS[DEPTHS.length - 1] ?? 0) - 200;
      cameraZ = (DEPTHS[0] ?? 0) + ((end - (DEPTHS[0] ?? 0)) * travel);
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
    gl.shaderSource(fragment, "#version 300 es\nout vec4 o;void main(){o=vec4(0.0,0.0,0.0,1.0);}");
    gl.compileShader(vertex);
    gl.compileShader(fragment);
    gl.attachShader(driverProgram, vertex);
    gl.attachShader(driverProgram, fragment);
    gl.linkProgram(driverProgram);
    gl.useProgram(driverProgram);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(driverProgram, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteProgram(driverProgram);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteBuffer(buffer);
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
