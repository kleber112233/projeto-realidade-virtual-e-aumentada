// src/bancada/devices/graus.ts
// ---------------------------------------------------------------------------
// Graus de liberdade e classe do aparelho, inferidos do que foi concedido.
//
// A API XR não expõe um número de graus de liberdade. Não há propriedade a ler,
// e isso não é omissão: o navegador não sabe o que o sensor faz, sabe o que o
// runtime do aparelho aceitou entregar. O que existe para inferir é o conjunto de
// espaços de referência concedidos, e a inferência tem limites que este arquivo
// registra em vez de esconder.
//
// O porquê de a inferência ser conservadora: um relatório que afirma "seis graus
// de liberdade" com base em evidência fraca é pior que um relatório que diz "não
// dá para saber daqui". O primeiro será citado; o segundo, verificado.
// ---------------------------------------------------------------------------

/**
 * O que se pode afirmar sobre o rastreamento de posição a partir do que a sessão
 * concedeu — três graus (só orientação) contra seis (orientação e posição).
 */
export type GrausDeLiberdade = 'tres' | 'seis' | 'indeterminado';

/**
 * Classe do aparelho deduzida da capacidade declarada, e não do nome que o
 * navegador diz ter.
 *
 * A escolha é deliberada e é o conteúdo do módulo: a cadeia de identificação do
 * navegador é editável, imitada por outros aparelhos e envelhece a cada versão.
 * O que a sessão concede é o que o aparelho faz agora, na mão de quem está
 * usando.
 */
export type ClasseDeAparelho =
  | 'sem-api'
  | 'somente-janela'
  | 'visor-sem-posicao'
  | 'visor-com-posicao'
  | 'aparelho-de-mao-com-camera';

export interface LeituraDeEspacos {
  /** Espaços de referência que a sessão de fato entregou quando pedidos. */
  readonly concedidos: readonly string[];
  /** O modo de sessão em que a leitura foi feita. */
  readonly modo: 'immersive-vr' | 'immersive-ar';
  /** Havia alguma fonte de entrada com pose de punho declarada. */
  readonly comPoseDePunho: boolean;
}

/**
 * Regra da inferência, escrita por extenso porque é ela que o estudante precisa
 * poder contestar:
 *
 * - `local-floor` ou `bounded-floor` concedidos exigem que o aparelho saiba onde
 *   está o chão em relação a quem observa. Um visor que só gira não tem como
 *   sustentar isso, então a concessão é evidência forte de posição rastreada.
 * - `viewer` sozinho é o mínimo que qualquer sessão entrega: a origem acompanha
 *   quem observa, e translação alguma é observável a partir dela. Evidência forte
 *   da ausência.
 * - `local` no meio do caminho é ambíguo de verdade. A especificação o descreve
 *   como origem próxima de quem observa no início da sessão, e um aparelho de três
 *   graus pode concedê-lo mantendo a posição sempre na origem. Daí
 *   `indeterminado`, e não uma aposta.
 */
export function grausDeLiberdade(leitura: LeituraDeEspacos): GrausDeLiberdade {
  const temChao: boolean =
    leitura.concedidos.includes('local-floor') ||
    leitura.concedidos.includes('bounded-floor') ||
    leitura.concedidos.includes('unbounded');
  if (temChao) {
    return 'seis';
  }
  if (leitura.concedidos.length === 1 && leitura.concedidos[0] === 'viewer') {
    return 'tres';
  }
  return 'indeterminado';
}

/**
 * Classifica o aparelho pela combinação de modo de sessão, posição rastreada e
 * tipo de mira das fontes de entrada.
 *
 * `modosSuportados` vem da consulta feita sem sessão alguma — a mesma do módulo
 * anterior —, e por isso esta função responde mesmo quando nenhuma sessão chegou
 * a abrir.
 */
export function classificarAparelho(
  modosSuportados: readonly string[],
  graus: GrausDeLiberdade,
  temApiXr: boolean,
): ClasseDeAparelho {
  if (!temApiXr) {
    return 'sem-api';
  }
  const suportaVr: boolean = modosSuportados.includes('immersive-vr');
  const suportaAr: boolean = modosSuportados.includes('immersive-ar');

  if (!suportaVr && !suportaAr) {
    return 'somente-janela';
  }
  // Aparelho que faz realidade aumentada e não faz sessão imersiva completa é o
  // celular: a câmera vê o mundo, mas ninguém veste a tela no rosto.
  if (suportaAr && !suportaVr) {
    return 'aparelho-de-mao-com-camera';
  }
  return graus === 'tres' ? 'visor-sem-posicao' : 'visor-com-posicao';
}

/** Frase curta e legível para cada classe, usada no relatório. */
export function descreverClasse(classe: ClasseDeAparelho): string {
  switch (classe) {
    case 'sem-api':
      return 'Navegador sem a API XR, ou página fora de contexto seguro.';
    case 'somente-janela':
      return 'Aparelho que só sustenta o regime de janela — é o caso do desktop do laboratório.';
    case 'visor-sem-posicao':
      return 'Visor que acompanha a rotação da cabeça e não acompanha o deslocamento.';
    case 'visor-com-posicao':
      return 'Visor que acompanha rotação e deslocamento, com o chão do ambiente como referência.';
    case 'aparelho-de-mao-com-camera':
      return 'Aparelho de mão que compõe o virtual sobre a imagem da própria câmera.';
  }
}
