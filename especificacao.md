# Especificação do Projeto de Bateria Acústica

## 1. Identificação do grupo e da cena

**Grupo:** N.A (nome do grupo ainda não formalizado)
**Integrantes:** Kleber, Isabela, Pedro Santilli, Gabriel Verga
**Cena escolhida:** Bateria acústica

**Descrição em uma frase:** uma plataforma sobre a qual o usuário monta livremente, peça por peça, um kit de bateria acústica em escala real, ajustando posição e ângulo de cada componente até que o conjunto responda e soe como um instrumento de verdade.

**Por que esta cena:** ela endurece o problema de origem sonora no espaço. O som de cada peça precisa nascer exatamente de onde a peça foi colocada, mas essa posição só é definida pelo próprio usuário durante a montagem, e a cabeça de quem ouve também se move. O grupo topa esse custo porque é a parte do trabalho que mais se parece com um problema real de áudio 3D, e não com decoração de cena.

**A armadilha desta cena:** o risco de escopo do som posicionado no espaço, ou seja, tentar implementar áudio posicional 3D completo (recalculado a cada frame, para cada peça, a cada movimento de cabeça no visor) sem medir antes o custo de processamento. Para não cair nisso, o grupo vai testar cedo, com poucas peças, o equilíbrio entre velocidade de processamento e delay de resposta sonora (ver Seção 10), e só então decidir o quanto de espacialização entra nesta fase do projeto ou fica para depois.

## 2. O que a pessoa faz ali

A pessoa chega ao ambiente e encontra as peças da bateria soltas no chão ao redor de uma plataforma vazia. Não há um kit montado esperando por ela: há um monte de peças e um espaço livre. Ela caminha até cada peça, aponta, apanha e leva até a plataforma; ao aproximar a peça da base, o sistema a fixa ali, e a partir desse momento a pessoa pode ajustar sua altura e seu ângulo até achar a configuração que quer. O processo se repete peça por peça, na ordem que a pessoa escolher, até que todas as peças obrigatórias do inventário estejam fixadas e produzindo som. A tarefa é considerada cumprida quando isso acontece (ver Seção 6); a partir daí a pessoa está livre para tocar o kit que montou.

**O que se faz com as mãos:** apanhar e posicionar cada peça fisicamente sobre a plataforma, regular altura e ângulo dos suportes até um ajuste confortável, e segurar as baquetas para bater nas peças e ouvir o som responder à velocidade do movimento. Nenhuma dessas ações passa por menu ou botão de interface.

**O que muda com o visor:** a pessoa deixa de olhar a cena de fora e passa a estar dentro dela, na escala real do instrumento. O alcance do próprio braço vira o limite de onde uma peça pode ser deixada, e o som passa a vir fisicamente da direção em que a peça está, mudando quando a cabeça gira.

**O que a cena precisa provar contra uma mesa de verdade:** a plataforma real da bateria precisa ficar ancorada no mesmo lugar do mundo físico enquanto a pessoa anda ao redor dela apontando o celular, sem deslizar ou "flutuar" junto com a câmera. E o tamanho de cada peça projetada sobre a mesa precisa corresponder ao tamanho real do objeto, para que a câmera funcione como sensor de posição e não como um pano de fundo decorativo.

## 3. Inventário de objetos

Peças obrigatórias (compõem o kit padrão que precisa estar completo para a tarefa ser dada como cumprida, conforme a Seção 6):

