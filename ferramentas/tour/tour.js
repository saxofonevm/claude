// Grava um tour guiado pelo Naipe + naipe rit (vídeo vertical 780x1688, cerca de 60 s).
// Uso: node ferramentas/tour/tour.js <url-do-app> <pasta-de-saida>
//   ex.: node ferramentas/tour/tour.js http://localhost:8765 /tmp/tour
const { chromium } = require('playwright');
const [URL_APP, SAIDA] = process.argv.slice(2);

const hoje = new Date();
const iso = k => { const d = new Date(hoje); d.setDate(d.getDate() - k); return d.toISOString().slice(0, 10); };
const futuro = k => { const d = new Date(hoje); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); };
// Um aluno de exemplo com algumas semanas de estudo (só para o vídeo)
const sessoes = [];
[0, 1, 2, 4, 5, 7, 8, 10, 12, 15, 17, 20, 23, 26, 30, 34].forEach((k, i) =>
  sessoes.push({ id: 's' + i, data: iso(k), minutos: 15 + (i * 7) % 30, raizId: i % 3 ? 'ritmo' : 'escuta', exercicioId: i % 3 ? 'rit-01' : 'esc-01', avaliacao: 3 + i % 3, notas: '' }));
const ESTADO = {
  nome: 'Lucas', metaSemanal: 150, desbloqueado: true, sax: 'Mib', tema: 'verde', boasVindas: true,
  sessoes,
  feitos: { 'esc-01': iso(9), 'esc-02': iso(6), 'esc-03': iso(3) },
  prazos: { 'r:ritmo': futuro(9) },
  andamentos: { 'rit-01': 76 }, historicoBpm: { 'rit-01': [{ d: iso(20), b: 60 }, { d: iso(10), b: 68 }, { d: iso(2), b: 76 }] },
  metronomo: { bpm: 76, compasso: 4, som: 'analogico', sub: 1 }
};

