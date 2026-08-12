import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

/**
 * Configura os dois controllers XR:
 *  - modelo 3D do controle
 *  - um "raio" de apontamento
 *  - pegar/soltar objetos com o gatilho (selectstart/selectend)
 */
export function setupControllers(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  interactive: THREE.Object3D[],
) {
  const raycaster = new THREE.Raycaster();
  const tempMatrix = new THREE.Matrix4();
  const modelFactory = new XRControllerModelFactory();

  const rayGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);
  const rayLine = new THREE.Line(
    rayGeometry,
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  );
  rayLine.scale.z = 5;

  const controllers: THREE.XRTargetRaySpace[] = [];
  const selected = new Map<THREE.XRTargetRaySpace, THREE.Object3D>();

  for (let i = 0; i < 2; i++) {
    const controller = renderer.xr.getController(i);
    controller.add(rayLine.clone());
    scene.add(controller);

    controller.addEventListener('selectstart', () => onSelectStart(controller));
    controller.addEventListener('selectend', () => onSelectEnd(controller));
    controllers.push(controller);

    const grip = renderer.xr.getControllerGrip(i);
    grip.add(modelFactory.createControllerModel(grip));
    scene.add(grip);
  }

  function intersect(controller: THREE.XRTargetRaySpace): THREE.Intersection | null {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    const hits = raycaster.intersectObjects(interactive, false);
    return hits.length > 0 ? hits[0] : null;
  }

  function onSelectStart(controller: THREE.XRTargetRaySpace): void {
    const hit = intersect(controller);
    if (hit) {
      const obj = hit.object;
      controller.attach(obj); // "gruda" o objeto na mão
      selected.set(controller, obj);
    }
  }

  function onSelectEnd(controller: THREE.XRTargetRaySpace): void {
    const obj = selected.get(controller);
    if (obj) {
      scene.attach(obj); // solta de volta na cena
      selected.delete(controller);
    }
  }

  return {
    /** Realça o objeto sob a mira de cada controller. */
    update(): void {
      for (const material of highlightReset) material.emissive.setHex(0x000000);
      highlightReset.length = 0;

      for (const controller of controllers) {
        if (selected.has(controller)) continue;
        const hit = intersect(controller);
        const mesh = hit?.object as THREE.Mesh | undefined;
        const mat = mesh?.material as THREE.MeshStandardMaterial | undefined;
        if (mat && 'emissive' in mat) {
          mat.emissive.setHex(0x333333);
          highlightReset.push(mat);
        }
      }
    },
  };
}

const highlightReset: THREE.MeshStandardMaterial[] = [];
