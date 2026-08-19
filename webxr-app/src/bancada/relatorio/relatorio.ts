// src/bancada/relatorio/relatorio.ts
// ---------------------------------------------------------------------------
// Apresentação do confronto — versão provisória, fora da cena.
//
// O painel definitivo da Bancada é diegético: um cartaz preso à própria bancada,
// dentro do mundo, lido de dentro do ambiente. Ele não pode existir ainda, pelo
// motivo mais simples possível — não há mundo. Enquanto o grafo de cena não
// chega, o relatório sai em HTML comum, e essa é uma decisão temporária que vale
// a pena declarar em vez de esconder: quando a bancada existir, este arquivo é o
// que muda de lugar, e nada mais.
// ---------------------------------------------------------------------------

import type { Dominio } from '../dominio/dominio';
import type { EstadoDeRecurso } from '../devices/recursos';
import { descreverClasse, type GrausDeLiberdade } from '../devices/graus';
import type { ResultadoDaSonda, SondaEmSessao } from '../devices/sonda';
import type { LinhaDoRelatorio, Suporte } from '../modes/verificacao';

function rotuloDoSuporte(suporte: Suporte): string {
  switch (suporte) {
    case 'sim':
      return 'suportado';
    case 'nao':
      return 'não suportado';
    case 'desconhecido':
      return 'sem resposta';
  }
}

function celula(texto: string, cabecalho: boolean = false): HTMLTableCellElement {
  const elemento: HTMLTableCellElement = document.createElement(cabecalho ? 'th' : 'td');
  elemento.textContent = texto;
  return elemento;
}

function tabelaDeRegimes(linhas: readonly LinhaDoRelatorio[]): HTMLTableElement {
  const tabela: HTMLTableElement = document.createElement('table');

  const cabecalho: HTMLTableRowElement = tabela.insertRow();
  for (const titulo of [
    'Regime',
    'O que faz com o mundo',
    'Espaço de referência',
    'Rastreia',
    'Registro contra',
    'Neste aparelho',
  ]) {
    cabecalho.appendChild(celula(titulo, true));
  }

  for (const linha of linhas) {
    const fileira: HTMLTableRowElement = tabela.insertRow();
    fileira.appendChild(celula(linha.regime.nome));
    fileira.appendChild(celula(linha.regime.tratamentoDoMundo));
    fileira.appendChild(celula(linha.regime.espacoDeReferencia));
    fileira.appendChild(celula(linha.regime.rastreia));
    fileira.appendChild(celula(linha.regime.registroContra));
    fileira.appendChild(celula(`${rotuloDoSuporte(linha.suporte)} — ${linha.observacao}`));
  }

  return tabela;
}

function blocoDoDominio(dominio: Dominio, problemas: readonly string[]): HTMLElement {
  const bloco: HTMLElement = document.createElement('section');

  const titulo: HTMLHeadingElement = document.createElement('h2');
  titulo.textContent = `Domínio: ${dominio.nome}`;
  bloco.appendChild(titulo);

  const descricao: HTMLParagraphElement = document.createElement('p');
  descricao.textContent = dominio.descricao;
  bloco.appendChild(descricao);

  const tarefa: HTMLParagraphElement = document.createElement('p');
  tarefa.textContent = `Tarefa: ${dominio.tarefa.enunciado} Concluída quando: ${dominio.tarefa.estadoFinal}`;
  bloco.appendChild(tarefa);

  const inventario: HTMLParagraphElement = document.createElement('p');
  inventario.textContent =
    `${dominio.pecas.length} peças e ${dominio.sockets.length} encaixes declarados. ` +
    (problemas.length === 0
      ? 'Nenhuma inconsistência entre peças e encaixes.'
      : `Inconsistências: ${problemas.join(' ')}`);
  bloco.appendChild(inventario);

  return bloco;
}

export function montarRelatorio(
  raiz: HTMLElement,
  dominio: Dominio,
  problemas: readonly string[],
  linhas: readonly LinhaDoRelatorio[],
): void {
  raiz.replaceChildren();
  raiz.appendChild(blocoDoDominio(dominio, problemas));

  const tituloRegimes: HTMLHeadingElement = document.createElement('h2');
  tituloRegimes.textContent = 'Regimes: o que foi declarado e o que este aparelho responde';
  raiz.appendChild(tituloRegimes);
  raiz.appendChild(tabelaDeRegimes(linhas));
}

// ---------------------------------------------------------------------------
// Acréscimo deste módulo: a apresentação da sonda de capacidades.
//
// O relatório de regimes acima continua onde estava — ele responde "este
// aparelho entra?", que é a pergunta grossa. O que vem daqui para baixo responde
// "e uma vez dentro, o que ele concede?", que é a pergunta do módulo de
// dispositivos e que só a sessão responde.
// ---------------------------------------------------------------------------

function rotuloDoEstado(estado: EstadoDeRecurso): string {
  switch (estado) {
    case 'concedido':
      return 'concedido';
    case 'negado':
      return 'não concedido';
    case 'indeterminado':
      return 'sem resposta';
  }
}

function rotuloDosGraus(graus: GrausDeLiberdade): string {
  switch (graus) {
    case 'tres':
      return 'três graus de liberdade — o aparelho acompanha para onde a cabeça aponta e não acompanha para onde ela vai';
    case 'seis':
      return 'seis graus de liberdade — o aparelho acompanha orientação e deslocamento';
    case 'indeterminado':
      return 'indeterminado — os espaços concedidos não bastam para afirmar nem uma coisa nem outra';
  }
}