const CSS = `
.tour-legenda { position: fixed; left: 14px; right: 14px; z-index: 9999; padding: 13px 16px 14px; border-radius: 18px;
  background: rgb(9 30 23 / .97); border: 1.5px solid #e9b949; box-shadow: 0 18px 40px rgb(0 0 0 / .55);
  color: #f3efe6; font-family: Figtree, system-ui, sans-serif; opacity: 0; transform: translateY(10px); transition: opacity .3s, transform .3s; }
.tour-legenda.ver { opacity: 1; transform: none; }
.tour-legenda.cima, .tour-legenda.baixo { top: 54%; bottom: auto; transform: translateY(-50%) scale(.92); }
.tour-legenda.ver { transform: translateY(-50%) scale(1) !important; }
.tour-legenda { left: 18px; right: 18px; padding: 18px 20px 20px; text-align: center; border-width: 2.5px; border-radius: 22px;
  background: rgb(8 28 21 / .96); box-shadow: 0 0 0 100vmax rgb(0 0 0 / .28), 0 0 34px rgb(242 193 78 / .45), 0 22px 50px rgb(0 0 0 / .6); }
.tour-legenda b { font-size: 1.65rem !important; margin-bottom: 6px !important; }
.tour-legenda span { font-size: 1.18rem !important; line-height: 1.4 !important; }
.tour-legenda b { display: block; font-family: Archivo, sans-serif; font-stretch: 80%; font-size: 1.2rem; text-transform: uppercase; letter-spacing: .03em; color: #f2c14e; margin-bottom: 2px; }
.tour-legenda span { font-size: .98rem; line-height: 1.35; }
.tour-alvo { outline: 3px solid #f2d48a !important; outline-offset: 4px; border-radius: 14px; animation: tour-anel 1.2s ease-in-out infinite !important; position: relative; z-index: 5; }
@keyframes tour-anel { 50% { outline-color: rgb(242 212 138 / .4); box-shadow: 0 0 26px 4px rgb(242 212 138 / .45); } }
.tour-dedo { position: fixed; z-index: 10000; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%;
  background: rgb(255 255 255 / .55); border: 3px solid #fff; box-shadow: 0 4px 14px rgb(0 0 0 / .4); pointer-events: none; animation: tour-toque .7s ease-out forwards; }
/* Na gravação a página fica ampliada 2x: o quadro do naipe rit ocupa a tela certa */
.rit-embutido { height: calc(50dvh - 61px) !important; }
@keyframes tour-toque { 0% { transform: scale(.4); opacity: 0; } 30% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.7); opacity: 0; } }
.tour-capa { position: fixed; inset: 0; z-index: 10001; display: grid; place-items: center; text-align: center; padding: 30px;
  background: radial-gradient(70% 50% at 50% 40%, rgb(242 193 78 / .28), transparent 70%), #0b2a20; color: #f3efe6; font-family: Figtree, sans-serif; transition: opacity .5s; }
.tour-capa .logo { font-family: Outfit, sans-serif; font-weight: 600; font-size: 4.4rem; color: #F2C14E; letter-spacing: -.01em; display: inline-flex; align-items: flex-end; line-height: 1; }
.tour-capa .logo svg { width: .66em; height: 1.1em; margin: 0 0 -.04em -.06em; }
.tour-capa p { color: #cfe0d6; font-size: 1.15rem; margin: 18px 0 0; }
.tour-capa .arroba { display: inline-block; margin-top: 26px; padding: 12px 26px; border-radius: 999px; background: #F2C14E; color: #0b2a20; font-family: Outfit, sans-serif; font-weight: 700; font-size: 1.6rem; }
`;
const SAX = `<svg viewBox="-12.6 -2.12 71.22 95.96"><g transform="rotate(-10 30 85.5)" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8 L16 12 C22 15 24 19 24 25 L24 66 C24 88 46 88 46 66 L46 56"/><path d="M39 54 Q46 59 52 50"/></g></svg>`;

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 780, height: 1688 }, deviceScaleFactor: 1,
    recordVideo: { dir: SAIDA, size: { width: 780, height: 1688 } } });
  await ctx.addInitScript(([estado, css]) => {
    if (location.pathname.includes('/rit/')) return;
    if (!localStorage.getItem('tour-pronto')) { localStorage.setItem('cma.v1', JSON.stringify(estado)); localStorage.setItem('tour-pronto', '1'); }
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.zoom = '2';
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    });
  }, [ESTADO, CSS]);
  const p = await ctx.newPage();
  const espera = ms => p.waitForTimeout(ms);

  async function capa(html, ms) {
    await p.evaluate(h => { const c = document.createElement('div'); c.className = 'tour-capa'; c.id = 'tour-capa'; c.innerHTML = `<div>${h}</div>`; document.body.appendChild(c); }, html);
    await espera(ms);
    await p.evaluate(() => { const c = document.getElementById('tour-capa'); c.style.opacity = '0'; setTimeout(() => c.remove(), 520); });
    await espera(520);
  }
  async function legenda(seletor, titulo, texto, ms, onde = 'baixo', centro = 'center') {
    await p.evaluate(([sel, t, tx, ond, cen]) => {
      document.querySelectorAll('.tour-alvo').forEach(e => e.classList.remove('tour-alvo'));
      document.querySelectorAll('.tour-legenda').forEach(e => e.remove());
      const el = sel && document.querySelector(sel);
      if (el) { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); setTimeout(() => window.scrollBy({ top: -60, behavior: 'smooth' }), 350); el.classList.add('tour-alvo'); }
      const l = document.createElement('div'); l.className = 'tour-legenda ' + ond;
      l.innerHTML = `<b>${t}</b><span>${tx}</span>`; document.body.appendChild(l);
      requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add('ver')));
    }, [seletor, titulo, texto, onde, centro]);
    await espera(ms);
  }
  async function limpar() {
    await p.evaluate(() => { document.querySelectorAll('.tour-alvo').forEach(e => e.classList.remove('tour-alvo')); document.querySelectorAll('.tour-legenda').forEach(e => e.remove()); });
  }
  // Toque visível (o dedo) num elemento da página ou de dentro do naipe rit
  async function tocar(seletor, quadro) {
    const alvo = quadro ? quadro.locator(seletor).first() : p.locator(seletor).first();
    await alvo.scrollIntoViewIfNeeded();
    const box = await alvo.boundingBox();
    if (box) await p.evaluate(([x, y]) => {
      const z = parseFloat(document.documentElement.style.zoom) || 1;
      const d = document.createElement('div'); d.className = 'tour-dedo';
      d.style.left = (x / z) + 'px'; d.style.top = (y / z) + 'px';
      document.body.appendChild(d); setTimeout(() => d.remove(), 800);
    }, [box.x + box.width / 2, box.y + box.height / 2]);
    await espera(380);
    if (quadro) await alvo.evaluate(e => e.click()); else await alvo.click();
    await espera(500);
  }

  await p.goto(URL_APP + '/index.html#/inicio'); await espera(1200);
  // 1. Abertura
  await capa(`<span class="logo">naipe${SAX}</span><p>Seu estudo de saxofone<br>na palma da mão</p>`, 2600);

  // 2. Início
  await legenda('.percurso-cartao', 'Meu percurso', 'O sax e os 6 pilares do estudo. Cada pilar se enche de cor quando você avança.', 2992, 'cima');
  await legenda('#timer-iniciar', 'Começar os estudos', 'Ligue o cronômetro ao pegar o sax. A prática vai direto para o Diário.', 2640, 'cima');
  await legenda('#btn-afinador-inicio', 'Metrônomo e afinador', 'Sempre à mão. O metrônomo continua tocando enquanto você navega.', 2816, 'cima');
  // 3. Dica de estudo
  await legenda('#estudo-dia', 'Dica de estudo', 'Três passos para hoje: aquecer, o exercício da vez e tocar junto.', 3696, 'cima');
  await limpar();

  // 4. Pilar
  await tocar('.abas a[data-aba="raizes"]');
  await tocar('.raiz-card:nth-child(2)');
  await espera(500);
  await legenda('.metodos-pilar', 'Métodos deste pilar', 'Os livros já organizados por assunto. Nada de procurar página por página.', 3168, 'baixo', 'start');
  await limpar();
  await tocar('.mp-livro');
  await espera(400);
  await legenda('.grupo-raiz .ind-onde', 'Selo amarelo', 'Toque no selo e o método abre no exercício indicado.', 2992, 'baixo');
  await limpar();
  await tocar('#metodos-conteudo .btn-voltar');
  await espera(500);

  // 5. Exercício
  await p.evaluate(() => { location.hash = '#/ex/rit-01'; }); await espera(900);
  await legenda('.andamento', 'Exercício com metrônomo', 'Comece devagar e suba o andamento até o alvo.', 2992, 'baixo', 'start');
  await legenda('#gravador', 'Grave e compare', 'Ouça a primeira gravação e a mais recente: a sua evolução, em segundos.', 3168, 'baixo', 'start');
  await limpar();

  // 6. Tocar junto + naipe rit
  await tocar('.abas a[data-aba="tocar"]');
  await legenda('.modo-tocar', 'Tocar junto', 'Play-alongs por estilo, em Mib ou Sib. E o naipe rit:', 2288, 'baixo');
  await limpar();
  await tocar('.modo-tocar a[href="#/tocar/base"]');
  await espera(2200);
  const rit = p.frameLocator('.rit-quadro');
  await legenda('.rit-quadro', 'naipe rit', 'Escolha o ritmo, a música e o tom. A banda toca, você improvisa.', 2816, 'cima');
  await limpar();
  await tocar('#rhythms button:nth-child(2)', rit);
  await tocar('#tr-up', rit);
  await tocar('#play', rit);
  await espera(2600);
  await tocar('#play', rit);

  // 7. Diário
  await tocar('.abas a[data-aba="diario"]');
  await legenda('#diario-graficos', 'Diário', 'Minutos por semana, a meta e o andamento subindo. Para você e para o professor.', 3520, 'baixo', 'start');
  await limpar();

  // 8. Fechamento
  await capa(`<span class="logo">naipe${SAX}</span><p>Bons estudos!</p><span class="arroba">@naipesax</span>`, 3600);

  await ctx.close(); await b.close();
})();
