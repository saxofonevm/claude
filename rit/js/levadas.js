/* Naipe Rit — Levadas gravadas (áudios reais em loop).
   Cadastro em levadas/levadas.json; áudios em levadas/audios/. Veja levadas/LEIA-ME.md.
   Uma gravação toca no andamento em que foi gravada (mudar o andamento mudaria a afinação). */
(function () {
  'use strict';
  var M = window.Music;
  var $ = function (id) { return document.getElementById(id); };
  var LISTA = [], ctx = null, fonte = null, ganho = null, atual = null, t0 = 0, raf = 0, buffers = {};
  var SAX = { '': 0, Mib: 9, Sib: 2 };
  var TEMPOS = { '2/4': 2, '3/4': 3, '4/4': 4, '6/8': 2, '12/8': 4 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function saxAtual() { return (window.RitApp && window.RitApp.sax()) || ''; }

  function duracaoCompasso(l) { return (TEMPOS[l.compasso] || 4) * 60 / l.bpm; }

  function cifraHtml(l) {
    if (!l.cifra || !M) return '';
    var n = SAX[saxAtual()] || 0, sust = M.prefersSharps ? M.prefersSharps(l.cifra, n) : false;
    var comps = l.cifra.split('|').map(function (c) { return c.trim(); }).filter(function (c) { return c; });
    return '<div class="lev-cifra">' + comps.map(function (c, i) {
      return '<span class="lev-comp" data-i="' + i + '">' + esc(c.split(/\s+/).map(function (t) {
        return /^[A-G]/.test(t) ? (M.transposeSymKey ? M.transposeSymKey(t, n, sust) : M.transposeSym(t, n)) : t;
      }).join(' ')) + '</span>';
    }).join('') + '</div>';
  }

  function render() {
    var box = $('levadas');
    if (!box) return;
    if (!LISTA.length) { box.hidden = true; return; }
    box.hidden = false;
    var estilos = [];
    LISTA.forEach(function (l) { if (estilos.indexOf(l.estilo) < 0) estilos.push(l.estilo); });
    box.innerHTML = '<div class="lev-topo"><span class="rotulo">Levadas do Tiago</span><small>Gravações reais. Tocam no andamento em que foram gravadas.</small></div>' +
      estilos.map(function (e) {
        return '<div class="lev-grupo"><span class="lev-estilo">' + esc(e) + '</span><div class="lev-lista">' +
          LISTA.filter(function (l) { return l.estilo === e; }).map(function (l) {
            var on = atual && atual.id === l.id;
            return '<button type="button" class="lev-item' + (on ? ' ativo' : '') + '" data-lev="' + esc(l.id) + '"><strong>' + esc(l.nome) + '</strong><small>♩ ' + l.bpm + ' · ' + esc(l.compasso || '4/4') + (l.compassos ? ' · ' + l.compassos + ' comp.' : '') + '</small></button>';
          }).join('') + '</div></div>';
      }).join('') +
      (atual ? '<div class="lev-player"><button type="button" class="lev-play" id="lev-play">' + (fonte ? '■ Parar' : '▶ Tocar a levada') + '</button>' +
        '<label class="lev-vol">Volume<input type="range" id="lev-vol" min="0" max="100" value="' + Math.round((ganho ? ganho.gain.value : 0.9) * 100) + '"></label>' +
        cifraHtml(atual) + (atual.cifra ? '<small class="lev-nota">' + (saxAtual() ? 'Cifra escrita para o sax em ' + saxAtual() + '.' : 'Cifra em som real (Dó).') + '</small>' : '') +
        '<p class="lev-erro" id="lev-erro" hidden></p></div>' : '');
  }

  function carregarAudio(l) {
    if (buffers[l.id]) return Promise.resolve(buffers[l.id]);
    return fetch('levadas/audios/' + encodeURIComponent(l.arquivo))
      .then(function (r) { if (!r.ok) throw new Error('arquivo'); return r.arrayBuffer(); })
      .then(function (ab) { return new Promise(function (ok, erro) { ctx.decodeAudioData(ab, ok, erro); }); })
      .then(function (b) { buffers[l.id] = b; return b; });
  }

  function parar() {
    if (fonte) { try { fonte.stop(); } catch (e) { /* já parou */ } fonte.disconnect(); fonte = null; }
    cancelAnimationFrame(raf);
    document.querySelectorAll('.lev-comp.now').forEach(function (e) { e.classList.remove('now'); });
  }

  function tocar() {
    if (!atual) return;
    if (window.RitApp) window.RitApp.stop(); // a banda sintetizada para quando a gravação toca
    var C = window.AudioContext || window.webkitAudioContext;
    if (!ctx) { ctx = new C(); ganho = ctx.createGain(); ganho.gain.value = 0.9; ganho.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume();
    var l = atual;
    carregarAudio(l).then(function (buf) {
      if (atual !== l) return;
      parar();
      var ini = Math.max(0, +l.inicio || 0), fimLoop = l.compassos ? ini + l.compassos * duracaoCompasso(l) : buf.duration;
      fonte = ctx.createBufferSource(); fonte.buffer = buf; fonte.loop = true;
      fonte.loopStart = ini; fonte.loopEnd = Math.min(buf.duration, fimLoop);
      fonte.connect(ganho); fonte.start(0, ini); t0 = ctx.currentTime;
      render(); animar();
    }).catch(function () {
      render();
      var e = $('lev-erro'); if (e) { e.hidden = false; e.textContent = 'Não consegui abrir o áudio "' + l.arquivo + '". Confira o nome do arquivo na pasta levadas/audios.'; }
    });
  }

  function animar() {
    if (!fonte || !atual || !atual.compassos) return;
    var dc = duracaoCompasso(atual), total = atual.compassos * dc;
    var pos = ((ctx.currentTime - t0) % total + total) % total, i = Math.floor(pos / dc);
    var comps = document.querySelectorAll('.lev-comp');
    if (comps.length) comps.forEach(function (e, k) { e.classList.toggle('now', k === i % comps.length); });
    raf = requestAnimationFrame(animar);
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-lev]');
    if (b) {
      var l = LISTA.filter(function (x) { return x.id === b.dataset.lev; })[0];
      var tocava = !!fonte; parar();
      atual = l; render();
      if (tocava) tocar();
      return;
    }
    if (ev.target.closest('#lev-play')) { if (fonte) { parar(); render(); } else tocar(); }
  });
  document.addEventListener('input', function (ev) {
    if (ev.target.id === 'lev-vol' && ganho) ganho.gain.value = ev.target.value / 100;
  });

  window.RitLevadas = {
    parar: function () { parar(); render(); },
    redesenhar: render
  };

  fetch('levadas/levadas.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : { levadas: [] }; })
    .then(function (d) {
      LISTA = (d.levadas || []).filter(function (l) { return l && l.id && l.arquivo && l.bpm; });
      var pedida = null;
      try { pedida = new URLSearchParams(location.search).get('levada'); } catch (e) { /* sem parâmetros */ }
      if (pedida) {
        atual = LISTA.filter(function (l) { return l.id === pedida; })[0] || null;
        if (atual) setTimeout(function () { var el = $('levadas'); if (el) el.scrollIntoView({ block: 'start' }); }, 300);
      }
      render();
    })
    .catch(function () { LISTA = []; render(); });
})();