function tabelaDeRecursos(sonda: SondaEmSessao): HTMLTableElement {
  const tabela: HTMLTableElement = document.createElement('table');
  const cabecalho: HTMLTableRowElement = tabela.insertRow();
  for (const titulo of ['Recurso', 'Para que serve', 'Neste aparelho']) {
    cabecalho.appendChild(celula(titulo, true));
  }
  for (const recurso of sonda.recursos) {
    const fileira: HTMLTableRowElement = tabela.insertRow();
    fileira.appendChild(celula(recurso.nome));
    fileira.appendChild(celula(recurso.paraQueServe));
    fileira.appendChild(celula(rotuloDoEstado(recurso.estado)));
  }
  return tabela;
}

function tabelaDeFontes(sonda: SondaEmSessao): HTMLElement {
  if (sonda.fontesDeEntrada.length === 0) {
    const vazio: HTMLParagraphElement = document.createElement('p');
    vazio.textContent =
      'Nenhuma fonte de entrada foi declarada durante a sondagem. Num visor, isso costuma significar controle desligado ou fora de alcance; num aparelho de mão, é o esperado até a primeira toque na tela.';
    return vazio;
  }
  const tabela: HTMLTableElement = document.createElement('table');
  const cabecalho: HTMLTableRowElement = tabela.insertRow();
  for (const titulo of ['Lado', 'Mira', 'Pose de punho', 'Mão articulada', 'Perfis']) {
    cabecalho.appendChild(celula(titulo, true));
  }
  for (const fonte of sonda.fontesDeEntrada) {
    const fileira: HTMLTableRowElement = tabela.insertRow();
    fileira.appendChild(celula(fonte.lado));
    fileira.appendChild(celula(fonte.mira));
    fileira.appendChild(celula(fonte.temPoseDePunho ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.temMao ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.perfis.join(', ')));
  }
  return tabela;
}

function paragrafo(texto: string): HTMLParagraphElement {
  const elemento: HTMLParagraphElement = document.createElement('p');
  elemento.textContent = texto;
  return elemento;
}

function subtitulo(texto: string): HTMLHeadingElement {
  const elemento: HTMLHeadingElement = document.createElement('h3');
  elemento.textContent = texto;
  return elemento;
}

/**
 * Escreve o resultado da sonda no elemento indicado.
 *
 * `confronto` é a frase que compara a composição declarada no módulo anterior com
 * a que a sessão informou, e ela vem pronta de fora porque quem a produz é o
 * módulo de dispositivos, não a apresentação.
 */
export function montarSonda(
  raiz: HTMLElement,
  resultado: ResultadoDaSonda,
  confronto: string | undefined,
): void {
  raiz.replaceChildren();

  const titulo: HTMLHeadingElement = document.createElement('h2');
  titulo.textContent = 'Sonda de capacidades';
  raiz.appendChild(titulo);

  raiz.appendChild(paragrafo(descreverClasse(resultado.classe)));
  raiz.appendChild(
    paragrafo(
      resultado.semSessao.contextoSeguro
        ? 'A página está em contexto seguro, então a ausência de um recurso é resposta do aparelho.'
        : 'A página NÃO está em contexto seguro. Nada abaixo é informação sobre o aparelho: é a URL impedindo a pergunta.',
    ),
  );

  const sonda: SondaEmSessao | undefined = resultado.emSessao;
  if (sonda === undefined) {
    raiz.appendChild(
      paragrafo(resultado.motivoSemSessao ?? 'Não houve sessão, e o motivo não foi registrado.'),
    );
    return;
  }

  raiz.appendChild(subtitulo(`Recursos opcionais pedidos em ${sonda.modo}`));
  raiz.appendChild(tabelaDeRecursos(sonda));

  raiz.appendChild(subtitulo('Espaços de referência e graus de liberdade'));
  raiz.appendChild(
    paragrafo(
      sonda.espacosConcedidos.length === 0
        ? 'Nenhum espaço de referência foi concedido.'
        : `Concedidos: ${sonda.espacosConcedidos.join(', ')}.`,
    ),
  );
  raiz.appendChild(paragrafo(rotuloDosGraus(sonda.graus)));

  raiz.appendChild(subtitulo('Fontes de entrada declaradas'));
  raiz.appendChild(tabelaDeFontes(sonda));

  raiz.appendChild(subtitulo('Composição do fundo'));
  raiz.appendChild(paragrafo(`A sessão informou composição ${sonda.composicaoObservada}.`));
  if (confronto !== undefined) {
    raiz.appendChild(paragrafo(confronto));
  }

  raiz.appendChild(subtitulo('Estabilidade do rastreamento na janela observada'));
  raiz.appendChild(
    paragrafo(
      `${sonda.estabilidade.quadros} quadros observados, ` +
        `${sonda.estabilidade.quadrosSemPose} sem pose, ` +
        `${sonda.estabilidade.quadrosOcultos} com a sessão fora de primeiro plano.`,
    ),
  );
  raiz.appendChild(paragrafo(sonda.diagnostico));
}

/**
 * A estrutura da cena e a demonstração da ordem das operações, na página comum.
 *
 * Isto não substitui o painel dentro da cena, e não concorre com ele: o painel
 * mostra o que muda a cada quadro e precisa ser lido de dentro do ambiente; esta
 * seção mostra o que é fixo e se lê melhor com o texto parado diante dos olhos.
 */
export function montarEstruturaDaCena(
  raiz: HTMLElement,
  arvore: readonly string[],
  frasesDaOrdem: readonly string[],
): void {
  raiz.replaceChildren();
  raiz.appendChild(subtitulo('Como a cena está montada'));

  const bloco: HTMLPreElement = document.createElement('pre');
  bloco.textContent = arvore.join('\n');
  raiz.appendChild(bloco);

  raiz.appendChild(subtitulo('A ordem das operações não é livre'));
  for (const frase of frasesDaOrdem) {
    raiz.appendChild(paragrafo(frase));
  }
}
