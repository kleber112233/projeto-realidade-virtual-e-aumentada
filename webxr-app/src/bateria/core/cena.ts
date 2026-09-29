import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
} from 'three';

import { BATERIA, type Dominio, type FaixaDeAjuste, type Peca, type PecaId } from '../dominio/dominio';

// --- Medidas ----------------------------------------------------------------
export const ESPESSURA_DO_PISO: number = 0.05;

export const ABERTURA_DO_CHIMBAL_M: number = 0.02;

const ESPESSURA_DO_PRATO_M: number = 0.006;

const ALTURA_DO_TUBO_FIXO_M: number = 0.45;
const INICIO_DA_HASTE_M: number = 0.3;

const RAIO_DAS_PECAS_SOLTAS: number = 1.5;

const ANGULO_INICIAL_DO_ANEL: number = Math.PI / 2;

export interface CenaDaBateria {
  readonly sala: Scene;
  readonly chao: Group;
  readonly plataforma: Group;
  readonly piso: Mesh;
  readonly suporteDoPainel: Object3D;
  readonly pecas: ReadonlyMap<PecaId, Group>;
  readonly hasteDoChimbal: Group;
  readonly pratoDeCimaDoChimbal: Mesh;
  redimensionarPlataforma(ladoM: number): number;
  ajustarAlturaDoChimbal(alturaM: number): number;
}

// --- Materiais --------------------------------------------------------------
function materialCru(cor: number): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: cor, roughness: 0.7, metalness: 0.1 });
}

const MATERIAIS = {
  casco: materialCru(0x9c3b3b),
  metal: materialCru(0xc9b26b),
  ferragem: materialCru(0x8a8f99),
  madeira: materialCru(0x6b5238),
  chao: materialCru(0x2a2d35),
} as const;

// --- Formas das peças -------------------------------------------------------
function cilindroDeBase(raio: number, altura: number, material: MeshStandardMaterial): Mesh {
  const malha: Mesh = new Mesh(new CylinderGeometry(raio, raio, altura, 24), material);
  malha.position.y = altura / 2;
  return malha;
}

function montarChimbal(peca: Peca, no: Group): { haste: Group; pratoDeCima: Mesh } {
  const raioDoPrato: number = peca.dimensoes.largura / 2;
  const alturaTotal: number = peca.dimensoes.altura;
  const e: number = ESPESSURA_DO_PRATO_M;

  no.add(cilindroDeBase(0.17, 0.02, MATERIAIS.ferragem));
  no.add(cilindroDeBase(0.016, ALTURA_DO_TUBO_FIXO_M, MATERIAIS.ferragem));

  const haste: Group = new Group();
  haste.name = 'chimbal-haste';
  no.add(haste);
  const comprimentoDaHaste: number = alturaTotal - e - INICIO_DA_HASTE_M;
  const tuboDaHaste: Mesh = new Mesh(new CylinderGeometry(0.012, 0.012, comprimentoDaHaste, 8), MATERIAIS.ferragem);
  tuboDaHaste.position.y = INICIO_DA_HASTE_M + comprimentoDaHaste / 2;
  haste.add(tuboDaHaste);

  const pratoDeBaixo: Mesh = new Mesh(new CylinderGeometry(raioDoPrato, raioDoPrato, e, 32), MATERIAIS.metal);
  pratoDeBaixo.name = 'chimbal-prato-de-baixo';
  pratoDeBaixo.position.y = alturaTotal - e - ABERTURA_DO_CHIMBAL_M - e / 2;
  haste.add(pratoDeBaixo);

  const pratoDeCima: Mesh = pratoDeBaixo.clone();
  pratoDeCima.name = 'chimbal-prato-de-cima';
  pratoDeCima.position.y = alturaTotal - e / 2;
  haste.add(pratoDeCima);

  return { haste, pratoDeCima };
}

function vestirPeca(peca: Peca, no: Group): void {
  const { largura, altura, profundidade } = peca.dimensoes;
  switch (peca.id) {
    case 'bumbo': {
      const casco: Mesh = new Mesh(new CylinderGeometry(largura / 2, largura / 2, profundidade, 32), MATERIAIS.casco);
      casco.rotation.x = Math.PI / 2;
      casco.position.y = largura / 2;
      no.add(casco);
      return;
    }
    case 'caixa':
    case 'tom-1':
    case 'tom-2':
    case 'tom-de-chao':
      no.add(cilindroDeBase(largura / 2, altura, MATERIAIS.casco));
      return;
    case 'prato-ataque':
    case 'prato-conducao':
      no.add(cilindroDeBase(largura / 2, altura, MATERIAIS.metal));
      return;
    case 'estante-de-prato':
    case 'estante-de-caixa':
      no.add(cilindroDeBase(largura / 2, 0.02, MATERIAIS.ferragem));
      no.add(cilindroDeBase(0.012, altura, MATERIAIS.ferragem));
      return;
    case 'banco':
      no.add(cilindroDeBase(largura / 2, altura, MATERIAIS.madeira));
      return;
    case 'pedal-bumbo-esquerdo':
    case 'pedal-bumbo-direito': {
      const pedal: Mesh = new Mesh(new BoxGeometry(largura, altura, profundidade), MATERIAIS.ferragem);
      pedal.position.y = altura / 2;
      no.add(pedal);
      return;
    }
    case 'baqueta-esquerda':
    case 'baqueta-direita': {
      const baqueta: Mesh = new Mesh(new CylinderGeometry(largura / 2, largura / 2, profundidade, 8), MATERIAIS.madeira);
      baqueta.rotation.x = Math.PI / 2;
      baqueta.position.y = largura / 2;
      no.add(baqueta);
      return;
    }
    case 'chimbal':
      return;
  }
}

