import {
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  RingGeometry,
  Vector3,
} from 'three';

const COR_DA_LIGACAO: number = 0xffd24a;

const ALTURA_DO_MARCADOR_M: number = 0.06;

export interface LigacaoDeParentesco {
  ligar(pai: Object3D, filho: Object3D, raioDoAnel: number): void;
  desligar(): void;
}

export function montarLigacao(): LigacaoDeParentesco {
  const pontos: Float32Array = new Float32Array(6);
  const geometria: BufferGeometry = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(pontos, 3));
  const linha: Line = new Line(geometria, new LineBasicMaterial({ color: COR_DA_LIGACAO }));
  linha.visible = false;

  const materialDoAnel: MeshBasicMaterial = new MeshBasicMaterial({ color: COR_DA_LIGACAO });
  let anel: Mesh | undefined;

  function descartarAnel(): void {
    if (anel === undefined) {
      return;
    }
    anel.removeFromParent();
    anel.geometry.dispose();
    anel = undefined;
  }

  return {
    ligar(pai: Object3D, filho: Object3D, raioDoAnel: number): void {
      const destino: Vector3 = filho.position;
      pontos.set([0, ALTURA_DO_MARCADOR_M, 0, destino.x, ALTURA_DO_MARCADOR_M, destino.z]);
      geometria.attributes.position.needsUpdate = true;
      geometria.computeBoundingSphere();
      pai.add(linha);
      linha.visible = true;

      descartarAnel();
      anel = new Mesh(new RingGeometry(raioDoAnel, raioDoAnel + 0.03, 40), materialDoAnel);
      anel.rotation.x = -Math.PI / 2;
      anel.position.y = 0.005;
      filho.add(anel);
    },
    desligar(): void {
      linha.visible = false;
      descartarAnel();
    },
  };
}
