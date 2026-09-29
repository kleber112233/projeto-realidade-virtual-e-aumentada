import { contarEstadoFinal, type Dominio, type FaixaDeAjuste, type Papel } from '../dominio/dominio';
import type { EstadoDeRecurso } from '../devices/recursos';
import { descreverClasse, type GrausDeLiberdade } from '../devices/graus';
import type { ResultadoDaSonda, SondaEmSessao } from '../devices/sonda';
import { descreverTratamento } from '../modes/regimes';
import type { LinhaDoRelatorio, Suporte } from '../modes/verificacao';

// --- Peças de montagem ------------------------------------------------------

function celula(texto: string, cabecalho: boolean = false): HTMLTableCellElement {
  const elemento: HTMLTableCellElement = document.createElement(cabecalho ? 'th' : 'td');
  elemento.textContent = texto;
  return elemento;
}

function tabela(titulos: readonly string[], linhas: readonly (readonly string[])[]): HTMLTableElement {
  const t: HTMLTableElement = document.createElement('table');
  const cab: HTMLTableRowElement = t.insertRow();
  cab.className = 'cabecalho';
  for (const titulo of titulos) {
    cab.appendChild(celula(titulo, true));
  }
  for (const linha of linhas) {
    const fileira: HTMLTableRowElement = t.insertRow();
    linha.forEach((texto: string, i: number) => {
      const c: HTMLTableCellElement = celula(texto);
      c.dataset['coluna'] = titulos[i] ?? '';
      fileira.appendChild(c);
    });
  }
  return t;
}

function paragrafo(texto: string): HTMLParagraphElement {
  const p: HTMLParagraphElement = document.createElement('p');
  p.textContent = texto;
  return p;
}

function titulo(nivel: 'h2' | 'h3', texto: string): HTMLHeadingElement {
  const h: HTMLHeadingElement = document.createElement(nivel);
  h.textContent = texto;
  return h;
}

// --- Domínio e regimes ------------------------------------------------------

function rotuloDoPapel(papel: Papel): string {
  switch (papel) {
    case 'instrumento':
      return 'fixa e soa';
    case 'ferragem':
      return 'fixa, não soa';
    case 'baqueta':
      return 'acompanha a mão';
  }
}

function rotuloDoAjuste(ajuste: FaixaDeAjuste | undefined): string {
  if (ajuste === undefined) {
    return 'não tem';
  }
  switch (ajuste.grandeza) {
    case 'altura':
      return `altura de ${Math.round(ajuste.minimo * 100)} a ${Math.round(ajuste.maximo * 100)} cm`;
    case 'inclinacao':
      return `inclinação de ${ajuste.minimo}° a ${ajuste.maximo}°`;
  }
}

function rotuloDoSuporte(suporte: Suporte): string {
  switch (suporte) {
    case 'sim':
      return 'Entra';
    case 'nao':
      return 'Não entra';
    case 'desconhecido':
      return 'Sem resposta';
  }
}

export function montarRelatorio(
  raiz: HTMLElement,
  dominio: Dominio,
  problemas: readonly string[],
  linhas: readonly LinhaDoRelatorio[],
): void {
  raiz.replaceChildren();
  const contagem = contarEstadoFinal(dominio);

  raiz.appendChild(titulo('h2', `Domínio: ${dominio.nome}`));
  raiz.appendChild(paragrafo(dominio.descricao));
  raiz.appendChild(paragrafo(`Tarefa: ${dominio.tarefa.enunciado}`));
  raiz.appendChild(paragrafo(`Concluída quando: ${dominio.tarefa.estadoFinal}`));
  raiz.appendChild(
    paragrafo(
      `Para concluir a tarefa, ${contagem.aFixar} peças precisam estar fixadas e ${contagem.aSoar} delas precisam soar. ` +
        `As ${contagem.foraDoEstadoFinal} baquetas não entram nessa conta. A plataforma tem ` +
        `${dominio.plataforma.ladoInicial} m de lado e a folga de encaixe é de ${dominio.folgaDeEncaixe * 100} cm.`,
    ),
  );
  raiz.appendChild(
    paragrafo(
      problemas.length === 0
        ? 'Conferência do domínio: nenhuma inconsistência.'
        : `Conferência do domínio: ${problemas.join(' ')}`,
    ),
  );
  raiz.appendChild(
    tabela(
      ['Peça', 'Papel', 'Largura x altura x profundidade (m)', 'Faixa de ajuste', 'Origem da medida'],
      dominio.pecas.map((p) => [
        p.nome,
        rotuloDoPapel(p.papel),
        `${p.dimensoes.largura} x ${p.dimensoes.altura} x ${p.dimensoes.profundidade}`,
        rotuloDoAjuste(p.ajuste),
        p.origemDaMedida,
      ]),
    ),
  );

  raiz.appendChild(titulo('h2', 'Regimes: o que declaramos e o que este aparelho respondeu'));
  raiz.appendChild(
    tabela(
      ['Regime', 'Trata o mundo', 'Espaço de referência', 'Rastreia', 'Registrado contra', 'Neste aparelho'],
      linhas.map((l) => [
        l.regime.nome,
        descreverTratamento(l.regime.tratamentoDoMundo),
        l.regime.espacoDeReferencia,
        l.regime.rastreia,
        l.regime.registroContra,
        `${rotuloDoSuporte(l.suporte)}. ${l.observacao}`,
      ]),
    ),
  );
}

// --- Sonda ------------------------------------------------------------------

function rotuloDoEstado(estado: EstadoDeRecurso): string {
  switch (estado) {
    case 'concedido':
      return 'concedido';
    case 'negado':
      return 'não concedido (motivo não informado)';
    case 'indeterminado':
      return 'sem resposta';
  }
}

