import type { Scene } from 'three';

import type { Palco } from './palco';
import type { Amostra, Relogio } from './relogio';
import type { Orcamento } from './orcamento';

export type PassoDoQuadro = (amostra: Amostra, quadroXR: XRFrame | undefined) => void;

export interface Laco {
  aoPasso(passo: PassoDoQuadro): void;
  iniciar(): void;
  parar(): void;
}

export function montarLaco(palco: Palco, cena: Scene, relogio: Relogio, orcamento: Orcamento): Laco {
  const passos: PassoDoQuadro[] = [];

  function quadro(instanteMs: number, quadroXR: XRFrame | undefined): void {
    const inicio: number = performance.now();

    palco.ajustar();
    const amostra: Amostra = relogio.avancar(instanteMs);
    for (const passo of passos) {
      passo(amostra, quadroXR);
    }
    palco.desenhar(cena);

    const custoMs: number = performance.now() - inicio;
    orcamento.registrar(
      custoMs,
      amostra.intervaloReal * 1000,
      palco.renderer.info.render.calls,
      palco.renderer.info.render.triangles,
      amostra.saltoDescartado,
    );
  }

  return {
    aoPasso(passo: PassoDoQuadro): void {
      passos.push(passo);
    },
    iniciar(): void {
      palco.renderer.setAnimationLoop(quadro);
    },
    parar(): void {
      palco.renderer.setAnimationLoop(null);
      relogio.reiniciar();
    },
  };
}
