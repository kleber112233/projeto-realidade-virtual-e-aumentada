import { Matrix4, Object3D, Quaternion, Vector3 } from 'three';

const matrizLocal: Matrix4 = new Matrix4();
const posicaoDoPai: Vector3 = new Vector3();
const rotacaoDoPai: Quaternion = new Quaternion();
const escalaDoPai: Vector3 = new Vector3();
const rotacaoAntes: Quaternion = new Quaternion();
const rotacaoDepois: Quaternion = new Quaternion();
const posicaoDescartada: Vector3 = new Vector3();
const escalaDescartada: Vector3 = new Vector3();

const MENOR_ESCALA_ACEITA: number = 1e-6;

export interface ResultadoDaTroca {
  readonly antes: Vector3;
  readonly depois: Vector3;
  readonly desvio: number;
  readonly desvioAngularGraus: number;
}

const rotacaoRelativa: Quaternion = new Quaternion();
function anguloEntreGraus(a: Quaternion, b: Quaternion): number {
  rotacaoRelativa.copy(a).invert().multiply(b);
  const parteVetorial: number = Math.hypot(rotacaoRelativa.x, rotacaoRelativa.y, rotacaoRelativa.z);
  return (2 * Math.atan2(parteVetorial, Math.abs(rotacaoRelativa.w)) * 180) / Math.PI;
}

function nomeDe(no: Object3D): string {
  return no.name !== '' ? no.name : `(${no.type} sem nome)`;
}

function ehAncestral(talvezAncestral: Object3D, no: Object3D): boolean {
  for (let atual: Object3D | null = no; atual !== null; atual = atual.parent) {
    if (atual === talvezAncestral) {
      return true;
    }
  }
  return false;
}

export function reparentar(filho: Object3D, novoPai: Object3D): ResultadoDaTroca {
  if (ehAncestral(filho, novoPai)) {
    throw new Error(`"${nomeDe(novoPai)}" está dentro de "${nomeDe(filho)}": a troca criaria um ciclo na árvore.`);
  }

  filho.updateWorldMatrix(true, false);
  novoPai.updateWorldMatrix(true, false);

  if (Math.cbrt(Math.abs(novoPai.matrixWorld.determinant())) < MENOR_ESCALA_ACEITA) {
    throw new Error(`"${nomeDe(novoPai)}" tem escala zero no mundo; não há como pôr um filho dentro dele sem perder a posição.`);
  }

  novoPai.matrixWorld.decompose(posicaoDoPai, rotacaoDoPai, escalaDoPai);
  const tolerancia: number = 1e-6;
  if (Math.abs(escalaDoPai.x - escalaDoPai.y) > tolerancia || Math.abs(escalaDoPai.y - escalaDoPai.z) > tolerancia) {
    throw new Error(`"${nomeDe(novoPai)}" tem escala não uniforme no mundo; o filho sairia deformado.`);
  }

  const antes: Vector3 = new Vector3().setFromMatrixPosition(filho.matrixWorld);
  filho.matrixWorld.decompose(posicaoDescartada, rotacaoAntes, escalaDescartada);

  matrizLocal.copy(novoPai.matrixWorld).invert().multiply(filho.matrixWorld);

  novoPai.add(filho);

  matrizLocal.decompose(filho.position, filho.quaternion, filho.scale);

  filho.updateWorldMatrix(true, false);
  const depois: Vector3 = new Vector3().setFromMatrixPosition(filho.matrixWorld);
  filho.matrixWorld.decompose(posicaoDescartada, rotacaoDepois, escalaDescartada);
  return {
    antes,
    depois,
    desvio: antes.distanceTo(depois),
    desvioAngularGraus: anguloEntreGraus(rotacaoAntes, rotacaoDepois),
  };
}

export function posicaoNoMundo(no: Object3D): Vector3 {
  no.updateWorldMatrix(true, false);
  return new Vector3().setFromMatrixPosition(no.matrixWorld);
}

export function emMetros(v: Vector3): string {
  return `(${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}) m`;
}

export function descreverArvore(raiz: Object3D): string[] {
  const linhas: string[] = [];
  function percorrer(no: Object3D, nivel: number): void {
    if (no.name !== '') {
      linhas.push(`${'   '.repeat(nivel)}${no.name}`);
    }
    for (const filho of no.children) {
      percorrer(filho, no.name !== '' ? nivel + 1 : nivel);
    }
  }
  percorrer(raiz, 0);
  return linhas;
}
