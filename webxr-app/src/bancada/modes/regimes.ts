// src/bancada/modes/regimes.ts
// ---------------------------------------------------------------------------
// Declaração dos três regimes da Bancada.
//
// Este arquivo é a Tarefa 2 do Projeto Integrador. Ele não abre sessão, não
// renderiza e não detecta nada: declara, regime a regime, o espaço de referência
// pretendido, o que será rastreado e contra o que a cena será registrada.
//
// Escrever isso antes do código tem uma consequência barata e boa: mais adiante,
// quando os regimes existirem de fato, a declaração pode ser confrontada com o
// comportamento observado. Declaração que ninguém guarda não se confronta com
// coisa alguma, e o projeto perde o único registro de qual era a intenção.
// ---------------------------------------------------------------------------

/**
 * Os três regimes do ambiente. Os dois primeiros nomes coincidem com os modos de
 * sessão da API XR do navegador de propósito — é o que permite perguntar ao
 * aparelho, sem tradução no meio, se ele suporta o que declaramos.
 */
export type RegimeId = 'inline' | 'immersive-vr' | 'immersive-ar';

/**
 * O que o regime faz com o ambiente de quem observa — a distinção que separa os
 * três antes de qualquer detalhe técnico.
 */
export type TratamentoDoMundo =
  | 'substitui'   // o ambiente sintético toma o lugar do ambiente real
  | 'preserva'    // o ambiente real permanece visível e recebe o sintético sobre si
  | 'exibe';      // o ambiente sintético é mostrado por uma janela, sem tocar o real

/**
 * Modo de composição do fundo, tal como a API XR o nomeia. É o ponto em que o
 * contínuo entre o real e o sintético deixa de ser desenho de livro e vira um
 * valor que a sessão informa: fundo opaco esconde o mundo, os outros dois o
 * deixam passar. Só é legível com uma sessão ativa, e por isso aqui ele é o
 * valor ESPERADO — a leitura do valor real chega quando houver sessão.
 */
export type ModoDeComposicao = 'opaque' | 'additive' | 'alpha-blend';

export interface Regime {
  readonly id: RegimeId;
  readonly nome: string;
  readonly tratamentoDoMundo: TratamentoDoMundo;
  /** Espaço de referência pretendido, no vocabulário da API XR. */
  readonly espacoDeReferencia: 'viewer' | 'local' | 'local-floor' | 'unbounded';
  /** O que o sistema rastreia neste regime, em uma frase. */
  readonly rastreia: string;
  /** Contra o que a cena é registrada — a origem do mundo virtual. */
  readonly registroContra: string;
  readonly composicaoEsperada: ModoDeComposicao;
  /** Por que este regime existe no projeto, e não como enfeite comparativo. */
  readonly papel: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'inline',
    nome: 'Realidade virtual não imersiva',
    tratamentoDoMundo: 'exibe',
    espacoDeReferencia: 'viewer',
    rastreia: 'nada do corpo; a câmera obedece ao mouse',
    registroContra: 'a origem arbitrária da própria cena, fixada por quem a modelou',
    composicaoEsperada: 'opaque',
    papel:
      'É o caso base e o destino de quem não tem headset: a bancada inteira precisa ' +
      'ser montável aqui.',
  },
  {
    id: 'immersive-vr',
    nome: 'Realidade virtual imersiva',
    tratamentoDoMundo: 'substitui',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a pose da cabeça e a das duas mãos, com seis graus de liberdade',
    registroContra:
      'o chão do espaço físico onde a pessoa está, o que faz a bancada nascer na ' +
      'altura certa em vez de flutuar',
    composicaoEsperada: 'opaque',
    papel:
      'É onde escala corporal e alcance de braço passam a existir — e nenhum dos ' +
      'dois tem equivalente na janela do desktop.',
  },
  {
    id: 'immersive-ar',
    nome: 'Realidade aumentada',
    tratamentoDoMundo: 'preserva',
    espacoDeReferencia: 'local-floor',
    rastreia:
      'a pose da cabeça, a das mãos e as superfícies que o aparelho encontra no ' +
      'ambiente',
    registroContra:
      'uma superfície real escolhida no ambiente, à qual a bancada permanece presa ' +
      'enquanto a pessoa caminha em volta',
    composicaoEsperada: 'alpha-blend',
    papel:
      'É o único regime em que errar o registro é visível a olho nu: a bancada ' +
      'desliza sobre a mesa, e ninguém precisa de instrumento para notar.',
  },
];

export function regimePorId(id: RegimeId): Regime {
  const encontrado: Regime | undefined = REGIMES.find((regime) => regime.id === id);
  if (encontrado === undefined) {
    // Inalcançável enquanto REGIMES cobrir RegimeId, e é o compilador que garante
    // isso ao construir a lista. O lançamento existe para o caso de alguém
    // acrescentar um id ao tipo e esquecer a entrada correspondente.
    throw new Error(`Regime não declarado: ${id}`);
  }
  return encontrado;
}