// --- Montagem da cena -------------------------------------------------------
export function montarCena(dominio: Dominio = BATERIA): CenaDaBateria {
  const sala: Scene = new Scene();
  sala.name = 'sala';
  sala.background = new Color(0x15171c);

  const ambiente: HemisphereLight = new HemisphereLight(0xdfe6f5, 0x2a2c33, 1.2);
  ambiente.name = 'luz-ambiente';
  sala.add(ambiente);
  const direcional: DirectionalLight = new DirectionalLight(0xffffff, 1.5);
  direcional.name = 'luz-direcional';
  direcional.position.set(2, 4, 3);
  sala.add(direcional);

  const chao: Group = new Group();
  chao.name = 'chao';
  sala.add(chao);
  const superficieDoChao: Mesh = new Mesh(new PlaneGeometry(8, 8), MATERIAIS.chao);
  superficieDoChao.rotation.x = -Math.PI / 2;
  chao.add(superficieDoChao);

  const plataforma: Group = new Group();
  plataforma.name = 'plataforma';
  sala.add(plataforma);

  const piso: Mesh = new Mesh(new BoxGeometry(1, ESPESSURA_DO_PISO, 1), MATERIAIS.madeira);
  piso.name = 'piso-da-plataforma';
  piso.position.y = ESPESSURA_DO_PISO / 2;
  plataforma.add(piso);

  const suporteDoPainel: Object3D = new Object3D();
  suporteDoPainel.name = 'suporte-do-painel';
  plataforma.add(suporteDoPainel);

  const pecas: Map<PecaId, Group> = new Map();
  let haste: Group | undefined;
  let pratoDeCima: Mesh | undefined;
  dominio.pecas.forEach((peca: Peca, i: number) => {
    const no: Group = new Group();
    no.name = peca.id;
    const angulo: number = ANGULO_INICIAL_DO_ANEL + (i / dominio.pecas.length) * Math.PI * 2;
    no.position.set(Math.sin(angulo) * RAIO_DAS_PECAS_SOLTAS, 0, Math.cos(angulo) * RAIO_DAS_PECAS_SOLTAS);
    if (peca.id === 'chimbal') {
      ({ haste, pratoDeCima } = montarChimbal(peca, no));
    } else {
      vestirPeca(peca, no);
    }
    chao.add(no);
    pecas.set(peca.id, no);
  });
  if (haste === undefined || pratoDeCima === undefined) {
    throw new Error('O domínio não declara o chimbal, e a cena depende dele para o ajuste de altura.');
  }
  const hasteDoChimbal: Group = haste;
  const pecaChimbal: Peca | undefined = dominio.pecas.find((p) => p.id === 'chimbal');
  const faixaDeclarada: FaixaDeAjuste | undefined = pecaChimbal?.ajuste;
  if (pecaChimbal === undefined || faixaDeclarada === undefined || faixaDeclarada.grandeza !== 'altura') {
    throw new Error('O domínio não declara a faixa de altura do chimbal, e a cena depende dela para o ajuste.');
  }
  const faixaDoChimbal: FaixaDeAjuste = faixaDeclarada;
  const alturaBaseDoChimbal: number = pecaChimbal.dimensoes.altura;

  function redimensionarPlataforma(ladoM: number): number {
    const { ladoMinimo, ladoMaximo } = dominio.plataforma;
    const lado: number = Math.min(Math.max(ladoM, ladoMinimo), ladoMaximo);
    piso.scale.set(lado, 1, lado);
    suporteDoPainel.position.set(lado / 2, ESPESSURA_DO_PISO, 0);
    return lado;
  }

  function ajustarAlturaDoChimbal(alturaM: number): number {
    const altura: number = Math.min(Math.max(alturaM, faixaDoChimbal.minimo), faixaDoChimbal.maximo);
    hasteDoChimbal.position.y = altura - alturaBaseDoChimbal;
    return altura;
  }

  redimensionarPlataforma(dominio.plataforma.ladoInicial);

  return {
    sala,
    chao,
    plataforma,
    piso,
    suporteDoPainel,
    pecas,
    hasteDoChimbal,
    pratoDeCimaDoChimbal: pratoDeCima,
    redimensionarPlataforma,
    ajustarAlturaDoChimbal,
  };
}
