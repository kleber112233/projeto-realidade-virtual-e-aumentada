import type { WebGLRenderer } from 'three';

import type { LeituraDoOrcamento } from '../core/orcamento';
import type { ResultadoDaSonda } from '../devices/sonda';
import { identificarPlaca } from './medicao';

// --- Registro da medição ----------------------------------------------------
export interface Maquina {
  readonly rotulo: string;
  readonly navegador: string;
  readonly placa: string;
  readonly tela: string;
  readonly densidade: number;
}

export interface RegistroDeMedicao {
  readonly data: string;
  readonly maquina: Maquina;
  readonly orcamento: LeituraDoOrcamento;
  readonly sonda: ResultadoDaSonda | undefined;
}

export function montarRegistro(
  rotulo: string,
  renderer: WebGLRenderer | undefined,
  orcamento: LeituraDoOrcamento,
  sonda: ResultadoDaSonda | undefined,
): RegistroDeMedicao {
  return {
    data: new Date().toISOString(),
    maquina: {
      rotulo: rotulo.trim() === '' ? 'sem nome' : rotulo.trim(),
      navegador: navigator.userAgent,
      placa: identificarPlaca(renderer),
      tela: `${window.screen.width}x${window.screen.height}`,
      densidade: window.devicePixelRatio,
    },
    orcamento,
    sonda,
  };
}

// --- Texto para compartilhar ------------------------------------------------
function ms(valor: number): string {
  return `${valor.toFixed(2)} ms`;
}

function linhasDaSonda(sonda: ResultadoDaSonda | undefined): string[] {
  if (sonda === undefined) {
    return ['Sonda: ainda não rodou nesta página. Clique em Sondar este aparelho antes de copiar para ela entrar aqui.'];
  }
  const s = sonda.emSessao;
  const linhas: string[] = [`Sonda: classe do aparelho ${sonda.classe}`];
  if (s === undefined) {
    linhas.push(`  sem sessão imersiva: ${sonda.motivoSemSessao ?? 'motivo não registrado'}`);
    return linhas;
  }
  const porEstado = (estado: string): string =>
    s.recursos.filter((r) => r.estado === estado).map((r) => r.nome).join(', ') || 'nenhum';
  linhas.push(
    `  sessão: ${s.modo}, graus de liberdade: ${s.graus} (${s.posesObservadas} poses, ${s.posesComPosicaoEmulada} emuladas)`,
    `  forma de interação: ${s.modoDeInteracao ?? 'não informada'}`,
    `  observação: ${s.interrupcao ?? `completa (${s.estabilidade.quadros} quadros)`}`,
    `  composição do fundo: ${s.composicaoObservada}`,
    `  recursos concedidos: ${porEstado('concedido')}`,
    `  recursos não concedidos (motivo não informado): ${porEstado('negado')}`,
    `  sem resposta: ${porEstado('indeterminado')}`,
    `  espaços de referência: ${s.espacosConcedidos.join(', ') || 'nenhum'}`,
    `  fontes de entrada: ${s.fontesDeEntrada.map((f) => `${f.lado}/${f.mira}`).join(', ') || 'nenhuma'}`,
    `  estabilidade: ${s.estabilidade.quadros} quadros, ${s.estabilidade.quadrosSemPose} sem pose`,
  );
  return linhas;
}

const COLUNAS_CSV: readonly string[] = [
  'data', 'maquina', 'placa', 'navegador', 'tela', 'densidade',
  'teto_ms', 'quadros_medidos', 'custo_medio_ms', 'pior_custo_ms', 'quadros_acima_do_teto',
  'intervalo_medio_ms', 'pior_intervalo_ms', 'chamadas_de_desenho', 'triangulos', 'quadros_com_salto_cortado',
  'classe_do_aparelho', 'modo_da_sessao', 'graus_de_liberdade', 'composicao_do_fundo',
];

function celulaCsv(valor: string | number): string {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

function linhaCsv(r: RegistroDeMedicao): string {
  const o: LeituraDoOrcamento = r.orcamento;
  const s = r.sonda?.emSessao;
  const vazio: string = r.sonda === undefined ? 'não sondado' : 'sem sessão';
  const valores: (string | number)[] = [
    r.data, r.maquina.rotulo, r.maquina.placa, r.maquina.navegador, r.maquina.tela, r.maquina.densidade,
    o.tetoMs, o.quadrosMedidos, o.custoMedioMs.toFixed(3), o.piorCustoMs.toFixed(3), o.quadrosAcimaDoTeto,
    o.intervaloMedioMs.toFixed(3), o.piorIntervaloMs.toFixed(3), o.chamadasDeDesenho, o.triangulos, o.quadrosComSaltoCortado,
    r.sonda?.classe ?? 'não sondado', s?.modo ?? vazio, s?.graus ?? vazio, s?.composicaoObservada ?? vazio,
  ];
  return `${COLUNAS_CSV.map(celulaCsv).join(',')}\n${valores.map(celulaCsv).join(',')}`;
}

export function textoParaCompartilhar(r: RegistroDeMedicao): string {
  const o: LeituraDoOrcamento = r.orcamento;
  const quando: string = new Date(r.data).toLocaleString('pt-BR');
  const medicao: string[] =
    o.quadrosMedidos === 0
      ? ['Quadro: ainda sem quadros medidos.']
      : [
          `Quadro (últimos ${o.quadrosMedidos} quadros, teto de ${o.tetoMs} ms do visor a 72 Hz):`,
          `  custo médio ${ms(o.custoMedioMs)}, pior ${ms(o.piorCustoMs)}, ${o.quadrosAcimaDoTeto} quadro(s) acima do teto`,
          `  intervalo médio ${ms(o.intervaloMedioMs)}, pior ${ms(o.piorIntervaloMs)}`,
          `  ${o.chamadasDeDesenho} chamadas de desenho e ${o.triangulos} triângulos`,
          `  ${o.quadrosComSaltoCortado} quadro(s) com salto de tempo cortado (mais de 0,1 s)`,
        ];
  return [
    `Bateria VR, medição de "${r.maquina.rotulo}" em ${quando}`,
    `Máquina: ${r.maquina.placa}, tela ${r.maquina.tela}, densidade ${r.maquina.densidade}`,
    `Navegador: ${r.maquina.navegador}`,
    '',
    ...medicao,
    '',
    ...linhasDaSonda(r.sonda),
    '',
    'Linha para planilha (CSV):',
    '```',
    linhaCsv(r),
    '```',
  ].join('\n');
}

// --- Copiar e salvar --------------------------------------------------------
export async function copiarParaAreaDeTransferencia(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const area: HTMLTextAreaElement = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let copiou: boolean = false;
    try {
      copiou = document.execCommand('copy');
    } catch {
      copiou = false;
    }
    area.remove();
    return copiou;
  }
}

function paraNomeDeArquivo(texto: string): string {
  return (
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'sem-nome'
  );
}

export function nomeDoArquivo(r: RegistroDeMedicao): string {
  const d: Date = new Date(r.data);
  const dois = (n: number): string => String(n).padStart(2, '0');
  const dia: string = `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
  const hora: string = `${dois(d.getHours())}${dois(d.getMinutes())}`;
  return `medicao_${dia}_${hora}_${paraNomeDeArquivo(r.maquina.rotulo)}.txt`;
}

export function salvarArquivo(nome: string, conteudo: string): void {
  const blob: Blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
  const endereco: string = URL.createObjectURL(blob);
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = endereco;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(endereco), 1000);
}