| Objeto | Quantos | Origem | Move? | Observação |
|---|---|---|---|---|
| Plataforma | 1 | construída por código | posição livre em y/z, redimensionável, sem rotação | base fixa da montagem; tamanho ajustável pelo usuário (Seção 4) |
| Bumbo | 1 | importado de terceiro | solto no chão até ser apanhado; após fixado, ajuste livre de altura e ângulo limitado | peça mais pesada visualmente, referência de escala do kit |
| Caixa | 1 | importado de terceiro | idem acima | fica sobre estante de caixa própria |
| Pedal de bumbo | 2 | construído por código | idem acima | geometria simples (base + haste), acionado ao ser pisado/atingido |
| Chimbal (hi-hat) | 1 | importado de terceiro | idem acima | par de pratos com pedal próprio |
| Tons suspensos | 2 | importado de terceiro | idem acima | presos ao bumbo ou a suporte próprio |
| Tom de chão | 1 | importado de terceiro | idem acima | apoiado em pés próprios |
| Prato de ataque (crash) | 1 | importado de terceiro | idem acima | |
| Prato de condução (ride) | 1 | importado de terceiro | idem acima | |
| Estante de pratos | 1 | construído por código | fixa após posicionada; permite ajuste de altura e ângulo do prato preso | geometria simples (tripé + haste telescópica) |
| Estante de caixa | 1 | construído por código | idem acima | |
| Banco/assento | 1 | importado de terceiro | idem acima | altura ajustável |
| Baquetas | 1 par (2 unidades) | importado de terceiro | acompanham o controle/mão do usuário | velocidade de movimento lida para calcular intensidade do som (Seção 5) |

**Total de peças obrigatórias: 17.**

Peças opcionais (o usuário pode inserir na plataforma se quiser; mesma regra de encaixe das obrigatórias):

| Objeto | Quantos | Origem | Move? | Observação |
|---|---|---|---|---|
| China | 1 | importado de terceiro | idem peças obrigatórias | |
| Splash | 4 | importado de terceiro | idem acima | formatos e tamanhos variáveis entre as 4 unidades |
| Crash-ride | 1 | importado de terceiro | idem acima | |
| Sizzle / prato com rebites | 1 | importado de terceiro | idem acima | |
| Effects cymbal | 4 | importado de terceiro | idem acima | 4 formatos diferentes entre si |

**Total de peças opcionais: 11. Total geral se tudo for inserido: 28** (valor usado no orçamento da Seção 10).

## 4. O espaço e as escalas

A plataforma nasce com **1,5 m × 1,5 m** e pode ser redimensionada pelo usuário entre **1,0 m × 1,0 m** e **2,5 m × 2,5 m**, para caber desde um kit mínimo (só as peças obrigatórias) até um kit com todas as opcionais. Ela fica apoiada no chão.

Dimensões aproximadas das peças principais (valores provisórios de referência, baseados em um kit acústico padrão, que serão conferidos contra os modelos importados antes do Bloco 3 da Seção 13):

| Peça | Dimensão aproximada |
|---|---|
| Bumbo | 56 cm de diâmetro × 40 cm de profundidade |
| Caixa | 35 cm de diâmetro, suporte ajustável entre 60 cm e 75 cm |
| Tom suspenso | entre 25 cm e 30 cm de diâmetro |
| Tom de chão | 40 cm de diâmetro, altura livre entre 45 cm e 50 cm sobre os pés |
| Pratos (ataque/condução) | entre 35 cm e 50 cm de diâmetro, suporte ajustável entre 90 cm e 145 cm |
| Chimbal | suporte ajustável entre 70 cm e 90 cm |
| Banco | altura ajustável entre 45 cm e 55 cm |
| Baqueta | ~40 cm de comprimento |

**Espaço livre necessário:** um mínimo de 2,5 m × 2,5 m ao redor da plataforma, para que o usuário caminhe e alcance todas as peças, mais 1 m de margem até paredes ou mobília real, marcado no ambiente físico com apoio de referência (ex.: fita no chão) para facilitar o rastreamento da câmera.

**Decisão de escala: uma escala só, real (1:1), em todos os regimes**, inclusive no modo câmera/celular. O grupo descartou a escala reduzida de mesa porque o problema central desta cena é a origem do som no espaço (Seção 1): se a distância visual entre as peças não corresponder à distância acústica real, o teste de equilíbrio entre processamento e delay (Seção 10) deixa de significar algo. Além disso, bater numa peça com a baqueta só faz sentido fisicamente na escala real do braço da pessoa.

## 5. As ações do usuário

Convenção de eixos usada nesta seção e na Seção 7: **x = eixo vertical (altura)**; **y, z = plano horizontal da plataforma**.

