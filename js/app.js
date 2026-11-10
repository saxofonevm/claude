/* Levada — interface e sequenciador. */
(function () {
  'use strict';
  var M = window.Music, E = window.Engine;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'levada.v1';

  /* ---------- Estado ---------- */
  var S = {
    rhythmId: 'samba', songId: 'p-samba', bpm: 96, transpose: 0, countIn: true, ramp: 0,
    mix: {},    // mix[ritmo][canal] = { v: volume, m: mudo }
    edits: {},  // edits[ritmo][canal] = padrão alterado
    songs: []   // progressões criadas ou alteradas: { id, title, text }
  };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') Object.keys(S).forEach(function (k) { if (k in saved) S[k] = saved[k]; });
  } catch (e) { /* sem armazenamento: segue com o padrão */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* idem */ } }

  function rhythm() {
    return M.RHYTHMS.filter(function (r) { return r.id === S.rhythmId; })[0] || M.RHYTHMS[0];
  }
  function allSongs() {
    var over = {};
    S.songs.forEach(function (s) { over[s.id] = s; });
    var list = M.PRESETS.map(function (p) { return over[p.id] || p; });
    S.songs.forEach(function (s) { if (s.id.indexOf('p-') !== 0) list.push(s); });
    return list;
  }
  function song() {
    var l = allSongs();
    return l.filter(function (s) { return s.id === S.songId; })[0] || l[0];
  }

  /* Canais do ritmo atual: instrumentos + baixo + acordes. */
  function channels() {
    var r = rhythm(), ed = S.edits[r.id] || {};
    var list = r.tracks.map(function (t, i) {
      return { id: 't' + i, name: t.name, group: t.group, voice: t.voice, pat: ed['t' + i] || t.pat,
        base: t.pat, v: t.v || 0.8, off: !!t.off, cycle: '-xXo' };
    });
    list.push({ id: 'bass', name: 'Baixo', group: 'Harmonia', pat: ed.bass || r.bass, base: r.bass, v: 0.8, cycle: '-r58N37aw', h: true });
    list.push({ id: 'comp', name: 'Acordes', group: 'Harmonia', pat: ed.comp || r.comp, base: r.comp, v: 0.7, cycle: '-xXn', h: true });
    return list;
  }
  function mixOf(c) {
    var m = (S.mix[S.rhythmId] || {})[c.id];
    return m || { v: c.v, m: !!c.off };
  }
  function setMix(c, patch) {
    var cur = mixOf(c), m = S.mix[S.rhythmId] || (S.mix[S.rhythmId] = {});
    m[c.id] = { v: 'v' in patch ? patch.v : cur.v, m: 'm' in patch ? patch.m : cur.m };
    applyVolumes();
    save();
  }
  function applyVolumes() {
    CH.forEach(function (c) { var m = mixOf(c); E.setVol(c.id, m.m ? 0 : m.v); });
  }

  var CH = [], CHART = { rows: [], bars: [] }, TL = [];
  var startBar = 0;

  function rebuild() {
    CH = channels();
    CHART = M.parseChart(song().text);
    TL = M.buildTimeline(CHART.bars, rhythm().beats, S.transpose);
    if (startBar >= CHART.bars.length) startBar = 0;
  }

  /* ---------- Sequenciador ---------- */
  var P = null, timer = null, queue = [], raf = 0, wake = null;

  function stepDur() { return 60 / S.bpm / rhythm().spb; }

  function play(fromBar, noCount) {
    E.init();
    E.resume();
    applyVolumes();
    stop(true);
    var r = rhythm();
    P = { bar: fromBar || 0, step: 0, count: (S.countIn && !noCount) ? r.beats * r.spb : 0, t: E.now() + 0.08 };
    timer = setInterval(tick, 25);
    tick();
    raf = requestAnimationFrame(draw);
    $('play').classList.add('on');
    $('play').setAttribute('aria-label', 'Parar');
    $('play-icon').setAttribute('d', 'M6 5h12v14H6z');
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }, function () {});
  }

  function stop(silent) {
    clearInterval(timer);
    timer = null;
    cancelAnimationFrame(raf);
    queue = [];
    P = null;
    if (wake) { wake.release().catch(function () {}); wake = null; }
    if (silent) return;
    $('play').classList.remove('on');
    $('play').setAttribute('aria-label', 'Tocar');
    $('play-icon').setAttribute('d', 'M7 4l14 8-14 8z');
    mark(-1, -1, -1);
  }

  function tick() {
    while (P && P.t < E.now() + 0.12) {
      schedule(P.t);
      P.t += stepDur();
    }
  }

  function nextHit(pat, idx, max) {
    for (var d = 1; d < max; d++) if (pat[(idx + d) % pat.length] !== '-') return d;
    return max;
  }

  function schedule(t) {
    var r = rhythm(), spbar = r.beats * r.spb, sd = stepDur();
    if (P.count > 0) {
      var done = spbar - P.count;
      if (done % r.spb === 0) {
        E.hit(done === 0 ? 'clickH' : 'clickL', 'click', t, 1);
        queue.push({ t: t, bar: -1, step: -1, beat: done / r.spb });
      }
      P.count--;
      return;
    }
    var n = TL.length;
    if (!n) return;
    var bar = P.bar % n, step = P.step, beat = Math.floor(step / r.spb);
    var idx = (bar % r.bars) * spbar + step;
    var cur = TL[bar][beat];
    var nxt = beat + 1 < r.beats ? TL[bar][beat + 1] : TL[(bar + 1) % n][0];

    CH.forEach(function (c) {
      var ch = c.pat[idx];
      if (!ch || ch === '-' || mixOf(c).m) return;
      if (!c.h) {
        E.hit(c.voice, c.id, t, ch === 'X' ? 1 : ch === 'o' ? 0.3 : 0.7);
      } else if (c.id === 'bass') {
        var midi = bassNote(ch, cur, nxt, beat, bar);
        if (midi !== null) E.bass(midi, t, nextHit(c.pat, idx, spbar) * sd * 0.92);
      } else {
        var chord = ch === 'n' ? nxt.ch : cur.ch;
        if (chord) E.chord(M.voicing(chord), t, ch === 'X' ? Math.min(2.5, nextHit(c.pat, idx, spbar) * sd) : 0.24);
      }
    });
    queue.push({ t: t, bar: bar, step: idx, beat: beat });

    P.step++;
    if (P.step >= spbar) {
      P.step = 0;
      P.bar++;
      if (P.bar >= n) {
        P.bar = 0;
        if (S.ramp > 0) setBpm(S.bpm + S.ramp);
      }
    }
  }

  function bassNote(ch, cur, nxt, beat, bar) {
    var c = cur.ch;
    if (ch === 'N' || ch === 'a') {
      if (!nxt.ch) return null;
      return M.bassMidi(nxt.ch.bassPc) - (ch === 'a' ? 1 : 0);
    }
    if (!c) return null;
    var low = M.bassMidi(c.rootPc);
    var fit = function (m) { return m > 46 ? m - 12 : m; };
    if (ch === 'w') {
      if (cur.start || beat === 0) return M.bassMidi(c.bassPc);
      if (nxt.start && nxt.ch) return M.bassMidi(nxt.ch.bassPc) + (bar % 2 ? 1 : -1);
      var tones = [c.third, c.fifth, c.seventh !== null ? c.seventh : (c.sixth ? 9 : 12)];
      return fit(low + tones[(beat + bar) % 3]);
    }
    switch (ch) {
      case 'r': return M.bassMidi(c.bassPc);
      case '3': return fit(low + c.third);
      case '5': return fit(low + c.fifth);
      case '7': return fit(low + (c.seventh !== null ? c.seventh : c.sixth ? 9 : 12));
      case '8': return low + 12;
    }
    return null;
  }

  /* ---------- Indicadores visuais em sincronia com o áudio ---------- */
  var barEls = [], cellCols = [], beatEls = [], shown = { bar: -2, step: -2, beat: -2 };

  function draw() {
    var now = E.now(), ev = null;
    while (queue.length && queue[0].t <= now) ev = queue.shift();
    if (ev) mark(ev.bar, ev.step, ev.beat);
    raf = requestAnimationFrame(draw);
  }

  function mark(bar, step, beat) {
    if (bar !== shown.bar) {
      if (barEls[shown.bar]) barEls[shown.bar].classList.remove('now');
      if (barEls[bar]) {
        barEls[bar].classList.add('now');
        var rect = barEls[bar].getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight - 170) barEls[bar].scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
    if (step !== shown.step) {
      (cellCols[shown.step] || []).forEach(function (el) { el.classList.remove('now'); });
      (cellCols[step] || []).forEach(function (el) { el.classList.add('now'); });
    }
    if (beat !== shown.beat) beatEls.forEach(function (el, i) { el.classList.toggle('on', i === beat); });
    shown = { bar: bar, step: step, beat: beat };
  }

  /* ---------- Desenho ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function chordEl(tok) {
    if (tok === '%') return el('span', 'ch rep', '%');
    var sym = M.transposeSym(tok, S.transpose);
    var span = el('span', 'ch' + (M.parseChord(sym) ? '' : ' bad'));
    var m = /^([A-G][#b]?)(.*)$/.exec(sym);
    if (!m) { span.textContent = sym; return span; }
    var pretty = function (s) { return s.replace(/b/g, '♭').replace(/#/g, '♯'); };
    span.appendChild(document.createTextNode(pretty(m[1])));
    if (m[2]) span.appendChild(el('small', '', m[2].replace(/([b#])(?=\d)/g, pretty).replace(/\/([A-G])([b#]?)/, function (_, n, a) { return '/' + n + pretty(a); })));
    return span;
  }

  function renderChart() {
    var s = song(), r = rhythm(), box = $('chart');
    $('song-title').textContent = s.title;
    $('sig').textContent = r.sig;
    box.textContent = '';
    barEls = [];
    CHART.rows.forEach(function (row) {
      for (var i = 0; i < row.bars.length; i += 4) {
        var line = el('div', 'row');
        line.appendChild(i === 0 && row.label ? el('span', 'row-label', row.label) : el('span'));
        row.bars.slice(i, i + 4).forEach(function (bar) {
          var b = el('button', 'bar' + (bar.index === startBar && startBar > 0 ? ' start' : ''));
          b.type = 'button';
          b.setAttribute('aria-label', 'Compasso ' + (bar.index + 1));
          bar.chords.slice(0, r.beats).forEach(function (t) { b.appendChild(chordEl(t)); });
          b.addEventListener('click', function () {
            startBar = bar.index;
            if (P) play(startBar, true);
            else renderChart();
          });
          barEls[bar.index] = b;
          line.appendChild(b);
        });
        box.appendChild(line);
      }
    });
    if (!CHART.bars.length) box.appendChild(el('p', 'hint', 'Progressão vazia. Toque em Editar para escrever os acordes.'));
    shown.bar = -2;
  }

  function renderMixer() {
    var box = $('mixer'), group = null;
    box.textContent = '';
    CH.forEach(function (c) {
      if (c.group !== group) { group = c.group; box.appendChild(el('h3', 'group', group)); }
      var m = mixOf(c), strip = el('div', 'strip');
      var btn = el('button', 'mute');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(!m.m));
      btn.title = 'Ligar ou silenciar ' + c.name;
      btn.appendChild(el('span', '', c.name));
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!on));
        setMix(c, { m: on });
      });
      var vol = el('input');
      vol.type = 'range'; vol.min = 0; vol.max = 1; vol.step = 0.05; vol.value = m.v;
      vol.id = 'vol-' + S.rhythmId + '-' + c.id;
      vol.setAttribute('aria-label', 'Volume de ' + c.name);
      vol.addEventListener('input', function () { setMix(c, { v: +vol.value }); });
      strip.appendChild(btn);
      strip.appendChild(vol);
      box.appendChild(strip);
    });
  }

  function renderGrid() {
    var r = rhythm(), len = r.beats * r.spb * r.bars, spbar = r.beats * r.spb, box = $('grid');
    box.textContent = '';
    box.style.gridTemplateColumns = 'auto repeat(' + len + ', 22px)';
    cellCols = [];
    CH.forEach(function (c) {
      box.appendChild(el('span', 'g-name', c.name));
      for (var i = 0; i < len; i++) (function (i) {
        var cell = el('button', 'cell' + (c.h ? ' h' : '') + (i % spbar === 0 ? ' bar1' : i % r.spb === 0 ? ' beat' : ''));
        cell.type = 'button';
        var paint = function () {
          var v = c.pat[i];
          cell.dataset.v = v;
          cell.textContent = c.h && v !== '-' ? v : '';
          cell.setAttribute('aria-label', c.name + ', casa ' + (i + 1) + ': ' + (v === '-' ? 'pausa' : v));
        };
        paint();
        cell.addEventListener('click', function () {
          var next = c.cycle[(c.cycle.indexOf(c.pat[i]) + 1) % c.cycle.length];
          c.pat = c.pat.slice(0, i) + next + c.pat.slice(i + 1);
          (S.edits[r.id] || (S.edits[r.id] = {}))[c.id] = c.pat;
          save();
          paint();
        });
        (cellCols[i] || (cellCols[i] = [])).push(cell);
        box.appendChild(cell);
      })(i);
    });
    shown.step = -2;
  }

  function renderBeats() {
    var box = $('beats');
    box.textContent = '';
    beatEls = [];
    for (var i = 0; i < rhythm().beats; i++) { var d = el('i'); beatEls.push(d); box.appendChild(d); }
    shown.beat = -2;
  }

  function renderSelects() {
    var rs = $('rhythm'), ss = $('song');
    rs.textContent = '';
    M.RHYTHMS.forEach(function (r) {
      var o = el('option', '', r.name + ' · ' + r.sig);
      o.value = r.id;
      rs.appendChild(o);
    });
    rs.value = rhythm().id;
    ss.textContent = '';
    allSongs().forEach(function (s) {
      var o = el('option', '', s.title);
      o.value = s.id;
      ss.appendChild(o);
    });
    ss.value = song().id;
  }

  function renderTranspose() {
    var n = S.transpose;
    $('tr-val').textContent = n === 0 ? 'Original' : (n > 0 ? '+' + n : '−' + (-n)) + ' st';
  }

  function setBpm(v) {
    S.bpm = Math.max(40, Math.min(260, Math.round(v)));
    $('bpm').value = S.bpm;
    $('bpm-val').textContent = S.bpm;
    save();
  }

  function refresh(restart) {
    rebuild();
    renderChart();
    renderMixer();
    renderGrid();
    renderBeats();
    renderTranspose();
    if (E.now()) applyVolumes();
    if (restart && P) play(0, true);
    save();
  }

  /* ---------- Eventos ---------- */
  $('play').addEventListener('click', function () { if (P) stop(); else play(startBar); });
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' || /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) || $('editor').open) return;
    e.preventDefault();
    $('play').click();
  });

  $('rhythm').addEventListener('change', function () {
    S.rhythmId = this.value;
    setBpm(rhythm().bpm);
    refresh(true);
  });
  $('song').addEventListener('change', function () {
    S.songId = this.value;
    startBar = 0;
    refresh(true);
  });
  function transposeBy(d) {
    S.transpose = Math.max(-11, Math.min(11, S.transpose + d));
    rebuild();
    renderChart();
    renderTranspose();
    save();
  }
  $('tr-down').addEventListener('click', function () { transposeBy(-1); });
  $('tr-up').addEventListener('click', function () { transposeBy(1); });

  $('bpm').addEventListener('input', function () { setBpm(+this.value); });
  $('bpm-down').addEventListener('click', function () { setBpm(S.bpm - 1); });
  $('bpm-up').addEventListener('click', function () { setBpm(S.bpm + 1); });
  var taps = [];
  $('tap').addEventListener('click', function () {
    var now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
    taps.push(now);
    if (taps.length > 5) taps.shift();
    if (taps.length >= 2) setBpm(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
  });
  $('countin').addEventListener('change', function () { S.countIn = this.checked; save(); });
  $('ramp').addEventListener('change', function () {
    S.ramp = Math.max(0, Math.min(20, Math.round(+this.value) || 0));
    this.value = S.ramp;
    save();
  });

  function showTab(grid) {
    $('tab-mixer').setAttribute('aria-selected', String(!grid));
    $('tab-grid').setAttribute('aria-selected', String(grid));
    $('mixer').hidden = grid;
    $('grid-pane').hidden = !grid;
  }
  $('tab-mixer').addEventListener('click', function () { showTab(false); });
  $('tab-grid').addEventListener('click', function () { showTab(true); });
  $('grid-reset').addEventListener('click', function () {
    delete S.edits[S.rhythmId];
    refresh(false);
  });

  /* Editor de progressão */
  var editing = null;
  function openEditor(s) {
    editing = s;
    var isPreset = s.id.indexOf('p-') === 0;
    var changed = S.songs.some(function (x) { return x.id === s.id; });
    $('ed-title').value = s.title;
    $('ed-text').value = s.text;
    $('ed-error').hidden = true;
    $('ed-delete').hidden = !changed;
    $('ed-delete').textContent = isPreset ? 'Restaurar original' : 'Excluir';
    $('editor').showModal();
  }
  $('edit').addEventListener('click', function () { openEditor(song()); });
  $('new').addEventListener('click', function () {
    openEditor({ id: 'c-' + Date.now(), title: 'Minha progressão', text: '[A] | Dm7 | G7 | C7M | % |' });
  });
  $('ed-cancel').addEventListener('click', function () { $('editor').close(); });
  $('ed-delete').addEventListener('click', function () {
    S.songs = S.songs.filter(function (x) { return x.id !== editing.id; });
    $('editor').close();
    renderSelects();
    refresh(true);
  });
  $('editor-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = $('ed-text').value, parsed = M.parseChart(text), bad = [];
    parsed.bars.forEach(function (b) {
      b.chords.forEach(function (t) { if (t !== '%' && !M.parseChord(t) && bad.indexOf(t) < 0) bad.push(t); });
    });
    var err = !parsed.bars.length ? 'Escreva ao menos um compasso entre barras, por exemplo | C7M |.'
      : bad.length ? 'Não reconheci: ' + bad.join(', ') + '. Confira a escrita desses acordes.' : '';
    $('ed-error').textContent = err;
    $('ed-error').hidden = !err;
    if (err) return;
    var item = { id: editing.id, title: $('ed-title').value.trim() || 'Sem título', text: text };
    S.songs = S.songs.filter(function (x) { return x.id !== item.id; }).concat([item]);
    S.songId = item.id;
    startBar = 0;
    $('editor').close();
    renderSelects();
    refresh(true);
  });

  /* ---------- Início ---------- */
  $('countin').checked = S.countIn;
  $('ramp').value = S.ramp;
  renderSelects();
  setBpm(S.bpm);
  refresh(false);
})();
