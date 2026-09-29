export type PecaId =
  | 'bumbo'
  | 'caixa'
  | 'pedal-bumbo-esquerdo'
  | 'pedal-bumbo-direito'
  | 'chimbal'
  | 'tom-1'
  | 'tom-2'
  | 'tom-de-chao'
  | 'prato-ataque'
  | 'prato-conducao'
  | 'estante-de-prato'
  | 'estante-de-caixa'
  | 'banco'
  | 'baqueta-esquerda'
  | 'baqueta-direita';

export type Papel = 'instrumento' | 'ferragem' | 'baqueta';

export interface Dimensoes {
  readonly largura: number;
  readonly altura: number;
  readonly profundidade: number;
}

export interface FaixaDeAjuste {
  readonly grandeza: 'altura' | 'inclinacao';
  readonly minimo: number;
  readonly maximo: number;
}

export interface Peca {
  readonly id: PecaId;
  readonly nome: string;
  readonly papel: Papel;
  readonly dimensoes: Dimensoes;
  readonly ajuste?: FaixaDeAjuste;
  readonly origemDaMedida: string;
}

export interface TarefaDoAmbiente {
  readonly enunciado: string;
  readonly estadoFinal: string;
}

export interface Dominio {
  readonly nome: string;
  readonly descricao: string;
  readonly tarefa: TarefaDoAmbiente;
  readonly plataforma: { readonly ladoInicial: number; readonly ladoMinimo: number; readonly ladoMaximo: number };
  readonly folgaDeEncaixe: number;
  readonly pecas: readonly Peca[];
}

const FOLGA_DE_ENCAIXE_M: number = 0.08;

function caixa(largura: number, altura: number, profundidade: number): Dimensoes {
  return { largura, altura, profundidade };
}

function faixaDeAltura(minimo: number, maximo: number): FaixaDeAjuste {
  return { grandeza: 'altura', minimo, maximo };
}
function faixaDeInclinacao(minimo: number, maximo: number): FaixaDeAjuste {
  return { grandeza: 'inclinacao', minimo, maximo };
}

export const BATERIA: Dominio = {
  nome: 'Bateria acústica',
  descricao:
    'Uma plataforma vazia e as peças de um kit de bateria soltas no chão em volta. ' +
    'A pessoa leva cada peça até a plataforma, fixa, ajusta altura e ângulo, e toca.',
  tarefa: {
    enunciado:
      'Montar o kit de bateria sobre a plataforma, fixando cada peça obrigatória e ' +
      'ajustando altura e ângulo até ele poder ser tocado.',
    estadoFinal:
      `Todos os instrumentos e ferragens estão fixados sobre a plataforma, a até ${Math.round(FOLGA_DE_ENCAIXE_M * 100)} cm ` +
      'da superfície útil, e cada instrumento produz som ao ser atingido pela baqueta.',
  },
  plataforma: { ladoInicial: 1.5, ladoMinimo: 1.0, ladoMaximo: 2.5 },
  folgaDeEncaixe: FOLGA_DE_ENCAIXE_M,
  pecas: [
    { id: 'bumbo', nome: 'Bumbo', papel: 'instrumento', dimensoes: caixa(0.56, 0.56, 0.4), origemDaMedida: 'seção 4' },
    { id: 'caixa', nome: 'Caixa', papel: 'instrumento', dimensoes: caixa(0.35, 0.14, 0.35), origemDaMedida: 'seção 4 (diâmetro); altura do casco provisória' },
    { id: 'pedal-bumbo-esquerdo', nome: 'Pedal de bumbo (esquerdo)', papel: 'ferragem', dimensoes: caixa(0.1, 0.08, 0.3), origemDaMedida: 'provisório' },
    { id: 'pedal-bumbo-direito', nome: 'Pedal de bumbo (direito)', papel: 'ferragem', dimensoes: caixa(0.1, 0.08, 0.3), origemDaMedida: 'provisório' },
    { id: 'chimbal', nome: 'Chimbal', papel: 'instrumento', dimensoes: caixa(0.35, 0.8, 0.35), ajuste: faixaDeAltura(0.7, 0.9), origemDaMedida: 'seção 4 (suporte de 70 a 90 cm); pratos de 35 cm provisórios' },
    { id: 'tom-1', nome: 'Tom suspenso 1', papel: 'instrumento', dimensoes: caixa(0.25, 0.2, 0.25), origemDaMedida: 'seção 4 (diâmetro); profundidade provisória' },
    { id: 'tom-2', nome: 'Tom suspenso 2', papel: 'instrumento', dimensoes: caixa(0.3, 0.22, 0.3), origemDaMedida: 'seção 4 (diâmetro); profundidade provisória' },
    { id: 'tom-de-chao', nome: 'Tom de chão', papel: 'instrumento', dimensoes: caixa(0.4, 0.48, 0.4), ajuste: faixaDeAltura(0.45, 0.5), origemDaMedida: 'seção 4' },
    { id: 'prato-ataque', nome: 'Prato de ataque', papel: 'instrumento', dimensoes: caixa(0.4, 0.01, 0.4), ajuste: faixaDeInclinacao(0, 45), origemDaMedida: 'seção 4 (35 a 50 cm)' },
    { id: 'prato-conducao', nome: 'Prato de condução', papel: 'instrumento', dimensoes: caixa(0.5, 0.01, 0.5), ajuste: faixaDeInclinacao(0, 45), origemDaMedida: 'seção 4 (35 a 50 cm)' },
    { id: 'estante-de-prato', nome: 'Estante de prato', papel: 'ferragem', dimensoes: caixa(0.5, 1.2, 0.5), ajuste: faixaDeAltura(0.9, 1.45), origemDaMedida: 'seção 4 (90 a 145 cm); base do tripé provisória' },
    { id: 'estante-de-caixa', nome: 'Estante de caixa', papel: 'ferragem', dimensoes: caixa(0.45, 0.65, 0.45), ajuste: faixaDeAltura(0.6, 0.75), origemDaMedida: 'seção 4 (60 a 75 cm); base provisória' },
    { id: 'banco', nome: 'Banco', papel: 'ferragem', dimensoes: caixa(0.35, 0.5, 0.35), ajuste: faixaDeAltura(0.45, 0.55), origemDaMedida: 'seção 4 (45 a 55 cm); assento provisório' },
    { id: 'baqueta-esquerda', nome: 'Baqueta (esquerda)', papel: 'baqueta', dimensoes: caixa(0.015, 0.015, 0.4), origemDaMedida: 'seção 4' },
    { id: 'baqueta-direita', nome: 'Baqueta (direita)', papel: 'baqueta', dimensoes: caixa(0.015, 0.015, 0.4), origemDaMedida: 'seção 4' },
  ],
};

