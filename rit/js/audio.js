/* Naipe Rit — motor de áudio (Web Audio). Todos os timbres são sintetizados,
   sem amostras gravadas. */
(function (root) {
  'use strict';

  // Camadas de cada timbre: ['t', onda, freqInicial, freqFinal, duração, ganho]
  //                     ou  ['n', filtro, frequência, Q, duração, ganho]
  var VOICES = {
    kick: [['t', 'sine', 150, 45, 0.28, 1], ['n', 'lowpass', 1500, 1, 0.02, 0.3]],
    snare: [['n', 'highpass', 1500, 1, 0.16, 0.7], ['t', 'triangle', 200, 140, 0.1, 0.5]],
    caixa: [['n', 'highpass', 2500, 1, 0.09, 0.6], ['t', 'triangle', 260, 200, 0.05, 0.3]],
    rim: [['t', 'triangle', 820, 800, 0.035, 0.7], ['n', 'bandpass', 2600, 3, 0.025, 0.5]],
    hh: [['n', 'highpass', 7500, 1, 0.045, 0.45]],
    ride: [['n', 'bandpass', 8500, 2, 0.35, 0.3], ['t', 'square', 5300, 5300, 0.06, 0.04]],
    surdoO: [['t', 'sine', 105, 68, 0.55, 1]],
    surdoM: [['t', 'sine', 95, 80, 0.1, 0.8], ['n', 'lowpass', 900, 1, 0.02, 0.3]],
    tamb: [['n', 'bandpass', 3800, 4, 0.05, 0.8], ['t', 'triangle', 1100, 900, 0.03, 0.3]],
    agoH: [['t', 'square', 1175, 1175, 0.16, 0.16], ['t', 'sine', 1760, 1760, 0.2, 0.3]],
    agoL: [['t', 'square', 784, 784, 0.18, 0.16], ['t', 'sine', 1175, 1175, 0.22, 0.3]],
    pandJ: [['n', 'highpass', 6500, 1, 0.06, 0.5]],
    pandT: [['t', 'sine', 150, 95, 0.16, 0.8]],
    ganza: [['n', 'bandpass', 6000, 1.5, 0.07, 0.4]],
    triO: [['t', 'sine', 4300, 4300, 0.35, 0.2], ['t', 'sine', 5750, 5750, 0.3, 0.12]],
    triC: [['t', 'sine', 4300, 4300, 0.04, 0.2], ['t', 'sine', 5750, 5750, 0.04, 0.12]],
    zabL: [['t', 'sine', 120, 58, 0.3, 1], ['n', 'lowpass', 800, 1, 0.02, 0.3]],
    zabH: [['n', 'bandpass', 3000, 3, 0.04, 0.6], ['t', 'triangle', 480, 420, 0.03, 0.3]],
    alfaia: [['t', 'sine', 90, 60, 0.4, 1], ['n', 'lowpass', 600, 1, 0.03, 0.4]],
    congaH: [['t', 'sine', 340, 300, 0.14, 0.7]],
    congaL: [['t', 'sine', 215, 185, 0.25, 0.8]],
    cow: [['t', 'square', 560, 560, 0.12, 0.15], ['t', 'square', 845, 845, 0.12, 0.12]],
    clickH: [['t', 'sine', 1600, 1600, 0.04, 0.6]],
    clickL: [['t', 'sine', 1000, 1000, 0.04, 0.5]]
  };

  var ctx = null, master = null, noiseBuf = null, chans = {};

  function init() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    loadPack();
    return ctx;
  }

  /* Gravações reais (samples/pack.js). Cada timbre de percussão aponta para uma
     peça gravada: [nota GM, afinação, duração máxima, ganho]. Enquanto o pacote
     não carrega (ou se faltar), o som sintetizado serve de reserva. */
  var DRUM = {
    kick: [36, 1, 0, 1], snare: [38, 1, 0, 0.9], caixa: [40, 1.15, 0.18, 0.8], rim: [37, 1, 0, 0.9],
    hh: [42, 1, 0, 0.6], ride: [51, 1, 0.9, 0.6],
    surdoO: [41, 0.72, 0, 1.2], surdoM: [41, 0.72, 0.13, 1.1], alfaia: [41, 0.6, 0, 1.2],
    tamb: [65, 1.5, 0.12, 0.8], agoH: [67, 1, 0, 0.8], agoL: [68, 1, 0, 0.8],
    pandJ: [54, 1, 0.14, 0.7], pandT: [61, 0.6, 0.25, 1], ganza: [70, 1, 0, 0.7],
    triO: [81, 1, 0, 0.7], triC: [80, 1, 0, 0.7],
    zabL: [35, 0.9, 0, 1.2], zabH: [60, 1.6, 0.1, 0.8],
    congaH: [63, 1, 0, 0.9], congaL: [64, 1, 0, 0.9], cow: [56, 1, 0, 0.6],
    clickH: [76, 1, 0, 0.9], clickL: [77, 1, 0, 0.8]
  };
  Object.keys(DRUM).forEach(function (k) { DRUM[k][3] *= 0.7; });
  var drumBuf = {}, instBuf = {}, pedidos = {}, espera = [];

  function decodificar(id, mapa) {
    var store = id === 'drums' ? drumBuf : (instBuf[id.replace(/^i-/, '')] = {});
    Object.keys(mapa).forEach(function (key) {
      var bin = atob(mapa[key]), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      ctx.decodeAudioData(bytes.buffer, function (buf) { store[key] = buf; }, function () {});
    });
  }
  // Cada arquivo de samples/ chama esta função ao carregar.
  root.NAIPE_SAMPLES = function (id, mapa) {
    if (ctx) decodificar(id, mapa); else espera.push([id, mapa]);
  };
  /* Carrega sob demanda samples/drums.js ou samples/i-<instrumento>.js. */
  function load(id) {
    if (pedidos[id] || !root.document) return;
    pedidos[id] = true;
    var sc = document.createElement('script');
    sc.src = 'samples/' + (id === 'drums' ? 'drums' : 'i-' + id) + '.js';
    sc.onerror = function () { pedidos[id] = false; };
    document.head.appendChild(sc);
  }
  function loadPack() {
    espera.forEach(function (e) { decodificar(e[0], e[1]); });
    espera = [];
    load('drums');
  }

  /* Toca uma nota gravada do instrumento, afinando a amostra mais próxima.
     Devolve false se o instrumento ainda não estiver carregado. */
  function note(inst, midi, t, dur, chanId, vel) {
    var bank = instBuf[inst], best = null;
    if (!bank) return false;
    Object.keys(bank).forEach(function (n) {
      if (best === null || Math.abs(n - midi) < Math.abs(best - midi)) best = +n;
    });
    if (best === null) return false;
    var src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = bank[best];
    src.playbackRate.value = Math.pow(2, (midi - best) / 12);
    g.gain.setValueAtTime(vel, t);
    g.gain.setValueAtTime(vel, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.1);
    src.connect(g);
    g.connect(chan(chanId));
    src.start(t);
    src.stop(t + dur + 0.12);
    return true;
  }

  function chan(id) {
    if (!chans[id]) {
      chans[id] = ctx.createGain();
      chans[id].connect(master);
    }
    return chans[id];
  }

  function setVol(id, v) {
    if (!ctx) return;
    chan(id).gain.setTargetAtTime(v, ctx.currentTime, 0.01);
  }

  function env(t, dur, peak, attack) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + (attack || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    return g;
  }

  function hit(voice, chanId, t, vel) {
    var layers = VOICES[voice], out = chan(chanId);
    if (!layers) return;
    var d = DRUM[voice];
    if (d && drumBuf[d[0]]) {
      var s = ctx.createBufferSource(), sg = ctx.createGain();
      s.buffer = drumBuf[d[0]];
      s.playbackRate.value = d[1];
      sg.gain.setValueAtTime(vel * d[3], t);
      if (d[2]) {
        sg.gain.setValueAtTime(vel * d[3], t + d[2] * 0.6);
        sg.gain.linearRampToValueAtTime(0, t + d[2]);
      }
      s.connect(sg);
      sg.connect(out);
      s.start(t);
      return;
    }
    layers.forEach(function (l) {
      var src, g = env(t, l[4], l[5] * vel);
      if (l[0] === 't') {
        src = ctx.createOscillator();
        src.type = l[1];
        src.frequency.setValueAtTime(l[2], t);
        if (l[3] !== l[2]) src.frequency.exponentialRampToValueAtTime(l[3], t + l[4]);
        src.connect(g);
      } else {
        src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;
        var f = ctx.createBiquadFilter();
        f.type = l[1];
        f.frequency.value = l[2];
        f.Q.value = l[3];
        src.connect(f);
        f.connect(g);
      }
      g.connect(out);
      src.start(t);
      src.stop(t + l[4] + 0.02);
    });
  }

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function bass(midi, t, dur) {
    var f = hz(midi), d = Math.max(0.08, dur);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(260, t + d);
    var g = env(t, d, 0.7, 0.006);
    [['sawtooth', 0.5], ['sine', 1]].forEach(function (o) {
      var osc = ctx.createOscillator(), og = ctx.createGain();
      osc.type = o[0];
      osc.frequency.value = f;
      og.gain.value = o[1];
      osc.connect(og);
      og.connect(lp);
      osc.start(t);
      osc.stop(t + d + 0.02);
    });
    lp.connect(g);
    g.connect(chan('bass'));
  }

  function chord(midis, t, dur) {
    var d = Math.max(0.15, dur);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2800;
    var g = env(t, d, 0.22, 0.008);
    midis.forEach(function (m) {
      [['triangle', 1, 1], ['sine', 2, 0.25]].forEach(function (o) {
        var osc = ctx.createOscillator(), og = ctx.createGain();
        osc.type = o[0];
        osc.frequency.value = hz(m) * o[1];
        og.gain.value = o[2];
        osc.connect(og);
        og.connect(lp);
        osc.start(t);
        osc.stop(t + d + 0.02);
      });
    });
    lp.connect(g);
    g.connect(chan('comp'));
  }

  root.Engine = {
    init: init, setVol: setVol, hit: hit, bass: bass, chord: chord, note: note, load: load,
    now: function () { return ctx ? ctx.currentTime : 0; },
    resume: function () { return ctx && ctx.state !== 'running' ? ctx.resume() : null; }
  };
})(this);
