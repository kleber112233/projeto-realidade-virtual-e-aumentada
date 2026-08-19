// src/bancada/main.ts
// ---------------------------------------------------------------------------
// Composição do estado demonstrável do percurso.
//
// A Bancada passa a desenhar. Sobre o que já existia — a delimitação do domínio,
// a declaração dos regimes e a sonda de capacidades — entra a oficina como árvore
// de nós, com o laço andando contra o relógio e o custo do quadro exibido em um
// painel preso à própria bancada.
//
// A página se divide em três tempos. A cena sobe ao carregar. O que se responde
// sem sessão aparece logo abaixo. O que só a sessão responde espera um toque no
// botão, porque o navegador recusa o pedido de sessão imersiva que não venha de
// gesto de quem usa.
// ---------------------------------------------------------------------------

import { BANCADA, inconsistenciasDoDominio } from './dominio/dominio';
import { levantarRelatorio } from './modes/verificacao';
import { conferirComposicao, sondar, type ResultadoDaSonda } from './devices/sonda';
import { montarRelatorio, montarSonda } from './relatorio/relatorio';
import { montarEstruturaDaCena } from './relatorio/relatorio';
import { Diario, explicarFalha } from './relatorio/diario';
import { frasesSobreAOrdem, iniciarOficina, type Oficina } from './app/oficina';

function exigirCanvas(id: string): HTMLCanvasElement {
  const elemento: HTMLElement = exigirElemento(id);
  if (!(elemento instanceof HTMLCanvasElement)) {
    throw new Error(`O elemento #${id} existe, mas não é uma superfície de desenho.`);
  }
  return elemento;
}

function exigirElemento(id: string): HTMLElement {
  const elemento: HTMLElement | null = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`A página não tem o elemento #${id}.`);
  }
  return elemento;
}

const raizRelatorio: HTMLElement = exigirElemento('relatorio');
const raizSonda: HTMLElement = exigirElemento('sonda');
const raizDiario: HTMLElement = exigirElemento('diario');
const botao: HTMLElement = exigirElemento('sondar');
const raizEstrutura: HTMLElement = exigirElemento('estrutura');
const botaoPrender: HTMLElement = exigirElemento('prender');

const diario: Diario = new Diario();
diario.fixarDestino(raizDiario);

const problemas: string[] = inconsistenciasDoDominio(BANCADA);
if (problemas.length > 0) {
  diario.alerta(`O domínio tem inconsistências: ${problemas.join(' ')}`);
}

// A consulta ao suporte é assíncrona porque a API XR responde por promessa: o
// navegador pode precisar consultar o runtime do aparelho antes de saber.
void levantarRelatorio().then((linhas) => {
  montarRelatorio(raizRelatorio, BANCADA, problemas, linhas);
  diario.nota('Consulta sem sessão concluída. A sonda completa espera um toque no botão.');
});

if (!window.isSecureContext) {
  diario.alerta(
    'Esta página não está em contexto seguro. A API XR não é exposta aqui, e o botão vai responder como se o aparelho não tivesse suporte — o que seria mentira sobre o aparelho.',
  );
}

async function executarSonda(): Promise<void> {
  diario.nota('Sondando. Se um visor pedir permissão, aceite: sem ela a sessão não abre.');
  try {
    const resultado: ResultadoDaSonda = await sondar();
    const confronto: string | undefined =
      resultado.emSessao === undefined ? undefined : conferirComposicao(resultado.emSessao);
    montarSonda(raizSonda, resultado, confronto);
    diario.nota('Sondagem concluída e sessão encerrada.');
  } catch (erro: unknown) {
    // A falha é resultado, e precisa ser lida no próprio aparelho — quem está de
    // visor não abre console de depuração.
    diario.falha(explicarFalha(erro));
  }
}

botao.addEventListener('click', () => {
  void executarSonda();
});

// A oficina sobe assim que a página carrega: o regime não imersivo não pede
// gesto de ninguém, e é ele o caso base do projeto inteiro.
const oficina: Oficina = iniciarOficina(exigirCanvas('cena'));
montarEstruturaDaCena(raizEstrutura, oficina.estrutura(), frasesSobreAOrdem());

botaoPrender.addEventListener('click', () => {
  const antes: string = oficina.posicaoDaEngrenagem();
  const desvio: number = oficina.presa() ? oficina.soltar() : oficina.prender();
  const destino: string = oficina.presa() ? 'ao eixo' : 'ao tampo';
  diario.nota(
    `A engrenagem passou a pertencer ${destino}. Estava em ${antes}, ficou em ` +
      `${oficina.posicaoDaEngrenagem()}, e o desvio medido foi de ${desvio.toExponential(1)} m.`,
  );
  botaoPrender.textContent = oficina.presa()
    ? 'Soltar a engrenagem do eixo'
    : 'Prender a engrenagem ao eixo';
  montarEstruturaDaCena(raizEstrutura, oficina.estrutura(), frasesSobreAOrdem());
});
