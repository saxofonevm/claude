# Sons gravados

`pack.js` reúne as gravações de instrumentos reais usadas pelo app: bateria e percussão,
baixo acústico e elétrico, piano, piano elétrico, violão, guitarra e sanfona.

Origem: banco **FluidR3_GM**, de Frank Wen, licença
[Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/us/),
nas versões distribuídas por `gleitz/midi-js-soundfonts` e `surikov/webaudiofontdata`.

Para refazer o pacote (ou acrescentar instrumentos), edite e rode:

```bash
node tools/fetch-samples.js
```

Para economizar espaço há uma gravação a cada três semitons; o app afina as notas vizinhas.
Se o pacote não carregar, o app usa os timbres sintetizados de `js/audio.js` como reserva.

As peças de percussão vêm do padrão General MIDI, que não tem surdo, tamborim, pandeiro,
zabumba ou alfaia. Esses usam a peça gravada mais parecida (tom de chão, timbale, pandeirola,
bumbo), reafinada. A correspondência está na tabela `DRUM` de `js/audio.js`; trocar por
gravações dos instrumentos brasileiros é o próximo passo natural.