| Ação | O que a pessoa faz | O que o sistema faz | Se não puder |
|---|---|---|---|
| Apontar/mirar peça | aponta o controle, a mão rastreada ou o centro da tela/celular para uma peça | realça a peça com contorno (Seção 8) | nenhuma peça sob a mira: nenhum realce, cursor/retículo neutro |
| Apanhar peça do chão | aciona o botão/gesto de apanhar sobre a peça mirada, dentro do alcance do braço (até 90 cm) | a peça passa a acompanhar a mão/controle | peça fora do alcance de 90 cm: peça não responde, contorno cinza e mensagem "fora de alcance"; peça já em uso por outra tentativa simultânea: contorno vermelho e mensagem "peça em uso" |
| Encaixar peça na plataforma | aproxima a peça apanhada da superfície da plataforma e solta | se estiver dentro da hitbox válida (Seção 7), a peça é fixada à base (trava o eixo x) e libera ajuste de y/z e ângulo | se soltar fora da hitbox válida ou dentro do campo de invalidação ao redor do próprio corpo do usuário (Seção 7): a peça pisca vermelho, retorna à posição anterior e mostra a mensagem "fora da área de montagem" |
| Ajustar altura/ângulo de peça já fixada | move a peça no eixo x (só peças com suporte regulável) e gira o ângulo dentro do curso do suporte | aplica o novo valor dentro do intervalo de conforto do suporte (Seção 7) | ao tentar ultrapassar o curso máximo do suporte: trava no limite e mostra a mensagem "altura/ângulo máximo do suporte" |
| Mover peça já fixada sobre a plataforma | arrasta a peça livremente nos eixos y/z sobre a superfície | a peça acompanha, permanecendo travada no eixo x até novo ajuste manual | ao tentar sair dos limites da plataforma: a peça não ultrapassa a borda, contorno vermelho na borda tocada |
| Redimensionar a plataforma | aciona o gesto de redimensionar e define o novo tamanho (entre 1,0 m e 2,5 m por lado) | a plataforma escala e recalcula a grade de encaixe | se o novo tamanho não couber no espaço livre mapeado pela câmera (Seção 4): recusa o resize e mostra a mensagem "espaço insuficiente" |
| Tocar a peça (bater com a baqueta) | move a baqueta contra a peça | calcula a velocidade do movimento no instante do impacto e dispara o som correspondente na intensidade correspondente | se a peça ainda não estiver fixada na plataforma: nenhum som (ou som abafado) e mensagem "fixe a peça antes de tocar" |

## 6. A tarefa e sua validação

**Estado inicial:** as 17 peças obrigatórias estão soltas no chão ao redor de uma plataforma vazia; nenhuma peça opcional aparece até o usuário optar por inseri-la.

**Estado final de sucesso:** as 17 peças obrigatórias estão fixadas sobre a plataforma (cada uma dentro da hitbox de encaixe descrita na Seção 7) e cada uma produz som ao ser atingida pela baqueta.

**Ordem: livre.** A pessoa pode fixar as peças em qualquer sequência. A condição de sucesso é sobre o conjunto final, não sobre uma ordem de passos: o sistema mantém um contador de "peças obrigatórias fixadas e sonoras" e considera a tarefa cumprida quando esse contador atinge 17/17, independentemente de qual peça foi colocada primeiro ou por último. Peças opcionais fixadas não contam para nem atrapalham essa condição.

Ao atingir 17/17, o sistema declara sucesso mostrando um contorno luminoso ao redor de toda a plataforma e um som curto de confirmação (Seção 8), e libera formalmente o modo de "tocar livremente", que na prática já estava disponível peça a peça, mas passa a ter a confirmação de kit completo.

## 7. Regras de encaixe e tolerâncias

Esta cena tem duas categorias de restrição distintas:

