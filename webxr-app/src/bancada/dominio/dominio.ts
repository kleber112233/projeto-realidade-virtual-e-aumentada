// src/bancada/dominio/dominio.ts
// ---------------------------------------------------------------------------
// Delimitação do domínio da Bancada.
//
// Este arquivo é a Tarefa 1 do Projeto Integrador escrita como dado, e não como
// texto solto num documento à parte. O motivo é operacional: a delimitação
// precisa ser confrontável com o que o ambiente faz mais adiante, e texto em
// documento não se confronta com nada. Aqui ela é tipada, e o compilador passa
// a cobrar o que antes dependia de alguém reler a ata da reunião.
//
// Nada nesta etapa desenha, carrega malha ou abre sessão. A cena chega quando
// houver grafo de cena; o encaixe, quando houver interação. O que existe agora é
// a descrição do que aquele ambiente terá de suportar.
// ---------------------------------------------------------------------------

/** Identificador de uma peça manipulável da oficina. */
export type PecaId =
  | 'corpo'
  | 'eixo'
  | 'engrenagem-grande'
  | 'engrenagem-pequena'
  | 'tampa';

/** Identificador de um encaixe do suporte de montagem. */
export type SocketId =
  | 'base-do-suporte'
  | 'furo-do-eixo'
  | 'dente-maior'
  | 'dente-menor'
  | 'topo';

/**
 * Uma peça do mecanismo. `sockets` lista os encaixes que a aceitam — uma peça
 * que não serve em lugar nenhum é um objeto decorativo, e a delimitação existe
 * justamente para não deixar objeto decorativo entrar como se fosse conteúdo.
 */
export interface Peca {
  readonly id: PecaId;
  readonly nome: string;
  readonly sockets: readonly SocketId[];
}

/**
 * A tarefa que o ambiente suporta, enunciada em uma frase, mais o estado que a
 * caracteriza concluída. Os dois campos andam juntos de propósito: tarefa sem
 * estado final é intenção, e é o que produz a cena bonita e vazia.
 */
export interface TarefaDoAmbiente {
  readonly enunciado: string;
  readonly estadoFinal: string;
}

export interface Dominio {
  readonly nome: string;
  readonly descricao: string;
  readonly tarefa: TarefaDoAmbiente;
  readonly pecas: readonly Peca[];
  readonly sockets: readonly SocketId[];
}

export const BANCADA: Dominio = {
  nome: 'Bancada',
  descricao:
    'Uma oficina de montagem: sobre uma bancada de trabalho estão as peças de um ' +
    'mecanismo e um suporte com encaixes, e quem usa o ambiente monta o mecanismo ' +
    'peça por peça.',
  tarefa: {
    enunciado:
      'Montar o mecanismo encaixando cada peça no suporte, na ordem em que uma ' +
      'depende da outra.',
    estadoFinal:
      'As cinco peças estão encaixadas nos sockets compatíveis, na ordem válida, ' +
      'e o mecanismo montado gira.',
  },
  pecas: [
    { id: 'corpo', nome: 'Corpo', sockets: ['base-do-suporte'] },
    { id: 'eixo', nome: 'Eixo', sockets: ['furo-do-eixo'] },
    { id: 'engrenagem-grande', nome: 'Engrenagem grande', sockets: ['dente-maior'] },
    { id: 'engrenagem-pequena', nome: 'Engrenagem pequena', sockets: ['dente-menor'] },
    { id: 'tampa', nome: 'Tampa', sockets: ['topo'] },
  ],
  sockets: ['base-do-suporte', 'furo-do-eixo', 'dente-maior', 'dente-menor', 'topo'],
};

/**
 * Confere que todo socket citado por alguma peça existe no suporte e que todo
 * socket do suporte recebe alguma peça. Devolve a lista de inconsistências, que
 * é vazia quando o domínio fecha.
 *
 * O porquê de isto ser código, e não conferência a olho: a delimitação vai ser
 * editada muitas vezes ao longo do percurso, e um socket órfão sobrevive a
 * qualquer releitura distraída — some só quando alguém tenta encaixar, muitos
 * módulos adiante, quando trocar de domínio já custa caro.
 */
export function inconsistenciasDoDominio(dominio: Dominio): string[] {
  const declarados: ReadonlySet<SocketId> = new Set(dominio.sockets);
  const usados: Set<SocketId> = new Set();
  const problemas: string[] = [];

  for (const peca of dominio.pecas) {
    if (peca.sockets.length === 0) {
      problemas.push(`A peça "${peca.nome}" não encaixa em socket nenhum.`);
    }
    for (const socket of peca.sockets) {
      if (!declarados.has(socket)) {
        problemas.push(
          `A peça "${peca.nome}" cita o socket "${socket}", que o suporte não declara.`,
        );
      }
      usados.add(socket);
    }
  }

  for (const socket of dominio.sockets) {
    if (!usados.has(socket)) {
      problemas.push(`O socket "${socket}" não recebe peça alguma.`);
    }
  }

  return problemas;
}
