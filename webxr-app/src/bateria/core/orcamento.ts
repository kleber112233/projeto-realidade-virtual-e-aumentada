export const TETO_JANELA_MS: number = 16.7;

export const TETO_VISOR_MS: number = 13.9;

export const TETO_ADOTADO_MS: number = TETO_VISOR_MS;

const JANELA_DE_QUADROS: number = 120;

const QUADROS_DE_AQUECIMENTO: number = 5;

export interface LeituraDoOrcamento {
  readonly tetoMs: number;
  readonly quadrosMedidos: number;
  readonly custoMedioMs: number;
  readonly piorCustoMs: number;
  readonly intervaloMedioMs: number;
  readonly piorIntervaloMs: number;
  readonly quadrosAcimaDoTeto: number;
  readonly quadrosComSaltoCortado: number;
  readonly chamadasDeDesenho: number;
  readonly triangulos: number;
}

export class Orcamento {
  private readonly custos: Float64Array = new Float64Array(JANELA_DE_QUADROS);
  private readonly intervalos: Float64Array = new Float64Array(JANELA_DE_QUADROS);
  private readonly saltos: Uint8Array = new Uint8Array(JANELA_DE_QUADROS);
  private proximo: number = 0;
  private preenchidos: number = 0;
  private chamadas: number = 0;
  private triangulos: number = 0;
  private aquecimentoRestante: number = QUADROS_DE_AQUECIMENTO;

  constructor(private readonly tetoMs: number) {}

  public registrar(
    custoMs: number,
    intervaloMs: number,
    chamadas: number,
    triangulos: number,
    saltoCortado: boolean = false,
  ): void {
    this.chamadas = chamadas;
    this.triangulos = triangulos;
    if (this.aquecimentoRestante > 0) {
      this.aquecimentoRestante -= 1;
      return;
    }
    this.custos[this.proximo] = custoMs;
    this.intervalos[this.proximo] = intervaloMs;
    this.saltos[this.proximo] = saltoCortado ? 1 : 0;
    this.proximo = (this.proximo + 1) % JANELA_DE_QUADROS;
    this.preenchidos = Math.min(this.preenchidos + 1, JANELA_DE_QUADROS);
  }

  public ler(): LeituraDoOrcamento {
    let somaCusto: number = 0;
    let somaIntervalo: number = 0;
    let piorCusto: number = 0;
    let piorIntervalo: number = 0;
    let acima: number = 0;
    let saltos: number = 0;
    for (let i: number = 0; i < this.preenchidos; i += 1) {
      const custo: number = this.custos[i] ?? 0;
      const intervalo: number = this.intervalos[i] ?? 0;
      somaCusto += custo;
      somaIntervalo += intervalo;
      piorCusto = Math.max(piorCusto, custo);
      piorIntervalo = Math.max(piorIntervalo, intervalo);
      if (custo > this.tetoMs) {
        acima += 1;
      }
      saltos += this.saltos[i] ?? 0;
    }
    const n: number = Math.max(this.preenchidos, 1);
    return {
      tetoMs: this.tetoMs,
      quadrosMedidos: this.preenchidos,
      custoMedioMs: somaCusto / n,
      piorCustoMs: piorCusto,
      intervaloMedioMs: somaIntervalo / n,
      piorIntervaloMs: piorIntervalo,
      quadrosAcimaDoTeto: acima,
      quadrosComSaltoCortado: saltos,
      chamadasDeDesenho: this.chamadas,
      triangulos: this.triangulos,
    };
  }
}

export function linhasDoOrcamento(l: LeituraDoOrcamento): string[] {
  if (l.quadrosMedidos === 0) {
    return ['Ainda sem quadros medidos.'];
  }
  const acima: number = Math.round((l.quadrosAcimaDoTeto / l.quadrosMedidos) * 100);
  return [
    `Teto (visor 72 Hz): ${l.tetoMs.toFixed(1)} ms`,
    `Custo: médio ${l.custoMedioMs.toFixed(2)} ms, pior ${l.piorCustoMs.toFixed(2)} ms`,
    `Acima do teto: ${acima}% de ${l.quadrosMedidos} quadros`,
    `Intervalo: médio ${l.intervaloMedioMs.toFixed(1)} ms, pior ${l.piorIntervaloMs.toFixed(1)} ms`,
    `Chamadas de desenho: ${l.chamadasDeDesenho}, triângulos: ${l.triangulos}`,
    `Quadros com salto de tempo cortado (mais de 0,1 s): ${l.quadrosComSaltoCortado}`,
  ];
}

export function linhasDoPainel(l: LeituraDoOrcamento): string[] {
  if (l.quadrosMedidos === 0) {
    return ['Ainda sem quadros medidos.'];
  }
  const acima: number = Math.round((l.quadrosAcimaDoTeto / l.quadrosMedidos) * 100);
  return [
    `Teto: ${l.tetoMs.toFixed(1)} ms (visor 72 Hz)`,
    `Custo médio: ${l.custoMedioMs.toFixed(2)} ms`,
    `Pior custo: ${l.piorCustoMs.toFixed(2)} ms`,
    `Acima do teto: ${acima}% dos quadros`,
  ];
}
