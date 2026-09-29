import { Group, MathUtils, WebGLRenderer } from 'three';

import { BATERIA, inconsistenciasDoDominio } from './bateria/dominio/dominio';
import { levantarRelatorio, type LinhaDoRelatorio } from './bateria/modes/verificacao';
import { conferirComposicao, sondar, type ResultadoDaSonda } from './bateria/devices/sonda';
import { montarRelatorio, montarSonda } from './bateria/relatorio/relatorio';
import { Diario, explicarFalha } from './bateria/relatorio/diario';
import { montarEstrutura, montarMedicao } from './bateria/relatorio/estrutura';
import { folhaDeMedicao } from './bateria/relatorio/medicao';
import {
  copiarParaAreaDeTransferencia,
  montarRegistro,
  nomeDoArquivo,
  salvarArquivo,
  textoParaCompartilhar,
  type RegistroDeMedicao,
} from './bateria/relatorio/exportacao';
import { montarPalco, type Palco } from './bateria/core/palco';
import { ABERTURA_DO_CHIMBAL_M, montarCena, type CenaDaBateria } from './bateria/core/cena';
import { Relogio, type Amostra } from './bateria/core/relogio';
import { Orcamento, TETO_ADOTADO_MS, linhasDoPainel, type LeituraDoOrcamento } from './bateria/core/orcamento';
import { montarLaco, type Laco } from './bateria/core/laco';
import { descreverArvore, emMetros, posicaoNoMundo, reparentar, type ResultadoDaTroca } from './bateria/core/hierarquia';
import { montarPainel, type Painel } from './bateria/ui/painel';
import { montarLigacao, type LigacaoDeParentesco } from './bateria/ui/ligacao';

function exigir<T extends HTMLElement>(id: string): T {
  const elemento: HTMLElement | null = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`A página não tem o elemento #${id}.`);
  }
  return elemento as T;
}

// --- 1. Diário e conferências iniciais --------------------------------------

const diario: Diario = new Diario();
diario.fixarDestino(exigir('diario'));
diario.fixarDestinoDaUltima(exigir('ultima-acao'));

if (!window.isSecureContext) {
  diario.alerta('A página não está em contexto seguro (HTTPS ou endereço local). Sem isso o navegador esconde a WebXR, e a sonda vai dizer que o aparelho não tem suporte mesmo que ele tenha.');
}
const problemas: string[] = inconsistenciasDoDominio(BATERIA);
if (problemas.length > 0) {
  diario.alerta(`O domínio tem inconsistências: ${problemas.join(' ')}`);
}

// --- 2. Consulta dos regimes ------------------------------------------------

const raizRelatorio: HTMLElement = exigir('relatorio');
const consultaDeRegimes: Promise<LinhaDoRelatorio[]> = levantarRelatorio();
void consultaDeRegimes.then((linhas: LinhaDoRelatorio[]) => {
  montarRelatorio(raizRelatorio, BATERIA, problemas, linhas);
  diario.nota('Já perguntamos ao navegador quais modos ele aceita. Para a sonda completa, clique em Sondar este aparelho.');
});

// --- 3. Cena e demonstração -------------------------------------------------

interface Demonstracao {
  readonly renderer: WebGLRenderer;
  readonly orcamento: Orcamento;
}

const BOTOES_DA_CENA: readonly string[] = ['fixar', 'girar', 'mover', 'redimensionar', 'chimbal', 'medir'];

const raizMedicao: HTMLElement = exigir('medicao');

