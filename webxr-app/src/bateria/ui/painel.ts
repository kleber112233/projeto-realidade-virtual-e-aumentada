import { CanvasTexture, CylinderGeometry, Group, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three';

const LARGURA_M: number = 1.2;
const ALTURA_M: number = 0.7;
const ALTURA_DE_LEITURA_M: number = 0.8;
const LARGURA_PX: number = 1200;
const ALTURA_PX: number = 700;

const INTERVALO_DE_REDESENHO_S: number = 0.25;

export interface Painel {
  readonly no: Group;
  atualizar(linhas: readonly string[], decorridoS: number): void;
}

export function montarPainel(titulo: string): Painel {
  const tela: HTMLCanvasElement = document.createElement('canvas');
  tela.width = LARGURA_PX;
  tela.height = ALTURA_PX;
  const ctx: CanvasRenderingContext2D | null = tela.getContext('2d');
  if (ctx === null) {
    throw new Error('Este navegador não fornece contexto 2D para desenhar o painel.');
  }
  const pincel: CanvasRenderingContext2D = ctx;

  const textura: CanvasTexture = new CanvasTexture(tela);
  textura.minFilter = LinearFilter;
  textura.generateMipmaps = false;
  textura.colorSpace = SRGBColorSpace;

  const no: Group = new Group();
  no.name = 'painel';

  const haste: Mesh = new Mesh(
    new CylinderGeometry(0.01, 0.01, ALTURA_DE_LEITURA_M, 8),
    new MeshBasicMaterial({ color: 0x555a66 }),
  );
  haste.position.y = ALTURA_DE_LEITURA_M / 2;
  no.add(haste);

  const cartaz: Mesh = new Mesh(new PlaneGeometry(LARGURA_M, ALTURA_M), new MeshBasicMaterial({ map: textura }));
  cartaz.position.y = ALTURA_DE_LEITURA_M + ALTURA_M / 2;
  no.add(cartaz);

  let ultimoDesenho: number = Number.NEGATIVE_INFINITY;
  let ultimoTexto: string = '';

  function desenhar(linhas: readonly string[]): void {
    pincel.fillStyle = '#11131a';
    pincel.fillRect(0, 0, LARGURA_PX, ALTURA_PX);
    pincel.fillStyle = '#f2f4fa';
    pincel.font = 'bold 88px system-ui, sans-serif';
    pincel.fillText(titulo, 40, 100);
    pincel.font = '76px system-ui, sans-serif';
    let y: number = 208;
    for (const linha of linhas) {
      if (y > ALTURA_PX - 10) {
        break;
      }
      pincel.fillText(linha, 40, y, LARGURA_PX - 80);
      y += 112;
    }
    textura.needsUpdate = true;
  }

  desenhar(['Aguardando o primeiro quadro.']);

  return {
    no,
    atualizar(linhas: readonly string[], decorridoS: number): void {
      if (decorridoS < ultimoDesenho) {
        ultimoDesenho = Number.NEGATIVE_INFINITY;
      }
      const texto: string = linhas.join('\n');
      if (decorridoS - ultimoDesenho < INTERVALO_DE_REDESENHO_S || texto === ultimoTexto) {
        return;
      }
      ultimoDesenho = decorridoS;
      ultimoTexto = texto;
      desenhar(linhas);
    },
  };
}