export interface ContagemDoEstadoFinal {
  readonly aFixar: number;
  readonly aSoar: number;
  readonly foraDoEstadoFinal: number;
}

export function contarEstadoFinal(dominio: Dominio): ContagemDoEstadoFinal {
  const aFixar: number = dominio.pecas.filter((p) => p.papel !== 'baqueta').length;
  const aSoar: number = dominio.pecas.filter((p) => p.papel === 'instrumento').length;
  return { aFixar, aSoar, foraDoEstadoFinal: dominio.pecas.length - aFixar };
}

export function inconsistenciasDoDominio(dominio: Dominio): string[] {
  const problemas: string[] = [];
  const vistos: Set<PecaId> = new Set();
  const { ladoInicial, ladoMinimo, ladoMaximo } = dominio.plataforma;

  if (!(ladoMinimo <= ladoInicial && ladoInicial <= ladoMaximo)) {
    problemas.push(
      `O lado inicial da plataforma (${ladoInicial} m) está fora do intervalo de ${ladoMinimo} a ${ladoMaximo} m.`,
    );
  }

  for (const peca of dominio.pecas) {
    if (vistos.has(peca.id)) {
      problemas.push(`A peça "${peca.id}" aparece duas vezes no inventário.`);
    }
    vistos.add(peca.id);

    const { largura, altura, profundidade } = peca.dimensoes;
    if (largura <= 0 || altura <= 0 || profundidade <= 0) {
      problemas.push(`A peça "${peca.nome}" tem uma dimensão zero ou negativa.`);
    }
    if (peca.papel !== 'baqueta' && Math.max(largura, profundidade) > ladoMinimo) {
      problemas.push(
        `A peça "${peca.nome}" não cabe na plataforma mínima de ${ladoMinimo} m, e a tarefa não fecharia.`,
      );
    }

    const ajuste: FaixaDeAjuste | undefined = peca.ajuste;
    if (ajuste !== undefined) {
      if (!(ajuste.minimo < ajuste.maximo)) {
        problemas.push(`A faixa de ajuste de "${peca.nome}" tem o mínimo maior ou igual ao máximo.`);
      } else if (ajuste.grandeza === 'altura' && (altura < ajuste.minimo || altura > ajuste.maximo)) {
        problemas.push(
          `A altura de "${peca.nome}" (${altura} m) está fora da faixa do próprio suporte (${ajuste.minimo} a ${ajuste.maximo} m).`,
        );
      }
    }
  }

  if (contarEstadoFinal(dominio).aSoar === 0) {
    problemas.push('Nenhuma peça é instrumento: o estado final não teria o que exigir que soe.');
  }

  return problemas;
}
