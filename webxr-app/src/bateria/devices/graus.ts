import type { Suporte } from '../modes/verificacao';

export type GrausDeLiberdade = 'tres' | 'seis' | 'indeterminado';

export type ClasseDeAparelho =
  | 'sem-api'
  | 'inconclusivo'
  | 'somente-janela'
  | 'aparelho-de-mao-com-camera'
  | 'aparelho-de-mao-provavel'
  | 'visor-sem-posicao'
  | 'visor-com-posicao'
  | 'imersivo-sem-leitura';

export interface LeituraDasPoses {
  readonly posesObservadas: number;
  readonly posesComPosicaoEmulada: number;
}

export function grausDeLiberdade(leitura: LeituraDasPoses): GrausDeLiberdade {
  if (leitura.posesObservadas === 0) {
    return 'indeterminado';
  }
  return leitura.posesComPosicaoEmulada < leitura.posesObservadas ? 'seis' : 'tres';
}

export interface EvidenciaDoAparelho {
  readonly temApiXr: boolean;
  readonly vr: Suporte;
  readonly ar: Suporte;
  readonly graus: GrausDeLiberdade;
  readonly modoDeInteracao: XRInteractionMode | undefined;
}

export function classificarAparelho(e: EvidenciaDoAparelho): ClasseDeAparelho {
  if (!e.temApiXr) {
    return 'sem-api';
  }
  if (e.vr !== 'sim' && e.ar !== 'sim') {
    return e.vr === 'desconhecido' || e.ar === 'desconhecido' ? 'inconclusivo' : 'somente-janela';
  }
  if (e.modoDeInteracao === 'screen-space') {
    return 'aparelho-de-mao-com-camera';
  }
  if (e.modoDeInteracao === undefined && e.ar === 'sim' && e.vr !== 'sim') {
    return 'aparelho-de-mao-provavel';
  }
  switch (e.graus) {
    case 'tres':
      return 'visor-sem-posicao';
    case 'seis':
      return 'visor-com-posicao';
    case 'indeterminado':
      return 'imersivo-sem-leitura';
  }
}

export function descreverClasse(classe: ClasseDeAparelho): string {
  switch (classe) {
    case 'sem-api':
      return 'Navegador sem WebXR, ou página fora de contexto seguro.';
    case 'inconclusivo':
      return 'O navegador tem WebXR, mas não respondeu se aceita os modos imersivos. Não dá para dizer o que este aparelho oferece.';
    case 'somente-janela':
      return 'Aparelho que só abre o modo janela, como o PC do laboratório.';
    case 'aparelho-de-mao-com-camera':
      return 'Aparelho de mão que desenha a cena sobre a imagem da própria câmera. A própria sessão informou que é segurado na mão.';
    case 'aparelho-de-mao-provavel':
      return 'Provavelmente um aparelho de mão com câmera: aceita AR e não aceita VR. É uma hipótese, porque a sessão não informou a forma de interação que confirmaria isso.';
    case 'visor-sem-posicao':
      return 'Visor em que todas as poses observadas vieram com a posição emulada: ou ele só acompanha a rotação da cabeça, ou perdeu o rastreamento durante a observação.';
    case 'visor-com-posicao':
      return 'Visor que acompanha rotação e deslocamento.';
    case 'imersivo-sem-leitura':
      return 'Aparelho com modo imersivo, mas não houve leitura de pose nem da forma de interação (a sessão foi recusada ou não entregou esses dados). Não dá para dizer se é visor ou celular, nem quantos graus ele rastreia.';
  }
}
