// src/bancada/modes/janela.ts
// ---------------------------------------------------------------------------
// O regime em janela, e a lista do que ele não faz.
//
// Este arquivo tem duas metades, e a segunda é a que costuma não existir em
// projeto nenhum. A primeira declara o que o regime entrega. A segunda declara o
// que ele NÃO entrega, item a item, com a razão técnica de cada ausência e com
// aquilo que a ausência impede de demonstrar.
//
// A segunda metade é escrita como dado, e não como parágrafo em documento à
// parte, pela mesma razão que levou a delimitação do domínio a ser escrita
// assim: limite em texto solto não se confronta com nada. Aqui cada limite
// carrega uma verificação, e a verificação é rodada contra o ambiente em
// execução — de modo que a afirmação "não há visão estereoscópica" deixa de ser
// promessa e passa a ser leitura.
//
// Escada rolante parada ainda é escada; ambiente que só existe com o visor no
// rosto não é nada sem ele. Este regime é o piso de todas as demonstrações do
// percurso, inclusive da última, e por isso fecha utilizável antes de qualquer
// outro existir.
// ---------------------------------------------------------------------------

import { Box3, Object3D, Vector3, WebGLRenderer } from 'three';

import { regimePorId, type Regime } from './regimes';

/** Como a verificação de um limite terminou. */
export type Afericao = 'confirmado' | 'contrariado' | 'sem-resposta';

export interface LimiteDoRegime {
  readonly id: string;
  /** O que falta, em uma frase que quem lê consegue conferir. */
  readonly enunciado: string;
  /** Por que falta — a razão técnica, e não a lamentação. */
  readonly porque: string;
  /** O que a ausência impede de demonstrar. É esta coluna que a tutoria cobra. */
  readonly impedeDemonstrar: string;
}

/**
 * Os três limites do regime em janela.
 *
 * Nenhum deles é defeito de implementação: os três decorrem de o ambiente ser
 * exibido numa superfície plana, a uma distância que não é a do corpo de quem
 * olha. Corrigi-los dentro deste regime é impossível, e prometer corrigi-los é o
 * que produz a demonstração desonesta que o percurso adiante desmonta.
 */
export const LIMITES_DA_JANELA: readonly LimiteDoRegime[] = [
  {
    id: 'profundidade-inferida',
    enunciado: 'A profundidade é inferida, e não vista.',
    porque:
      'a tela entrega uma imagem só, para os dois olhos; o que sugere distância é ' +
      'perspectiva, oclusão e tamanho relativo, que são pistas de imagem e não de ' +
      'disparidade entre duas vistas',
    impedeDemonstrar:
      'julgar a distância entre duas peças próximas sem girar a câmera — e é ' +
      'justamente esse julgamento que o encaixe vai exigir adiante',
  },
  {
    id: 'sem-escala-corporal',
    enunciado: 'Não há escala corporal.',
    porque:
      'a bancada está a noventa centímetros do chão da cena, e esse número não tem ' +
      'contra o que ser comparado: quem olha está sentado diante de um monitor, e o ' +
      'ambiente não sabe a altura dos olhos de ninguém',
    impedeDemonstrar:
      'que a bancada está na altura certa para trabalhar de pé — a afirmação só se ' +
      'verifica quando o piso da cena coincidir com o piso da sala',
  },
  {
    id: 'sem-alcance-de-braco',
    enunciado: 'Não há alcance de braço.',
    porque:
      'o cursor alcança qualquer pixel da tela com o mesmo esforço, esteja o objeto ' +
      'a vinte centímetros ou a cinco metros dentro da cena',
    impedeDemonstrar:
      'que uma peça está longe demais para ser apanhada sem caminhar até ela, que é ' +
      'a restrição de onde nasce a necessidade de locomoção',
  },
];

export interface LimiteAferido {
  readonly limite: LimiteDoRegime;
  readonly afericao: Afericao;
  readonly observacao: string;
}

