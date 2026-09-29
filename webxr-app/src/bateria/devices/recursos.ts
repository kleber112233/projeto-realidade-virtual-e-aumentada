export type EstadoDeRecurso = 'concedido' | 'negado' | 'indeterminado';

export interface RecursoOpcional {
  readonly nome: string;
  readonly paraQueServe: string;
}

export const RECURSOS_CONSULTADOS: readonly RecursoOpcional[] = [
  {
    nome: 'local-floor',
    paraQueServe: 'coloca a origem no chão real, para a plataforma nascer no piso e as alturas das estantes serem reais',
  },
  {
    nome: 'bounded-floor',
    paraQueServe: 'informa os limites da área livre no visor, para ver se cabe a área de 2,5 m por 2,5 m da seção 4',
  },
  {
    nome: 'hit-test',
    paraQueServe: 'no celular, achar o chão real onde a plataforma vai ser pousada',
  },
  {
    nome: 'anchors',
    paraQueServe: 'manter a plataforma presa ao chão enquanto a pessoa anda em volta (seção 2)',
  },
  {
    nome: 'plane-detection',
    paraQueServe: 'receber o plano do chão para saber se a plataforma redimensionada cabe (seção 5)',
  },
  {
    nome: 'hand-tracking',
    paraQueServe: 'segurar as baquetas com a mão, sem controle. Ainda está fora do escopo, pedimos só para registrar',
  },
];

export function estadoDoRecurso(nome: string, concedidos: readonly string[] | undefined): EstadoDeRecurso {
  if (concedidos === undefined) {
    return 'indeterminado';
  }
  return concedidos.includes(nome) ? 'concedido' : 'negado';
}
