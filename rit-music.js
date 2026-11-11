/* Naipe Rit — núcleo musical: acordes, cifras, ritmos e progressões.
   Sem dependência de navegador: também roda em Node para os testes. */
(function (root) {
  'use strict';

  var NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  var NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function notePc(n) {
    var p = NATURAL[n[0]];
    if (n[1] === '#') p++;
    if (n[1] === 'b') p--;
    return (p + 12) % 12;
  }

  /* Interpreta uma cifra (C7M, Dm7(b5), G7(b9), F#dim, Bb6/9, C/E…).
     Devolve null quando não reconhece. */
  function parseChord(sym) {
    var s = String(sym).trim().replace('6/9', '69');
    var m = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(s);
    if (!m) return null;
    var q = m[2]
      .replace(/[()\s,]/g, '')
      .replace(/Δ7?/g, 'maj7')
      .replace(/7M/g, 'maj7')
      .replace(/M7/g, 'maj7')
      .replace(/M9/g, 'maj9')
      .replace(/ø7?/g, 'm7b5')
      .replace(/°/g, 'dim')
      .replace(/^-/, 'm')
      .replace(/^min/, 'm');
    if (/[^a-zA-Z0-9#+]/.test(q)) return null;

    var minor = /^m(?!aj)/.test(q);
    var dim = /dim/.test(q);
    var aug = /aug|\+/.test(q);
    var sus2 = /sus2/.test(q);
    var sus4 = /sus(?!2)/.test(q);
    var add = /add/.test(q);
    var alt = {};
    var rest = q.replace(/sus[24]?|add|dim|aug|\+/g, '')
      .replace(/([b#])(13|11|9|5)/g, function (_, a, n) { alt[a + n] = true; return ''; });
    var hasMaj = /maj/.test(rest);
    var nums = rest.replace(/maj|m/g, '').match(/13|11|9|7|6/g) || [];
    if (rest.replace(/maj|m|13|11|9|7|6/g, '') !== '') return null;
    var has = function (n) { return nums.indexOf(n) >= 0; };

    var third = sus4 ? 5 : sus2 ? 2 : (minor || dim) ? 3 : 4;
    var fifth = (dim || alt.b5) ? 6 : (aug || alt['#5']) ? 8 : 7;
    var sixth = has('6');
    var seventh = null;
    if (dim) seventh = 9;
    else if (has('7') || has('11') || has('13') || (has('9') && !add && !sixth)) seventh = hasMaj ? 11 : 10;

    var iv = [0, third, fifth];
    if (sixth) iv.push(9);
    if (seventh !== null) iv.push(seventh);
    if (has('9')) iv.push(14);
    if (alt.b9) iv.push(13);
    if (alt['#9']) iv.push(15);
    if (alt['#11']) iv.push(18);
    if (has('13')) iv.push(21);
    if (alt.b13) iv.push(20);

    var rootPc = notePc(m[1]);
    return {
      sym: s, rootPc: rootPc, bassPc: m[3] ? notePc(m[3]) : rootPc,
      third: third, fifth: fifth, seventh: seventh, sixth: sixth, intervals: iv
    };
  }

  function transposeSym(sym, n) {
    if (!n) return sym;
    var tr = function (note) { return NOTES[(notePc(note) + n + 120) % 12]; };
    return String(sym)
      .replace(/^[A-G][#b]?/, tr)
      .replace(/\/([A-G][#b]?)$/, function (_, b) { return '/' + tr(b); });
  }

  /* Notas (MIDI) do acorde para o acompanhamento, na região média. */
  function voicing(ch) {
    var ivs;
    if (ch.seventh !== null) {
      var ext = ch.intervals.filter(function (i) { return i > 12; });
      ivs = [ch.third, ch.seventh, ext.length ? ext[0] : ch.fifth];
      if (ext.length > 1) ivs.push(ext[1]);
    } else {
      ivs = ch.intervals.slice();
    }
    return ivs.map(function (i) {
      var pc = (ch.rootPc + i) % 12;
      return 55 + ((pc - 7 + 12) % 12); // G3 … F#4
    }).sort(function (a, b) { return a - b; });
  }

  function bassMidi(pc) { return 33 + ((pc - 9 + 12) % 12); } // A1 … G#2

  /* Texto da cifra -> linhas de compassos.
     Formato:  [A] | Dm7 | G7 | C7M | % |   (um compasso entre barras, % repete) */
  function parseChart(text) {
    var rows = [], bars = [];
    String(text).split('\n').forEach(function (line) {
      var label = null;
      line = line.replace(/^\s*\[([^\]]+)\]/, function (_, l) { label = l.trim(); return ''; });
      var cells = line.split('|').map(function (c) { return c.trim(); }).filter(Boolean);
      if (!cells.length) return;
      var row = { label: label, bars: [] };
      cells.forEach(function (c) {
        var bar = { index: bars.length, repStart: false, repEnd: false, ending: 0 };
        if (c[0] === ':') { bar.repStart = true; c = c.slice(1); }
        if (c[c.length - 1] === ':') { bar.repEnd = true; c = c.slice(0, -1); }
        bar.chords = c.trim().split(/\s+/).filter(function (t) {
          var m = /^([12])\.$/.exec(t);
          if (m) bar.ending = +m[1];
          return t && !m;
        });
        if (!bar.chords.length) bar.chords = ['%'];
        row.bars.push(bar);
        bars.push(bar);
      });
      rows.push(row);
    });
    return { rows: rows, bars: bars };
  }

  /* Ordem em que os compassos são tocados, resolvendo ritornelos (|: … :|)
     e casas de 1ª e 2ª vez. Devolve índices de compasso. */
  function playOrder(bars) {
    var order = [], i = 0, start = 0, pass = 1, house = 0, guard = 0;
    var houses = bars.map(function (bar) {
      if (bar.repStart) house = 0;
      if (bar.ending) house = bar.ending;
      var h = house;
      if (bar.repEnd && house === 1) house = 0;
      return h;
    });
    while (i < bars.length && guard++ < 4000) {
      var bar = bars[i];
      if (bar.repStart && i !== start) { start = i; pass = 1; }
      if (houses[i] && houses[i] !== pass && pass === 2) { i++; continue; }
      order.push(i);
      if (bar.repEnd) {
        if (pass === 1) { pass = 2; i = start; continue; }
        pass = 1; start = i + 1;
      }
      i++;
    }
    return order;
  }

  /* Para cada compasso e tempo, qual acorde soa e se ele começa ali. */
  function buildTimeline(bars, beats, transpose) {
    var last = null, tl = [];
    bars.forEach(function (bar) {
      var toks = bar.chords.slice(0, beats), slots = {};
      toks.forEach(function (t, i) {
        slots[Math.min(beats - 1, Math.round(i * beats / toks.length))] = t;
      });
      var row = [];
      for (var b = 0; b < beats; b++) {
        var start = false;
        if (slots[b] !== undefined && slots[b] !== '%') {
          last = parseChord(transposeSym(slots[b], transpose));
          start = true;
        }
        row.push({ ch: last, start: start });
      }
      tl.push(row);
    });
    return tl;
  }

  /* ---------- Ritmos ----------
     Cada caractere é uma subdivisão:  X acento · x normal · o nota fantasma · - pausa
     Baixo:    r fundamental · 3 terça · 5 quinta · 7 sétima · 8 oitava
               N fundamental do próximo acorde · a aproximação cromática · w walking
     Acordes:  x curto · X sustentado · n antecipa o próximo acorde               */
  var B = 'Bateria', P = 'Percussão';
  var RHYTHMS = [
    { id: 'samba', name: 'Samba', fill: 'caixa', sig: '2/4', beats: 2, spb: 4, bars: 2, bpm: 96,
      tracks: [
        { name: 'Surdo aberto', voice: 'surdoO', group: P, pat: '----X---' },
        { name: 'Surdo abafado', voice: 'surdoM', group: P, pat: 'x-------' },
        { name: 'Tamborim', voice: 'tamb', group: P, pat: 'x-x-xx-x-x-xx-x-', v: 0.6 },
        { name: 'Pandeiro', voice: 'pandJ', group: P, pat: 'XooXXooX' },
        { name: 'Ganzá', voice: 'ganza', group: P, pat: 'XoxoXoxo', v: 0.5 },
        { name: 'Agogô agudo', voice: 'agoH', group: P, pat: 'x-x-----x-xx----', off: 1 },
        { name: 'Agogô grave', voice: 'agoL', group: P, pat: '----xx-x-----x-x', off: 1 },
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'x--xx--x', off: 1 },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'XoxxXoxx', off: 1 },
        { name: 'Aro', voice: 'rim', group: B, pat: 'x-x-xx-x-x-xx-x-', off: 1 }
      ],
      bass: 'r--55--N', comp: 'x--x-x--x-x--x-n' },
    { id: 'bossa', name: 'Bossa Nova', fill: 'snare', sig: '4/4', beats: 4, spb: 2, bars: 2, bpm: 130,
      tracks: [
        { name: 'Aro', voice: 'rim', group: B, pat: 'x--x--x---x--x--' },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'xxxxxxxx', v: 0.5 },
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'x--xx--x', v: 0.6 },
        { name: 'Ganzá', voice: 'ganza', group: P, pat: 'XoXoXoXo', off: 1 }
      ],
      bass: 'r--55--N', comp: 'x-x--x-x--x--x-n' },
    { id: 'choro', name: 'Choro', fill: 'pandJ', sig: '2/4', beats: 2, spb: 4, bars: 1, bpm: 84,
      tracks: [
        { name: 'Pandeiro (platinela)', voice: 'pandJ', group: P, pat: 'xoxXxoxX' },
        { name: 'Pandeiro (grave)', voice: 'pandT', group: P, pat: 'X--x----' },
        { name: 'Ganzá', voice: 'ganza', group: P, pat: 'XoxoXoxo', off: 1 }
      ],
      bass: 'r---5--N', comp: 'x-xx-x-x' },
    { id: 'baiao', name: 'Baião', fill: 'zabH', sig: '2/4', beats: 2, spb: 4, bars: 1, bpm: 100,
      tracks: [
        { name: 'Zabumba (grave)', voice: 'zabL', group: P, pat: 'X--x----' },
        { name: 'Zabumba (bacalhau)', voice: 'zabH', group: P, pat: '------x-' },
        { name: 'Triângulo fechado', voice: 'triC', group: P, pat: 'xx-xxx-x', v: 0.6 },
        { name: 'Triângulo aberto', voice: 'triO', group: P, pat: '--X---X-', v: 0.6 },
        { name: 'Agogô', voice: 'agoL', group: P, pat: 'x--x--x-', off: 1 },
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'x--x--x-', off: 1 },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'xxxxxxxx', off: 1 }
      ],
      bass: 'r--r--5-', comp: 'x--x-x--' },
    { id: 'maracatu', name: 'Maracatu', fill: 'caixa', sig: '4/4', beats: 4, spb: 4, bars: 1, bpm: 96,
      tracks: [
        { name: 'Alfaia', voice: 'alfaia', group: P, pat: 'X--x--x-X--xx-x-' },
        { name: 'Gonguê', voice: 'agoL', group: P, pat: 'x--xx-x-x--xx-x-', v: 0.6 },
        { name: 'Caixa', voice: 'caixa', group: P, pat: 'XoxxXoxxXoxxXoxx', v: 0.6 },
        { name: 'Abê', voice: 'ganza', group: P, pat: 'x-xxx-xxx-xxx-xx', v: 0.5 }
      ],
      bass: 'r--r--r-5--5--N-', comp: 'x--x--x-----x---' },
    { id: 'ijexa', name: 'Ijexá', fill: 'congaH', sig: '4/4', beats: 4, spb: 4, bars: 1, bpm: 92,
      tracks: [
        { name: 'Agogô agudo', voice: 'agoH', group: P, pat: 'xx------x-x-----' },
        { name: 'Agogô grave', voice: 'agoL', group: P, pat: '---x-xx-----xx--' },
        { name: 'Atabaque grave', voice: 'congaL', group: P, pat: 'x--x--x---x-x---' },
        { name: 'Atabaque agudo', voice: 'congaH', group: P, pat: '--x--x-x-x-x--xx', off: 1 },
        { name: 'Ganzá', voice: 'ganza', group: P, pat: 'XoxoXoxoXoxoXoxo', v: 0.5 }
      ],
      bass: 'r-----5-r--5----', comp: '--x--x-x--x--x--' },
    { id: 'afro', name: 'Afro 12/8', fill: 'congaH', sig: '12/8', beats: 4, spb: 3, bars: 1, bpm: 100,
      tracks: [
        { name: 'Agogô', voice: 'agoH', group: P, pat: 'x-x-xx-x-x-x' },
        { name: 'Atabaque grave', voice: 'congaL', group: P, pat: 'x-----x--x--' },
        { name: 'Atabaque agudo', voice: 'congaH', group: P, pat: '--x-x---x-xx', v: 0.6 },
        { name: 'Ganzá', voice: 'ganza', group: P, pat: 'XooXooXooXoo', v: 0.5 }
      ],
      bass: 'r-----5--r--', comp: 'x--x-x---x--' },
    { id: 'swing', name: 'Jazz Swing', fill: 'snare', sig: '4/4', beats: 4, spb: 3, bars: 2, bpm: 140,
      tracks: [
        { name: 'Condução', voice: 'ride', group: B, pat: 'x--x-xx--x-x' },
        { name: 'Chimbal (pé)', voice: 'hh', group: B, pat: '---x-----x--' },
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'o--o--o--o--', v: 0.4 },
        { name: 'Caixa', voice: 'snare', group: B, pat: '-----o-----o', off: 1 }
      ],
      bass: 'w--w--w--w--', comp: 'x----x-----------x--x---' },
    { id: 'valsa', name: 'Jazz Waltz', fill: 'snare', sig: '3/4', beats: 3, spb: 3, bars: 1, bpm: 150,
      tracks: [
        { name: 'Condução', voice: 'ride', group: B, pat: 'x--x-xx--' },
        { name: 'Chimbal (pé)', voice: 'hh', group: B, pat: '---x-----' },
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'x--------', v: 0.5 }
      ],
      bass: 'w--w--w--', comp: '---x-x---' },
    { id: 'funk', name: 'Funk', fill: 'snare', sig: '4/4', beats: 4, spb: 4, bars: 1, bpm: 96,
      tracks: [
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'X--x--x---x--x--' },
        { name: 'Caixa', voice: 'snare', group: B, pat: '----X--o-o--X--o' },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'xoxoxoxoxoxoxoxo' },
        { name: 'Cowbell', voice: 'cow', group: P, pat: 'x---x---x---x---', off: 1 }
      ],
      bass: 'r--r--8-r-5-7-r-', comp: '---x--x-----x-x-' },
    { id: 'pop', name: 'Pop / Rock', fill: 'snare', sig: '4/4', beats: 4, spb: 2, bars: 1, bpm: 110,
      tracks: [
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'x--xx---' },
        { name: 'Caixa', voice: 'snare', group: B, pat: '--x---x-' },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'XxXxXxXx' }
      ],
      bass: 'rrrrrrr5', comp: 'X---X---' },
    { id: 'xote', name: 'Xote', fill: 'zabH', sig: '2/4', beats: 2, spb: 4, bars: 1, bpm: 76,
      tracks: [
        { name: 'Zabumba (grave)', voice: 'zabL', group: P, pat: 'X-----x-' },
        { name: 'Zabumba (bacalhau)', voice: 'zabH', group: P, pat: '----x---' },
        { name: 'Triângulo fechado', voice: 'triC', group: P, pat: 'x---x---', v: 0.6 },
        { name: 'Triângulo aberto', voice: 'triO', group: P, pat: '--X---X-', v: 0.6 },
        { name: 'Ganzá', voice: 'ganza', group: P, pat: 'XoxoXoxo', off: 1 }
      ],
      bass: 'r-----5-', comp: '--x---x-' },
    { id: 'frevo', name: 'Frevo', fill: 'caixa', sig: '2/4', beats: 2, spb: 4, bars: 2, bpm: 136,
      tracks: [
        { name: 'Caixa', voice: 'caixa', group: P, pat: 'XoxxXoxxXoxxXxxx' },
        { name: 'Surdo abafado', voice: 'surdoM', group: P, pat: 'x-------' },
        { name: 'Surdo aberto', voice: 'surdoO', group: P, pat: '----X---' },
        { name: 'Pandeiro', voice: 'pandJ', group: P, pat: 'XoxXXoxX', v: 0.6 }
      ],
      bass: 'r---5---', comp: '--x---x-' },
    { id: 'reggae', name: 'Reggae', fill: 'snare', sig: '4/4', beats: 4, spb: 2, bars: 1, bpm: 76,
      tracks: [
        { name: 'Bumbo', voice: 'kick', group: B, pat: '----x---' },
        { name: 'Aro', voice: 'rim', group: B, pat: '----x---' },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'xXxXxXxX' }
      ],
      bass: 'r--r-5--', comp: '--x---x-' },
    { id: 'balada', name: 'Balada 12/8', fill: 'snare', sig: '12/8', beats: 4, spb: 3, bars: 1, bpm: 66,
      tracks: [
        { name: 'Bumbo', voice: 'kick', group: B, pat: 'x----xx-----' },
        { name: 'Caixa', voice: 'snare', group: B, pat: '---x-----x--' },
        { name: 'Chimbal', voice: 'hh', group: B, pat: 'XxxXxxXxxXxx' }
      ],
      bass: 'r-----r--5--', comp: 'x--x--x--x--' },
    { id: 'metro', name: 'Só metrônomo', sig: '4/4', beats: 4, spb: 1, bars: 1, bpm: 80,
      tracks: [
        { name: 'Clique forte', voice: 'clickH', group: 'Metrônomo', pat: 'x---' },
        { name: 'Clique fraco', voice: 'clickL', group: 'Metrônomo', pat: '-xxx' }
      ],
      bass: 'r---', comp: 'X---' }
  ];

  /* Estende cada padrão para o comprimento total do ciclo do ritmo. */
  RHYTHMS.forEach(function (r) {
    var len = r.beats * r.spb * r.bars;
    var full = function (p) { var s = ''; while (s.length < len) s += p; return s.slice(0, len); };
    r.tracks.forEach(function (t) { t.pat = full(t.pat); });
    r.bass = full(r.bass);
    r.comp = full(r.comp);
  });

  var PRESETS = [
    { id: 'p-251', title: 'II–V–I maior (descendo em tons)', text:
      '[1] | Dm7 | G7 | C7M | % |\n[2] | Cm7 | F7 | Bb7M | % |\n[3] | Bbm7 | Eb7 | Ab7M | % |\n' +
      '[4] | Abm7 | Db7 | Gb7M | % |\n[5] | F#m7 | B7 | E7M | % |\n[6] | Em7 | A7 | D7M | % |' },
    { id: 'p-251m', title: 'II–V–I menor', text:
      '[1] | Dm7(b5) | G7(b9) | Cm6 | % |\n[2] | Gm7(b5) | C7(b9) | Fm6 | % |\n' +
      '[3] | Cm7(b5) | F7(b9) | Bbm6 | % |\n[4] | Am7(b5) | D7(b9) | Gm6 | % |' },
    { id: 'p-blues', title: 'Blues em Fá', text:
      '| F7 | Bb7 | F7 | % |\n| Bb7 | % | F7 | D7 |\n| Gm7 | C7 | F7 D7 | Gm7 C7 |' },
    { id: 'p-bluesm', title: 'Blues menor em Dó', text:
      '| Cm7 | Fm7 | Cm7 | % |\n| Fm7 | % | Cm7 | % |\n| Ab7 | G7 | Cm7 | G7 |' },
    { id: 'p-turn', title: 'Turnaround I–VI–II–V', text: '| C7M A7 | Dm7 G7 | Em7 A7 | Dm7 G7 |' },
    { id: 'p-samba', title: 'Cadência de samba com diminuto', text:
      '[A] | C6 | C#dim | Dm7 | G7 |\n| Dm7 | G7 | C6 | A7 |\n[B] | Dm7 | % | G7 | % |\n| Em7 | A7 | Dm7 | G7 |' },
    { id: 'p-ciclo', title: 'Ciclo de quartas em Lá menor', text:
      '| Am7 | D7(9) | G7M | C7M |\n| F#m7(b5) | B7(b9) | Em7 | E7(b9) |' },
    { id: 'p-baiao', title: 'Baião modal (mixolídio)', text: '[A] | D7(9) | % | C/D | % |\n[B] | G7 | % | D7(9) | % |' },
    { id: 'p-casas', title: 'Ritornelo com casas de 1ª e 2ª vez', text:
      '[A] |: C7M | A7 | Dm7 | G7 |\n| 1. Em7 A7 | Dm7 G7 :| 2. Gm7 C7 | F7M |\n[B] | Fm6 | C7M | Dm7 G7 | C6 |' },
    { id: 'p-vamp', title: 'Um acorde só (vamp)', text: '| Dm7 | % | % | % |' }
  ];

  var api = {
    NOTES: NOTES, parseChord: parseChord, transposeSym: transposeSym, voicing: voicing,
    bassMidi: bassMidi, parseChart: parseChart, playOrder: playOrder, buildTimeline: buildTimeline,
    RHYTHMS: RHYTHMS, PRESETS: PRESETS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Music = api;
})(this);
