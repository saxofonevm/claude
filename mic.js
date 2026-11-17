/*
 * Naipe — microfone compartilhado (lições da Teoria, gravador, afinador).
 * Abre o microfone com a melhor configuração que o aparelho aceitar, prepara o áudio
 * para análise e, quando algo falha, explica a causa real e como resolver.
 */
(function () {
  const ua = navigator.userAgent || "";
  const IOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const ANDROID = /Android/i.test(ua);
  // Navegadores embutidos em outros apps costumam bloquear o microfone.
  const EMBUTIDO = /Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|TikTok|musical_ly|Bytedance|GSA\//i.test(ua) || (ANDROID && /; wv\)/.test(ua));
  const NA_MOLDURA = (() => { try { return window.self !== window.top; } catch { return true; } })();

  const COMO_LIBERAR = IOS
    ? "No iPhone: abra Ajustes › Safari › Microfone e escolha Permitir (ou toque em “aA” na barra de endereço › Ajustes do site › Microfone). Depois recarregue a página."
    : ANDROID
      ? "No Android: toque no cadeado ao lado do endereço › Permissões › Microfone › Permitir. Se não aparecer, vá em Configurações › Apps › Chrome › Permissões › Microfone. Depois recarregue a página."
      : "No computador: clique no cadeado ao lado do endereço, permita o Microfone e recarregue a página.";

  function mensagem(err) {
    const nome = (err && err.name) || "";
    if (NA_MOLDURA) return { titulo: "Microfone bloqueado nesta janela", texto: "Dentro de uma prévia ou de outro site o navegador bloqueia o microfone. Abra o Naipe direto pelo endereço naipesax.com.br ou pelo app instalado." };
    if (!window.isSecureContext) return { titulo: "Endereço sem segurança", texto: "O microfone só funciona em endereços com https. Abra pelo endereço https://naipesax.com.br." };
    if (nome === "SemSuporte" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return EMBUTIDO
        ? { titulo: "Abra no navegador do celular", texto: "Você abriu o Naipe dentro de outro app (Instagram, Facebook ou similar), e ele não deixa usar o microfone. Toque nos três pontinhos e escolha “Abrir no navegador” (Safari ou Chrome)." }
        : { titulo: "Este navegador não usa o microfone", texto: "Atualize o navegador ou abra o Naipe no Chrome (Android) ou no Safari (iPhone)." };
    }
    if (nome === "NotAllowedError" || nome === "PermissionDeniedError" || nome === "SecurityError") {
      return EMBUTIDO
        ? { titulo: "Abra no navegador do celular", texto: "Este app não deixa o Naipe usar o microfone. Toque nos três pontinhos e escolha “Abrir no navegador” (Safari ou Chrome)." }
        : { titulo: "O microfone está bloqueado para o Naipe", texto: `Quando o celular perguntar, toque em Permitir. Se você já negou antes, ele não pergunta de novo. ${COMO_LIBERAR}` };
    }
    if (nome === "NotFoundError" || nome === "DevicesNotFoundError" || nome === "OverconstrainedError") return { titulo: "Nenhum microfone encontrado", texto: "O aparelho não mostrou nenhum microfone. Confira se há um fone com microfone desconectado pela metade ou tente outro aparelho." };
    if (nome === "NotReadableError" || nome === "TrackStartError" || nome === "AbortError") return { titulo: "O microfone está ocupado", texto: "Outro app está usando o microfone (ligação, gravador, WhatsApp, Instagram). Feche o outro app e toque de novo em Ligar o microfone." };
    return { titulo: "Não consegui ligar o microfone", texto: `Feche e abra o Naipe e tente de novo. ${COMO_LIBERAR}` };
  }

  // Estado da permissão sem perguntar nada (Chrome e Android). "denied" = já bloqueado.
  async function estado() {
    try { const s = await navigator.permissions.query({ name: "microphone" }); return s.state; } catch { return "desconhecido"; }
  }

  // Abre o microfone. Tenta primeiro sem os filtros de voz (melhor para afinação); se o aparelho
  // recusar a configuração, tenta de novo com o pedido mais simples.
  // iPhone (Safari 16.4+): "playback" toca o som mesmo com a chave do silencioso ligada;
  // "play-and-record" é o modo para usar o microfone e o alto-falante juntos.
  function sessao(tipo) { try { if (navigator.audioSession && navigator.audioSession.type !== tipo) navigator.audioSession.type = tipo; } catch { /* sem suporte */ } }

  async function abrir() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { const e = new Error("sem suporte"); e.name = "SemSuporte"; throw e; }
    sessao("play-and-record");
    const negado = err => err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError" || err.name === "SecurityError");
    try {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      } catch (err) {
        if (negado(err)) throw err;
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err) {
      // Alguns navegadores devolvem um erro genérico quando a permissão foi negada: confere o estado real.
      if (!negado(err) && (await estado()) === "denied") { const e = new Error("negado"); e.name = "NotAllowedError"; throw e; }
      throw err;
    }
  }

  // Liga o som do microfone a um analisador. Reaproveita o contexto de áudio indicado (para o pulso
  // andar junto) e cria outro quando aquele não serve: no iPhone o contexto antigo pode ficar
  // "interrompido" depois que o microfone liga, e no Firefox a taxa de amostragem precisa ser igual.
  async function analisador(stream, ctx, fft = 2048) {
    const C = window.AudioContext || window.webkitAudioContext;
    const montar = async c => {
      if (c.state !== "running") { try { await Promise.race([c.resume(), new Promise(r => setTimeout(r, 1500))]); } catch { /* tenta seguir */ } }
      if (c.state !== "running") throw new Error("contexto parado");
      const an = c.createAnalyser(); an.fftSize = fft;
      const fonte = c.createMediaStreamSource(stream); fonte.connect(an);
      return { ctx: c, an, fonte };
    };
    if (ctx) { try { return await montar(ctx); } catch { /* cai para um contexto próprio */ } }
    let taxa;
    try { taxa = stream.getAudioTracks()[0].getSettings().sampleRate; } catch { /* sem taxa */ }
    let novo;
    try { novo = taxa ? new C({ sampleRate: taxa }) : new C(); } catch { novo = new C(); }
    const r = await montar(novo);
    r.proprio = true;
    return r;
  }

  // Caixa de aviso com o motivo e o caminho para liberar.
  function htmlAviso(err) {
    const m = mensagem(err), esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    return `<div class="mic-aviso" role="alert"><strong>${esc(m.titulo)}</strong><span>${esc(m.texto)}</span></div>`;
  }

  window.NaipeMic = { abrir, analisador, mensagem, htmlAviso, estado, sessao, IOS, ANDROID, EMBUTIDO };
})();
