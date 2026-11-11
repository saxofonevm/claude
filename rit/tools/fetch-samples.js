// Baixa as gravações usadas pelo app, apara, nivela e gera os arquivos de samples/.
// Requer ffmpeg.   node tools/fetch-samples.js
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const RAW = 'https://raw.githubusercontent.com/';
const OUT = path.join(__dirname, '..', 'samples');
const TMP = path.join(require('os').tmpdir(), 'naipe-rit-samples');
fs.mkdirSync(TMP, { recursive: true });

const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SHARP = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
const nome = (t, m) => t[m % 12] + (Math.floor(m / 12) - 1);
const URLS = {
  fluid: (dir, m) => RAW + 'gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/' + dir + '-mp3/' + nome(FLAT, m) + '.mp3',
  tone: (dir, m) => RAW + 'nbrosowsky/tonejs-instruments/master/samples/' + dir + '/' + nome(SHARP, m) + '.mp3',
  sal: (dir, m) => RAW + 'Tonejs/audio/master/salamander/' + nome(SHARP, m) + '.mp3'
};

// Uma gravação a cada 3 ou 4 semitons; o app afina as notas vizinhas.
const BASS = [31, 34, 37, 40, 43, 46, 49, 52, 55], MID = [56, 59, 62, 65], MID5 = [54, 57, 60, 63, 66];
// id: [origem, pasta, notas, duração em s, pico alvo em dB]
const INST = {
  bassE: ['tone', 'bass-electric', BASS, 2.5, -3],
  bassA: ['fluid', 'acoustic_bass', BASS, 2.5, -3],
  bassF: ['fluid', 'fretless_bass', BASS, 2.5, -3],
  bassP: ['fluid', 'electric_bass_pick', BASS, 2.5, -3],
  nylon: ['tone', 'guitar-nylon', [55, 59, 63, 66], 3, -3],
  steel: ['tone', 'guitar-acoustic', MID, 3, -3],
  clean: ['tone', 'guitar-electric', [57, 60, 63, 66], 3, -3],
  jazzg: ['fluid', 'electric_guitar_jazz', MID, 3, -3],
  piano: ['sal', '', MID5, 3.5, -3],
  ep: ['fluid', 'electric_piano_1', MID, 3, -3],
  ep2: ['fluid', 'electric_piano_2', MID, 3, -3],
  organ: ['tone', 'organ', MID5, 3, -10],
  acc: ['fluid', 'accordion', MID, 3, -9],
  band: ['fluid', 'tango_accordion', MID, 3, -9],
  harm: ['tone', 'harmonium', MID, 3, -9]
};
const DRUMS = [35, 36, 37, 38, 40, 41, 42, 51, 54, 56, 60, 61, 63, 64, 65, 67, 68, 70, 76, 77, 80, 81];

async function baixar(url, arq) {
  if (fs.existsSync(arq)) return;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status + ' ' + url);
      fs.writeFileSync(arq, Buffer.from(await r.arrayBuffer()));
      return;
    } catch (e) { if (i === 3) throw e; await new Promise((s) => setTimeout(s, 2000 * (i + 1))); }
  }
}
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-nostdin', '-y'].concat(args), { stdio: ['ignore', 'pipe', 'pipe'] });
const CORTE = 'silenceremove=start_periods=1:start_threshold=-45dB';
function medirPico(arq, dur) {
  const r = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-i', arq, '-af', CORTE + ',atrim=0:' + dur + ',volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  return parseFloat(/max_volume: (-?[\d.]+) dB/.exec(r.stderr)[1]);
}
function escrever(id, mapa) {
  fs.writeFileSync(path.join(OUT, id + '.js'), 'window.NAIPE_SAMPLES(' + JSON.stringify(id) + ',' + JSON.stringify(mapa) + ');\n');
}

(async () => {
  for (const [id, [src, dir, notas, dur, alvo]] of Object.entries(INST)) {
    const arqs = [];
    for (const m of notas) {
      const arq = path.join(TMP, id + '-' + m + '.mp3');
      await baixar(URLS[src](dir, m), arq);
      arqs.push([m, arq]);
    }
    const ganho = alvo - Math.max(...arqs.map(([, a]) => medirPico(a, dur)));
    const mapa = {};
    for (const [m, arq] of arqs) {
      const sai = path.join(TMP, 'out-' + id + '-' + m + '.mp3');
      ff(['-i', arq, '-af', CORTE + ',atrim=0:' + dur + ',volume=' + ganho.toFixed(1) + 'dB,afade=t=out:st=' + (dur - 0.3) + ':d=0.3',
        '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '72k', sai]);
      mapa[m] = fs.readFileSync(sai).toString('base64');
    }
    escrever('i-' + id, mapa);
    console.log(id, 'ganho', ganho.toFixed(1), 'dB', Math.round(fs.statSync(path.join(OUT, 'i-' + id + '.js')).size / 1024) + ' KB');
  }
  const drums = {};
  for (const n of DRUMS) {
    const arq = path.join(TMP, 'drum-' + n + '.js');
    await baixar(RAW + 'surikov/webaudiofontdata/master/sound/128' + n + '_0_FluidR3_GM_sf2_file.js', arq);
    const cru = path.join(TMP, 'drum-' + n + '.mp3'), sai = path.join(TMP, 'out-drum-' + n + '.mp3');
    fs.writeFileSync(cru, Buffer.from(/file:'([^']+)'/.exec(fs.readFileSync(arq, 'utf8'))[1], 'base64'));
    const g = -4 - medirPico(cru, 2);
    ff(['-i', cru, '-af', CORTE + ',atrim=0:2,volume=' + g.toFixed(1) + 'dB', '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '72k', sai]);
    drums[n] = fs.readFileSync(sai).toString('base64');
  }
  escrever('drums', drums);
})();
