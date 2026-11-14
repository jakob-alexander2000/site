import type {
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
import { placeThread } from "@/components/schnitt-fallback";
import { STYLE_DISTANCE } from "@/lib/diagrams";

type Card = {
  rig: Group;
  sheet: CssObject;
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

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function nextTask() {
  return new Promise<void>((resolve) => {
    const idle = window.requestIdleCallback;
    if (idle) idle(() => resolve(), { timeout: 400 });
    else window.setTimeout(resolve, 0);
  });
}

type CssObject = import("three").Object3D & { element: HTMLElement };

type CssRenderer = {
  domElement: HTMLElement;
  setSize(width: number, height: number): void;
  render(scene: Scene, camera: PerspectiveCamera): void;
};

/** Load three.js in separate chunks so no one evaluation owns the frame. */
async function loadBits() {
  const geometry = (await import("three/src/geometries/PlaneGeometry.js")) as {
    PlaneGeometry: new (width: number, height: number) => PlaneGeometry;
  };
  await nextTask();
  const material = (await import("three/src/materials/MeshBasicMaterial.js")) as {
    MeshBasicMaterial: new (params?: object) => MeshBasicMaterial;
  };
  const mesh = (await import("three/src/objects/Mesh.js")) as { Mesh: new (geometry: PlaneGeometry, material: MeshBasicMaterial) => Mesh };
  const group = (await import("three/src/objects/Group.js")) as { Group: new () => Group };
  await nextTask();
  const sceneMod = (await import("three/src/scenes/Scene.js")) as { Scene: new () => Scene };
  const cameraMod = (await import("three/src/cameras/PerspectiveCamera.js")) as {
    PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => PerspectiveCamera;
  };
  const vector = (await import("three/src/math/Vector3.js")) as { Vector3: new () => Vector3 };
  await nextTask();
  const renderer = (await import("three/src/renderers/WebGLRenderer.js")) as {
    WebGLRenderer: new (params?: object) => WebGLRenderer;
  };
  await nextTask();
  const css = (await import("@/components/css3d.js")) as {
    CSS3DObject: new (element?: HTMLElement) => CssObject;
    CSS3DRenderer: new () => CssRenderer;
  };
  return { ...geometry, ...material, ...mesh, ...group, ...sceneMod, ...cameraMod, ...vector, ...renderer, ...css };
}

function cameraZFor(dist: number, depths: number[]) {
  const hero = document.querySelector(".schnitt");
  const bottom = hero instanceof HTMLElement ? hero.getBoundingClientRect().bottom : window.innerHeight;
  if (bottom > window.innerHeight * 0.25 || depths.length === 0) return dist;
  const t = clamp01((railProgress() - 0.2) / 0.7);
  // Stop in front of the last plane so the camera never flies through a sheet.
  return dist + (depths[0] + 800 - dist) * t;
}

function sectionProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  return clamp01((window.innerHeight - rect.top) / (rect.height + window.innerHeight));
}

/**
 * One scroll position drives the hero camera and plates 00–04.
 * The value is 0 at the top of the page and 1 when the skills plate
 * has reached the bottom of the viewport.
 */
function railProgress() {
  const skills = document.getElementById("skills");
  if (!skills) return 0;
  const end = skills.offsetTop + skills.offsetHeight - window.innerHeight;
  if (end <= 1) return 0;
  return Math.min(1, Math.max(0, window.scrollY / end));
}

/** Plate motion runs in the hero's render loop so the page keeps one WebGL renderer. */
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
    const span = progress;
    const shift = span * 16;
    style.querySelectorAll<HTMLElement>(".draft-sheet").forEach((draft) => {
      if (draft.tagName.toLowerCase() === "g") draft.setAttribute("transform", `translate(0 ${shift.toFixed(1)})`);
      else draft.style.transform = `translateY(${shift.toFixed(1)}px)`;
    });
    // The sheet moves continuously, but the reading names only the two measured figures, never a value in between.
    const figure = span < 0.5 ? STYLE_DISTANCE.heldOut : STYLE_DISTANCE.drifted;
    style.querySelectorAll(".depth-read").forEach((read) => {
      read.textContent = figure;
    });
  }
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
  if (window.innerWidth < 1100) {
    let index = 0;
    for (const callout of stage.querySelectorAll<HTMLElement>(".callout")) {
      const note = callout.querySelector<HTMLElement>(".leader-note");
      if (note) note.style.display = "none";
      callout.style.position = "absolute";
      callout.style.left = "4px";
      callout.style.top = `${8 + index * 40}px`;
      callout.style.width = "120px";
      callout.style.maxHeight = "28px";
      callout.style.overflow = "hidden";
      callout.style.transform = "none";
      callout.style.zIndex = "6";
      index += 1;
    }
    parts.length = 0;
  }
  svg.innerHTML = parts.join("");
}

