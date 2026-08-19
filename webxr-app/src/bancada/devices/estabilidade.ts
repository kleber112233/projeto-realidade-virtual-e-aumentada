// src/bancada/devices/estabilidade.ts
// ---------------------------------------------------------------------------
// A falha como medida, e não como anedota.
//
// A pose de quem observa pode simplesmente não vir. A API prevê isso: o quadro
// entrega a pose ou entrega nada, e nada significa que o aparelho perdeu, naquele
// instante, a conta de onde está. É o único sintoma de degradação de rastreamento
// que se lê de dentro do código, sem instrumento e sem sensor extra.
//
// Este contador existe porque o módulo cobra prever a falha, e previsão que não
// se confronta com contagem alguma é opinião. Ele é deliberadamente burro: conta
// quadros com pose e quadros sem, e mais nada. A interpretação fica na função de
// diagnóstico, separada de propósito — misturar contagem e julgamento é o que
// produz medidor que sempre concorda com quem o escreveu.
// ---------------------------------------------------------------------------

export interface Estabilidade {
  readonly quadros: number;
  readonly quadrosSemPose: number;
  /** Maior sequência ininterrupta de quadros sem pose. */
  readonly maiorLacuna: number;
  /** Quadros descartados por a sessão não estar em primeiro plano. */
  readonly quadrosOcultos: number;
}

/**
 * Acumula a contagem quadro a quadro.
 *
 * O parâmetro `visivel` é o que separa perda de rastreamento de sessão que saiu
 * de foco. Quando quem usa abre o menu do sistema do visor, a sessão continua
 * viva, os quadros continuam chegando e a pose deixa de vir — e contar isso como
 * falha de sensor acusaria o aparelho de um defeito que é comportamento normal
 * do sistema operacional.
 */
export class ContadorDeEstabilidade {
  private quadros: number = 0;
  private quadrosSemPose: number = 0;
  private quadrosOcultos: number = 0;
  private maiorLacuna: number = 0;
  private lacunaCorrente: number = 0;

  public registrar(temPose: boolean, visivel: boolean): void {
    this.quadros += 1;

    if (!visivel) {
      this.quadrosOcultos += 1;
      this.lacunaCorrente = 0;
      return;
    }

    if (temPose) {
      this.lacunaCorrente = 0;
      return;
    }

    this.quadrosSemPose += 1;
    this.lacunaCorrente += 1;
    if (this.lacunaCorrente > this.maiorLacuna) {
      this.maiorLacuna = this.lacunaCorrente;
    }
  }

  public resultado(): Estabilidade {
    return {
      quadros: this.quadros,
      quadrosSemPose: this.quadrosSemPose,
      maiorLacuna: this.maiorLacuna,
      quadrosOcultos: this.quadrosOcultos,
    };
  }
}

/**
 * Traduz a contagem numa frase, com as condições que a bibliografia da disciplina
 * aponta como causas de degradação de rastreamento óptico: superfície sem textura
 * (não há canto a reconhecer), iluminação pobre (não há contraste para extrair
 * canto algum) e movimento brusco (a imagem borra e o canto some entre quadros).
 *
 * A frase não afirma qual das três aconteceu. Não dá para saber daqui, e escolher
 * uma seria inventar o diagnóstico junto com a medida.
 */
export function diagnosticar(estabilidade: Estabilidade): string {
  if (estabilidade.quadros === 0) {
    return 'Nenhum quadro foi entregue — a sessão não chegou a produzir imagem.';
  }
  if (estabilidade.quadrosSemPose === 0) {
    return 'A pose veio em todos os quadros observados. A janela de observação é curta, e ausência de falha aqui não é promessa de estabilidade em uso prolongado.';
  }
  const proporcao: number = Math.round(
    (estabilidade.quadrosSemPose / estabilidade.quadros) * 100,
  );
  return (
    `A pose faltou em ${proporcao}% dos quadros, com lacuna máxima de ` +
    `${estabilidade.maiorLacuna} quadros seguidos. As causas prováveis são superfície ` +
    'sem textura, iluminação pobre ou movimento brusco — e daqui não se distingue qual delas.'
  );
}
