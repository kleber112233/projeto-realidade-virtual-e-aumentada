export const LIMITE_DE_QUADROS_SEM_POSE: number = 10;

export interface Estabilidade {
  readonly quadros: number;
  readonly quadrosSemPose: number;
  readonly maiorLacuna: number;
  readonly quadrosOcultos: number;
}

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
    this.maiorLacuna = Math.max(this.maiorLacuna, this.lacunaCorrente);
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

export function diagnosticar(e: Estabilidade): string {
  if (e.quadros === 0) {
    return 'Nenhum quadro chegou. A sessão não chegou a gerar imagem.';
  }
  const visiveis: number = e.quadros - e.quadrosOcultos;
  const sobreOcultos: string =
    e.quadrosOcultos > 0 ? ` Outros ${e.quadrosOcultos} quadros vieram com a sessão fora de primeiro plano e não entram na conta.` : '';
  if (visiveis === 0) {
    return `Todos os ${e.quadros} quadros vieram com a sessão fora de primeiro plano (menu do sistema aberto). Não houve observação visível, então não dá para avaliar o rastreamento.`;
  }
  if (e.quadrosSemPose === 0) {
    return (
      `A pose veio em todos os ${visiveis} quadros visíveis.${sobreOcultos} ` +
      'Foi pouco tempo de observação, então isso não garante que o rastreamento fique estável em uso longo.'
    );
  }
  const proporcao: number = Math.round((e.quadrosSemPose / visiveis) * 100);
  const veredito: string =
    e.maiorLacuna > LIMITE_DE_QUADROS_SEM_POSE
      ? `Passou do limite de ${LIMITE_DE_QUADROS_SEM_POSE} quadros seguidos, então o rastreamento esteve instável.`
      : `Ficou dentro do limite de ${LIMITE_DE_QUADROS_SEM_POSE} quadros seguidos.`;
  return (
    `A pose faltou em ${proporcao}% dos ${visiveis} quadros visíveis, com até ${e.maiorLacuna} quadros seguidos sem pose. ${veredito}${sobreOcultos} ` +
    'As causas mais comuns são parede sem textura, pouca luz ou movimento brusco. Pela contagem não dá para saber qual delas foi.'
  );
}