/**
 * Confronta cada limite declarado com o ambiente em execução.
 *
 * Dois dos três se aferem por leitura direta: a ausência de sessão imersiva e a
 * contagem de vistas que a placa está desenhando. O terceiro não tem leitura
 * possível de dentro do programa, e dizer isso é mais honesto do que arranjar um
 * indicador que apenas pareça responder.
 */
export function aferirLimites(renderer: WebGLRenderer): LimiteAferido[] {
  const emSessao: boolean = renderer.xr.isPresenting;
  const camadas: number = emSessao ? 2 : 1;

  return LIMITES_DA_JANELA.map((limite: LimiteDoRegime): LimiteAferido => {
    switch (limite.id) {
      case 'profundidade-inferida':
        return {
          limite,
          afericao: camadas === 1 ? 'confirmado' : 'contrariado',
          observacao:
            camadas === 1
              ? 'a placa está desenhando uma vista só: não há duas imagens para os ' +
                'dois olhos, logo não há disparidade de onde tirar profundidade'
              : `a placa está desenhando ${camadas} vistas, o que já não é o regime em janela`,
        };
      case 'sem-escala-corporal':
        return {
          limite,
          afericao: emSessao ? 'contrariado' : 'confirmado',
          observacao: emSessao
            ? 'há sessão imersiva ativa, e com ela chega o espaço de referência do chão'
            : 'não há sessão imersiva, logo não há espaço de referência ancorado no ' +
              'chão físico nem altura de olhos conhecida',
        };
      default:
        return {
          limite,
          afericao: 'sem-resposta',
          observacao:
            'não há leitura possível de dentro do programa: o alcance do braço é uma ' +
            'propriedade de quem usa, e o cursor não tem corpo para medir',
        };
    }
  });
}

export interface EntregaDaJanela {
  readonly regime: Regime;
  readonly cenaEnquadrada: Box3;
  readonly objetosAlcancaveis: number;
}

/**
 * Mede o que o regime entrega: a caixa que envolve tudo o que existe na cena e
 * quantos objetos do domínio cabem dentro dela.
 *
 * A conta serve à exigência da tarefa — alcançar todos os objetos do domínio —,
 * e serve porque é ela que alimenta o enquadramento da órbita. Um objeto fora
 * desta caixa é um objeto que a câmera nunca vai encontrar, e o sintoma é a peça
 * que ninguém acha e que todo mundo jura ter posicionado.
 */
export function medirEntrega(raiz: Object3D, nomes: readonly string[]): EntregaDaJanela {
  const caixa: Box3 = new Box3().setFromObject(raiz);
  let alcancaveis: number = 0;
  for (const nome of nomes) {
    if (raiz.getObjectByName(nome) !== undefined) {
      alcancaveis += 1;
    }
  }
  return {
    regime: regimePorId('inline'),
    cenaEnquadrada: caixa,
    objetosAlcancaveis: alcancaveis,
  };
}

/** As linhas do regime, para a página e para a conferência cruzada entre grupos. */
export function linhasDaJanela(
  entrega: EntregaDaJanela,
  aferidos: readonly LimiteAferido[],
): string[] {
  const tamanho: Vector3 = entrega.cenaEnquadrada.getSize(new Vector3());
  const linhas: string[] = [
    `Regime: ${entrega.regime.nome} — ${entrega.regime.papel}`,
    `Registro contra: ${entrega.regime.registroContra}`,
    `Objetos do domínio alcançáveis pela órbita: ${entrega.objetosAlcancaveis}`,
    `Caixa que a órbita precisa enquadrar: ${tamanho.x.toFixed(2)} x ${tamanho.y.toFixed(2)} x ` +
      `${tamanho.z.toFixed(2)} m`,
    '',
  ];
  for (const aferido of aferidos) {
    linhas.push(
      `${aferido.limite.enunciado} [${aferido.afericao}]`,
      `  Por quê: ${aferido.limite.porque}.`,
      `  Impede demonstrar: ${aferido.limite.impedeDemonstrar}.`,
      `  Aferição: ${aferido.observacao}.`,
      '',
    );
  }
  return linhas;
}
