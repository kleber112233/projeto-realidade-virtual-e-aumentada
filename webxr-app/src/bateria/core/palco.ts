import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DENSIDADE_MAXIMA: number = 2;

export interface Palco {
  readonly renderer: WebGLRenderer;
  readonly camera: PerspectiveCamera;
  ajustar(): boolean;
  desenhar(cena: Scene): void;
}

export function montarPalco(canvas: HTMLCanvasElement): Palco {
  const renderer: WebGLRenderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, DENSIDADE_MAXIMA));

  const camera: PerspectiveCamera = new PerspectiveCamera(55, 16 / 9, 0.05, 50);
  camera.position.set(0, 2.3, 3.6);

  const orbita: OrbitControls = new OrbitControls(camera, canvas);
  orbita.target.set(0, 0.35, -0.1);
  orbita.update();

  function ajustar(): boolean {
    if (renderer.xr.isPresenting) {
      return false;
    }
    const densidade: number = Math.min(window.devicePixelRatio, DENSIDADE_MAXIMA);
    const larguraCss: number = Math.max(1, canvas.clientWidth);
    const alturaCss: number = Math.max(1, canvas.clientHeight);
    const largura: number = Math.floor(larguraCss * densidade);
    const altura: number = Math.floor(alturaCss * densidade);
    if (canvas.width === largura && canvas.height === altura) {
      return false;
    }
    renderer.setPixelRatio(densidade);
    renderer.setSize(larguraCss, alturaCss, false);
    camera.aspect = larguraCss / alturaCss;
    camera.updateProjectionMatrix();
    return true;
  }

  function desenhar(cena: Scene): void {
    renderer.render(cena, camera);
  }

  return { renderer, camera, ajustar, desenhar };
}
