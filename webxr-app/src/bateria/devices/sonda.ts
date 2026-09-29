import { REGIMES, type Regime, type RegimeId } from '../modes/regimes';
import { levantarRelatorio, type LinhaDoRelatorio, type Suporte } from '../modes/verificacao';
import { RECURSOS_CONSULTADOS, estadoDoRecurso, type EstadoDeRecurso } from './recursos';
import { ContadorDeEstabilidade, diagnosticar, type Estabilidade } from './estabilidade';
import { classificarAparelho, grausDeLiberdade, type ClasseDeAparelho, type GrausDeLiberdade } from './graus';
import { descreverRecusaDeSessao } from './recusa';

// --- Tipos e constantes -----------------------------------------------------
class RecusaDeSessao extends Error {
  constructor(public readonly original: unknown) {
    super(original instanceof Error ? original.message : 'recusa sem descrição');
  }
}

export type ModoSondavel = 'immersive-vr' | 'immersive-ar';

const ESPACOS_TENTADOS: readonly XRReferenceSpaceType[] = ['bounded-floor', 'local-floor', 'local', 'viewer'];

export const QUADROS_OBSERVADOS: number = 90;

const TEMPO_MAXIMO_DE_OBSERVACAO_MS: number = 10_000;

export interface RecursoSondado {
  readonly nome: string;
  readonly paraQueServe: string;
  readonly estado: EstadoDeRecurso;
}

export interface FonteDeEntradaSondada {
  readonly lado: string;
  readonly mira: string;
  readonly temPoseDePunho: boolean;
  readonly temMao: boolean;
  readonly perfis: readonly string[];
}

export interface SondaSemSessao {
  readonly temApiXr: boolean;
  readonly contextoSeguro: boolean;
  readonly regimes: readonly LinhaDoRelatorio[];
  readonly modosSuportados: readonly string[];
}

export interface SondaEmSessao {
  readonly modo: ModoSondavel;
  readonly recursos: readonly RecursoSondado[];
  readonly espacosConcedidos: readonly string[];
  readonly composicaoObservada: XREnvironmentBlendMode;
  readonly modoDeInteracao: XRInteractionMode | undefined;
  readonly fontesDeEntrada: readonly FonteDeEntradaSondada[];
  readonly graus: GrausDeLiberdade;
  readonly posesObservadas: number;
  readonly posesComPosicaoEmulada: number;
  readonly estabilidade: Estabilidade;
  readonly diagnostico: string;
  readonly interrupcao: string | undefined;
}

export interface ResultadoDaSonda {
  readonly semSessao: SondaSemSessao;
  readonly emSessao: SondaEmSessao | undefined;
  readonly motivoSemSessao: string | undefined;
  readonly classe: ClasseDeAparelho;
}

// --- Consulta sem sessão ----------------------------------------------------
export async function sondarSemSessao(regimesJaConsultados?: readonly LinhaDoRelatorio[]): Promise<SondaSemSessao> {
  const regimes: readonly LinhaDoRelatorio[] = regimesJaConsultados ?? (await levantarRelatorio());
  return {
    temApiXr: navigator.xr !== undefined,
    contextoSeguro: window.isSecureContext,
    regimes,
    modosSuportados: regimes.filter((l) => l.suporte === 'sim').map((l) => l.regime.id),
  };
}

function suporteNaTabela(semSessao: SondaSemSessao, id: RegimeId): Suporte {
  return semSessao.regimes.find((l) => l.regime.id === id)?.suporte ?? 'desconhecido';
}

// --- Leituras dentro da sessão ----------------------------------------------
async function espacosConcedidos(sessao: XRSession): Promise<string[]> {
  const obtidos: string[] = [];
  for (const tipo of ESPACOS_TENTADOS) {
    try {
      await sessao.requestReferenceSpace(tipo);
      obtidos.push(tipo);
    } catch {
    }
  }
  return obtidos;
}

function lerFonte(fonte: XRInputSource): FonteDeEntradaSondada {
  return {
    lado: fonte.handedness,
    mira: fonte.targetRayMode,
    temPoseDePunho: fonte.gripSpace != null,
    temMao: fonte.hand != null,
    perfis: [...fonte.profiles],
  };
}

function camadaMinima(sessao: XRSession): WebGL2RenderingContext {
  const tela: HTMLCanvasElement = document.createElement('canvas');
  const gl: WebGL2RenderingContext | null = tela.getContext('webgl2', { xrCompatible: true });
  if (gl === null) {
    throw new Error('Este navegador não entregou contexto WebGL 2 compatível com XR.');
  }
  try {
    sessao.updateRenderState({ baseLayer: new XRWebGLLayer(sessao, gl) });
  } catch (erro: unknown) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    throw erro;
  }
  return gl;
}