**1) Encaixe rígido: fixação inicial da peça à base da plataforma.** Ao soltar uma peça apanhada, o sistema verifica se o ponto de solda está dentro da hitbox válida: **folga de posição de 8 cm** (raio a partir de qualquer ponto da superfície útil da plataforma) e **sem folga de ângulo**, já que a orientação com que a peça foi solta não importa para o encaixe inicial. O ângulo fino é resolvido depois, no ajuste livre. Esses 8 cm foram escolhidos para serem generosos o bastante para não exigir precisão de milímetro ao "largar" a peça (o que tornaria a montagem uma tortura), mas pequenos o bastante para que a peça não "salte" para a plataforma vinda de longe.

**2) Campo de invalidação ao redor do usuário.** Uma hitbox fantasma de **50 cm de raio** ao redor do corpo do usuário é tratada como zona de exclusão binária (sem tolerância intermediária): qualquer tentativa de soltar a plataforma ou uma peça dentro desse raio é recusada e sinalizada em vermelho (Seção 8). O valor de 50 cm corresponde, aproximadamente, ao espaço de "braço estendido + folga de segurança" e evita que o usuário monte uma peça em cima de si mesmo.

**3) Ajuste livre de altura e ângulo dos suportes (não é encaixe, não tem acerto/erro).** Depois de fixada, cada peça com suporte regulável tem um intervalo confortável de ajuste, sem tolerância de sucesso/falha. Qualquer valor dentro do intervalo é válido: estante de prato entre 90 cm e 145 cm de altura, chimbal entre 70 cm e 90 cm, estante de caixa entre 60 cm e 75 cm, banco entre 45 cm e 55 cm, ângulo de inclinação dos pratos entre 0° e 45°. Esses intervalos vêm do curso físico real dos suportes de bateria e serão conferidos contra os modelos importados antes do Bloco 3 (Seção 13).

## 8. Retorno ao usuário

| Situação | Retorno |
|---|---|
| Peça mirada | contorno amarelo suave ao redor do objeto |
| Peça apanhada | a peça acompanha a mão/controle com leve brilho branco; a plataforma revela sua grade de encaixe |
| Encaixe aceito | flash verde breve na peça, som curto de "clique" de encaixe, peça trava visualmente na base |
| Encaixe recusado / fora do campo de invalidação | a peça pisca vermelho, retorna à posição anterior, e (no visor, quando houver suporte a vibração do controle) um pulso tátil curto |
| Ajuste no limite do suporte | a peça para de responder ao movimento naquele eixo e o contorno pisca âmbar uma vez |
| Tarefa concluída (17/17) | contorno luminoso ao redor de toda a plataforma + som de confirmação curto |
| Peça tocada com a baqueta | o som da peça, na intensidade correspondente à velocidade do movimento. É um retorno imediato e natural, mas que **não substitui** os retornos visuais acima: nenhuma das outras seis situações desta tabela depende de som para ser percebida, exatamente para não deixar a cena muda fora do momento de tocar. |

## 9. Os três regimes

| Aspecto | Na tela | No visor | Pela câmera |
|---|---|---|---|
| Como se olha | câmera orbital/livre controlada por mouse, vendo a plataforma de fora | primeira pessoa, a cabeça controla o olhar 1:1 | através da câmera do celular, ambiente real ao fundo |
| Como se aponta e age | clique aponta (raycast do cursor), arrasto com mouse posiciona peças, teclado ajusta ângulo/altura | controles/joysticks fazem o raycast e o gesto de apanhar; o braço se move fisicamente para bater com a baqueta | toque na tela apanha/solta, arrasto de dedo posiciona, retículo central mira |
| Escala da cena | real (1:1), mas com câmera afastada o bastante para ver a plataforma inteira | real (1:1), obrigatória, é o instrumento em tamanho de verdade | real (1:1), ancorada ao chão físico mapeado pela câmera |
| O que a cena faz de diferente | é o modo de edição e conferência: monta e testa o layout inteiro sem depender de equipamento | mede a velocidade do movimento do controle para calcular a intensidade do som e ativa o áudio posicional 3D completo, recalculado a cada giro de cabeça | usa o rastreamento de superfície para ancorar a plataforma no espaço físico real, permitindo caminhar fisicamente ao redor dela |
| O que não existe neste regime | áudio posicional 3D completo (usa um estéreo simples baseado na posição da câmera virtual); não há leitura de velocidade de baquete | mira por mouse; visão do próprio corpo/mãos reais (só dos controles/baquetas virtuais) | controle físico tipo baqueta (o toque na tela substitui o gesto de bater); feedback tátil |

