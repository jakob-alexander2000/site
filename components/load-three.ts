import type { CanvasTexture } from "three/src/textures/CanvasTexture.js";
import type { Group } from "three/src/objects/Group.js";
import type { Mesh } from "three/src/objects/Mesh.js";
import type { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import type { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js";
import type { PlaneGeometry } from "three/src/geometries/PlaneGeometry.js";
import type { Scene } from "three/src/scenes/Scene.js";
import type { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";

export type ThreeBits = {
  LinearFilter: number;
  LinearMipmapLinearFilter: number;
  CanvasTexture: typeof CanvasTexture;
  Group: typeof Group;
  Mesh: typeof Mesh;
  MeshBasicMaterial: typeof MeshBasicMaterial;
  PerspectiveCamera: typeof PerspectiveCamera;
  PlaneGeometry: typeof PlaneGeometry;
  Scene: typeof Scene;
  WebGLRenderer: typeof WebGLRenderer;
};

function tick() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

/** Each import is its own task so no one slice evaluates the whole renderer. */
export async function loadThree(): Promise<ThreeBits> {
  await tick();
  await import("three/src/renderers/webgl/WebGLPrograms.js");
  await tick();
  await import("three/src/renderers/webgl/WebGLTextures.js");
  await tick();
  await import("three/src/renderers/webgl/WebGLState.js");
  await tick();
  const renderer = await import("three/src/renderers/WebGLRenderer.js");
  await tick();
  const objects = await import("@/components/three-objects");
  return {
    LinearFilter: objects.LinearFilter,
    LinearMipmapLinearFilter: objects.LinearMipmapLinearFilter,
    CanvasTexture: objects.CanvasTexture,
    Group: objects.Group,
    Mesh: objects.Mesh,
    MeshBasicMaterial: objects.MeshBasicMaterial,
    PerspectiveCamera: objects.PerspectiveCamera,
    PlaneGeometry: objects.PlaneGeometry,
    Scene: objects.Scene,
    WebGLRenderer: renderer.WebGLRenderer,
  };
}
