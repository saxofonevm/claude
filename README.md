# Naipe Rit

Aplicativo de estudo que junta **levadas de bateria e percussão** com **harmonia cifrada**:
o aluno escolhe um ritmo, escreve (ou escolhe) uma progressão de acordes e toca junto com
percussão, baixo e acordes no andamento e no tom que quiser.

Protótipo web, sem instalação e sem dependências: abra `index.html` no navegador
(computador ou celular). Todos os sons são sintetizados com Web Audio.

## O que já faz

- **Ritmos**: Samba, Bossa Nova, Choro, Baião, Maracatu, Ijexá, Afro 12/8, Jazz Swing,
  Jazz Waltz, Funk, Pop/Rock e metrônomo simples.
- **Instrumentos separados**: cada peça (surdo, tamborim, pandeiro, zabumba, triângulo,
  bumbo, chimbal…) tem volume e botão de silenciar, além de Baixo e Acordes.
- **Grade do ritmo**: cada levada pode ser editada casa a casa (normal, acento, nota
  fantasma), inclusive a linha do baixo e a rítmica dos acordes.
- **Cifra**: compassos em grade, partes nomeadas (`[A]`, `[B]`), compasso atual destacado,
  começo a partir de qualquer compasso.
- **Editor de progressões** em texto: `| Dm7 | G7 | C7M | % |`. Aceita `7M`/`maj7`,
  `m7(b5)`, `dim`, `7(b9)`, `6/9`, `sus4`, baixo invertido (`C/E`) etc.
- **Estudo**: transposição por semitons, andamento de 40 a 260 BPM, tap tempo, contagem
  inicial e aceleração automática a cada volta da progressão.
- Progressões e ajustes ficam salvos no próprio navegador.

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `js/music.js` | Leitura de cifras, transposição, voicings, ritmos e progressões prontas |
| `js/audio.js` | Timbres sintetizados (percussão, baixo, acordes) |
| `js/app.js` | Sequenciador e interface |
| `test/music.test.js` | Testes do núcleo musical (`node test/music.test.js`) |

Para acrescentar um ritmo, adicione um item à lista `RHYTHMS` em `js/music.js`.

## Próximos passos possíveis

- Trocar os timbres sintetizados por amostras gravadas de instrumentos reais.
- Variações e viradas por ritmo; mais levadas (frevo, xote, partido-alto, marcha-rancho).
- Repetições, casas de 1ª/2ª vez e coda na cifra; compassos mistos.
- Exportar/importar progressões; versão instalável (PWA) ou app nativo.
