import { placeThread } from "@/components/schnitt-fallback";
import { STYLE_DISTANCE } from "@/lib/diagrams";

const PLATES = ["citebot", "autopsy", "style", "skills"] as const;

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
  return hero.getBoundingClientRect().bottom <= window.innerHeight * 0.25;
}

function drawingOf(id: string) {
  const plate = document.getElementById(id);
  if (!plate) return null;
  const svg = plate.querySelector("svg.plate-drawing");
  if (svg instanceof SVGSVGElement && svg.getBoundingClientRect().width > 2) return svg;
  return null;
}

function onScreen() {
  let best: { id: string; node: SVGSVGElement; visible: number; height: number } | null = null;
  for (const id of ["citebot", "style"]) {
    const node = drawingOf(id);
    if (!(node instanceof SVGSVGElement)) continue;
    const box = node.getBoundingClientRect();
    const visible = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
    if (visible > 24 && (!best || visible > best.visible)) best = { id, node, visible, height: box.height };
  }
  return best;
}

const DEPTHS = [0, -800, -1600, -2400];
const PAPER: [number, number, number, number] = [251 / 255, 250 / 255, 247 / 255, 1];
const INK: [number, number, number, number] = [17 / 255, 17 / 255, 17 / 255, 1];

function painter(gl: WebGL2RenderingContext) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("shader is missing");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  if (!program) throw new Error("program is missing");
  gl.attachShader(program, compile(gl.VERTEX_SHADER, "attribute vec2 p;attribute vec2 t;varying vec2 v;void main(){v=t;gl_Position=vec4(p,0.,1.);}"));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;uniform sampler2D u;uniform vec4 c;uniform float k;void main(){gl_FragColor=k>0.5?texture2D(u,v):c;}"));
  gl.linkProgram(program);
  const buffer = gl.createBuffer();
  const pos = gl.getAttribLocation(program, "p");
  const uv = gl.getAttribLocation(program, "t");
  const color = gl.getUniformLocation(program, "c");
  const flag = gl.getUniformLocation(program, "k");
  const sampler = gl.getUniformLocation(program, "u");
  let calls = 0;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return {
    program,
    buffer,
    reset() {
      calls = 0;
    },
    calls() {
      return calls;
    },
    draw(x: number, y: number, w: number, h: number, cssW: number, cssH: number, ink: [number, number, number, number], tex: WebGLTexture | null) {
      const x0 = (x / cssW) * 2 - 1;
      const x1 = ((x + w) / cssW) * 2 - 1;
      const y0 = 1 - (y / cssH) * 2;
      const y1 = 1 - ((y + h) / cssH) * 2;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([x0, y0, 0, 1, x1, y0, 1, 1, x0, y1, 0, 0, x0, y1, 0, 0, x1, y0, 1, 1, x1, y1, 1, 0]),
        gl.DYNAMIC_DRAW,
      );
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(uv);
      gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8);
      gl.uniform4fv(color, ink);
      gl.uniform1f(flag, tex ? 1 : 0);
      if (tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(sampler, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      calls += 1;
    },
  };
}

function upload(gl: WebGL2RenderingContext, source: HTMLCanvasElement) {
  const tex = gl.createTexture();
  if (!tex) throw new Error("texture is missing");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  return tex;
}

