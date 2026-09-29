import type { WebGLRenderer } from 'three';

import { linhasDoOrcamento, type LeituraDoOrcamento } from '../core/orcamento';

export function identificarPlaca(renderer: WebGLRenderer | undefined): string {
  if (renderer === undefined) {
    return 'placa não identificada (a cena não pôde ser montada neste navegador)';
  }
  const gl: WebGLRenderingContext | WebGL2RenderingContext = renderer.getContext();
  const extensao = gl.getExtension('WEBGL_debug_renderer_info');
  if (extensao === null) {
    return 'placa não identificada (o navegador não informou)';
  }
  const nome: unknown = gl.getParameter(extensao.UNMASKED_RENDERER_WEBGL);
  return typeof nome === 'string' && nome !== '' ? nome : 'placa não identificada (resposta vazia)';
}

export function folhaDeMedicao(renderer: WebGLRenderer, leitura: LeituraDoOrcamento): string[] {
  return [
    `Data: ${new Date().toLocaleString('pt-BR')}`,
    `Navegador: ${navigator.userAgent}`,
    `Placa de vídeo: ${identificarPlaca(renderer)}`,
    `Tela: ${window.screen.width} x ${window.screen.height}, densidade ${window.devicePixelRatio}`,
    '',
    ...linhasDoOrcamento(leitura),
  ];
}
