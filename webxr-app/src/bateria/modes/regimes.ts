export type RegimeId = 'inline' | 'immersive-vr' | 'immersive-ar';

export type TratamentoDoMundo =
  | 'substitui'
  | 'preserva'
  | 'exibe';

export type ModoDeComposicao = 'opaque' | 'additive' | 'alpha-blend';

export interface Regime {
  readonly id: RegimeId;
  readonly nome: string;
  readonly tratamentoDoMundo: TratamentoDoMundo;
  readonly espacoDeReferencia: 'viewer' | 'local' | 'local-floor' | 'unbounded';
  readonly rastreia: string;
  readonly registroContra: string;
  readonly composicaoEsperada: ModoDeComposicao;
  readonly provaAdiante: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'inline',
    nome: 'Janela (PC)',
    tratamentoDoMundo: 'exibe',
    espacoDeReferencia: 'viewer',
    rastreia: 'nada do corpo; a câmera obedece ao mouse',
    registroContra: 'a origem da cena, que escolhemos no centro da plataforma, no chão',
    composicaoEsperada: 'opaque',
    provaAdiante: 'que o kit inteiro pode ser montado só com mouse e teclado',
  },
  {
    id: 'immersive-vr',
    nome: 'Visor (VR)',
    tratamentoDoMundo: 'substitui',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a cabeça e os dois controles, com seis graus de liberdade',
    registroContra: 'o chão físico onde a pessoa está; a plataforma nasce no nível do piso real',
    composicaoEsperada: 'opaque',
    provaAdiante: 'escala corporal, alcance de 90 cm e a velocidade do controle virando intensidade do som',
  },
  {
    id: 'immersive-ar',
    nome: 'Celular (AR)',
    tratamentoDoMundo: 'preserva',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a pose do celular e as superfícies que ele encontra',
    registroContra:
      'o chão real encontrado por teste de impacto, com uma âncora que mantém a plataforma no lugar enquanto a pessoa anda',
    composicaoEsperada: 'alpha-blend',
    provaAdiante: 'que a plataforma não desliza nem flutua quando a pessoa caminha',
  },
];

export function descreverTratamento(tratamento: TratamentoDoMundo): string {
  switch (tratamento) {
    case 'exibe':
      return 'exibe a cena numa janela, sem tocar no mundo';
    case 'substitui':
      return 'substitui o mundo pela cena';
    case 'preserva':
      return 'preserva o mundo e põe a cena por cima';
  }
}

export function regimePorId(id: RegimeId): Regime {
  const encontrado: Regime | undefined = REGIMES.find((regime) => regime.id === id);
  if (encontrado === undefined) {
    throw new Error(`Regime não declarado: ${id}`);
  }
  return encontrado;
}
