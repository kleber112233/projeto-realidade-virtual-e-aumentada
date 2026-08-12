import * as THREE from 'three';

/**
 * Hit-test de AR: detecta superfícies reais e mostra um retículo onde você
 * aponta. Ao tocar a tela, planta um objeto naquele ponto do mundo real.
 * Só funciona dentro de uma sessão AR com a feature 'hit-test'.
 */
export function setupARHitTest(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
) {
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.07, 0.09, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x4f7cff }),
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  let hitTestSource: XRHitTestSource | null = null;
  let requested = false;

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (!reticle.visible) return;
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 }),
    );
    mesh.position.setFromMatrixPosition(reticle.matrix);
    mesh.position.y += 0.1;
    scene.add(mesh);
  });
  scene.add(controller);

  return {
    update(frame: XRFrame): void {
      const session = renderer.xr.getSession();
      if (!session) return;

      const referenceSpace = renderer.xr.getReferenceSpace();
      if (!referenceSpace) return;

      if (!requested) {
        requested = true;
        session.requestReferenceSpace('viewer').then((viewerSpace) => {
          session.requestHitTestSource?.({ space: viewerSpace })?.then((source) => {
            hitTestSource = source;
          });
        });
        session.addEventListener('end', () => {
          requested = false;
          hitTestSource = null;
        });
      }

      if (!hitTestSource) return;

      const results = frame.getHitTestResults(hitTestSource);
      if (results.length > 0) {
        const pose = results[0].getPose(referenceSpace);
        if (pose) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        }
      } else {
        reticle.visible = false;
      }
    },
  };
}
