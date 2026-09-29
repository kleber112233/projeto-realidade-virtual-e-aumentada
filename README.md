# Bateria acústica em realidade virtual e aumentada

Projeto da disciplina de Realidade Virtual e Aumentada, com o professor Moacyr. Este é o estado do projeto no fim do Módulo 03.

Grupo: Kleber, Isabela, Pedro Santilli e Gabriel Verga.

A cena em uma frase: uma plataforma onde a pessoa monta, peça por peça, um kit de bateria acústica em tamanho real, ajustando a posição e o ângulo de cada peça até o kit poder ser tocado.

Documentos do projeto:

- Especificação em 14 seções: [docs/especificacao.md](docs/especificacao.md)

## 1. O que é o ambiente

É uma página web feita com TypeScript, Three.js e WebXR. Por enquanto ela faz quatro coisas:

1. Pergunta ao aparelho o que ele oferece (a sonda de capacidades) e mostra o resultado na própria página. O mesmo endereço mostra resultados diferentes no PC, no celular e no visor.
2. Monta a cena da bateria como uma árvore de objetos, com formas simples (cilindros e caixas) e nas medidas em metros da especificação.
3. Troca um objeto de pai sem tirar ele do lugar. No nosso caso, fixa o bumbo na plataforma e mostra a posição antes e depois em números.
4. Anima a cena pelo tempo que passou, e não pela quantidade de quadros, e mostra o custo de cada quadro num painel dentro da própria cena.

Neste módulo só o modo janela (PC) desenha a cena. Os modos visor (VR) e celular (AR) já estão declarados e a sonda consulta os dois, mas eles ainda não mostram a bateria.

## 2. Como rodar

Você vai precisar do Node.js 20.19 ou mais novo (confira com `node -v`; o Vite usado no projeto não roda em versões anteriores) e do Google Chrome.

```bash
git clone https://github.com/kleber112233/projeto-realidade-virtual-e-aumentada.git
cd projeto-realidade-virtual-e-aumentada
git checkout modulo-03
cd webxr-app
npm install
npm run dev
```

Atenção: o projeto Node fica dentro da pasta `webxr-app`. Se rodar o `npm install` na raiz do repositório, ele dá erro.

Depois abra https://localhost:5173 no Chrome. Na primeira vez o navegador avisa que o certificado não é confiável. Clique em Avançado e depois em Continuar. Isso é esperado, porque a WebXR só funciona em HTTPS e o servidor cria um certificado próprio.

Para conferir se o código compila sem erro, use `npm run typecheck` e `npm run build`.

### Abrir no celular ou no visor

