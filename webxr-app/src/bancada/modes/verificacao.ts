// src/bancada/modes/verificacao.ts
// ---------------------------------------------------------------------------
// Confronto entre o que declaramos e o que o aparelho oferece.
//
// A Tarefa 2 termina numa declaração de intenção, e intenção envelhece bem
// demais: continua parecendo certa muito depois de ter deixado de ser. Este
// arquivo faz a pergunta correspondente ao navegador em que a página está aberta
// e devolve as duas colunas lado a lado.
//
// O que ele NÃO faz, e a distinção importa: não abre sessão, não mede graus de
// liberdade, não enumera fontes de entrada nem lista capacidades opcionais. Isso
// é a sonda de capacidades, que pertence ao módulo de dispositivos. Aqui a
// pergunta é a mais grossa possível — "este aparelho entra neste regime?" —, que
// é exatamente a que o conceito deste módulo suporta.
// ---------------------------------------------------------------------------

import { REGIMES, type Regime, type RegimeId } from './regimes';

/**
 * `desconhecido` não é sinônimo de `nao`. O navegador sem a API XR não está
 * dizendo que o aparelho não serve — está dizendo que não sabe responder, e
 * tratar as duas coisas como a mesma é o erro que faz um relatório honesto
 * virar um relatório confiante e errado.
 */
export type Suporte = 'sim' | 'nao' | 'desconhecido';

export interface LinhaDoRelatorio {
  readonly regime: Regime;
  readonly suporte: Suporte;
  readonly observacao: string;
}

/** A API XR do navegador, quando existe. */
function sistemaXr(): XRSystem | undefined {
  return navigator.xr;
}

async function suporteDe(id: RegimeId): Promise<Suporte> {
  const xr: XRSystem | undefined = sistemaXr();
  if (xr === undefined) {
    return 'desconhecido';
  }
  try {
    const suportado: boolean = await xr.isSessionSupported(id);
    return suportado ? 'sim' : 'nao';
  } catch {
    // Alguns navegadores rejeitam a promessa em vez de devolver `false` — para
    // um modo de sessão que não reconhecem, ou fora de contexto seguro. Nos dois
    // casos o que se sabe é que não houve resposta utilizável.
    return 'desconhecido';
  }
}

function observacaoDe(regime: Regime, suporte: Suporte): string {
  if (suporte === 'sim') {
    return `Declarado com registro contra ${regime.registroContra}. Falta confrontar em sessão.`;
  }
  if (suporte === 'nao') {
    return 'Este aparelho não entra neste regime. É informação sobre o aparelho, não defeito do código.';
  }
  return 'Sem API XR neste navegador, ou página fora de contexto seguro (HTTPS).';
}

export async function levantarRelatorio(): Promise<LinhaDoRelatorio[]> {
  const linhas: LinhaDoRelatorio[] = [];
  for (const regime of REGIMES) {
    const suporte: Suporte = await suporteDe(regime.id);
    linhas.push({ regime, suporte, observacao: observacaoDe(regime, suporte) });
  }
  return linhas;
}