## 10. Orçamento e desempenho

**Total de objetos (Seção 3):** 17 obrigatórios + até 11 opcionais = **28 objetos simultâneos no cenário máximo**.

**Meta de fluidez declarada:** 60 fps no regime de tela, **72 fps no visor** (limiar considerado necessário para não causar desconforto/cinetose em uso prolongado), mínimo de 30 fps no regime câmera/celular.

**Objetos que se repetem muito:** os pratos splash (4), effects cymbal (4) e tons suspensos (2) compartilham geometria e material entre si, o que os torna candidatos naturais a instanciamento/LOD compartilhado em vez de malhas independentes.

**Ordem de degradação, se não couber:** (1) reduzir o nível de detalhe (LOD) dos pratos opcionais primeiro, por serem os menos essenciais à tarefa da Seção 6; (2) desligar o áudio posicional 3D completo do visor e cair para um estéreo simples baseado na posição da câmera, mantendo o som mas sem o recálculo por movimento de cabeça; (3) limitar a no máximo 2 peças opcionais simultâneas na plataforma; (4) remover sombras dinâmicas e reflexos dos metais dos pratos.

**Espacialização de som:** entra nesta fase, mas com escopo propositalmente reduzido, ou seja, zonas de áudio posicional recalculadas por peça fixada, e não uma simulação acústica completa do ambiente. Essa é exatamente a armadilha nomeada na Seção 1, e o grupo vai medir o delay real antes de decidir se expande o escopo (ver risco na Seção 14).

## 11. Erros, limites e degradação

1. **Aparelho não suporta o regime pedido:** o sistema detecta a capacidade do aparelho na abertura e abre automaticamente no regime de tela (o caso base, que funciona em qualquer máquina), mostrando uma mensagem explicando por que o regime pedido não está disponível ali.
2. **Permissão de câmera negada:** a tela do regime câmera exibe uma explicação de que o modo AR depende da câmera, com um botão para tentar conceder a permissão novamente e outro para voltar ao regime de tela.
3. **Rastreamento se perde:** as peças já ancoradas **congelam** na última posição conhecida (não somem, não esperam em silêncio); um indicador visual (borda piscando na plataforma) avisa que o rastreamento está instável. Ao recuperar, o sistema reancora automaticamente se o desvio detectado for pequeno (abaixo de 15 cm), ou pede confirmação explícita ao usuário se o desvio for maior.
4. **Pessoa sai do espaço útil ou tenta alcançar peça fora do alcance do braço:** o sistema mede a distância entre a mão/controle e a peça-alvo; acima de 90 cm (Seção 5), a peça simplesmente não responde à tentativa de apanhar, com contorno cinza e a mensagem "fora de alcance", sem travar o restante da cena.

## 12. Ativos, formatos e licenças

Peças construídas por código (geometria própria do grupo, sem licença externa): plataforma, pedais de bumbo, estante de pratos, estante de caixa.

Peças a importar de terceiros: origem planejada e licença exigida (busca ainda não finalizada; valores exatos de arquivo/endereço entram nesta tabela assim que os modelos forem escolhidos, antes do Bloco 3 da Seção 13):

| Arquivo | Origem planejada | Licença exigida | Endereço |
|---|---|---|---|
| Bumbo, caixa, tons, tom de chão, chimbal, pratos, banco | banco de modelos gratuitos (ex.: Sketchfab, Poly Haven, Quaternius) | CC0 ou CC-BY, com atribuição registrada se exigida | a preencher com o link exato do modelo escolhido |
| Baquetas | banco de modelos gratuitos ou modeladas pelo grupo | CC0/CC-BY, ou originais do grupo | a preencher |
| Sons de impacto de cada peça | banco de áudio livre (ex.: Freesound, com filtro de licença CC0) | CC0 | a preencher com o link exato de cada amostra |

