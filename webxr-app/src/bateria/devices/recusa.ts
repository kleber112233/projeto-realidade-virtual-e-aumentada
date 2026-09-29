export function descreverRecusaDeSessao(erro: unknown): string | undefined {
  if (!(erro instanceof DOMException)) {
    return undefined;
  }
  switch (erro.name) {
    case 'NotSupportedError':
      return 'O aparelho recusou a sessão porque não suporta esse modo.';
    case 'SecurityError':
      return 'O navegador recusou o pedido. Ou faltou o clique de quem usa, ou a página não está em contexto seguro (HTTPS ou endereço local).';
    case 'InvalidStateError':
      return 'Já existe uma sessão aberta neste navegador. Feche a anterior e tente de novo.';
    case 'NotAllowedError':
      return 'A permissão pedida pelo navegador foi recusada. No celular, o modo AR precisa da câmera. Clique em Sondar de novo e aceite o pedido.';
    default:
      return undefined;
  }
}
