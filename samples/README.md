# Amostras gravadas

Por padrão todos os sons são sintetizados. Para usar gravações reais, coloque os arquivos
(`.wav`, `.mp3` ou `.ogg`, um toque isolado por arquivo, sem silêncio no início) nesta pasta
e liste-os em `index.json`:

```json
{ "surdoO": "surdo-aberto.wav", "tamb": "tamborim.wav" }
```

O que não estiver listado continua sintetizado. As amostras só carregam quando o app é
servido por um servidor web (GitHub Pages, por exemplo), não ao abrir o arquivo direto do disco.

Nomes dos timbres: `kick` bumbo, `snare` caixa de bateria, `caixa` caixa/tarol, `rim` aro,
`hh` chimbal, `ride` condução, `surdoO` surdo aberto, `surdoM` surdo abafado, `tamb` tamborim,
`agoH`/`agoL` agogô agudo/grave, `pandJ` platinela do pandeiro, `pandT` grave do pandeiro,
`ganza` ganzá, `triO`/`triC` triângulo aberto/fechado, `zabL` zabumba grave, `zabH` bacalhau,
`alfaia`, `congaH`/`congaL` atabaque agudo/grave, `cow` cowbell, `clickH`/`clickL` metrônomo.