export async function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  await nextTask();
  const slots = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  if (slots.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const parents = slots.map((slot) => slot.parentElement);
  const { Scene, PerspectiveCamera, Vector3, WebGLRenderer, Mesh, MeshBasicMaterial, PlaneGeometry, Group, CSS3DObject, CSS3DRenderer } = await loadBits();

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 1, 20000);
  const look = new Vector3();
  // Reuse the context SchnittStage already made on this canvas, so three.js never asks for a second one.
  const context = canvas.getContext("webgl2");
  if (!context) throw new Error("WebGL2 context is missing");
  const renderer = new WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: true,
    failIfMajorPerformanceCaveat: false,
  });
  if (!renderer.getContext()) throw new Error("WebGL context is missing");
  renderer.setClearColor(0x000000, 0);
  await nextTask();

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
    if (window.innerWidth < 1100 && stage.clientWidth >= 700) {
      slot.style.setProperty("width", "120px", "important");
      slot.style.setProperty("max-width", "120px", "important");
    } else if (stage.clientWidth >= 700) slot.style.width = `${Math.min(slot.offsetWidth, maxSheet)}px`;
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
    card.position.z = 0;
    rig.add(card);
    materials.push(fill);
    geometries.push(card.geometry);

    let edge: Mesh | undefined;
    if (!slot.classList.contains("verdict")) {
      const ink = new MeshBasicMaterial({ color: 0x111111, toneMapped: false });
      edge = new Mesh(new PlaneGeometry(cssW, cssH), ink);
      edge.rotation.copy(sheet.rotation);
      edge.position.z = -0.4;
      rig.add(edge);
      materials.push(ink);
      geometries.push(edge.geometry);
    }
    scene.add(rig);
    cards.push({ rig, sheet, card, edge, cssW, cssH });
  });

  await nextTask();
  const planeZ: number[] = [];
  const planes: CssObject[] = [];
  const cuts: CssObject[] = [];
  ["citebot", "autopsy", "style", "skills"].forEach((id, index) => {
    const depth = -1500 * (index + 1);
    const host = document.createElement("div");
    host.className = "rail-plane";
    host.dataset.plate = id;
    host.textContent = id;
    host.style.cssText = "width:420px;height:240px;background:#FFFdf8;border:1px solid #111;box-shadow:inset 0 0 0 1px #111;box-sizing:border-box;pointer-events:none;font:18px ui-monospace,monospace;padding:18px;color:#111;";
    const plane = new CSS3DObject(host);
    plane.position.set(0, 0, depth);
    scene.add(plane);
    planes.push(plane);
    planeZ.push(depth);
    const cutHost = document.createElement("div");
    cutHost.className = "rail-cut";
    cutHost.dataset.cut = id;
    cutHost.style.cssText = "width:420px;height:240px;background:#F7F7F5;border:1px solid #111;box-sizing:border-box;pointer-events:none;";
    const cut = new CSS3DObject(cutHost);
    cut.position.set(0, 0, depth + 750);
    scene.add(cut);
    cuts.push(cut);
  });
  const view = {
    get cameraZ() {
      return camera.position.z;
    },
    get planeZ() {
      return planeZ;
    },
  };
  (stage as HTMLElement & { schnittView?: typeof view }).schnittView = view;
  css.domElement.style.pointerEvents = "none";

  const resize = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width < 2 || height < 2) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, width < 700 ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    css.setSize(width, height);
  };

  let fittedWidth = 0;
  let fittedGap = 0;
  let drawnFrames = 0;
  const pinRail = () => {
    const hero = document.querySelector(".schnitt");
    const skills = document.getElementById("skills");
    const heroBottom = hero instanceof HTMLElement ? hero.getBoundingClientRect().bottom : window.innerHeight;
    const skillsBottom = skills instanceof HTMLElement ? skills.getBoundingClientRect().bottom : 0;
    const pin = window.innerWidth > 800 && heroBottom <= window.innerHeight * 0.25 && skillsBottom > 0;
    document.documentElement.classList.toggle("is-rail", pin);
    if (pin) {
      if (stage.parentElement !== document.body) document.body.appendChild(stage);
      const span = Math.round(window.innerWidth * 0.56);
      stage.classList.add("is-rail");
      stage.style.position = "fixed";
      stage.style.top = "0";
      stage.style.right = "0";
      stage.style.left = "auto";
      stage.style.width = `${span}px`;
      stage.style.height = "100vh";
      stage.style.zIndex = "4";
      stage.style.margin = "0";
      return;
    }
    const home = document.querySelector(".schnitt-sticky");
    if (home instanceof HTMLElement && stage.parentElement !== home) home.appendChild(stage);
    stage.classList.remove("is-rail");
    stage.style.position = "";
    stage.style.top = "";
    stage.style.right = "";
    stage.style.left = "";
    stage.style.width = "";
    stage.style.height = "";
    stage.style.zIndex = "";
    stage.style.margin = "";
  };

  const render = () => {
    pinRail();
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    const progress = progressOf(stage);
    const phone = window.innerWidth < 700;
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
      const placeDesktop = (gapValue: number, paint: boolean) => {
        cards.forEach((item, index) => {
          const y = (1.5 - index) * gapValue;
          const sheetFit = window.innerWidth < 1100 ? 0.55 : fit;
          item.sheet.scale.set(sheetFit, sheetFit, sheetFit);
          item.card.scale.set(sheetFit, sheetFit, 1);
          item.edge?.scale.set(sheetFit, sheetFit, 1);
          const worldX = window.innerWidth < 1100 ? -width * 0.48 : labelLane + item.cssW / 2 - width / 2;
          item.rig.position.set(worldX, y, (index - 1.5) * 12);
        });
        const anchorX = labelLane + (sample?.cssW ?? 0) / 2 - width / 2;
        camera.position.set(anchorX * 0.04, 0, cameraZFor(dist, planeZ));
        look.set(anchorX * 0.15, 0, 0);
        camera.lookAt(look);
        scene.updateMatrixWorld(true);
        css.render(scene, camera);
        if (paint) renderer.render(scene, camera);
      };
      const overflow = () => {
        const root = stage.getBoundingClientRect();
        const rects = [...stage.querySelectorAll<HTMLElement>(".sheet")].map((sheet) => sheet.getBoundingClientRect());
        if (rects.length !== cards.length) return 0;
        const below = Math.max(0, ...rects.map((rect) => rect.bottom)) - (root.bottom - 16);
        const above = root.top + 12 - Math.min(...rects.map((rect) => rect.top));
        return Math.max(below, above, 0);
      };
      if (fittedWidth !== width) {
        let maxGap = planeH * 1.7;
        placeDesktop(maxGap, false);
        for (let pass = 0; pass < 8 && overflow() > 1; pass += 1) {
          maxGap = Math.max(planeH * 0.9, maxGap - overflow() / 2.2);
          placeDesktop(maxGap, false);
        }
        fittedGap = maxGap;
        fittedWidth = width;
      }
      const gap = fittedGap * (0.7 + 0.3 * progress);
      placeDesktop(gap, true);
    }
    if (phone) {
      camera.lookAt(look);
      scene.updateMatrixWorld(true);
      renderer.render(scene, camera);
      css.render(scene, camera);
    }
    const heroBottom = document.querySelector(".schnitt")?.getBoundingClientRect().bottom ?? window.innerHeight;
    const traveling = heroBottom <= window.innerHeight * 0.25;
    for (const item of cards) {
      item.card.visible = !traveling;
      if (item.edge) item.edge.visible = !traveling;
      item.sheet.element.style.visibility = traveling ? "hidden" : "visible";
      item.sheet.element.style.display = traveling ? "none" : "";
    }
    for (const plane of planes) {
      const behind = plane.position.z > camera.position.z - 80;
      plane.element.style.visibility = traveling && !behind ? "visible" : "hidden";
    }
    for (const cut of cuts) {
      const gapToCut = Math.abs(camera.position.z - cut.position.z);
      const behind = cut.position.z > camera.position.z - 80;
      cut.element.style.visibility = traveling && !behind ? "visible" : "hidden";
      cut.rotation.y = clamp01(1 - gapToCut / 900) * (Math.PI / 2);
    }
    css.domElement.style.pointerEvents = "none";
    placeCallouts(stage);
    const leaders = stage.querySelector<SVGElement>(".leaders, .tie-svg, svg");
    if (leaders && traveling) leaders.style.visibility = "hidden";
    if (!traveling) stage.querySelectorAll<SVGElement>("svg").forEach((node) => (node.style.visibility = ""));
    stage.querySelectorAll<HTMLElement>(".callout").forEach((node) => {
      node.style.visibility = traveling ? "hidden" : "";
    });
    placeThread(stage);
    layoutPlates();
    drawnFrames += 1;
    const info = renderer.info.render;
    stage.dataset.draws = String(info.calls);
    stage.dataset.triangles = String(info.triangles);
    stage.dataset.ratio = String(renderer.getPixelRatio());
    stage.dataset.frames = String(drawnFrames);
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

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize);
  await nextTask();
  resize();
  render();
  stage.dataset.engine = "WebGLRenderer";
  stage.dataset.gl = "ready";

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", onResize);
    document.documentElement.classList.remove("is-rail");
    const home = document.querySelector(".schnitt-sticky");
    if (home instanceof HTMLElement && stage.parentElement !== home) home.appendChild(stage);
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
