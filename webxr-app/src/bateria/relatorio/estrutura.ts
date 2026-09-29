export function montarEstrutura(raiz: HTMLElement, arvore: readonly string[]): void {
  raiz.replaceChildren();
  const titulo: HTMLHeadingElement = document.createElement('h2');
  titulo.textContent = 'Como a cena está montada (um nível por recuo)';
  raiz.appendChild(titulo);
  const bloco: HTMLPreElement = document.createElement('pre');
  bloco.textContent = arvore.join('\n');
  raiz.appendChild(bloco);
}

export function montarMedicao(raiz: HTMLElement, linhas: readonly string[]): void {
  raiz.replaceChildren();
  const titulo: HTMLHeadingElement = document.createElement('h2');
  titulo.textContent = 'Medição do quadro';
  raiz.appendChild(titulo);
  const bloco: HTMLPreElement = document.createElement('pre');
  bloco.textContent = linhas.join('\n');
  raiz.appendChild(bloco);
}
