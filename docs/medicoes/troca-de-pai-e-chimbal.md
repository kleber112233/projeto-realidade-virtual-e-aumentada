# Troca de pai e ajuste do chimbal

Números que aparecem nos slides 5 e 6. Diferente dos arquivos `medicao_*`, eles não medem tempo: são posições calculadas pela própria cena, então dão o mesmo resultado em qualquer máquina.

## Onde foram obtidos

- Na página, no PC do Kleber (Windows, placa RTX 3080 Ti), lendo o que o diário escreve embaixo dos botões.
- Em 29/09/2026 a mesma sequência foi repetida rodando `cena.ts` e `hierarquia.ts` fora do navegador (Node 22 e Three.js 0.185.1). Os números bateram com os da página.

## Troca de pai (slide 6)

Sequência de botões: Girar a plataforma 30°, Fixar o bumbo na plataforma, Mover a plataforma 40 cm.

| Momento | Bumbo no mundo (m) | Pai do bumbo | Bumbo em relação ao pai (m) |
|---|---|---|---|
| Plataforma girada, antes de fixar | (1,500; 0,000; 0,000) | chao | (1,500; 0,000; 0,000) |
| Depois de fixar | (1,500; 0,000; 0,000) | plataforma | (1,299; 0,000; 0,750), rotação de −30° |
| Depois de mover a plataforma | (1,900; 0,000; 0,000) | plataforma | (1,299; 0,000; 0,750), sem mudança |

Desvio de posição na troca: 1.9e-17 m. Desvio de orientação: 0.0e+0 graus. Os dois são arredondamento de conta, não erro.

A rotação local fica em −30° porque a plataforma está girada +30°: as duas se anulam e o bumbo continua virado para o mesmo lado no mundo.

A caixa, que continua solta no chão, fica em (1,370; 0,000; −0,610) m durante toda a sequência.

## Ajuste do chimbal (slide 5)

O botão Subir o chimbal para 90 cm só move a haste. O prato de cima, que é filho dela, sobe exatamente 0,100 m.

- Com o prato parado (chimbal aberto), ele vai de y = 0,797 m para 0,897 m.
- Na página o prato abre e fecha uma vez por segundo, então o valor lido depende do instante do clique: com a haste em 80 cm ele fica entre 0,777 e 0,797 m. No clique usado no slide ele estava em 0,788 m e foi para 0,888 m.
