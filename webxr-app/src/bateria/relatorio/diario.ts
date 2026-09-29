import { descreverRecusaDeSessao } from '../devices/recusa';

export type Severidade = 'nota' | 'alerta' | 'falha';

export interface Entrada {
  readonly severidade: Severidade;
  readonly texto: string;
}

export class Diario {
  private readonly entradas: Entrada[] = [];
  private destino: HTMLElement | undefined = undefined;
  private destinoDaUltima: HTMLElement | undefined = undefined;

  public fixarDestinoDaUltima(destino: HTMLElement): void {
    this.destinoDaUltima = destino;
    this.redesenhar();
  }

  public fixarDestino(destino: HTMLElement): void {
    this.destino = destino;
    this.redesenhar();
  }

  public nota(texto: string): void {
    this.registrar({ severidade: 'nota', texto });
  }

  public alerta(texto: string): void {
    this.registrar({ severidade: 'alerta', texto });
  }

  public falha(texto: string): void {
    this.registrar({ severidade: 'falha', texto });
  }

  private registrar(entrada: Entrada): void {
    this.entradas.push(entrada);
    console.info(`[bateria:${entrada.severidade}] ${entrada.texto}`);
    this.redesenhar();
  }

  private redesenhar(): void {
    const ultima: Entrada | undefined = this.entradas[this.entradas.length - 1];
    if (this.destinoDaUltima !== undefined && ultima !== undefined) {
      this.destinoDaUltima.className = `diario diario-${ultima.severidade}`;
      this.destinoDaUltima.textContent = ultima.texto;
    }
    const destino: HTMLElement | undefined = this.destino;
    if (destino === undefined) {
      return;
    }
    destino.replaceChildren();
    for (const entrada of this.entradas) {
      const linha: HTMLParagraphElement = document.createElement('p');
      linha.className = `diario diario-${entrada.severidade}`;
      linha.textContent = entrada.texto;
      destino.appendChild(linha);
    }
  }
}

export function explicarFalha(erro: unknown, inicio: string = 'A sondagem parou'): string {
  const recusa: string | undefined = descreverRecusaDeSessao(erro);
  if (recusa !== undefined) {
    return recusa;
  }
  if (erro instanceof Error) {
    return `${inicio}: ${erro.message}`;
  }
  return `${inicio} por um motivo que o navegador não descreveu.`;
}