interface Observacao {
  readonly estabilidade: Estabilidade;
  readonly posesObservadas: number;
  readonly posesComPosicaoEmulada: number;
  readonly fontes: readonly FonteDeEntradaSondada[];
  readonly interrupcao: string | undefined;
}

function observarQuadros(
  sessao: XRSession,
  referencia: XRReferenceSpace,
  jaEncerrada: () => boolean,
): Promise<Observacao> {
  return new Promise<Observacao>((resolver, rejeitar) => {
    const contador: ContadorDeEstabilidade = new ContadorDeEstabilidade();
    const fontes: Map<XRInputSource, FonteDeEntradaSondada> = new Map();
    let restantes: number = QUADROS_OBSERVADOS;
    let posesObservadas: number = 0;
    let posesComPosicaoEmulada: number = 0;
    let concluida: boolean = false;

    const quadrosVistos = (): number => QUADROS_OBSERVADOS - restantes;

    function concluir(interrupcao: string | undefined): void {
      if (concluida) {
        return;
      }
      concluida = true;
      window.clearTimeout(limite);
      sessao.removeEventListener('end', aoEncerrar);
      resolver({
        estabilidade: contador.resultado(),
        posesObservadas,
        posesComPosicaoEmulada,
        fontes: [...fontes.values()],
        interrupcao,
      });
    }

    function aoEncerrar(): void {
      concluir(
        `A sessão terminou depois de ${quadrosVistos()} dos ${QUADROS_OBSERVADOS} quadros, antes do fim da observação. ` +
          'Isso acontece quando alguém sai pelo botão do sistema ou tira o visor.',
      );
    }

    const limite: number = window.setTimeout(() => {
      concluir(
        `Em ${TEMPO_MAXIMO_DE_OBSERVACAO_MS / 1000} s chegaram só ${quadrosVistos()} dos ${QUADROS_OBSERVADOS} quadros. ` +
          'A sessão estava aberta, mas o aparelho parou de entregar imagens.',
      );
    }, TEMPO_MAXIMO_DE_OBSERVACAO_MS);

    sessao.addEventListener('end', aoEncerrar);
    if (jaEncerrada()) {
      aoEncerrar();
      return;
    }

    const passo: XRFrameRequestCallback = (_tempo: number, quadro: XRFrame): void => {
      if (concluida) {
        return;
      }
      try {
        const pose: XRViewerPose | null | undefined = quadro.getViewerPose(referencia);
        const temPose: boolean = pose !== null && pose !== undefined;
        const visivel: boolean = sessao.visibilityState === 'visible';
        contador.registrar(temPose, visivel);
        if (visivel && pose !== null && pose !== undefined) {
          posesObservadas += 1;
          if (pose.emulatedPosition) {
            posesComPosicaoEmulada += 1;
          }
        }
        for (const fonte of sessao.inputSources) {
          if (!fontes.has(fonte)) {
            fontes.set(fonte, lerFonte(fonte));
          }
        }
        restantes -= 1;
        if (restantes > 0) {
          sessao.requestAnimationFrame(passo);
          return;
        }
        concluir(undefined);
      } catch (erro: unknown) {
        concluida = true;
        window.clearTimeout(limite);
        sessao.removeEventListener('end', aoEncerrar);
        rejeitar(erro);
      }
    };
    sessao.requestAnimationFrame(passo);
  });
}

