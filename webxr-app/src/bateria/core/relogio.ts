export interface Amostra {
  readonly delta: number;
  readonly decorrido: number;
  readonly intervaloReal: number;
  readonly saltoDescartado: boolean;
}

const TETO_DE_SALTO_S: number = 0.1;

export class Relogio {
  private ultimoMs: number | undefined = undefined;
  private decorrido: number = 0;

  public avancar(instanteMs: number): Amostra {
    const anterior: number | undefined = this.ultimoMs;
    this.ultimoMs = instanteMs;

    if (anterior === undefined) {
      return { delta: 0, decorrido: 0, intervaloReal: 0, saltoDescartado: false };
    }

    const intervaloReal: number = (instanteMs - anterior) / 1000;
    const saltoDescartado: boolean = intervaloReal > TETO_DE_SALTO_S;
    const delta: number = saltoDescartado ? TETO_DE_SALTO_S : intervaloReal;
    this.decorrido += delta;
    return { delta, decorrido: this.decorrido, intervaloReal, saltoDescartado };
  }

  public reiniciar(): void {
    this.ultimoMs = undefined;
    this.decorrido = 0;
  }
}
