/* Levada — motor de áudio (Web Audio). Todos os timbres são sintetizados,
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

  var ctx = null, master = null, noiseBuf = null, chans = {}, samples = {};

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
    loadSamples();
    return ctx;
  }

  /* Amostras gravadas (opcionais). samples/index.json mapeia timbre -> arquivo,
     por exemplo { "surdoO": "surdo-aberto.wav" }. O que não tiver amostra
     continua sintetizado. */
  function loadSamples() {
    if (!root.fetch) return;
    fetch('samples/index.json').then(function (r) { return r.ok ? r.json() : {}; }).then(function (map) {
      Object.keys(map).forEach(function (voice) {
        if (!VOICES[voice]) return;
        fetch('samples/' + map[voice])
          .then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
          .then(function (buf) { return ctx.decodeAudioData(buf); })
          .then(function (audio) { samples[voice] = audio; })
          .catch(function () { /* arquivo ausente ou inválido: fica o sintetizado */ });
      });
    }).catch(function () { /* sem pasta de amostras */ });
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
    if (samples[voice]) {
      var s = ctx.createBufferSource(), sg = ctx.createGain();
      s.buffer = samples[voice];
      sg.gain.value = vel;
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
    init: init, setVol: setVol, hit: hit, bass: bass, chord: chord,
    now: function () { return ctx ? ctx.currentTime : 0; },
    resume: function () { return ctx && ctx.state !== 'running' ? ctx.resume() : null; }
  };
})(this);