Se o celular estiver na mesma rede Wi-Fi do PC, use o endereço que aparece em `Network:` quando o `npm run dev` sobe (algo como https://192.168.x.x:5173) e aceite o aviso do certificado.

Se não funcionar pela rede, dá para usar um túnel. Com o `npm run dev` rodando, abra outro terminal e rode:

```bash
cloudflared tunnel --url https://localhost:5173 --no-tls-verify
```

Ele mostra um endereço terminado em trycloudflare.com, que abre de qualquer rede. Para instalar o cloudflared no Windows: `winget install --id Cloudflare.cloudflared`.

O iPhone não tem WebXR, nem no Safari nem no Chrome. A página abre e a cena aparece normalmente no modo janela, mas a sonda responde "sem resposta" para VR e AR.

### Simular um visor no PC

A extensão Immersive Web Emulator, da Meta, simula um Quest no Chrome. Fixe o ícone na barra, ative a extensão para o localhost, recarregue a página e clique em Sondar este aparelho. Serve para desenvolver, mas é uma simulação e não conta como aparelho testado.

## 3. Aparelhos em que já testamos

| Aparelho | Regime que abriu | Regime que não abriu |
|---|---|---|
| PC do Kleber, Windows e Chrome (RTX 3080 Ti; não é o PC do laboratório) | janela | VR e AR, porque o aparelho respondeu que não suporta |
| iPhone do Kleber, Safari (iPhone 17 Pro Max, iOS 26.6) | janela | VR e AR, porque o navegador não tem WebXR |
| PC do Kleber com o Immersive Web Emulator (Quest Pro simulado) | janela, e a sonda abriu uma sessão AR | nenhum, mas é simulação e o emulador libera todos os recursos |
| Android com Chrome e ARCore | pendente | pendente |
| Máquina do laboratório | pendente | pendente |

Para acrescentar uma linha, abra a página no aparelho, clique em Sondar este aparelho, preencha o nome da máquina e clique em Salvar arquivo na máquina. O arquivo vai para a pasta [docs/medicoes/](docs/medicoes/).

## 4. Os nove passos da tarefa

| Passo | O que pede | Onde está |
|---|---|---|
| 1 | Escolher a cena | especificação, seção 1 |
| 2 | Delimitar o domínio (tarefa, objetos e estado final) | `webxr-app/src/bateria/dominio/dominio.ts` e especificação, seções 3 e 6 |
| 3 | Declarar os três regimes | `webxr-app/src/bateria/modes/regimes.ts` e especificação, seção 9 |
| 4 | Especificação em 14 seções | [docs/especificacao.md](docs/especificacao.md) |
| 5 | Sonda de capacidades | pasta `webxr-app/src/bateria/devices/` e `modes/verificacao.ts` |
| 6 | Relatório visível no aparelho | pasta `webxr-app/src/bateria/relatorio/` |
| 7 | Cena como árvore | `webxr-app/src/bateria/core/cena.ts` e `core/palco.ts` |
| 8 | Trocar de pai sem recalcular à mão | `webxr-app/src/bateria/core/hierarquia.ts` |
| 9 | Laço pelo relógio, custo na cena e teto | `core/relogio.ts`, `core/laco.ts`, `core/orcamento.ts` e `ui/painel.ts` |

Sobre a organização do código: cada parte não sabe das outras. O palco só desenha e não sabe o que é uma bateria. A cena conhece a bateria, mas não mede tempo. O relógio mede tempo e não conhece as peças. O orçamento compara números com um teto sem saber de onde eles vêm. O `main.ts` só junta tudo. Assim, quando o modo VR entrar, dá para trocar o palco sem mexer na cena.

## 5. Roteiro da demonstração (modo janela)

1. A cena abre com os objetos prometidos: as 15 peças soltas no chão, em volta da plataforma de 1,5 m.
2. Um objeto se move junto com outro porque está preso a ele: o botão Subir o chimbal sobe só a haste, e os pratos, que são filhos dela, sobem junto.
3. Um objeto troca de pai e continua no mesmo lugar: clique em Girar a plataforma 30° e depois em Fixar o bumbo na plataforma. O bumbo não se move (é assim mesmo, trocar de pai não é mover). Aparece uma linha amarela da plataforma até ele, e embaixo dos botões aparecem a posição antes, a posição depois e os desvios de posição e de orientação, os dois praticamente zero mesmo com a plataforma girada. Em seguida, os botões de girar e de mover a plataforma levam o bumbo junto, enquanto a caixa, que continua solta, fica parada.
4. O indicador de custo do quadro aparece dentro da cena, no painel preso na borda direita da plataforma, e dá para ler da câmera inicial. O prato de cima do chimbal fecha e abre uma vez por segundo, seguindo o relógio.

Também dá para testar o botão Redimensionar a plataforma, que muda o piso de 1,5 m para 2,5 m sem esticar o bumbo fixado. A escala dele continua 1.

## 6. Orçamento do quadro e medições

O teto é de 13,9 ms por quadro, que é o tempo entre duas imagens num visor a 72 Hz, a meta da especificação (seção 10). Usamos esse teto também no PC, porque a mesma cena vai abrir no visor.

O que comparamos com o teto é o custo do nosso trabalho em cada quadro. O intervalo entre imagens também aparece, mas não entra na comparação, porque num monitor de 60 Hz ele nunca fica abaixo de uns 16,7 ms.

As medições ficam em [docs/medicoes/](docs/medicoes/), sempre com a máquina junto. A medição na máquina mais simples do laboratório ainda está pendente.

## 7. O que ainda não funciona

- Os modos VR e AR estão declarados e a sonda consulta os dois, mas eles ainda não desenham a cena.
- Ainda não dá para pegar, encaixar nem tocar as peças. Isso fica para os próximos módulos. Hoje, fixar só troca o pai da peça, ela não é levada até a plataforma.
- O custo medido é o tempo de processador. O tempo da placa de vídeo não entra nesse número.
- A sonda pode confundir um visor de seis graus de liberdade que perdeu o rastreamento com um visor de três graus. Por isso o relatório mostra as contagens de poses.
- Ainda não testamos em Android nem na máquina do laboratório.
- A cena anda igual em máquinas diferentes desde que elas passem de 10 quadros por segundo. Abaixo disso o relógio corta cada intervalo em 0,1 s e a cena fica mais lenta que o tempo real (a medição mostra quantos quadros foram cortados).

## 8. Pastas

```
projeto-realidade-virtual-e-aumentada/
  README.md               este arquivo
  docs/
    especificacao.md      especificação em 14 seções
    medicoes/             arquivos salvos pelo botão Salvar arquivo na máquina
  webxr-app/              projeto Node (os comandos rodam aqui dentro)
    index.html
    package.json, tsconfig.json, vite.config.ts
    src/
      main.ts             junta todas as partes
      bateria/
        dominio/          o que existe na cena e o que conclui a tarefa
        modes/            os três regimes
        devices/          a sonda de capacidades
        relatorio/        diário, relatório, medição e compartilhamento
        core/             palco, cena, troca de pai, relógio, laço e orçamento
        ui/               painel dentro da cena e a linha que mostra o parentesco
```

## 9. Uso de IA

Usamos uma assistente de IA (Claude) como apoio no estudo do material, simulando apresentações e possíveis perguntas do professor. Também foi criada uma skill de estudos, utilizada para realizar sessões de questionários e avaliar nosso conhecimento sobre o conteúdo.