export async function mountSchnittScene(stage: HTMLElement, canvas: HTMLCanvasElement): Promise<() => void> {
  await yieldTurn();
  const sheets = [...stage.querySelectorAll<HTMLElement>(".sheet")];
  if (sheets.length !== 4) throw new Error("Schnitt scene needs four sheets");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL2 context is missing");
  const pen = painter(gl);
  await yieldTurn();
  const warmup = document.createElement("canvas");
  warmup.width = 1;
  warmup.height = 1;
  const warmupTexture = upload(gl, warmup);
  await yieldTurn();
  gl.deleteTexture(warmupTexture);

  let cameraZ = 6;
  const view = {
    get cameraZ() {
      return cameraZ;
    },
    get planeZ() {
      return DEPTHS;
    },
  };
  (stage as HTMLElement & { schnittView?: typeof view }).schnittView = view;

  const fitHero = () => {
    const hero = document.querySelector(".schnitt");
    const stack = stage.querySelector<HTMLElement>(".stack");
    if (!(hero instanceof HTMLElement) || !stack) return;
    const nodes = [...stage.querySelectorAll<HTMLElement>(".plane-slot")];
    const used = nodes.reduce((sum, node) => sum + node.offsetHeight, 0);
    const spare = Math.max(0, stage.clientHeight - used - 12 * Math.max(0, nodes.length - 1) - 8);
    const start = hero.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(1, hero.clientHeight - window.innerHeight);
    const progress = clamp01((window.scrollY - start) / range);
    const step = progress * Math.min(52, spare / Math.max(1, nodes.length - 1));
    nodes.forEach((node, index) => {
      const shift = (index - (nodes.length - 1) / 2) * step;
      node.style.transform = shift === 0 ? "" : `translateY(${shift.toFixed(2)}px)`;
    });
  };

  let drawn = 0;
  let sized = "";
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const render = () => {
    const past = pastHero();
    document.documentElement.classList.toggle("is-past", past);
    const hero = document.querySelector(".schnitt");
    if (hero instanceof HTMLElement) stage.style.setProperty("--hero-fade", clamp01(hero.getBoundingClientRect().bottom / window.innerHeight).toFixed(3));
    const shown = past ? onScreen() : null;
    const drawing = shown?.node ?? null;
    const cutting = Boolean(shown && shown.visible < shown.height * 0.34);
    document.documentElement.classList.toggle("is-cut", cutting);
    if (cutting && drawing) {
      const box = drawing.getBoundingClientRect();
      canvas.style.position = "fixed";
      canvas.style.left = `${box.left}px`;
      canvas.style.top = `${box.top}px`;
      canvas.style.width = `${Math.max(2, box.width)}px`;
      canvas.style.height = `${Math.max(2, box.height)}px`;
      canvas.style.display = "";
      canvas.style.visibility = "visible";
      canvas.style.pointerEvents = "none";
    } else if (past) {
      canvas.style.display = "none";
    } else {
      canvas.style.position = "";
      canvas.style.left = "";
      canvas.style.top = "";
      canvas.style.width = "";
      canvas.style.height = "";
      canvas.style.display = "";
      canvas.style.visibility = "";
      canvas.style.zIndex = "0";
    }
    if (!past) fitHero();
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    const nextSize = `${width}x${height}`;
    if (nextSize !== sized) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      sized = nextSize;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    pen.reset();
    const live = canvas.getBoundingClientRect();
    if (!past) {
      for (const sheet of sheets) {
        const rect = sheet.getBoundingClientRect();
        pen.draw(rect.left - live.left, rect.top - live.top, rect.width, rect.height, live.width, live.height, sheet.classList.contains("verdict") ? INK : PAPER, null);
      }
    } else if (cutting && drawing && live.width > 2) {
      pen.draw(live.width / 2 - 1, 0, 2, live.height, live.width, live.height, INK, null);
    }
    const travel = clamp01((railProgress() - 0.05) / 0.9);
    cameraZ = past ? 4 + (-2600 - 4) * travel : 6;
    if (!past) {
      placeCallouts(stage);
      placeThread(stage);
    }
    layoutPlates();
    drawn += 1;
    stage.dataset.draws = String(pen.calls());
    stage.dataset.triangles = String(pen.calls() * 2);
    stage.dataset.ratio = String(ratio);
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
    document.documentElement.classList.remove("is-past");
    document.documentElement.classList.remove("is-cut");
    if (frame) window.cancelAnimationFrame(frame);
    gl.deleteProgram(pen.program);
    gl.deleteBuffer(pen.buffer);
    stage.dataset.gl = "off";
  };
}
