// Testes do núcleo musical:  node test/music.test.js
const assert = require('assert');
const M = require('../js/music.js');

const iv = (s) => M.parseChord(s).intervals;
assert.deepStrictEqual(iv('C'), [0, 4, 7]);
assert.deepStrictEqual(iv('Cm7'), [0, 3, 7, 10]);
assert.deepStrictEqual(iv('C7M'), [0, 4, 7, 11]);
assert.deepStrictEqual(iv('Cmaj7'), [0, 4, 7, 11]);
assert.deepStrictEqual(iv('Dm7(b5)'), [0, 3, 6, 10]);
assert.deepStrictEqual(iv('G7(b9)'), [0, 4, 7, 10, 13]);
assert.deepStrictEqual(iv('C#dim'), [0, 3, 6, 9]);
assert.deepStrictEqual(iv('Cm6'), [0, 3, 7, 9]);
assert.deepStrictEqual(iv('C6/9'), [0, 4, 7, 9, 14]);
assert.deepStrictEqual(iv('D7(9)'), [0, 4, 7, 10, 14]);
assert.deepStrictEqual(iv('C7sus4'), [0, 5, 7, 10]);
assert.deepStrictEqual(iv('Cadd9'), [0, 4, 7, 14]);
assert.deepStrictEqual(iv('C7M(#11)'), [0, 4, 7, 11, 18]);
assert.strictEqual(M.parseChord('C/E').bassPc, 4);
assert.strictEqual(M.parseChord('Bb7').rootPc, 10);
assert.strictEqual(M.parseChord('Xyz'), null);
assert.strictEqual(M.parseChord('Cfoo'), null);

assert.strictEqual(M.transposeSym('Dm7(b5)', 2), 'Em7(b5)');
assert.strictEqual(M.transposeSym('C/E', -1), 'B/Eb');
assert.strictEqual(M.transposeSym('Bb7', 3), 'Db7');

const chart = M.parseChart('[A] | Dm7 G7 | C7M | % |\n\n| F7 |');
assert.strictEqual(chart.bars.length, 4);
assert.strictEqual(chart.rows[0].label, 'A');
const tl = M.buildTimeline(chart.bars, 4, 0);
assert.strictEqual(tl[0][0].ch.sym, 'Dm7');
assert.strictEqual(tl[0][2].ch.sym, 'G7');
assert.strictEqual(tl[0][2].start, true);
assert.strictEqual(tl[2][0].ch.sym, 'C7M');
assert.strictEqual(tl[2][0].start, false);

M.voicing(M.parseChord('G7(b9)')).forEach((n) => assert.ok(n >= 55 && n <= 66));

const ok = { t: /^[-xXo]+$/, bass: /^[-r358N7aw]+$/, comp: /^[-xXn]+$/ };
M.RHYTHMS.forEach((r) => {
  const len = r.beats * r.spb * r.bars;
  r.tracks.forEach((t) => { assert.strictEqual(t.pat.length, len, r.id + ' ' + t.name); assert.ok(ok.t.test(t.pat)); });
  assert.ok(ok.bass.test(r.bass) && r.bass.length === len, r.id + ' baixo');
  assert.ok(ok.comp.test(r.comp) && r.comp.length === len, r.id + ' acordes');
});
M.PRESETS.forEach((p) => M.parseChart(p.text).bars.forEach((b) => b.chords.forEach((c) => {
  assert.ok(c === '%' || M.parseChord(c), p.id + ' ' + c);
})));
console.log('ok');
