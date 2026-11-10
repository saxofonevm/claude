// Baixa as gravações usadas pelo app (FluidR3_GM, CC BY 3.0) e monta samples/pack.js.
//   node tools/fetch-samples.js
const fs = require('fs');
const RAW = 'https://raw.githubusercontent.com/';
const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const noteName = (m) => NAMES[m % 12] + (Math.floor(m / 12) - 1);

// Uma amostra a cada 3 semitons; o app afina as notas vizinhas.
const BASS = [31, 34, 37, 40, 43, 46, 49, 52, 55], MID = [56, 59, 62, 65];
const INST = {
  bassA: ['acoustic_bass', BASS], bassE: ['electric_bass_finger', BASS],
  piano: ['acoustic_grand_piano', MID], ep: ['electric_piano_1', MID],
  nylon: ['acoustic_guitar_nylon', MID], jazzg: ['electric_guitar_jazz', MID],
  clean: ['electric_guitar_clean', MID], acc: ['accordion', MID]
};
// Peças de percussão do padrão General MIDI.
const DRUMS = [35, 36, 37, 38, 40, 41, 42, 51, 54, 56, 60, 61, 63, 64, 65, 67, 68, 70, 76, 77, 80, 81];

async function get(url, asText) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return asText ? await r.text() : Buffer.from(await r.arrayBuffer()).toString('base64');
    } catch (e) { if (i === 3) throw e; await new Promise((s) => setTimeout(s, 2000 * (i + 1))); }
  }
}

(async () => {
  const pack = { drums: {}, inst: {} };
  for (const n of DRUMS) {
    const js = await get(RAW + 'surikov/webaudiofontdata/master/sound/128' + n + '_0_FluidR3_GM_sf2_file.js', true);
    pack.drums[n] = /file:'([^']+)'/.exec(js)[1];
  }
  for (const [id, [name, notes]] of Object.entries(INST)) {
    pack.inst[id] = {};
    for (const n of notes) {
      pack.inst[id][n] = await get(RAW + 'gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/' + name + '-mp3/' + noteName(n) + '.mp3');
    }
    console.log(id, 'ok');
  }
  fs.writeFileSync(__dirname + '/../samples/pack.js',
    '/* Gravações do FluidR3_GM (Frank Wen), CC BY 3.0. Gerado por tools/fetch-samples.js. */\n' +
    'window.SAMPLE_PACK = ' + JSON.stringify(pack) + ';\n');
})();
