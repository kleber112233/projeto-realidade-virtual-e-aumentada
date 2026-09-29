import { REGIMES, type Regime, type RegimeId } from './regimes';

export type Suporte = 'sim' | 'nao' | 'desconhecido';

export interface LinhaDoRelatorio {
  readonly regime: Regime;
  readonly suporte: Suporte;
  readonly observacao: string;
}

function suporteDaJanela(): Suporte {
  const tela: HTMLCanvasElement = document.createElement('canvas');
  const gl: WebGL2RenderingContext | null = tela.getContext('webgl2');
  if (gl === null) {
    return 'nao';
  }
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return 'sim';
}

async function suporteImersivo(id: Exclude<RegimeId, 'inline'>): Promise<Suporte> {
  const xr: XRSystem | undefined = navigator.xr;
  if (xr === undefined) {
    return 'desconhecido';
  }
  try {
    return (await xr.isSessionSupported(id)) ? 'sim' : 'nao';
  } catch {
    return 'desconhecido';
  }
}

async function suporteDe(id: RegimeId): Promise<Suporte> {
  switch (id) {
    case 'inline':
      return suporteDaJanela();
    case 'immersive-vr':
    case 'immersive-ar':
      return suporteImersivo(id);
  }
}

function observacaoDe(id: RegimeId, suporte: Suporte): string {
  if (id === 'inline') {
    return suporte === 'sim'
      ? 'Este navegador entrega WebGL 2, que é o que o modo janela usa para desenhar. Não depende de WebXR.'
      : 'Este navegador não entregou WebGL 2, então nem o modo janela consegue desenhar a cena.';
  }
  switch (suporte) {
    case 'sim':
      return 'Ainda falta testar em sessão se o registro funciona como declaramos.';
    case 'nao':
      return 'O aparelho respondeu que não suporta este modo.';
    case 'desconhecido':
      return 'Ou o navegador não tem WebXR, ou a página não está em contexto seguro, ou a consulta falhou sem resposta.';
  }
}

export async function levantarRelatorio(): Promise<LinhaDoRelatorio[]> {
  const linhas: LinhaDoRelatorio[] = [];
  for (const regime of REGIMES) {
    const suporte: Suporte = await suporteDe(regime.id);
    linhas.push({ regime, suporte, observacao: observacaoDe(regime.id, suporte) });
  }
  return linhas;
}
