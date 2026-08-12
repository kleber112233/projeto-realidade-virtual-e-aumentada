import * as THREE from 'three';

/**
 * Encapsula a cena, a câmera e os objetos de exemplo.
 * `interactive` é a lista de objetos que os controllers podem apontar/pegar.
 */
export class XRScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly interactive: THREE.Object3D[] = [];

  private cubes: THREE.Mesh[] = [];

  constructor() {
    this.scene.background = new THREE.Color(0x101015);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100,
    );
    this.camera.position.set(0, 1.6, 3); // altura dos olhos (metros)

    this.addLights();
    this.addFloor();
    this.addSampleObjects();
  }

  private addLights(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 1.0);
    hemi.position.set(0, 1, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(1, 3, 2);
    this.scene.add(dir);
  }

  private addFloor(): void {
    const grid = new THREE.GridHelper(10, 20, 0x4f7cff, 0x2a2a35);
    this.scene.add(grid);
  }

  private addSampleObjects(): void {
    const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const colors = [0x4f7cff, 0x22c55e, 0xf97316, 0xef4444, 0xa855f7];

    for (let i = 0; i < 5; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: colors[i],
        roughness: 0.4,
        metalness: 0.1,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(-1 + i * 0.5, 1.2, -1);
      cube.userData.baseY = cube.position.y;
      this.scene.add(cube);
      this.cubes.push(cube);
      this.interactive.push(cube);
    }
  }

  /** Animação simples: cubos flutuando e girando. */
  update(delta: number): void {
    const t = performance.now() / 1000;
    this.cubes.forEach((cube, i) => {
      cube.rotation.x += delta * 0.5;
      cube.rotation.y += delta * 0.8;
      cube.position.y = cube.userData.baseY + Math.sin(t * 2 + i) * 0.08;
    });
  }
}
