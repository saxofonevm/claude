# Naipe Rit

Aplicativo de estudo que junta **levadas de bateria e percussão** com **harmonia cifrada**:
o aluno escolhe um ritmo, escreve (ou escolhe) uma progressão de acordes e toca junto com
percussão, baixo e acordes no andamento e no tom que quiser.

É um **módulo independente**: a pasta `rit/` funciona sozinha, em qualquer site ou como app
próprio, sem depender de nenhum arquivo de fora dela. O Naipe o abre pela aba **Tocar junto** e pelos
exercícios do Treino do dia, passando as opções pelo endereço (veja abaixo). Para testar, abra
`index.html` no navegador (computador ou celular). Os instrumentos são gravações reais (veja `samples/README.md`).

## O que já faz

- **Ritmos**: Samba, Bossa Nova, Choro, Baião, Maracatu, Ijexá, Afro 12/8, Jazz Swing,
  Jazz Waltz, Funk, Pop/Rock e metrônomo simples.
- **Instrumentos separados**: cada peça (surdo, tamborim, pandeiro, zabumba, triângulo,
  bumbo, chimbal…) tem volume e botão de silenciar. Na harmonia: baixo, violão ou guitarra,
  teclado e, nos ritmos brasileiros, sanfona, cada um com quatro opções de timbre (três na sanfona).
- **Grade do ritmo**: cada levada pode ser editada casa a casa (normal, acento, nota
  fantasma), inclusive a linha do baixo e a rítmica dos acordes.
- **Repertório**: progressões de estudo e harmonias de músicas conhecidas (bossa, baião,
  standards de jazz, funk e pop).
- **Cifra**: compassos em grade, partes nomeadas (`[A]`, `[B]`), compasso atual destacado,
  começo a partir de qualquer compasso.
- **Editor de progressões** em texto: `| Dm7 | G7 | C7M | % |`. Aceita `7M`/`maj7`,
  `m7(b5)`, `dim`, `7(b9)`, `6/9`, `sus4`, baixo invertido (`C/E`) etc.
- **Para o sax**: cifra escrita em Dó, Mib (alto) ou Sib (tenor); o acompanhamento soa no tom real.
- **Repetir trecho**: marque o primeiro e o último compasso e o trecho fica em loop.
- **Tom por volta**: a cada volta a progressão muda de tom (meio tom, quartas ou um tom abaixo).
- **Estudo**: transposição por semitons, andamento de 40 a 260 BPM, tap tempo, contagem
  inicial e aceleração automática a cada volta da progressão.
- Progressões e ajustes ficam salvos no próprio navegador.

## Abrir já configurado (opções no endereço)

Todas são opcionais. Exemplo: `index.html?ritmo=bossa&bpm=110&sax=Mib&prog=m-carnaval`

| Opção | Valores | O que faz |
| --- | --- | --- |
| `ritmo` | `samba`, `bossa`, `choro`, `baiao`, `xote`, `frevo`, `maracatu`, `ijexa`, `afro`, `swing`, `valsa`, `funk`, `pop`, `reggae`, `balada`, `metro` | Escolhe o ritmo |
| `bpm` | 40 a 260 | Andamento |
| `sax` | vazio (som real), `Mib` (alto e barítono), `Sib` (tenor e soprano) | Tonalidade em que a cifra é escrita |
| `prog` | código de uma progressão pronta (`p-251`, `p-blues`, `m-summertime`…) | Carrega a progressão |
| `cifra` | texto da cifra em som real, como `\| Dm7 \| G7 \| C7M \|` | Carrega uma cifra avulsa (vira a progressão "Exercício") |
| `titulo` | texto | Nome da cifra avulsa |
| `levada` | código de uma levada gravada (`levadas/levadas.json`) | Abre já na levada |
| `acesso` | `gratis` | Restringe a Samba, Bossa Nova, Jazz Swing e metrônomo. Sem essa opção, tudo fica liberado |
| `assinar` | endereço | Link "Conhecer a versão completa" do aviso da versão grátis |
| `voltar`, `voltarRotulo` | endereço e texto | Mostra um botão "‹ Voltar" no topo |

**Mensagens entre janelas**, quando o Rit abre num quadro (iframe) do mesmo site:
- o Rit envia `{ naipeRit: 'tocar' }` quando começa a tocar, para quem o abriu silenciar outros sons;
- quem abriu pode enviar `{ naipe: 'parar' }` para o Rit parar a banda e a levada gravada.

O Rit guarda as preferências dele no próprio navegador (`naiperit.v1`) e não lê dados de outros apps.

## Levadas gravadas

Gravações reais em loop, cadastradas em `levadas/levadas.json`, com os áudios em `levadas/audios/`.
Passo a passo em `levadas/LEIA-ME.md`.

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `js/music.js` | Leitura de cifras, transposição, voicings, ritmos e progressões prontas |
| `js/audio.js` | Reprodução das gravações e timbres sintetizados de reserva |
| `samples/` | Gravações dos instrumentos (origens e licenças em `samples/README.md`) |
| `js/app.js` | Sequenciador e interface |
| `js/levadas.js` | Levadas gravadas (áudios em loop) |
| `levadas/` | Cadastro e áudios das levadas gravadas |
| `test/music.test.js` | Testes do núcleo musical (`node test/music.test.js`) |

Para acrescentar um ritmo, adicione um item à lista `RHYTHMS` em `js/music.js`.

## Próximos passos possíveis

- Gravações próprias de surdo, tamborim, pandeiro, zabumba e alfaia.
- Variações e viradas por ritmo; mais levadas (frevo, xote, partido-alto, marcha-rancho).
- Repetições, casas de 1ª/2ª vez e coda na cifra; compassos mistos.
- Exportar/importar progressões; versão instalável (PWA) ou app nativo.