O grupo registra, desde já, que **não** vai publicar o modelo de demonstração da própria ferramenta como composição de cena. Isso é permitido como teste, mas não conta como o inventário da Seção 3.

## 13. Plano de construção por blocos

| Bloco | O que estará FUNCIONANDO ao fim dele |
|---|---|
| 1 | Regime de tela abre; plataforma fixa renderizada; câmera orbital controlável pelo mouse. |
| 2 | As 17 peças obrigatórias aparecem como formas placeholder soltas no chão; podem ser miradas, apanhadas e arrastadas até a plataforma (ainda sem regra de encaixe). |
| 3 | Regras de encaixe e tolerância da Seção 7 funcionando (peça trava na base, feedback visual de aceito/recusado da Seção 8); ambiente real mapeado com marcadores de apoio ao rastreamento. |
| 4 | Regime câmera (AR) funcional, com a plataforma ancorada no ambiente físico real; regime visor (VR) com controles mapeados para mirar, apanhar e bater. |
| 5 | Som implementado: colisão da baqueta com a peça dispara o áudio correspondente, com intensidade proporcional à velocidade do movimento; áudio posicional básico ativo no visor (Seção 10). |
| 6 | Modelos e texturas finais substituem os placeholders; tolerâncias e orçamento de desempenho testados e ajustados nas máquinas do laboratório; peças opcionais inseridas. |

Cada bloco a partir do 1 já abre e responde: nenhum deles depende do bloco seguinte para ser testável.

## 14. Riscos, decisões em aberto e declarações

**Riscos:**

- Áudio posicional pode gerar delay perceptível quando a cabeça gira rápido no visor. Mitigação: medir a latência antes do Bloco 5, comparando uma biblioteca de áudio espacial contra um simples pan estéreo, e só então decidir o escopo final (ligado à armadilha da Seção 1).
- As máquinas do laboratório têm vídeo integrado, sem placa dedicada, e podem não sustentar 28 objetos com sombras dinâmicas. Mitigação: aplicar a ordem de degradação da Seção 10 já a partir do Bloco 3, não esperar o fim do projeto para testar isso.
- O rastreamento de ambiente pode falhar em salas pequenas ou com pouca luz, situação comum no laboratório. Mitigação: testar cedo, no Bloco 3, com marcadores físicos de apoio (fita no chão) antes de depender só do rastreamento por imagem.
- O número de visores é menor que o número de grupos, o que pode atrasar os testes do regime VR. Mitigação: manter o regime de tela sempre funcional desde o Bloco 1 e reservar horários de teste do visor com antecedência.

**Decisões em aberto:**

- Tamanho final exato da plataforma: o valor provisório da Seção 4 é 1,5 m × 1,5 m, e será decidido testando com o kit completo montado fisicamente como referência, antes do Bloco 6.
- Biblioteca/mecanismo de áudio espacial a usar no visor: decidido comparando latência real entre duas opções antes do Bloco 5.
- Se as 11 peças opcionais entram todas na entrega final ou só uma parte delas: decidido conforme o orçamento de desempenho medido no laboratório (Seção 10), no Bloco 6.
- Endereços exatos dos modelos e sons de terceiro (Seção 12): a preencher assim que cada asset for escolhido, antes do Bloco 3.

**Declaração de uso de IA:** uma assistente de IA (Claude) foi usada para organizar as anotações e decisões que o grupo já tinha tomado em conversa, registradas primeiro em rascunho livre, no formato de 14 seções exigido pelo enunciado, redigir a prosa das Seções 1 e 2 a partir dessas anotações, montar as tabelas das Seções 3, 5, 8, 9 e 12, e propor os números provisórios de escala, tolerância e orçamento das Seções 4, 7 e 10 com base em dimensões aproximadas de um kit de bateria acústica padrão. Nenhum desses números foi testado no ambiente ainda. O grupo se compromete a conferir e ajustar cada valor provisório (tolerâncias, alcance de braço, contagem de objetos, metas de fps, endereços de assets) durante a construção, e a registrar no histórico de versões quando um valor mudar em razão de teste real, e não apenas de opinião.