function montarDemonstracao(): Demonstracao {
  const palco: Palco = montarPalco(exigir<HTMLCanvasElement>('cena'));
  const cena: CenaDaBateria = montarCena(BATERIA);
  const relogio: Relogio = new Relogio();
  const orcamento: Orcamento = new Orcamento(TETO_ADOTADO_MS);
  const laco: Laco = montarLaco(palco, cena.sala, relogio, orcamento);

  const painel: Painel = montarPainel('Custo do quadro');
  cena.suporteDoPainel.add(painel.no);

  const raizEstrutura: HTMLElement = exigir('estrutura');
  const atualizarEstrutura = (): void => {
    montarEstrutura(raizEstrutura, descreverArvore(cena.sala));
  };
  atualizarEstrutura();

  const peca = (id: Parameters<typeof cena.pecas.get>[0]): Group => {
    const no: Group | undefined = cena.pecas.get(id);
    if (no === undefined) {
      throw new Error(`A cena não tem a peça "${id}".`);
    }
    return no;
  };
  const bumbo: Group = peca('bumbo');
  const caixa: Group = peca('caixa');

  const relatoDoMovimento = (bumboAntes: string, caixaAntes: string): string =>
    `O bumbo (filho de "${bumbo.parent?.name}") foi de ${bumboAntes} para ${emMetros(posicaoNoMundo(bumbo))}. ` +
    `A caixa (filha de "${caixa.parent?.name}") estava em ${caixaAntes} e agora está em ${emMetros(posicaoNoMundo(caixa))}.`;

  const ligacao: LigacaoDeParentesco = montarLigacao();
  const RAIO_DO_ANEL_DO_BUMBO_M: number = 0.34;
  const botaoFixar: HTMLButtonElement = exigir('fixar');
  botaoFixar.addEventListener('click', () => {
    const fixado: boolean = bumbo.parent === cena.plataforma;
    const destino: Group = fixado ? cena.chao : cena.plataforma;
    try {
      const r: ResultadoDaTroca = reparentar(bumbo, destino);
      if (destino === cena.plataforma) {
        ligacao.ligar(cena.plataforma, bumbo, RAIO_DO_ANEL_DO_BUMBO_M);
      } else {
        ligacao.desligar();
      }
      const girada: boolean = cena.plataforma.rotation.y !== 0;
      diario.nota(
        `Bumbo agora é filho de "${destino.name}". Posição no mundo antes: ${emMetros(r.antes)}. ` +
          `Depois: ${emMetros(r.depois)}. Desvio de posição: ${r.desvio.toExponential(1)} m. ` +
          `Desvio de orientação: ${r.desvioAngularGraus.toExponential(1)} graus. ` +
          (girada ? 'A plataforma estava girada, então a conta também compôs a rotação. ' : '') +
          (destino === cena.plataforma
            ? 'Ele continua no mesmo lugar, mas agora está preso à plataforma (linha amarela). Gire ou mova a plataforma para ver ele ir junto.'
            : 'Ele voltou a ficar solto no chão.'),
      );
    } catch (erro: unknown) {
      diario.falha(erro instanceof Error ? erro.message : String(erro));
    }
    botaoFixar.textContent = bumbo.parent === cena.plataforma ? 'Soltar o bumbo da plataforma' : 'Fixar o bumbo na plataforma';
    atualizarEstrutura();
  });

  const ANGULO_DE_GIRO_RAD: number = MathUtils.degToRad(30);
  const botaoGirar: HTMLButtonElement = exigir('girar');
  botaoGirar.addEventListener('click', () => {
    const bumboAntes: string = emMetros(posicaoNoMundo(bumbo));
    const caixaAntes: string = emMetros(posicaoNoMundo(caixa));
    cena.plataforma.rotation.y = cena.plataforma.rotation.y === 0 ? ANGULO_DE_GIRO_RAD : 0;
    const graus: number = Math.round(MathUtils.radToDeg(cena.plataforma.rotation.y));
    diario.nota(`Plataforma girada para ${graus}°. ${relatoDoMovimento(bumboAntes, caixaAntes)}`);
    botaoGirar.textContent = graus === 0 ? 'Girar a plataforma 30°' : 'Desfazer o giro da plataforma';
  });

  const botaoMover: HTMLButtonElement = exigir('mover');
  botaoMover.addEventListener('click', () => {
    const bumboAntes: string = emMetros(posicaoNoMundo(bumbo));
    const caixaAntes: string = emMetros(posicaoNoMundo(caixa));
    cena.plataforma.position.x = cena.plataforma.position.x === 0 ? 0.4 : 0;
    diario.nota(
      `Plataforma movida para x = ${cena.plataforma.position.x.toFixed(2)} m. ${relatoDoMovimento(bumboAntes, caixaAntes)}`,
    );
    botaoMover.textContent = cena.plataforma.position.x === 0 ? 'Mover a plataforma 40 cm' : 'Voltar a plataforma';
  });

  const botaoRedimensionar: HTMLButtonElement = exigir('redimensionar');
  botaoRedimensionar.addEventListener('click', () => {
    const ladoAtual: number = cena.piso.scale.x;
    const lado: number = cena.redimensionarPlataforma(ladoAtual < 2 ? 2.5 : BATERIA.plataforma.ladoInicial);
    const escalaDoBumbo: number = bumbo.getWorldScale(bumbo.scale.clone()).x;
    diario.nota(
      `A plataforma agora tem ${lado.toFixed(2)} m de lado. Só a malha do piso mudou de tamanho, ` +
        `então a escala do bumbo no mundo continua ${escalaDoBumbo.toFixed(3)}.`,
    );
    botaoRedimensionar.textContent = lado < 2 ? 'Redimensionar a plataforma para 2,5 m' : 'Voltar a plataforma para 1,5 m';
  });

  const botaoChimbal: HTMLButtonElement = exigir('chimbal');
  let alturaDoChimbal: number = 0.8;
  botaoChimbal.addEventListener('click', () => {
    const pratoAntes: number = posicaoNoMundo(cena.pratoDeCimaDoChimbal).y;
    alturaDoChimbal = cena.ajustarAlturaDoChimbal(alturaDoChimbal < 0.85 ? 0.9 : 0.8);
    const pratoDepois: number = posicaoNoMundo(cena.pratoDeCimaDoChimbal).y;
    diario.nota(
      `Haste do chimbal em ${(alturaDoChimbal * 100).toFixed(0)} cm. O prato de cima, que é filho da haste, ` +
        `foi de y = ${pratoAntes.toFixed(3)} m para ${pratoDepois.toFixed(3)} m sem este botão mexer nele: o botão só move a haste.`,
    );
    botaoChimbal.textContent = alturaDoChimbal < 0.85 ? 'Subir o chimbal para 90 cm' : 'Baixar o chimbal para 80 cm';
  });

  const alturaBaseDoPratoDeCima: number = cena.pratoDeCimaDoChimbal.position.y;
  const CICLOS_POR_SEGUNDO: number = 1;
  laco.aoPasso((amostra: Amostra) => {
    const fase: number = 2 * Math.PI * CICLOS_POR_SEGUNDO * amostra.decorrido;
    cena.pratoDeCimaDoChimbal.position.y = alturaBaseDoPratoDeCima - (ABERTURA_DO_CHIMBAL_M * (1 - Math.cos(fase))) / 2;
    painel.atualizar([...linhasDoPainel(orcamento.ler()), `Tempo da cena: ${amostra.decorrido.toFixed(1)} s`], amostra.decorrido);
  });

  exigir('medir').addEventListener('click', () => {
    montarMedicao(raizMedicao, folhaDeMedicao(palco.renderer, orcamento.ler()));
    diario.nota('Medição registrada logo abaixo, junto com os dados da máquina.');
  });

  laco.iniciar();
  return { renderer: palco.renderer, orcamento };
}