// --- Sessão de sondagem -----------------------------------------------------
export async function sondarEmSessao(modo: ModoSondavel): Promise<SondaEmSessao> {
  const xr: XRSystem | undefined = navigator.xr;
  if (xr === undefined) {
    throw new Error('Não há API WebXR neste navegador.');
  }
  let sessao: XRSession;
  try {
    sessao = await xr.requestSession(modo, {
      optionalFeatures: RECURSOS_CONSULTADOS.map((r) => r.nome),
    });
  } catch (erro: unknown) {
    throw new RecusaDeSessao(erro);
  }
  let encerrada: boolean = false;
  sessao.addEventListener('end', () => {
    encerrada = true;
  });
  let gl: WebGL2RenderingContext | undefined;

  try {
    gl = camadaMinima(sessao);
    const concedidos: readonly string[] | undefined = sessao.enabledFeatures;
    const espacos: string[] = await espacosConcedidos(sessao);
    const referencia: XRReferenceSpace = await sessao.requestReferenceSpace(
      espacos.includes('local-floor') ? 'local-floor' : 'viewer',
    );
    const obs: Observacao = await observarQuadros(sessao, referencia, () => encerrada);

    return {
      modo,
      recursos: RECURSOS_CONSULTADOS.map((r) => ({
        nome: r.nome,
        paraQueServe: r.paraQueServe,
        estado: estadoDoRecurso(r.nome, concedidos),
      })),
      espacosConcedidos: espacos,
      composicaoObservada: sessao.environmentBlendMode,
      modoDeInteracao: sessao.interactionMode,
      fontesDeEntrada: obs.fontes,
      graus: grausDeLiberdade(obs),
      posesObservadas: obs.posesObservadas,
      posesComPosicaoEmulada: obs.posesComPosicaoEmulada,
      estabilidade: obs.estabilidade,
      diagnostico: diagnosticar(obs.estabilidade),
      interrupcao: obs.interrupcao,
    };
  } catch (erro: unknown) {
    if (encerrada || (erro instanceof DOMException && erro.name === 'InvalidStateError')) {
      throw new Error('A sessão terminou antes de a sonda terminar de ler as respostas dela.');
    }
    throw erro;
  } finally {
    if (!encerrada) {
      try {
        await sessao.end();
      } catch {
      }
    }
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

// --- Sonda completa ---------------------------------------------------------
export function modoPreferido(modosSuportados: readonly string[]): ModoSondavel | undefined {
  const ordem: readonly ModoSondavel[] = ['immersive-ar', 'immersive-vr'];
  return ordem.find((modo) => modosSuportados.includes(modo));
}

function motivoSemModo(semSessao: SondaSemSessao, vr: Suporte, ar: Suporte): string {
  if (!semSessao.temApiXr) {
    return 'Este navegador não tem WebXR. Se a página não estiver em contexto seguro (HTTPS ou endereço local), o problema pode ser o endereço usado.';
  }
  if (vr === 'desconhecido' || ar === 'desconhecido') {
    return 'O navegador tem WebXR, mas a consulta aos modos imersivos falhou sem resposta. Isso não prova que o aparelho não tenha esses modos, então nenhuma sessão foi tentada.';
  }
  return 'Este aparelho não oferece nenhuma sessão imersiva, então a parte da sonda que precisa de sessão não pôde rodar. Isso é uma característica do aparelho.';
}

export async function sondar(regimesJaConsultados?: readonly LinhaDoRelatorio[]): Promise<ResultadoDaSonda> {
  const semSessao: SondaSemSessao = await sondarSemSessao(regimesJaConsultados);
  const vr: Suporte = suporteNaTabela(semSessao, 'immersive-vr');
  const ar: Suporte = suporteNaTabela(semSessao, 'immersive-ar');
  const semLeitura = (motivo: string): ResultadoDaSonda => ({
    semSessao,
    emSessao: undefined,
    motivoSemSessao: motivo,
    classe: classificarAparelho({
      temApiXr: semSessao.temApiXr,
      vr,
      ar,
      graus: 'indeterminado',
      modoDeInteracao: undefined,
    }),
  });

  const modo: ModoSondavel | undefined = modoPreferido(semSessao.modosSuportados);
  if (modo === undefined) {
    return semLeitura(motivoSemModo(semSessao, vr, ar));
  }

  let emSessao: SondaEmSessao;
  try {
    emSessao = await sondarEmSessao(modo);
  } catch (erro: unknown) {
    const recusa: string | undefined =
      erro instanceof RecusaDeSessao ? descreverRecusaDeSessao(erro.original) : undefined;
    const detalhe: string =
      recusa ?? `A sondagem parou: ${erro instanceof Error ? erro.message : 'o navegador não descreveu o motivo.'}`;
    return semLeitura(`Tentamos abrir a sessão ${modo}. ${detalhe}`);
  }

  return {
    semSessao,
    emSessao,
    motivoSemSessao: undefined,
    classe: classificarAparelho({
      temApiXr: semSessao.temApiXr,
      vr,
      ar,
      graus: emSessao.graus,
      modoDeInteracao: emSessao.modoDeInteracao,
    }),
  };
}

export function conferirComposicao(emSessao: SondaEmSessao): string {
  const regime: Regime | undefined = REGIMES.find((r) => r.id === emSessao.modo);
  if (regime === undefined) {
    return 'O regime sondado não consta da declaração de regimes.';
  }
  if (regime.composicaoEsperada === emSessao.composicaoObservada) {
    return `A composição declarada (${regime.composicaoEsperada}) foi confirmada pela sessão.`;
  }
  return (
    `Declaramos a composição ${regime.composicaoEsperada}, mas a sessão informou ` +
    `${emSessao.composicaoObservada}. Precisamos corrigir a declaração em regimes.ts.`
  );
}