function rotuloDosGraus(graus: GrausDeLiberdade): string {
  switch (graus) {
    case 'tres':
      return 'Leitura de três graus de liberdade: todas as poses observadas vieram com a posição emulada. Ou o aparelho acompanha só para onde a cabeça aponta, ou perdeu o rastreamento durante a observação.';
    case 'seis':
      return 'Seis graus de liberdade: pelo menos uma pose veio com a posição medida por sensor, então o aparelho acompanha orientação e deslocamento.';
    case 'indeterminado':
      return 'Indeterminado, porque nenhuma pose foi observada.';
  }
}

function rotuloDaInteracao(modo: XRInteractionMode | undefined): string {
  switch (modo) {
    case 'screen-space':
      return 'Forma de interação: na tela (screen-space). O aparelho é segurado na mão.';
    case 'world-space':
      return 'Forma de interação: no espaço (world-space). O aparelho é vestido.';
    case undefined:
      return 'Forma de interação: a sessão não informou.';
  }
}

function blocoDeFontes(sonda: SondaEmSessao): HTMLElement {
  if (sonda.fontesDeEntrada.length === 0) {
    return paragrafo(
      'Nenhuma fonte de entrada apareceu durante a observação. Isso não quer dizer que o aparelho não tenha entrada: no visor costuma ser controle desligado, e no celular a fonte de toque só aparece enquanto o dedo está na tela.',
    );
  }
  return tabela(
    ['Lado', 'Mira', 'Pose própria', 'Mão articulada', 'Perfis'],
    sonda.fontesDeEntrada.map((f) => [
      f.lado,
      f.mira,
      f.temPoseDePunho ? 'sim' : 'não',
      f.temMao ? 'sim' : 'não',
      f.perfis.join(', '),
    ]),
  );
}

export function montarSonda(raiz: HTMLElement, resultado: ResultadoDaSonda, confronto: string | undefined): void {
  raiz.replaceChildren();
  raiz.appendChild(titulo('h2', 'Sonda de capacidades'));
  raiz.appendChild(paragrafo(descreverClasse(resultado.classe)));
  if (resultado.semSessao.regimes.some((l) => l.regime.id === 'inline' && l.suporte === 'nao')) {
    raiz.appendChild(paragrafo('Atenção: neste navegador nem o modo janela consegue desenhar, porque ele não entregou WebGL 2.'));
  }
  raiz.appendChild(
    paragrafo(
      resultado.semSessao.contextoSeguro
        ? 'A página está em contexto seguro (HTTPS ou endereço local), então o que aparece abaixo é resposta do próprio aparelho.'
        : 'A página não está em contexto seguro (nem HTTPS, nem endereço local), então o navegador escondeu a WebXR e os dados abaixo não dizem nada sobre o aparelho.',
    ),
  );

  const sonda: SondaEmSessao | undefined = resultado.emSessao;
  if (sonda === undefined) {
    raiz.appendChild(paragrafo(resultado.motivoSemSessao ?? 'Não houve sessão, e o motivo não foi registrado.'));
    return;
  }

  const naoSondados: string[] = resultado.semSessao.modosSuportados.filter(
    (m) => m !== sonda.modo && m !== 'inline',
  );
  raiz.appendChild(
    paragrafo(
      `Sessão aberta em ${sonda.modo}.` +
        (naoSondados.length > 0
          ? ` Este aparelho também aceita ${naoSondados.join(', ')}, mas esse modo não foi aberto nesta sondagem, então os recursos abaixo valem só para ${sonda.modo}.`
          : ''),
    ),
  );
  if (sonda.interrupcao !== undefined) {
    raiz.appendChild(paragrafo(`A observação não chegou ao fim. ${sonda.interrupcao} Os números abaixo são do que deu para observar.`));
  }

  raiz.appendChild(titulo('h3', `Recursos opcionais pedidos em ${sonda.modo}`));
  raiz.appendChild(
    tabela(
      ['Recurso', 'Para que a bateria precisa', 'Neste aparelho'],
      sonda.recursos.map((r) => [r.nome, r.paraQueServe, rotuloDoEstado(r.estado)]),
    ),
  );

  raiz.appendChild(titulo('h3', 'Espaços de referência e graus de liberdade'));
  raiz.appendChild(
    paragrafo(
      sonda.espacosConcedidos.length === 0
        ? 'Nenhum espaço de referência concedido.'
        : `Concedidos: ${sonda.espacosConcedidos.join(', ')}.`,
    ),
  );
  raiz.appendChild(
    paragrafo(
      `${rotuloDosGraus(sonda.graus)} Foram ${sonda.posesObservadas} poses observadas, ` +
        `${sonda.posesComPosicaoEmulada} com posição emulada.`,
    ),
  );

  raiz.appendChild(titulo('h3', 'Fontes de entrada que apareceram'));
  raiz.appendChild(blocoDeFontes(sonda));
  raiz.appendChild(paragrafo(rotuloDaInteracao(sonda.modoDeInteracao)));

  raiz.appendChild(titulo('h3', 'Composição do fundo'));
  raiz.appendChild(paragrafo(`A sessão informou composição ${sonda.composicaoObservada}.`));
  if (confronto !== undefined) {
    raiz.appendChild(paragrafo(confronto));
  }

  raiz.appendChild(titulo('h3', 'Estabilidade do rastreamento'));
  raiz.appendChild(
    paragrafo(
      `${sonda.estabilidade.quadros} quadros observados, ${sonda.estabilidade.quadrosSemPose} sem pose, ` +
        `${sonda.estabilidade.quadrosOcultos} com a sessão fora de primeiro plano.`,
    ),
  );
  raiz.appendChild(paragrafo(sonda.diagnostico));
}