let demonstracao: Demonstracao | undefined;
try {
  demonstracao = montarDemonstracao();
} catch (erro: unknown) {
  diario.falha(
    `${explicarFalha(erro, 'A cena não pôde ser montada')} A sonda e o relatório continuam funcionando logo abaixo.`,
  );
  for (const id of BOTOES_DA_CENA) {
    exigir<HTMLButtonElement>(id).disabled = true;
  }
}

// --- 4. Compartilhar --------------------------------------------------------

let ultimaSonda: ResultadoDaSonda | undefined;
const campoRotulo: HTMLInputElement = exigir('rotulo');
const botaoCopiar: HTMLButtonElement = exigir('copiar');
const botaoSalvar: HTMLButtonElement = exigir('salvar');

campoRotulo.addEventListener('input', () => {
  const semNome: boolean = campoRotulo.value.trim() === '';
  botaoCopiar.disabled = semNome;
  botaoSalvar.disabled = semNome;
});

function registroAtual(): { registro: RegistroDeMedicao; texto: string } {
  const leitura: LeituraDoOrcamento = (demonstracao?.orcamento ?? new Orcamento(TETO_ADOTADO_MS)).ler();
  const registro: RegistroDeMedicao = montarRegistro(campoRotulo.value, demonstracao?.renderer, leitura, ultimaSonda);
  const texto: string = textoParaCompartilhar(registro);
  montarMedicao(raizMedicao, texto.split('\n'));
  return { registro, texto };
}

botaoCopiar.addEventListener('click', () => {
  const { texto } = registroAtual();
  void copiarParaAreaDeTransferencia(texto).then((copiou: boolean) => {
    if (copiou) {
      diario.nota('Dados copiados. Agora é só colar onde quiser. Eles também estão logo abaixo.');
    } else {
      diario.alerta('O navegador não deixou copiar sozinho. O texto está logo abaixo, dá para selecionar e copiar à mão.');
    }
  });
});

botaoSalvar.addEventListener('click', () => {
  const { registro, texto } = registroAtual();
  const nome: string = nomeDoArquivo(registro);
  salvarArquivo(nome, texto);
  diario.nota(`Arquivo "${nome}" salvo na pasta de downloads deste aparelho.`);
});

// --- 5. Sonda completa ------------------------------------------------------

const raizSonda: HTMLElement = exigir('sonda');
const botaoSondar: HTMLButtonElement = exigir('sondar');

async function executarSonda(): Promise<void> {
  botaoSondar.disabled = true;
  diario.nota('Sondando o aparelho. Se aparecer um pedido de permissão, aceite, senão a sessão não abre.');
  try {
    const resultado: ResultadoDaSonda = await sondar(await consultaDeRegimes);
    const confronto: string | undefined =
      resultado.emSessao === undefined ? undefined : conferirComposicao(resultado.emSessao);
    montarSonda(raizSonda, resultado, confronto);
    ultimaSonda = resultado;
    const s = resultado.emSessao;
    if (s === undefined) {
      diario.nota(`Sondagem concluída sem sessão imersiva. ${resultado.motivoSemSessao ?? ''}`);
    } else if (s.interrupcao !== undefined) {
      diario.alerta(`Sondagem concluída pela metade. ${s.interrupcao} O que deu para ler está em Sonda de capacidades.`);
    } else {
      diario.nota(`Sondagem concluída. A sessão ${s.modo} abriu, observamos ${s.estabilidade.quadros} quadros e depois ela foi fechada.`);
    }
  } catch (erro: unknown) {
    diario.falha(explicarFalha(erro));
  } finally {
    botaoSondar.disabled = false;
  }
}

botaoSondar.addEventListener('click', () => {
  void executarSonda();
});
