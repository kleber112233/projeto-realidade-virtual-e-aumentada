// src/bancada/devices/recursos.ts
// ---------------------------------------------------------------------------
// Catálogo dos recursos opcionais que a sonda consulta, e a classificação do
// que o aparelho respondeu sobre cada um.
//
// Este arquivo existe para separar duas coisas que o vocabulário corrente
// confunde: o recurso que o aparelho NÃO TEM e o recurso que ele TEM e NÃO
// CONCEDEU. A API XR trata os dois de um jeito só na hora de pedir — passam
// ambos por `optionalFeatures` e simplesmente não aparecem depois —, e é por
// isso que a distinção precisa ser feita aqui, à mão, em vez de esperada da
// plataforma.
//
// O terceiro estado é o que mais dá trabalho e o que mais evita erro:
// `indeterminado`. A sessão só reporta o que concedeu através de
// `enabledFeatures`, e essa propriedade é opcional na especificação — um
// navegador pode entrar em sessão sem dizer o que ligou. Sem o terceiro estado,
// esse navegador apareceria no relatório como aparelho que negou tudo.
// ---------------------------------------------------------------------------

/**
 * O que se sabe sobre um recurso depois de a sessão abrir.
 *
 * - `concedido`: o nome está em `enabledFeatures`, e o recurso pode ser usado.
 * - `negado`: a sessão reportou a lista e o nome não está nela — o aparelho ou o
 *   navegador recusou, e a razão não é exposta.
 * - `indeterminado`: a sessão não reportou lista alguma. Não é negativa; é
 *   ausência de resposta, e tratá-la como negativa produz relatório confiante e
 *   errado.
 */
export type EstadoDeRecurso = 'concedido' | 'negado' | 'indeterminado';

/** Um recurso opcional da API XR, com o motivo de ele estar no catálogo. */
export interface RecursoOpcional {
  /** O nome exato aceito por `optionalFeatures` — não traduzir. */
  readonly nome: string;
  /** O que ele habilita no percurso, em uma frase. */
  readonly paraQueServe: string;
}

/**
 * Os recursos que a Bancada consulta.
 *
 * A lista é curta de propósito: pedir tudo o que a especificação prevê faria a
 * sonda demorar mais e algumas plataformas recusarem a sessão inteira por causa
 * de um item exótico. Cada entrada aqui é um recurso de que algum módulo adiante
 * realmente depende.
 *
 * `depth-sensing` ficou de fora, e a razão é técnica: ele exige um dicionário de
 * configuração próprio no pedido de sessão (formato de dado e ordem de uso), e um
 * pedido malformado derruba a sessão inteira em vez de apenas negar o recurso.
 * Consultá-lo custaria, aqui, o risco de perder tudo o mais.
 */
export const RECURSOS_CONSULTADOS: readonly RecursoOpcional[] = [
  {
    nome: 'local-floor',
    paraQueServe:
      'origem no chão do espaço físico — é o que faz a bancada nascer na altura certa',
  },
  {
    nome: 'bounded-floor',
    paraQueServe:
      'origem no chão mais os limites da área livre que o aparelho conhece',
  },
  {
    nome: 'unbounded',
    paraQueServe: 'espaço sem fronteira declarada, para percursos longos',
  },
  {
    nome: 'hit-test',
    paraQueServe:
      'lançar um raio contra as superfícies reais que o aparelho encontrou',
  },
  {
    nome: 'anchors',
    paraQueServe:
      'prender um objeto virtual a um ponto do mapa e deixar o aparelho corrigi-lo',
  },
  {
    nome: 'plane-detection',
    paraQueServe: 'receber os planos que o aparelho reconheceu no ambiente',
  },
  {
    nome: 'hand-tracking',
    paraQueServe:
      'pose das mãos sem controle — fora do núcleo do percurso, e consultado só para registro',
  },
];

/**
 * Classifica um recurso contra a lista que a sessão reportou.
 *
 * `concedidos` vem de `XRSession.enabledFeatures`, que é opcional na
 * especificação: `undefined` significa "esta sessão não diz", e é o que produz
 * `indeterminado`.
 */
export function estadoDoRecurso(
  nome: string,
  concedidos: readonly string[] | undefined,
): EstadoDeRecurso {
  if (concedidos === undefined) {
    return 'indeterminado';
  }
  return concedidos.includes(nome) ? 'concedido' : 'negado';
}
