# Sons gravados

Gravações de instrumentos reais usadas pelo app. `drums.js` traz bateria e percussão; cada
`i-<timbre>.js` traz um instrumento de harmonia e só é carregado quando o timbre é escolhido.

| Timbre | Origem | Licença |
| --- | --- | --- |
| Piano de cauda | Salamander Grand Piano, de Alexander Holm | CC BY 3.0 |
| Baixo elétrico, guitarra limpa | Karoryfer Samples | domínio público |
| Violão de aço | Universidade de Iowa (MIS) | uso livre |
| Órgão | VSCO 2 Community Edition | CC0 |
| Violão de nylon, harmônio (reed organ), baixo acústico, fretless e com palheta, guitarra de jazz, pianos elétricos, sanfona, bandoneon, bateria e percussão | FluidR3_GM, de Frank Wen | CC BY 3.0 |

Os arquivos vêm dos repositórios `nbrosowsky/tonejs-instruments`, `Tonejs/audio`,
`gleitz/midi-js-soundfonts` e `surikov/webaudiofontdata`. Para refazer ou acrescentar
timbres, edite e rode (precisa de ffmpeg):

```bash
node tools/fetch-samples.js
```

O script apara o silêncio inicial, corta cada nota em cerca de 3 segundos e nivela o volume.
Há uma gravação a cada três ou quatro semitons; o app afina as notas vizinhas. Enquanto um
timbre carrega, soa o timbre sintetizado de reserva de `js/audio.js`.

A percussão segue o padrão General MIDI, que não tem surdo, tamborim, pandeiro, zabumba ou
alfaia. Esses usam a peça gravada mais parecida (tom de chão, timbale, pandeirola, bumbo),
reafinada, conforme a tabela `DRUM` de `js/audio.js`.
