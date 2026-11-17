/*
 * Naipe — Teoria (as 16 unidades de leitura) e Estudo (plano de estudos com o professor virtual)
 * Lições curtas em passos: ler, ritmo, ouvir e tocar (o app escuta pelo microfone).
 * Fica em #/trilha e #/trilha/<lição>. O progresso é salvo em localStorage "naipe.trilha.v1".
 */
(function () {
  "use strict";

  // ---------- Visual ----------
  // O visual oficial (verde neon, dourado e lilás) é ligado logo no <head> do index.html.

  // ---------- Abas Teoria e Estudo (oficiais; ?beta=0 esconde) ----------
  // naipesax.com.br/?beta=1 liga a nova organização (abas Teoria e Estudo); ?beta=0 desliga.
  try {
    const q = new URLSearchParams(location.search).get("beta");
    // Teoria e Estudo agora são oficiais. ?beta=0 esconde as duas abas; ?beta=1 mostra de novo.
    if (q === "1") localStorage.removeItem("naipe.beta");
    if (q === "0") localStorage.setItem("naipe.beta", "0");
    // ?revisar=1: modo do professor. Tudo aberto e "Continuar" sempre liberado, para ler o conteúdo inteiro.
    const r = new URLSearchParams(location.search).get("revisar");
    if (r === "1") { localStorage.setItem("naipe.revisar", "1"); localStorage.removeItem("naipe.beta"); }
    if (r === "0") localStorage.removeItem("naipe.revisar");
  } catch { /* sem armazenamento */ }
  let REVISAR = false;
  try { REVISAR = localStorage.getItem("naipe.revisar") === "1"; } catch { /* segue desligado */ }
  // Acesso total (conteudo.js, acesso.livre): tudo aberto para todos, salvando o progresso normalmente.
  const LIVRE = !!(window.CMA && CMA.acesso && CMA.acesso.livre);
  const ABERTO = REVISAR || LIVRE;
  let BETA = false;
  try { BETA = localStorage.getItem("naipe.beta") !== "0"; } catch { BETA = true; }
  window.NAIPE_BETA = BETA;
  if (BETA) {
    document.documentElement.classList.add("beta");
    const aba = document.querySelector('.abas a[data-aba="metodos"]');
    if (aba) {
      aba.href = "#/trilha"; aba.dataset.aba = "trilha"; aba.innerHTML = '<span data-icone="nota"></span>Teoria';
      const est = document.createElement("a"); est.href = "#/estudo"; est.dataset.aba = "estudo"; est.innerHTML = '<span data-icone="calendario"></span>Estudo';
      const pil = document.querySelector('.abas a[data-aba="raizes"]'); if (pil) { pil.parentNode.insertBefore(aba, pil); pil.parentNode.insertBefore(est, pil); }
    }
    const cab = document.querySelector("#tela-raizes .cabecalho");
    if (cab) cab.insertAdjacentHTML("beforeend", '<a class="btn tr-biblioteca" href="#/metodos"><span data-icone="livro"></span>Biblioteca de métodos</a>');
  }

  // ---------- Conteúdo ----------
  // Notas escritas (clave de sol). passo = posição na pauta a partir do Mi da 1ª linha.
  // chaves = [3 da mão esquerda, 3 da mão direita], 1 = fechada.
  const NOTA = {
    re: { nome: "Ré", passo: -1, midi: 62, chaves: [1, 1, 1, 1, 1, 1], dica: "as duas mãos fechadas" },
    mi: { nome: "Mi", passo: 0, midi: 64, chaves: [1, 1, 1, 1, 1, 0], dica: "esquerda + 2 dedos da direita" },
    fa: { nome: "Fá", passo: 1, midi: 65, chaves: [1, 1, 1, 1, 0, 0], dica: "esquerda + 1 dedo da direita" },
    sol: { nome: "Sol", passo: 2, midi: 67, chaves: [1, 1, 1, 0, 0, 0], dica: "3 dedos da esquerda" },
    la: { nome: "Lá", passo: 3, midi: 69, chaves: [1, 1, 0, 0, 0, 0], dica: "2 dedos da esquerda" },
    si: { nome: "Si", passo: 4, midi: 71, chaves: [1, 0, 0, 0, 0, 0], dica: "1 dedo da esquerda" },
    do: { nome: "Dó", passo: 5, midi: 72, chaves: [0, 1, 0, 0, 0, 0], dica: "só o dedo do meio" },
    fas: { nome: "Fá♯", passo: 1, midi: 66, ac: "#", chaves: [1, 1, 1, 0, 1, 0], dica: "esquerda + dedo do meio da direita" },
    fan: { nome: "Fá", passo: 1, midi: 65, ac: "n", chaves: [1, 1, 1, 1, 0, 0], dica: "esquerda + 1 dedo da direita" },
    re2: { nome: "Ré agudo", passo: 6, midi: 74, oitava: true, chaves: [1, 1, 1, 1, 1, 1], dica: "tudo fechado + chave de oitava" },
    mi2: { nome: "Mi agudo", passo: 7, midi: 76, oitava: true, chaves: [1, 1, 1, 1, 1, 0], dica: "Mi + chave de oitava" },
    fas2: { nome: "Fá♯ agudo", passo: 8, midi: 78, ac: "#", oitava: true, chaves: [1, 1, 1, 0, 1, 0], dica: "Fá♯ + chave de oitava" },
    sib: { nome: "Si♭", passo: 4, midi: 70, ac: "b", chaves: [1, 1, 0, 0, 0, 0], extra: "lateral", dica: "dedos do Lá + chave lateral" },
    fa2: { nome: "Fá agudo", passo: 8, midi: 77, oitava: true, chaves: [1, 1, 1, 1, 0, 0], dica: "Fá + chave de oitava" },
    dob: { nome: "Dó grave", passo: -2, midi: 60, chaves: [1, 1, 1, 1, 1, 1], extra: "mindinho", dica: "tudo fechado + mindinho direito" },
    dos: { nome: "Dó♯", passo: 5, midi: 73, ac: "#", chaves: [0, 0, 0, 0, 0, 0], dica: "todas as chaves abertas" },
    mib2: { nome: "Mi♭ agudo", passo: 7, midi: 75, ac: "b", oitava: true, chaves: [1, 1, 1, 1, 1, 1], extra: "mindinho", dica: "Ré agudo + mindinho direito" },
    la2: { nome: "Lá agudo", passo: 10, midi: 81, oitava: true, chaves: [1, 1, 0, 0, 0, 0], dica: "Lá + chave de oitava" },
    sib2: { nome: "Si♭ agudo", passo: 11, midi: 82, ac: "b", oitava: true, chaves: [1, 1, 0, 0, 0, 0], extra: "lateral", dica: "Si♭ + chave de oitava" },
    sig: { nome: "Si grave", passo: -3, midi: 59, chaves: [1, 1, 1, 1, 1, 1], extra: "mindinho-esq", dica: "Dó grave + mindinho esquerdo (chave do Si)" },
    sibg: { nome: "Si♭ grave", passo: -3, midi: 58, ac: "b", chaves: [1, 1, 1, 1, 1, 1], extra: "mindinho-esq", dica: "Dó grave + mindinho esquerdo (chave do Si♭)" },
    si2: { nome: "Si agudo", passo: 11, midi: 83, oitava: true, chaves: [1, 0, 0, 0, 0, 0], dica: "Si + chave de oitava" },
    do3: { nome: "Dó agudo", passo: 12, midi: 84, oitava: true, chaves: [0, 1, 0, 0, 0, 0], dica: "Dó + chave de oitava" },
    re3: { nome: "Ré superagudo", passo: 13, midi: 86, oitava: true, chaves: [0, 0, 0, 0, 0, 0], extra: "palma", dica: "chave da palma + chave de oitava" },
    sol2: { nome: "Sol agudo", passo: 9, midi: 79, oitava: true, chaves: [1, 1, 1, 0, 0, 0], dica: "Sol + chave de oitava" },
  };
  const P = "pausa"; // pausa na pauta e nas melodias
  const T = 1 / 3; // colcheia de tercina
  const D = 2 / 3; // semínima no compasso composto

  // Melodias originais: [nota ou pausa, tempos]
  const PRIMEIRO_PASSO = [["si", 2], ["la", 2], ["sol", 4], ["si", 1], ["si", 1], ["la", 1], ["la", 1], ["sol", 4]];
  const CAMINHO_DE_CASA = [["sol", 1], ["la", 1], ["si", 1], ["do", 1], ["si", 2], ["sol", 1], [P, 1], ["fa", 1], ["mi", 1], ["re", 1], ["mi", 1], ["sol", 4]];

  const L = "liga";
  const RODA_DE_SABADO = [["sol", 0.5], ["la", 0.5], ["si", 1], ["si", 1], ["la", 1], ["sol", 0.5], ["la", 0.5], ["si", 1], ["la", 2], ["fa", 0.5], ["sol", 0.5], ["la", 1], ["la", 1], ["sol", 1], ["fa", 0.5], ["mi", 0.5], ["re", 1], ["sol", 2]];
  const ESCALA_SOL = [["sol", 1], ["la", 1], ["si", 1], ["do", 1], ["re2", 1], ["mi2", 1], ["fas2", 1], ["sol2", 1], ["sol2", 1], ["fas2", 1], ["mi2", 1], ["re2", 1], ["do", 1], ["si", 1], ["la", 1], ["sol", 1]];
  const MANHA_DE_SOL = [["sol", 1], ["si", 1], ["re2", 2], ["mi2", 1], ["re2", 1], ["si", 2], ["do", 0.5], ["si", 0.5], ["la", 1], ["fas", 1], ["la", 1], ["sol", 3], [P, 1]];
  const BAIAO_DE_ESTREIA = [["sol", 1.5], ["si", 1.5], ["re2", 1], ["re2", 0.5], ["do", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2], ["sol", 1.5], ["si", 1.5], ["re2", 1], ["fan", 1.5], ["la", 1.5], ["sol", 1], ["sol", 1.5], ["si", 1.5], ["re2", 1], ["mi2", 0.5], ["re2", 0.5], ["do", 0.5], ["si", 0.5], ["la", 2], ["fan", 1.5], ["la", 1.5], ["si", 1], ["sol", 3], [P, 1]];

  const ESCALA_FA = [["fa", 1], ["sol", 1], ["la", 1], ["sib", 1], ["do", 1], ["re2", 1], ["mi2", 1], ["fa2", 1], ["fa2", 1], ["mi2", 1], ["re2", 1], ["do", 1], ["sib", 1], ["la", 1], ["sol", 1], ["fa", 1]];
  const TARDE_EM_FA = [["fa", 1], ["la", 1], ["do", 2], ["re2", 0.5], ["do", 0.5], ["sib", 1], ["la", 2], ["sol", 0.5], ["la", 0.5], ["sib", 1], ["la", 1], ["sol", 1], ["fa", 2], ["dob", 1], ["fa", 1]];
  const SINCOPADO = [["sol", 0.25], ["si", 0.5], ["sol", 0.25], ["la", 1], ["si", 0.5], ["la", 0.5], ["sol", 1], ["la", 0.25], ["do", 0.5], ["la", 0.25], ["si", 1], ["re2", 2], ["re2", 0.5], ["do", 0.25], ["si", 0.25], ["la", 1], ["si", 0.25], ["la", 0.25], ["sol", 0.25], ["la", 0.25], ["si", 1], ["la", 0.75], ["sol", 0.25], ["la", 1], ["sol", 2]];
  const CHORO_A = [["fa", 0.25], ["la", 0.5], ["fa", 0.25], ["do", 1], ["la", 0.5], ["do", 0.5], ["fa2", 1], ["mi2", 0.5], ["re2", 0.25], ["do", 0.25], ["sib", 1], ["la", 0.5], ["sol", 0.5], ["la", 1], ["sol", 0.25], ["sib", 0.5], ["sol", 0.25], ["re2", 1], ["do", 0.5], ["sib", 0.5], ["la", 1], ["sol", 0.75], ["la", 0.25], ["sib", 0.5], ["la", 0.5], ["sol", 2]];
  const CHORO_B = [["fa", 0.25], ["la", 0.5], ["fa", 0.25], ["do", 1], ["la", 0.5], ["do", 0.5], ["fa2", 1], ["mi2", 0.5], ["re2", 0.25], ["do", 0.25], ["sib", 1], ["la", 0.25], ["sib", 0.25], ["do", 0.25], ["re2", 0.25], ["do", 1], ["sib", 0.25], ["re2", 0.5], ["sib", 0.25], ["la", 1], ["sol", 0.5], ["mi", 0.5], ["sol", 1], ["fa", 0.75], ["mi", 0.25], ["fa", 1], ["fa", 2]];
  const CHORINHO_DE_ESTREIA = CHORO_A.concat(CHORO_B);

  const VALSA_DE_DOMINGO = [["sol", 1], ["si", 1], ["re2", 1], ["re2", 2], ["si", 1], ["do", 1], ["la", 1], ["fas", 1], ["sol", 3], ["sol", 1], ["si", 1], ["re2", 1], ["mi2", 2], ["re2", 1], ["do", 0.5], ["si", 0.5], ["la", 1], ["fas", 1], ["sol", 3]];
  const DOIS_POR_QUATRO = [["fa", 0.5], ["la", 0.5], ["do", 1], ["do", 0.25], ["re2", 0.5], ["do", 0.25], ["la", 1], ["sib", 0.5], ["la", 0.5], ["sol", 0.5], ["fa", 0.5], ["sol", 2], ["fa", 0.5], ["la", 0.5], ["do", 1], ["re2", 0.5], ["do", 0.25], ["sib", 0.25], ["la", 1], ["sol", 0.25], ["la", 0.5], ["sol", 0.25], ["mi", 1], ["fa", 2]];
  const ESCALA_RE = [["re", 1], ["mi", 1], ["fas", 1], ["sol", 1], ["la", 1], ["si", 1], ["dos", 1], ["re2", 1], ["re2", 1], ["dos", 1], ["si", 1], ["la", 1], ["sol", 1], ["fas", 1], ["mi", 1], ["re", 1]];
  const ESCALA_SIB = [["sib", 1], ["do", 1], ["re2", 1], ["mib2", 1], ["fa2", 1], ["sol2", 1], ["la2", 1], ["sib2", 1], ["sib2", 1], ["la2", 1], ["sol2", 1], ["fa2", 1], ["mib2", 1], ["re2", 1], ["do", 1], ["sib", 1]];
  const FESTA_EM_RE = [["re", 0.5], ["fas", 0.5], ["la", 1], ["la", 0.5], ["si", 0.5], ["la", 1], ["dos", 0.5], ["re2", 0.5], ["dos", 1], ["la", 2], ["si", 0.5], ["la", 0.5], ["sol", 1], ["fas", 0.5], ["mi", 0.5], ["fas", 1], ["mi", 1], ["la", 1], ["re", 2]];
  const SERENATA = [["fa", 1], ["la", 1], ["do", 2], ["re2", 1], ["do", 1], ["sib", 1], ["la", 1], ["fa2", 2, "ac"], ["mi2", 0.5, "st"], ["re2", 0.5, "st"], ["do", 1], ["sib", 1], ["sol", 1], ["fa", 2]];

  const CANTIGA_EM_RE = [["la", 1], ["fas", 1], ["re", 1], ["fas", 1], ["la", 2], ["si", 1], ["la", 1], ["sol", 0.5], ["fas", 0.5], ["mi", 1], ["fas", 0.5], ["sol", 0.5], ["la", 1], ["fas", 1], ["mi", 1], ["re", 2]];
  const SWING_DO_NAIPE = [["sol", 1], ["si", 0.5], ["re2", 0.5], ["mi2", 1], ["re2", 1], ["si", 0.5], ["re2", 0.5], ["si", 0.5], ["sol", 0.5], ["la", 2], ["sol", 1], ["si", 0.5], ["re2", 0.5], ["mi2", 1], ["re2", 1], ["sib", 0.5], ["la", 0.5], ["sol", 1], ["sol", 2], ["do", 1], ["mi2", 0.5], ["sol2", 0.5], ["mi2", 1], ["do", 1], ["mi2", 0.5], ["re2", 0.5], ["do", 0.5], ["la", 0.5], ["sol", 2], ["re2", T], ["mi2", T], ["re2", T], ["si", 1], ["la", 0.5], ["sol", 0.5], ["mi", 1], ["sol", 3], [P, 1]];
  const SERESTA = [["fa", 1], ["la", 1, "ap=sol"], ["do", 2], ["re2", 1], ["do", 0.5], ["sib", 0.5], ["la", 2, "tr1"], ["sol", 1, "ap=la"], ["sib", 1], ["la", 0.5], ["sol", 0.5], ["fa", 1], ["sol", 2, "tr"], ["fa", 2]];
  const DE_PONTA_A_PONTA = [["dob", 1], ["mi", 1], ["sol", 1], ["do", 1], ["mi2", 1], ["sol2", 1], ["do3", 2], ["si2", 0.5], ["la2", 0.5], ["sol2", 1], ["mi2", 0.5], ["re2", 0.5], ["do", 1], ["sol", 1], ["mi", 1], ["dob", 2]];
  const FORMATURA = [["sol", 1], ["si", 0.5], ["re2", 0.5], ["sol2", 1], ["fas2", 0.5], ["mi2", 0.5], ["re2", 0.25], ["mi2", 0.5], ["re2", 0.25], ["si", 1], ["la", 0.5], ["si", 0.5], ["re2", 1], ["do", 0.5], ["mi2", 0.5], ["re2", 0.5], ["do", 0.5], ["si", 1], ["la", 1], ["la", T], ["si", T], ["la", T], ["fas", 1], ["sol", 2], ["sol", 1], ["si", 0.5], ["re2", 0.5], ["sol2", 1], ["fas2", 0.5], ["mi2", 0.5], ["re2", 1, "st"], ["mi2", 1, "st"], ["fas2", 1, "st"], ["sol2", 1], ["la2", 2, "ac"], ["sol2", 0.5], ["fas2", 0.5], ["mi2", 0.5], ["re2", 0.5], ["si", 1], ["la", 1], ["sol", 2]];



  // ---------- Plano de estudos (unidade 17 em diante) ----------
  // Cada trilho é uma sequência de exercícios dos métodos. O professor virtual guarda até onde o aluno chegou
  // e em que andamento, e só avança quando a meta é alcançada com facilidade.
  // Item: [livro, onde, o que fazer, [andamento inicial, meta] ou null]
  const TRILHOS = {
    aquecimento: { nome: "Aquecimento", gira: true, dica: "Som antes de velocidade: notas longas, ar contínuo e ouvido atento à afinação.", itens: [
      ["sonoridade-tv", "Seções A–E", "Sonoridade em intervalos. Notas longas e cheias, sem deixar o som cair no fim.", [60, 60]],
      ["demetrio", "Lição 1, Ex. 1–3 · pág. 4–5", "Notas curtas, notas tenutas e o som senoidal. Respire com calma entre os exercícios.", null],
      ["marienthal", "Parte 1 · pág. 1", "Notas longas cromáticas. Uma nota por respiração, o mais estável possível.", [60, 72]],
      ["demetrio", "Lições 2–3 · pág. 6–7", "Intervalos e exercícios para a mão direita, devagar e ligados.", null],
      ["demetrio", "Lição 10 · pág. 21–22", "Notas graves: maxilar solto, garganta aberta, ar quente.", null],
      ["sonoridade-tv", "Seções A–E", "Sonoridade em intervalos, agora com crescendo e diminuendo em cada nota longa.", [60, 60]],
      ["demetrio", "Lição 12 · pág. 27", "Agudos: ar rápido, sem morder a boquilha.", null],
      ["marienthal", "Parte 1 · pág. 1", "Notas longas cromáticas, cada uma em pianíssimo e depois em forte.", [60, 72]],
    ] },
    tecnica: { nome: "Técnica", dica: "Divida o exercício em grupos de quatro notas e repita cada grupo três vezes antes de juntar.", itens: [
      ["klose25", "Ex. 1 · pág. 2", "Exercício diário de mecanismo. Dedos perto das chaves, colcheias iguais.", [60, 92]],
      ["klose25", "Ex. 2 · pág. 2", "Exercício diário de mecanismo.", [60, 92]],
      ["klose25", "Ex. 3 · pág. 3", "Exercício diário de mecanismo.", [60, 92]],
      ["klose25", "Ex. 4 · pág. 4", "Exercício diário de mecanismo.", [60, 96]],
      ["klose25", "Ex. 5 · pág. 5", "Exercício diário de mecanismo.", [60, 96]],
      ["marienthal", "Parte 2 · pág. 2–5", "Exercício cromático. Uma linha por vez, sem pular a respiração.", [80, 120]],
      ["klose25", "Ex. 6 · pág. 6", "Exercício diário de mecanismo.", [60, 100]],
      ["klose25", "Ex. 7 · pág. 7", "Exercício diário de mecanismo.", [60, 100]],
      ["klose25", "Ex. 8 · pág. 8", "Exercício diário de mecanismo.", [60, 100]],
      ["rubank-int", "Daily Studies · pág. 8", "Estudos diários para a técnica.", [60, 100]],
      ["klose25", "Ex. 9 · pág. 9", "Exercício diário de mecanismo.", [60, 100]],
      ["klose25", "Ex. 10 · pág. 10", "Exercício diário de mecanismo.", [60, 100]],
      ["klose25", "Ex. 11 · pág. 11", "Exercício diário de mecanismo.", [60, 100]],
      ["klose25", "Ex. 12 · pág. 12", "Exercício diário de mecanismo.", [60, 100]],
      ["klose25", "Ex. 13 · pág. 13", "Exercício diário de mecanismo.", [60, 100]],
      ["rubank-int", "Daily Technical Study · pág. 19", "Estudo técnico diário.", [60, 104]],
      ["klose25", "Ex. 14 · pág. 14", "Exercício diário de mecanismo.", [60, 104]],
      ["klose25", "Ex. 15 · pág. 15", "Exercício diário de mecanismo.", [60, 104]],
      ["klose25", "Ex. 16 · pág. 16", "Exercício diário de mecanismo.", [60, 104]],
      ["klose25", "Ex. 17 · pág. 17", "Exercício diário de mecanismo.", [60, 104]],
      ["klose25", "Ex. 18 · pág. 18", "Exercício diário de mecanismo.", [60, 104]],
      ["klose25", "Ex. 19 · pág. 19", "Exercício diário de mecanismo.", [60, 104]],
      ["rubank-int", "4 Etudes for the Development of Technic · pág. 42", "Quatro estudos de técnica. Um por sessão.", [60, 104]],
      ["klose25", "Ex. 20 · pág. 20", "Exercício diário de mecanismo.", [60, 108]],
      ["klose25", "Ex. 21 · pág. 21", "Exercício diário de mecanismo.", [60, 108]],
      ["klose25", "Ex. 22 · pág. 22", "Exercício diário de mecanismo.", [60, 108]],
      ["klose25", "Ex. 23 · pág. 23", "Exercício diário de mecanismo.", [60, 108]],
      ["klose25", "Ex. 24 · pág. 24", "Exercício diário de mecanismo.", [60, 108]],
      ["klose25", "Ex. 25 · pág. 25", "Exercício diário de mecanismo.", [60, 108]],
    ] },
    escalas: { nome: "Escalas e arpejos", dica: "Toque primeiro em semínimas, depois em colcheias. Escala bonita é escala igual.", itens: [
      ["alfabeto", "Ex. 48 · pág. 15", "Sol maior: escala, arpejo e acorde de 7ª de dominante.", [60, 100]],
      ["alfabeto", "Ex. 67 · pág. 19", "Fá maior: escala, arpejo e acorde de 7ª de dominante.", [60, 100]],
      ["alfabeto", "Ex. 73 · pág. 20", "Ré maior: escala, arpejo e acorde de 7ª de dominante.", [60, 100]],
      ["alfabeto", "Ex. 80 · pág. 22", "Si♭ maior: escala, arpejo e acorde de 7ª de dominante.", [60, 100]],
      ["alfabeto", "Ex. 92 · pág. 25", "Lá maior: escala, arpejo e acorde de 7ª de dominante. Tom novo: confira a armadura.", [56, 96]],
      ["alfabeto", "Ex. 94 · pág. 26", "Mi♭ maior: escala, arpejo e acorde de 7ª de dominante. Tom novo: confira a armadura.", [56, 96]],
      ["alfabeto", "Ex. 82–84 · pág. 23", "A escala cromática: um dia ligada, outro dia destacada.", [60, 100]],
      ["rubank-int", "Major Scales on Steps of the Diatonic Scale · pág. 44", "Escalas maiores a partir de cada grau.", [60, 100]],
      ["rubank-int", "Major Chords and Scales on Steps · pág. 47", "Acordes e escalas sobre os graus. Ouça o acorde antes de tocar a escala.", [60, 100]],
      ["rubank-int", "Minor Key Studies · pág. 24", "Escalas menores: natural, harmônica e melódica.", [56, 92]],
      ["rubank-int", "Chromatic Studies · pág. 29", "Estudos cromáticos.", [60, 104]],
      ["marienthal", "Parte 3 · pág. 6–7", "Escalas maiores em todos os tons, subindo e descendo a extensão toda.", [80, 132]],
    ] },
    leitura: { nome: "Leitura", dica: "Antes de tocar, bata o ritmo e diga o nome das notas da primeira linha.", itens: [
      ["dantas", "pág. 3", "Lições progressivas. Leia a página inteira devagar, sem parar nos erros.", [60, 80]],
      ["dantas", "pág. 4", "Lições progressivas.", [60, 80]],
      ["dantas", "pág. 5", "Lições progressivas.", [60, 84]],
      ["dantas", "pág. 6", "Lições progressivas.", [60, 84]],
      ["dantas", "pág. 7", "Lições progressivas.", [60, 88]],
      ["dantas", "pág. 8", "Lições progressivas.", [60, 88]],
      ["dantas", "pág. 9", "Lições progressivas.", [60, 92]],
      ["dantas", "pág. 10", "Lições progressivas.", [60, 92]],
      ["dantas", "pág. 11", "Lições progressivas.", [60, 96]],
      ["dantas", "pág. 12", "Lições progressivas.", [60, 96]],
      ["dantas", "pág. 13", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 14", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 15", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 16", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 17", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 18", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 19", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 20", "Lições progressivas.", [60, 100]],
      ["dantas", "pág. 21–22", "Duetos: toque a primeira voz. Se tiver companhia, troquem de voz.", [60, 92]],
      ["dantas", "pág. 23–24", "Duetos: agora a segunda voz.", [60, 92]],
      ["dantas", "pág. 25–26", "Trios: escolha uma voz por sessão.", [60, 92]],
      ["dantas", "pág. 27–28", "Trios: escolha uma voz por sessão.", [60, 92]],
    ] },
    ritmo: { nome: "Ritmo", dica: "Bata e conte em voz alta antes de tocar. Se o ritmo não sai batido, não vai sair tocado.", itens: [
      ["rubank-int", "Rhythmic Review · pág. 3", "Revisão rítmica. Conte em voz alta.", [60, 88]],
      ["rubank-int", "Syncopation · pág. 11", "Melodia sincopada.", [60, 88]],
      ["rubank-int", "16th Note Rhythm · pág. 16", "Estudos de semicolcheias.", [56, 80]],
      ["rubank-int", "Dotted Eighth · pág. 21", "Colcheia pontuada e semicolcheia.", [56, 80]],
      ["rubank-int", "Triplet Studies · pág. 22", "Estudos de tercinas.", [56, 84]],
      ["rubank-int", "6/8 Rhythm · pág. 15", "O compasso composto: conte as seis colcheias, sinta dois tempos.", [50, 72]],
      ["rubank-int", "Syncopation Etude · pág. 23", "Estudo sincopado.", [60, 88]],
      ["alfabeto", "Ex. 106–112 · pág. 30–31", "Tercinas: três notas iguais por tempo.", [56, 88]],
      ["alfabeto", "Ex. 114–117 · pág. 32", "Semicolcheias em grupos de quatro.", [56, 88]],
      ["alfabeto", "Ex. 118–124 · pág. 33", "Figuras rítmicas com semicolcheias.", [56, 88]],
      ["alfabeto", "Ex. 126–128 · pág. 34", "Compassos compostos: 6/8, 9/8 e 12/8.", [50, 76]],
      ["alfabeto", "Ex. 129–131 · pág. 35", "A síncope e o 6/8.", [56, 88]],
      ["dorsey", "Ritmos sincopados · pág. 39–41", "Estudos em ritmos sincopados. Conte as colcheias em voz alta.", [56, 88]],
      ["dorsey", "Ritmos sincopados · pág. 42–45", "Estudos em ritmos sincopados, continuação.", [56, 92]],
    ] },
    articulacao: { nome: "Articulação", dica: "Toque primeiro só com o ar, tudo ligado. Depois acrescente a língua do jeito escrito.", itens: [
      ["pronuncias", "Todo o material", "As sílabas da articulação: RA, TU, TURI, FU-TURI, FUDU e TU-RURURU.", [60, 80]],
      ["rubank-int", "Studies in Accents · pág. 6", "Acentos: impulso de ar, não de língua dura.", [60, 88]],
      ["rubank-int", "Articulation and Expression · pág. 7", "Articulação e expressão.", [60, 88]],
      ["alfabeto", "Ex. 37–43 · pág. 12–13", "Notas repetidas: o ar não para, a língua só toca a palheta.", [60, 92]],
      ["rubank-int", "Legato Duet · pág. 9", "Legato: uma linha só, sem buracos entre as notas.", [60, 84]],
      ["rubank-int", "Staccato Studies · pág. 10", "Staccato leve, com o ar sempre pronto.", [60, 88]],
      ["alfabeto", "Ex. 75–78 · pág. 21", "Détaché: notas separadas e iguais.", [60, 92]],
      ["rubank-int", "Articulation Etude · pág. 40", "Estudo de articulação: siga cada ligadura e cada ponto.", [60, 96]],
      ["marienthal", "Parte 3 · pág. 6–7", "As escalas com quatro articulações diferentes, uma por dia.", [72, 120]],
      ["dorsey", "Staccato e legato · pág. 27–30", "Staccato e legato, separados e misturados.", [60, 100]],
      ["dorsey", "Golpe de língua · pág. 31–32", "Golpe de língua duplo e triplo. Comece bem devagar, só com a sílaba.", [52, 92]],
    ] },
    repertorio: { nome: "Repertório", dica: "Escolha os quatro compassos mais difíceis e estude só eles. Depois toque a música inteira.", itens: [
      ["leme", "pág. 32–33", "Estudo melódico de polca. Cante a melodia antes de tocar.", [60, 96]],
      ["leme", "pág. 40–41", "Estudo melódico de valsa. Apoio no primeiro tempo.", [60, 108]],
      ["leme", "pág. 47–48", "Estudo melódico de schottisch.", [60, 96]],
      ["leme", "pág. 64–66", "Estudo melódico de maxixe: a síncope em ação.", [56, 92]],
      ["leme", "pág. 75–77", "Estudo melódico de choro.", [56, 92]],
      ["rubank-int", "Lullaby (Brahms) · pág. 14", "Canção de ninar: som cheio e legato, sem pressa.", [56, 72]],
      ["rubank-int", "Austrian Melody · pág. 26", "Melodia austríaca: frases longas, respire nas pausas.", [60, 92]],
      ["rubank-int", "Andante (Gluck) · pág. 32", "Andante: cante cada frase antes de tocar.", [56, 76]],
      ["rubank-int", "Sharpshooters March · pág. 35", "Marcha: staccato leve e tempo firme.", [72, 108]],
      ["rubank-int", "Loreley · pág. 39", "Loreley: valsa lenta, com dinâmica.", [60, 92]],
      ["rubank-int", "Farewell · pág. 41", "Despedida: expressão e vibrato nas notas longas.", [56, 80]],
      ["rubank-int", "Memories · pág. 45", "Valsa em swing leve.", [72, 112]],
      ["rubank-adv", "The Swan (Saint-Saëns) · pág. 68", "O Cisne: o primeiro solo clássico. Notas longas, vibrato e muita respiração.", [50, 66]],
      ["rubank-adv", "On Wings of Song (Mendelssohn) · pág. 69", "Nas Asas da Canção: legato e frase longa.", [56, 72]],
    ] },
    jazz: { nome: "Jazz", dica: "Ouça uma gravação de swing antes e cante a frase. O balanço vem do ouvido.", itens: [
      ["niehaus1", "Exercise 1 · pág. 5", "Colcheias com swing, articulação do jazz. Leia a introdução nas pág. 3–4.", [60, 108]],
      ["niehaus1", "Exercise 2 · pág. 6", "Colcheias com swing.", [60, 108]],
      ["niehaus1", "Exercise 3 · pág. 7", "Colcheias com swing.", [60, 112]],
      ["niehaus1", "Exercise 4 · pág. 8", "Colcheias com swing.", [60, 112]],
      ["mintzer", "Est. I · pág. 3–4", "Primeiro estudo de Mintzer: um blues em swing médio.", [60, 112]],
      ["niehaus1", "Exercise 5 · pág. 9", "Colcheias com swing.", [66, 116]],
      ["niehaus1", "Exercise 6 · pág. 10", "Colcheias com swing.", [66, 116]],
      ["mintzer", "Est. II · pág. 5–6", "Swingin’: swing médio. Toque a melodia e depois improvise sobre o blues.", [66, 120]],
      ["niehaus1", "Exercise 7 · pág. 11", "Colcheias com swing.", [66, 120]],
      ["niehaus1", "Exercise 8 · pág. 12", "Colcheias com swing.", [66, 120]],
      ["mintzer", "Est. VII · pág. 15–16", "Bossa nova: colcheias iguais, sem swing.", [72, 120]],
      ["niehaus1", "Exercise 9 · pág. 13", "Colcheias com swing.", [72, 126]],
      ["niehaus1", "Exercise 10 · pág. 14", "Colcheias com swing.", [72, 126]],
      ["mintzer", "Est. V · pág. 11–12", "Balada: som, vibrato e respiração.", [56, 72]],
      ["niehaus1", "Exercise 11 · pág. 15", "Colcheias com swing.", [72, 132]],
      ["niehaus1", "Exercise 12 · pág. 16", "Colcheias com swing.", [72, 132]],
      ["niehaus1", "Having a Ball · pág. 18", "Primeiro tema completo de Niehaus.", [72, 132]],
      ["mintzer", "Est. VIII · pág. 17–18", "Shuffle médio-rápido.", [80, 132]],
      ["niehaus1", "Fancy Free · pág. 19", "Tema em swing.", [72, 132]],
    ] },

    // ----- Módulo 2 (meses 4 a 6): trilhos novos, que começam do zero e vão mais longe -----
    som: { nome: "Som e aquecimento", gira: true, dica: "Grave dez segundos de nota longa no começo da semana e compare no fim. O ouvido aprende com a comparação.", itens: [
      ["demetrio", "Lição 1, Ex. 3 · pág. 5", "Som senoidal: uma nota longa que cresce e diminui sem mudar a afinação. É a preparação do vibrato.", null],
      ["sonoridade-tv", "Seções A–E", "Sonoridade em intervalos, cada nota em pianíssimo, depois em forte, com o mesmo timbre.", [60, 60]],
      ["demetrio", "Lições 10 e 12 · pág. 21–22 e 27", "Graves e agudos com a garganta aberta. Os graves sem estourar, os agudos sem morder.", null],
      ["dorsey", "Vibrato · pág. 36", "Vibrato com o queixo: primeiro em colcheias, depois em tercinas, por fim livre.", [60, 72]],
      ["marienthal", "Parte 1 · pág. 1", "Notas longas cromáticas com crescendo e diminuendo em cada uma.", [60, 72]],
      ["demetrio", "Subtone · pág. 50", "Notas subtonadas: o som soprado e macio das baladas.", null],
    ] },
    mecanismo: { nome: "Técnica", dica: "Quando um trecho travar, toque só a passagem difícil em ritmo pontuado (longa-curta, depois curta-longa) e volte ao normal.", itens: [
      ["demetrio", "Lições 4–7 · pág. 8–11", "Mecanismo cromático e troca de registro. Uma lição por sessão, sem pressa.", [60, 96]],
      ["klose25", "Ex. 1–5 · pág. 2–5", "Revisão dos primeiros exercícios diários, agora com meta de andamento mais alta.", [80, 120]],
      ["marienthal", "Parte 4 · pág. 8", "Dedo Busters: frases rápidas para resistência dos dedos.", [72, 120]],
      ["rubank-adv", "Exercícios de digitação · pág. 55–58", "Exercícios de digitação: as passagens difíceis do saxofone, uma linha por vez.", [60, 100]],
      ["klose25", "Ex. 6–10 · pág. 6–10", "Exercícios diários com meta mais alta.", [80, 120]],
      ["marienthal", "Parte 5 · pág. 9–10", "Motivos em todas as tonalidades: um tom por dia, até completar o ciclo.", [72, 120]],
      ["klose25", "Ex. 11–15 · pág. 11–15", "Exercícios diários com meta mais alta.", [80, 126]],
      ["demetrio", "Tonalidades fáceis · pág. 28–48", "Arpejos, mecanismo e exercícios melódicos por tonalidade. Um tom por sessão.", [60, 100]],
      ["klose25", "Ex. 16–20 · pág. 16–20", "Exercícios diários com meta mais alta.", [80, 126]],
      ["klose25", "Ex. 21–25 · pág. 21–25", "Exercícios diários com meta mais alta. O fim do livro.", [80, 132]],
    ] },
    tons: { nome: "Escalas de Marcel Mule", dica: "Escala, terças e arpejo do mesmo tom, sempre na mesma ordem. Primeiro tudo ligado, depois tudo destacado.", itens: [
      ["mule-gammes", "Escala-modelo · pág. 3–8", "Leia as instruções e toque a escala-modelo: a escala, as terças e os arpejos que se repetem em cada tom.", [56, 88]],
      ["mule-gammes", "Fá maior · pág. 9–10", "Fá maior em toda a extensão: escala, terças e arpejos.", [56, 92]],
      ["mule-gammes", "Si♭ maior · pág. 12", "Si♭ maior: escala, terças e arpejos.", [56, 92]],
      ["mule-gammes", "Sol menor · pág. 13", "Sol menor: escala, terças e arpejos.", [56, 92]],
      ["rubank-adv", "Escalas e arpejos · pág. 6–19", "Escalas, terças e arpejos do Rubank Avançado: um tom por sessão, na ordem do livro.", [60, 100]],
      ["mule-gammes", "Lá maior · pág. 17", "Lá maior: escala, terças e arpejos.", [56, 96]],
      ["mule-gammes", "Mi maior · pág. 20", "Mi maior: quatro sustenidos. Confira cada nota antes de subir o andamento.", [52, 92]],
      ["mule-gammes", "Dó♯ menor · pág. 21", "Dó♯ menor, a relativa de Mi maior.", [52, 92]],
      ["coker", "Padrões 28–59", "Escalas maiores com padrões do jazz (1-2-3-5 e outros), em vários tons.", [60, 112]],
    ] },
    estudos: { nome: "Estudos melódicos", dica: "Estude a frase, não a nota: marque as respirações a lápis e cante cada frase antes de tocar.", itens: [
      ["mule24", "Estudo 1", "Primeiro dos 24 Estudos Fáceis de Marcel Mule. Siga cada dinâmica escrita.", [56, 96]],
      ["mule24", "Estudo 2", "Estudo fácil de Marcel Mule.", [56, 96]],
      ["mule24", "Estudo 3", "Estudo fácil de Marcel Mule.", [56, 100]],
      ["mule24", "Estudo 4", "Estudo fácil de Marcel Mule.", [56, 100]],
      ["mule24", "Estudo 5", "Estudo fácil de Marcel Mule.", [56, 104]],
      ["mule24", "Estudo 6", "Estudo fácil de Marcel Mule.", [56, 104]],
      ["mule24", "Estudo 7", "Estudo fácil de Marcel Mule.", [56, 108]],
      ["mule24", "Estudo 8", "Estudo fácil de Marcel Mule.", [56, 108]],
      ["hite", "Nocentini · pág. 31–40", "Estudos cantabile de Nocentini: dolce e espressivo. Um estudo por sessão.", [52, 80]],
      ["mule48", "Estudo 1", "Primeiro dos 48 Estudos de Ferling: lento e cantado. Respire onde a frase pede.", [50, 72]],
      ["mule48", "Estudo 2", "O par rápido do Estudo 1: mesmo tom, outro caráter.", [60, 100]],
      ["mule48", "Estudo 3", "Ferling, lento e cantado.", [50, 72]],
      ["mule48", "Estudo 4", "Ferling, o par rápido.", [60, 100]],
    ] },
    expressao: { nome: "Articulação e expressão", dica: "Toque o trecho primeiro todo ligado, só com o ar. Depois coloque a articulação escrita sem mudar o som.", itens: [
      ["rubank-adv", "Estudos de articulação · pág. 45–49", "Estudos de articulação do Rubank Avançado, primeira parte.", [60, 96]],
      ["hite", "Baermann Op. 63 · pág. 41–56", "Estudos de Baermann: legato longo e indicações de ligadura. Um estudo por sessão.", [56, 88]],
      ["rubank-adv", "Estudos de articulação · pág. 50–54", "Estudos de articulação do Rubank Avançado, segunda parte.", [60, 100]],
      ["freeman", "Legato Tonguing · pág. 14–17", "A língua legato do swing, em oito exercícios de Bud Freeman. Dois por sessão.", [72, 132]],
      ["rubank-adv", "Mozart, Tempo di Menuetto · pág. 21", "Interpretação melódica: o minueto de Mozart, leve e elegante.", [80, 112]],
      ["rubank-adv", "Andante grazioso · pág. 22", "Interpretação melódica: frase cantada e dinâmica.", [60, 84]],
      ["rubank-adv", "Hohmann, Allegretto · pág. 25", "Interpretação melódica: estude em três tempos e depois em um.", [80, 120]],
      ["rubank-adv", "Barret, Allegretto · pág. 27", "Interpretação melódica com ornamentos.", [72, 104]],
      ["rubank-adv", "Verroust, Larghetto · pág. 31", "Interpretação melódica lenta: som, vibrato e frase.", [50, 66]],
    ] },
    balanco: { nome: "Ritmo e levadas", dica: "Ponha o metrônomo nos tempos 2 e 4 e bata o pé no 1 e no 3. O balanço mora entre os dois.", itens: [
      ["ritmo-tv", "Todo o material", "Figuras rítmicas brasileiras: leia em voz alta e depois toque numa nota só.", [60, 90]],
      ["dorsey", "Colcheia pontuada e tercinas · pág. 33–34", "Colcheia pontuada com semicolcheia e tercinas, lado a lado.", [60, 96]],
      ["freeman", "Syncopation · pág. 18–21", "Síncopes e fraseado de swing sobre progressões. Dois exercícios por sessão.", [72, 132]],
      ["mintzer", "Est. III · pág. 7–8", "Funk: semicolcheias firmes e notas curtas.", [72, 100]],
      ["aerobica", "Workouts 288–301 · pág. 84–87", "Exercícios de ritmo: swing, rock e 12/8. Um por sessão.", [72, 120]],
      ["mintzer", "Est. X · pág. 21–22", "Valsa jazz em 3/4: sinta um tempo por compasso.", [100, 160]],
      ["mintzer", "Est. IX · pág. 19–20", "Funk com colcheias iguais.", [72, 100]],
    ] },
    jazz2: { nome: "Jazz e improviso", dica: "Toque a melodia, depois improvise só com as notas do primeiro compasso. Pouca nota, muito ritmo.", itens: [
      ["niehaus1", "Cool ’n’ Breezy · pág. 20", "Tema de Lennie Niehaus em swing moderado.", [80, 132]],
      ["bergonzi2", "Cap. 1 · pág. 6–9", "As escalas pentatônicas: a porta de entrada do improviso.", [60, 120]],
      ["niehaus1", "Remember When? · pág. 21", "Tema de Niehaus em swing moderado.", [80, 132]],
      ["mintzer", "Est. IV · pág. 9–10", "Etude de swing de Bob Mintzer.", [80, 132]],
      ["pentatonica", "Pentatônicas por tom · pág. 16–43", "Pentatônica maior, menor e blues: um tom por sessão.", [60, 120]],
      ["niehaus1", "Stan’s Idea · pág. 22", "Tema de Niehaus.", [80, 132]],
      ["mintzer", "Est. VI · pág. 13–14", "Blues de Bob Mintzer. Toque o tema e improvise um chorus.", [80, 132]],
      ["bergonzi2", "Cap. 2 · pág. 10–23", "Criando linhas com a pentatônica: oito fórmulas.", [72, 132]],
      ["niehaus1", "Listener’s Delight · pág. 23", "Tema de Niehaus.", [88, 138]],
      ["coker", "Padrões 123–148", "Padrões sobre II-V e II-V-I, em vários tons.", [72, 132]],
      ["mintzer", "Est. XI · pág. 23–24", "Blues de Bob Mintzer.", [88, 138]],
      ["freeman", "Standard Songs · pág. 23–46", "Os standards de Bud Freeman: a melodia, a versão com ritmo e a versão improvisada.", [80, 132]],
    ] },
    // Cadernos do Naipe (Tiago Veloso), em PDF no próprio site.
    arpejos: { nome: "Arpejos", dica: "Três tons por sessão, no ciclo das quartas. Diga o nome de cada nota do acorde antes de tocar.", itens: [
      ["arpejos-tv", "Maiores, Ex. 1 · pág. 1–2", "Arpejos maiores em toda a extensão do sax. Três tons por sessão; em quatro sessões você fecha os doze.", [60, 108]],
      ["arpejos-tv", "Maiores, Ex. 2 · pág. 2–3", "Arpejos maiores em grupos de quatro notas.", [60, 104]],
      ["arpejos-tv", "Maiores, Ex. 3 · pág. 3–4", "Inversões dos acordes maiores: fundamental, primeira e segunda inversão.", [60, 104]],
      ["arpejos-tv", "Menores, Ex. 1 · pág. 5–6", "Arpejos menores em toda a extensão.", [60, 108]],
      ["arpejos-tv", "Menores, Ex. 2 · pág. 6–7", "Arpejos menores em grupos de quatro notas.", [60, 104]],
      ["arpejos-tv", "Menores, Ex. 3 · pág. 7–8", "Inversões dos acordes menores.", [60, 104]],
      ["arpejos-tv", "Aumentados, Ex. 1 · pág. 9–10", "Arpejos aumentados em toda a extensão: duas terças maiores seguidas.", [56, 100]],
      ["arpejos-tv", "Diminutos, Ex. 1 · pág. 13–14", "Arpejos diminutos em toda a extensão: duas terças menores seguidas.", [56, 100]],
      ["arpejos-tv", "Aumentados, Ex. 2 e 3 · pág. 10–12", "Aumentados em grupos de quatro e em inversões.", [56, 100]],
      ["arpejos-tv", "Diminutos, Ex. 2 e 3 · pág. 14–16", "Diminutos em grupos de quatro e em inversões.", [56, 100]],
      ["arpejos-tv", "Sétima diminuta, Ex. 4 · pág. 17–18", "O acorde de sétima diminuta, o diminuto do choro e do jazz, nos doze nomes.", [56, 104]],
    ] },
    modos: { nome: "Escalas modais", dica: "Toque com um bordão na tônica (uma nota longa no afinador ou no teclado) e cante a nota característica do modo.", itens: [
      ["modos-tv", "Parte 1 · pág. 1", "Os modos da escala de Dó maior: as mesmas sete notas, começando em cada grau.", [60, 100]],
      ["modos-tv", "Parte 2 · pág. 2", "Os sete modos sobre o Dó. Leia a cor de cada um e cante a nota característica.", [60, 100]],
      ["modos-tv", "Parte 3 · pág. 3", "Os sete modos sobre o Dó, em terças.", [60, 96]],
      ["modos-tv", "Dórico nos 12 tons · pág. 6", "O modo dórico nos doze tons: o menor do jazz e do samba-jazz. Quatro tons por sessão.", [60, 104]],
      ["modos-tv", "Mixolídio nos 12 tons · pág. 9", "O mixolídio nos doze tons: o som do baião e do blues.", [60, 104]],
      ["modos-tv", "Jônio nos 12 tons · pág. 4–5", "O jônio (escala maior) nos doze tons.", [60, 108]],
      ["modos-tv", "Eólio nos 12 tons · pág. 10", "O eólio (menor natural) nos doze tons.", [60, 104]],
      ["modos-tv", "Lídio nos 12 tons · pág. 8", "O lídio nos doze tons: maior com a quarta aumentada.", [60, 100]],
      ["modos-tv", "Frígio nos 12 tons · pág. 7", "O frígio nos doze tons: menor com a segunda menor.", [60, 100]],
      ["modos-tv", "Lócrio nos 12 tons · pág. 11", "O lócrio nos doze tons: o modo do acorde meio-diminuto.", [56, 96]],
    ] },
    ornamentos: { nome: "Ornamentação", dica: "Toque primeiro a versão escrita por extenso, devagar. O enfeite nunca atrasa o tempo: ele cabe dentro da nota.", itens: [
      ["ornamentos-tv", "1 · Apojatura breve · pág. 1", "A notinha cortada, rapidíssima. Exercícios 1 a 6 em cinco tons.", [60, 96]],
      ["ornamentos-tv", "2 · Apojatura longa · pág. 2", "A apojatura que cai no tempo e vale metade da nota. Exercício 7: melodia em 3/4.", [56, 88]],
      ["ornamentos-tv", "3 · Mordentes · pág. 3", "Mordente superior e inferior alternados nas escalas. Exercícios 8 a 12.", [56, 92]],
      ["ornamentos-tv", "4 · Grupeto · pág. 4", "O grupeto em cada grau da escala. Exercícios 13 a 17.", [56, 88]],
      ["ornamentos-tv", "5 · Trinado · pág. 5", "Trinado medido e depois livre, em cada grau. Exercícios 18 a 22.", [56, 80]],
      ["ornamentos-tv", "6 · Estudo no choro · pág. 6", "Exercício 23: apojaturas, mordentes, grupeto e trinado num estudo de choro.", [56, 88]],
      ["ornamentos-tv", "6 · Estudo no jazz · pág. 6", "Exercício 24: glissando, fall, scoop e ghost notes num estudo de jazz.", [72, 120]],
    ] },
    // ----- Módulo 3 (meses 7 a 9): os cadernos do Naipe -----
    somart: { nome: "Som", gira: true, dica: "Use o afinador nas notas longas e grave um trecho por semana. O som melhora quando você se ouve.", itens: [
      ["som-tv", "Notas longas, do meio para o grave · pág. 1", "Notas longas com crescendo e diminuendo, do Sol para o Si♭ grave. Afinação parada do piano ao forte.", [60, 60]],
      ["som-tv", "Harmônicos · pág. 3", "Harmônicos sobre as notas graves: só ar, língua e garganta, sem trocar o dedo.", null],
      ["som-tv", "Notas longas, do meio para o agudo · pág. 1", "Notas longas com crescendo e diminuendo, do Sol até o Fá agudo.", [60, 60]],
      ["som-tv", "Dinâmica na escala · pág. 2", "A escala de Dó em seis níveis de volume, do pp ao ff.", [60, 72]],
    ] },
    escalas3: { nome: "Escalas", dica: "Escala bonita é escala igual: mesmo som e mesmo volume do grave ao agudo. Três tons por sessão.", itens: [
      ["escalas-tv", "Maiores, Dó a Lá♭ · pág. 1", "Escalas maiores em toda a extensão do sax.", [60, 112]],
      ["escalas-tv", "Maiores, Ré♭ a Sol · pág. 2", "Escalas maiores em toda a extensão do sax.", [60, 112]],
      ["escalas-tv", "Menores naturais · pág. 3", "Menores naturais em toda a extensão, nos doze tons.", [60, 108]],
      ["escalas-tv", "Menores harmônicas · pág. 4–5", "Menores harmônicas: cuidado com o salto de tom e meio entre o 6º e o 7º grau.", [56, 104]],
      ["escalas-tv", "Menores melódicas · pág. 6", "Menores melódicas: sobem com 6º e 7º elevados e descem como a natural.", [56, 104]],
      ["escalas-tv", "Maiores em terças · pág. 7–8", "Escalas maiores em terças nos doze tons.", [56, 104]],
    ] },
    escjazz: { nome: "Escalas do jazz", dica: "Depois de tocar a escala, improvise só com as notas dela sobre um playback por um minuto.", itens: [
      ["escalas-jazz-tv", "Cromática e tons inteiros · pág. 1–2", "A escala cromática em toda a extensão e as duas escalas de tons inteiros.", [60, 120]],
      ["escalas-jazz-tv", "Pentatônica maior · pág. 3", "Pentatônica maior nos doze tons.", [60, 120]],
      ["escalas-jazz-tv", "Pentatônica menor · pág. 4", "Pentatônica menor nos doze tons.", [60, 120]],
      ["escalas-jazz-tv", "Escala blues · pág. 5–6", "A escala blues nos doze tons. Arraste a blue note.", [60, 120]],
      ["escalas-jazz-tv", "Escalas diminutas · pág. 2", "Diminutas tom-semitom e semitom-tom: três formas de cada.", [56, 112]],
      ["escalas-jazz-tv", "Bebop dominante · pág. 7–8", "A escala bebop dominante, descendo da tônica, com swing.", [72, 144]],
    ] },
    intervalos: { nome: "Intervalos", dica: "Cante a nota de cima antes de tocar. Nos saltos, quem muda é o dedo: o ar e a boca ficam parados.", itens: [
      ["intervalos-tv", "Terças · pág. 1", "Terças em seis tons maiores.", [60, 112]],
      ["intervalos-tv", "Quartas · pág. 2", "Quartas em seis tons maiores.", [60, 108]],
      ["intervalos-tv", "Quintas · pág. 3", "Quintas em seis tons maiores.", [60, 104]],
      ["intervalos-tv", "Sextas · pág. 4", "Sextas em seis tons maiores.", [56, 100]],
      ["intervalos-tv", "Sétimas · pág. 5", "Sétimas em seis tons maiores.", [56, 96]],
      ["intervalos-tv", "Oitavas · pág. 6", "Oitavas em seis tons maiores: troca de registro sem estalo.", [56, 96]],
    ] },
    artic: { nome: "Articulação", dica: "Toque primeiro tudo ligado; depois coloque a língua sem mudar o som nem o tempo.", itens: [
      ["som-tv", "Padrões 1 a 4 · pág. 4", "Ligado, destacado, staccato e tenuto na escala de Dó em duas oitavas.", [60, 120]],
      ["som-tv", "Padrões 5 a 8 · pág. 4", "Combinações de notas ligadas e destacadas.", [60, 120]],
      ["som-tv", "Padrões 9 a 12 · pág. 4–5", "Acentos e a articulação do swing.", [60, 132]],
    ] },
    leitura3: { nome: "Leitura rítmica", dica: "Bata o pé nos tempos e diga o ritmo em voz alta antes de tocar. Se não sai batido, não sai tocado.", itens: [
      ["ritmica-tv", "Lições 1 e 2 · pág. 1", "Semínimas, colcheias e semicolcheias, numa nota só.", [60, 100]],
      ["ritmica-tv", "Lições 3 a 5 · pág. 2", "Combinações de semicolcheia e a colcheia pontuada.", [60, 96]],
      ["ritmica-tv", "Lições 6 a 8 · pág. 3", "Síncope, contratempo e semicolcheia com colcheia pontuada.", [60, 96]],
      ["ritmica-tv", "Lições 9 e 10 · pág. 4", "Tercinas e revisão geral.", [60, 96]],
      ["ritmica-tv", "Compasso 6/8 · pág. 5", "Seis colcheias sentidas em dois tempos.", [50, 80]],
      ["ritmica-tv", "Levadas brasileiras · pág. 5", "Baião, maxixe, samba, xote e frevo. Repita cada levada até soar natural.", [60, 100]],
      ["ritmica-tv", "Swing · pág. 6", "Colcheias com swing: a primeira longa, a segunda curta.", [80, 160]],
    ] },
    estilos: { nome: "Estudos no estilo", dica: "Ouça o disco indicado antes de tocar. O estilo está no jeito de tocar: articulação, swing e som, mais do que nas notas.", itens: [
      ["estilos-tv", "Estudo 1 · alto pág. 1 · tenor pág. 4", "Blues para Bird, no estilo de Charlie Parker. Use a versão do seu sax.", [80, 160]],
      ["estilos-tv", "Estudo 3 · alto pág. 2 · tenor pág. 4", "Bossa para Getz: colcheias iguais e som macio.", [80, 120]],
      ["estilos-tv", "Estudo 4 · alto pág. 2 · tenor pág. 5", "Soul para Cannonball: blues com a blue note.", [80, 112]],
      ["estilos-tv", "Estudo 5 · alto pág. 2 · tenor pág. 5", "Balada para a noite: subtone e vibrato largo.", [50, 60]],
      ["estilos-tv", "Estudo 7 · alto pág. 3 · tenor pág. 6", "Chorinho para Pixinguinha: semicolcheias leves.", [56, 80]],
      ["estilos-tv", "Estudo 6 · alto pág. 3 · tenor pág. 5", "Groove suave, no estilo de David Sanborn.", [72, 92]],
      ["estilos-tv", "Estudo 2 · alto pág. 1 · tenor pág. 4", "Passos gigantes, no estilo de Coltrane: bem devagar no começo.", [60, 132]],
    ] },
    escuta: { nome: "Escuta e transcrição", dica: "Cante antes de tocar. Uma frase por sessão, com a gravação mais lenta se precisar.", itens: [
      ["solos-tv", "Passo a passo · pág. 2–3", "Leia o passo a passo e ouça o solo de Stan Getz em “Garota de Ipanema” (nº 16) até cantar junto.", null],
      ["solos-tv", "Solo nº 16 · pág. 2", "Stan Getz, “Garota de Ipanema”: tire uma frase por sessão e toque junto com a gravação.", null],
      ["solos-tv", "Solo nº 14 · pág. 2", "Hank Mobley, “Soul Station”: uma frase por sessão.", null],
      ["solos-tv", "Solo nº 10 · pág. 1", "Paul Desmond, “Take Five”: som leve e o 5/4.", null],
      ["solos-tv", "Solo nº 3 · pág. 1", "Charlie Parker, “Now's the Time”. Compare com o Estudo 1 do caderno de estilos.", null],
      ["solos-tv", "Solo nº 8 · pág. 1", "Cannonball Adderley, “Autumn Leaves”: duas frases e leve as duas para os 12 tons.", null],
      ["solos-tv", "Solo nº 6 · pág. 1", "Sonny Rollins, “St. Thomas”. Depois confira no livro de solos de Rollins, na Biblioteca de métodos.", null],
      ["solos-tv", "Solo nº 12 · pág. 1", "John Coltrane, “Giant Steps”: ouça e cante o começo; compare com a transcrição do acervo.", null],
    ] },
    musicas: { nome: "Minhas músicas", dica: "Ouça a gravação, cante a melodia, fatie a música em frases de quatro compassos e só então toque com o playback.", itens: [
      ["rep:summertime", "Partitura", "Uma balada de jazz para começar: melodia cantada, notas longas e vibrato no fim das frases.", [56, 80]],
      ["rep:manha-carnaval", "Partitura e playback", "Bossa nova: colcheias iguais e som macio. Toque com o playback.", [60, 90]],
      ["rep:asa-branca", "Partitura e playback", "O baião de Luiz Gonzaga. Acentue o primeiro tempo como o zabumba.", [72, 100]],
      ["rep:all-of-me", "Partitura e playback", "Standard de swing: colcheias swingadas e notas curtas no fim das frases.", [80, 132]],
      ["rep:insensatez", "Partitura", "Bossa lenta e cromática. Cuidado com a afinação das notas que descem meio tom.", [56, 80]],
      ["rep:autumn-leaves", "Real Book", "O standard mais tocado nas jams. Aprenda a melodia de cor.", [80, 132]],
      ["rep:carinhoso", "Partitura", "O choro-canção de Pixinguinha: frase longa e expressiva.", [60, 88]],
      ["rep:chega", "Partitura e playback", "A primeira bossa nova gravada. A parte em maior pede outro brilho no som.", [72, 104]],
      ["rep:careless", "Partitura e playback", "O solo de sax mais famoso do pop. Som cheio e as síncopes bem no lugar.", [60, 76]],
      ["rep:blue-bossa", "Partitura", "Bossa do jazz: depois da melodia, improvise com a pentatônica.", [80, 132]],
      ["rep:wave", "Partitura e guia", "Siga o guia de estudo do Wave, passo a passo.", [70, 90]],
      ["rep:lamentos", "Songbook de choro", "O choro lento de Pixinguinha. Ornamentos leves e muita frase.", [56, 80]],
    ] },
  };

  const SEMANAS = [
    { foco: "Montar a rotina", texto: "Esta semana o objetivo é criar o hábito: quatro sessões de cerca de 30 minutos, sempre na mesma ordem. Avalie cada bloco com sinceridade. É assim que eu ajusto o próximo passo.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["leitura", 10], ["ritmo", 5]], [["aquecimento", 5], ["escalas", 10], ["articulacao", 10], ["repertorio", 5]], [["aquecimento", 5], ["tecnica", 10], ["ritmo", 10], ["leitura", 5]], [["aquecimento", 5], ["escalas", 10], ["repertorio", 15]]] },
    { foco: "Ganhar regularidade", texto: "As sessões ficam um pouco mais longas. Repare no andamento que eu sugiro em cada bloco: ele vem do que você me contou na semana passada.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["leitura", 10], ["ritmo", 10]], [["aquecimento", 5], ["escalas", 10], ["articulacao", 10], ["repertorio", 10]], [["aquecimento", 5], ["tecnica", 10], ["ritmo", 10], ["repertorio", 10]], [["aquecimento", 5], ["escalas", 10], ["leitura", 10], ["articulacao", 10]]] },
    { foco: "Entra o jazz", texto: "Um trilho novo começa: colcheias com swing pelos exercícios de Lennie Niehaus. O resto da rotina continua de onde você parou.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["jazz", 10], ["leitura", 10]], [["aquecimento", 5], ["escalas", 10], ["ritmo", 10], ["jazz", 10]], [["aquecimento", 5], ["articulacao", 10], ["jazz", 10], ["repertorio", 10]], [["aquecimento", 5], ["tecnica", 10], ["escalas", 10], ["jazz", 10]]] },
    { foco: "Fechar o mês", texto: "Última semana do primeiro mês. Todos os trilhos aparecem, e a última sessão termina com uma gravação para você comparar com o começo.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["leitura", 10], ["ritmo", 10]], [["aquecimento", 5], ["escalas", 10], ["articulacao", 10], ["jazz", 10]], [["aquecimento", 5], ["ritmo", 10], ["repertorio", 15]], [["aquecimento", 5], ["tecnica", 10], ["escalas", 10], ["repertorio", 15]]] },
    { foco: "Segundo mês: mais repertório", texto: "Começa o segundo mês. O repertório ganha mais tempo e entram as peças do Rubank. Os outros assuntos continuam exatamente de onde você parou.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["leitura", 10], ["repertorio", 10]], [["aquecimento", 5], ["escalas", 10], ["ritmo", 10], ["jazz", 10]], [["aquecimento", 5], ["articulacao", 10], ["leitura", 10], ["repertorio", 10]], [["aquecimento", 5], ["tecnica", 10], ["ritmo", 10], ["repertorio", 10]]] },
    { foco: "Leitura à primeira vista", texto: "Esta semana a leitura pesa mais. Leia cada página uma vez do começo ao fim sem parar, e só depois volte nos trechos difíceis. É assim que se treina a primeira vista.",
      sessoes: [[["aquecimento", 5], ["leitura", 15], ["tecnica", 10], ["ritmo", 5]], [["aquecimento", 5], ["leitura", 15], ["escalas", 10], ["jazz", 5]], [["aquecimento", 5], ["leitura", 15], ["articulacao", 10], ["repertorio", 5]], [["aquecimento", 5], ["leitura", 10], ["ritmo", 10], ["repertorio", 10]]] },
    { foco: "Do choro ao swing", texto: "Uma semana de estilo: síncope brasileira de um lado, swing do jazz do outro. Repare como a mesma colcheia muda de jeito em cada um.",
      sessoes: [[["aquecimento", 5], ["ritmo", 10], ["repertorio", 10], ["jazz", 10]], [["aquecimento", 5], ["tecnica", 10], ["ritmo", 10], ["jazz", 10]], [["aquecimento", 5], ["escalas", 10], ["repertorio", 10], ["jazz", 10]], [["aquecimento", 5], ["articulacao", 10], ["ritmo", 10], ["repertorio", 10]]] },
    { foco: "Fechar o segundo mês", texto: "Última semana do segundo mês. A última sessão termina com uma gravação: escolha a peça do repertório de que você mais gostou.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["escalas", 10], ["leitura", 10]], [["aquecimento", 5], ["articulacao", 10], ["ritmo", 10], ["jazz", 10]], [["aquecimento", 5], ["leitura", 10], ["repertorio", 15]], [["aquecimento", 5], ["tecnica", 10], ["repertorio", 20]]] },
    { foco: "Terceiro mês: sessões de 40 minutos", texto: "As sessões crescem para cerca de 40 minutos. Se num dia o tempo for curto, faça só o aquecimento e os dois primeiros blocos: regularidade vale mais que duração.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["escalas", 10], ["leitura", 10], ["ritmo", 5]], [["aquecimento", 5], ["articulacao", 10], ["jazz", 10], ["repertorio", 15]], [["aquecimento", 5], ["tecnica", 10], ["ritmo", 10], ["leitura", 10], ["jazz", 5]], [["aquecimento", 5], ["escalas", 10], ["articulacao", 10], ["repertorio", 15]]] },
    { foco: "Som e expressão", texto: "O aquecimento ganha mais tempo e o repertório pede vibrato, dinâmica e frase. Grave um trecho no gravador do app e ouça antes de avaliar o bloco.",
      sessoes: [[["aquecimento", 10], ["repertorio", 15], ["tecnica", 10], ["leitura", 5]], [["aquecimento", 10], ["escalas", 10], ["repertorio", 15], ["articulacao", 5]], [["aquecimento", 10], ["jazz", 10], ["repertorio", 15], ["ritmo", 5]], [["aquecimento", 10], ["tecnica", 10], ["repertorio", 15], ["escalas", 5]]] },
    { foco: "Estilo e repertório", texto: "Choro, valsa, marcha, balada e swing na mesma semana. O objetivo é tocar cada estilo com o sotaque certo, e não só as notas certas.",
      sessoes: [[["aquecimento", 5], ["repertorio", 15], ["ritmo", 10], ["jazz", 10]], [["aquecimento", 5], ["tecnica", 10], ["repertorio", 15], ["articulacao", 10]], [["aquecimento", 5], ["escalas", 10], ["jazz", 15], ["leitura", 10]], [["aquecimento", 5], ["ritmo", 10], ["repertorio", 15], ["jazz", 10]]] },
    { foco: "Fechar o trimestre", texto: "Última semana do terceiro mês. Na sessão final, grave o seu melhor repertório e ouça ao lado do som do primeiro dia: são três meses de estudo organizado.",
      sessoes: [[["aquecimento", 5], ["tecnica", 10], ["escalas", 10], ["leitura", 10], ["ritmo", 5]], [["aquecimento", 5], ["articulacao", 10], ["jazz", 15], ["repertorio", 10]], [["aquecimento", 5], ["leitura", 10], ["ritmo", 10], ["repertorio", 15]], [["aquecimento", 10], ["tecnica", 10], ["repertorio", 20]]] },
  ];
  // Módulo 2: meses 4 a 6. Sessões de 40 a 45 minutos com trilhos novos e as músicas do repertório essencial.
  SEMANAS.push(
    { foco: "Novos métodos", texto: "Começa o segundo módulo. Os trilhos são novos: Marcel Mule, Ferling, Rubank Avançado, o caderno de arpejos em todos os tons e as primeiras músicas do repertório essencial. As sessões ficam em cerca de 40 minutos.",
      sessoes: [[["som", 5], ["mecanismo", 10], ["arpejos", 10], ["estudos", 15]], [["som", 5], ["expressao", 10], ["balanco", 10], ["musicas", 15]], [["som", 5], ["mecanismo", 10], ["estudos", 10], ["jazz2", 15]], [["som", 5], ["tons", 10], ["expressao", 10], ["musicas", 15]]] },
    { foco: "Som de verdade", texto: "Esta semana o aquecimento ganha mais tempo. Grave uma nota longa no primeiro dia e outra no último: o som é o seu cartão de visita.",
      sessoes: [[["som", 10], ["mecanismo", 10], ["estudos", 10], ["musicas", 10]], [["som", 10], ["arpejos", 10], ["expressao", 10], ["balanco", 10]], [["som", 10], ["estudos", 10], ["jazz2", 10], ["musicas", 10]], [["som", 10], ["mecanismo", 10], ["expressao", 10], ["musicas", 10]]] },
    { foco: "Ferling e Mule", texto: "Os estudos melódicos pesam mais. Antes de tocar, marque a lápis onde respirar e cante cada frase uma vez. Entra também o caderno de ornamentos: apojaturas, mordentes, grupeto e trinado.",
      sessoes: [[["som", 5], ["arpejos", 10], ["estudos", 15], ["balanco", 10]], [["som", 5], ["mecanismo", 10], ["estudos", 15], ["jazz2", 10]], [["som", 5], ["ornamentos", 10], ["estudos", 15], ["musicas", 10]], [["som", 5], ["tons", 10], ["estudos", 10], ["musicas", 15]]] },
    { foco: "Fechar o quarto mês", texto: "Última semana do quarto mês. A sessão final termina com uma gravação da música do repertório de que você mais gostou.",
      sessoes: [[["som", 5], ["mecanismo", 10], ["arpejos", 10], ["estudos", 10], ["balanco", 5]], [["som", 5], ["ornamentos", 10], ["jazz2", 15], ["musicas", 10]], [["som", 5], ["estudos", 10], ["balanco", 10], ["musicas", 15]], [["som", 5], ["mecanismo", 10], ["musicas", 25]]] },
    { foco: "Quinto mês: groove", texto: "O ritmo ganha espaço: funk, valsa jazz, swing e as figuras brasileiras. Metrônomo nos tempos 2 e 4 sempre que der. E começam os modos gregos.",
      sessoes: [[["som", 5], ["balanco", 15], ["mecanismo", 10], ["musicas", 10]], [["som", 5], ["arpejos", 10], ["balanco", 10], ["modos", 15]], [["som", 5], ["balanco", 10], ["estudos", 10], ["musicas", 15]], [["som", 5], ["ornamentos", 10], ["balanco", 10], ["jazz2", 15]]] },
    { foco: "Primeiros improvisos", texto: "Entra a pentatônica. Depois de tocar cada tema, improvise um chorus com poucas notas. Errar aqui faz parte: é assim que se aprende a improvisar.",
      sessoes: [[["som", 5], ["arpejos", 10], ["modos", 15], ["musicas", 10]], [["som", 5], ["mecanismo", 10], ["jazz2", 15], ["balanco", 10]], [["som", 5], ["estudos", 10], ["jazz2", 15], ["ornamentos", 10]], [["som", 5], ["balanco", 10], ["jazz2", 10], ["musicas", 15]]] },
    { foco: "Do choro à bossa", texto: "Uma semana brasileira. Choro com articulação viva, bossa com colcheias iguais e som macio. A mesma colcheia muda de jeito em cada estilo.",
      sessoes: [[["som", 5], ["ornamentos", 10], ["musicas", 15], ["balanco", 10]], [["som", 5], ["mecanismo", 10], ["estudos", 10], ["musicas", 15]], [["som", 5], ["arpejos", 10], ["balanco", 10], ["musicas", 15]], [["som", 5], ["expressao", 10], ["modos", 10], ["musicas", 15]]] },
    { foco: "Fechar o quinto mês", texto: "Última semana do quinto mês. Na sessão final, grave uma música do repertório com o playback.",
      sessoes: [[["som", 5], ["mecanismo", 10], ["arpejos", 10], ["estudos", 15]], [["som", 5], ["balanco", 10], ["modos", 15], ["musicas", 10]], [["som", 5], ["ornamentos", 10], ["estudos", 10], ["musicas", 15]], [["som", 5], ["tons", 10], ["musicas", 25]]] },
    { foco: "Sexto mês: sessões de 45 minutos", texto: "As sessões chegam a 45 minutos. Se o dia estiver corrido, faça o aquecimento e os dois primeiros blocos. Regularidade vale mais que duração.",
      sessoes: [[["som", 5], ["mecanismo", 10], ["arpejos", 10], ["estudos", 10], ["musicas", 10]], [["som", 5], ["ornamentos", 10], ["balanco", 10], ["modos", 10], ["musicas", 10]], [["som", 5], ["mecanismo", 10], ["estudos", 10], ["jazz2", 10], ["balanco", 10]], [["som", 5], ["tons", 10], ["expressao", 10], ["musicas", 20]]] },
    { foco: "Interpretação", texto: "Os estudos de interpretação do Rubank e os Ferling lentos pedem som, vibrato e frase. Grave um trecho no gravador do app e ouça antes de avaliar o bloco.",
      sessoes: [[["som", 10], ["ornamentos", 15], ["estudos", 10], ["mecanismo", 10]], [["som", 10], ["estudos", 15], ["arpejos", 10], ["musicas", 10]], [["som", 10], ["expressao", 15], ["modos", 10], ["balanco", 10]], [["som", 10], ["estudos", 10], ["expressao", 10], ["musicas", 15]]] },
    { foco: "Montar o seu show", texto: "Escolha três músicas do repertório, de estilos diferentes, e toque as três em sequência como se fosse uma apresentação: entrada, música, pausa, próxima.",
      sessoes: [[["som", 5], ["mecanismo", 10], ["musicas", 20], ["balanco", 10]], [["som", 5], ["arpejos", 10], ["modos", 10], ["musicas", 20]], [["som", 5], ["ornamentos", 10], ["estudos", 10], ["musicas", 20]], [["som", 5], ["balanco", 10], ["jazz2", 10], ["musicas", 20]]] },
    { foco: "Fechar o semestre", texto: "Última semana do sexto mês. Na sessão final, grave o seu pequeno show e ouça ao lado do som do primeiro dia: são seis meses de estudo organizado.",
      sessoes: [[["som", 5], ["mecanismo", 10], ["arpejos", 10], ["estudos", 10], ["balanco", 10]], [["som", 5], ["ornamentos", 10], ["modos", 15], ["musicas", 15]], [["som", 5], ["estudos", 10], ["balanco", 10], ["musicas", 20]], [["som", 10], ["mecanismo", 5], ["musicas", 30]]] },
  );
  // Módulo 3: meses 7 a 9. Os cadernos do Naipe de escalas, intervalos, som, articulação e leitura rítmica.
  SEMANAS.push(
    { foco: "Escalas em toda a extensão", texto: "Começa o terceiro módulo, com os cadernos do Naipe. As escalas agora percorrem toda a extensão do sax, do Si♭ grave ao Fá agudo, e o aquecimento ganha notas longas com dinâmica.",
      sessoes: [[["somart", 5], ["escalas3", 15], ["arpejos", 10], ["estudos", 10]], [["somart", 5], ["leitura3", 10], ["escalas3", 10], ["musicas", 15]], [["somart", 5], ["intervalos", 10], ["escalas3", 10], ["ornamentos", 15]], [["somart", 5], ["escalas3", 10], ["artic", 10], ["musicas", 15]]] },
    { foco: "Intervalos e ouvido", texto: "Os intervalos entram com força. Cante a nota de cima antes de tocar: o ouvido guia o dedo.",
      sessoes: [[["somart", 5], ["intervalos", 15], ["escalas3", 10], ["estudos", 10]], [["somart", 5], ["intervalos", 10], ["leitura3", 10], ["musicas", 15]], [["somart", 5], ["intervalos", 10], ["arpejos", 10], ["modos", 15]], [["somart", 5], ["intervalos", 10], ["artic", 10], ["musicas", 15]]] },
    { foco: "Ler ritmo de verdade", texto: "Uma semana de leitura rítmica: bata, fale e toque. Síncope, contratempo e tercina precisam sair sem pensar. Começam também os estudos no estilo dos mestres e a escuta dos grandes solos, com o guia de transcrição.",
      sessoes: [[["somart", 5], ["leitura3", 15], ["escalas3", 10], ["escuta", 10]], [["somart", 5], ["leitura3", 15], ["intervalos", 10], ["estilos", 10]], [["somart", 5], ["leitura3", 10], ["artic", 10], ["estudos", 15]], [["somart", 5], ["leitura3", 10], ["escalas3", 10], ["musicas", 15]]] },
    { foco: "Fechar o sétimo mês", texto: "Última semana do sétimo mês. A sessão final termina com uma gravação da sua música preferida do repertório.",
      sessoes: [[["somart", 5], ["escalas3", 10], ["intervalos", 10], ["arpejos", 15]], [["somart", 5], ["artic", 10], ["leitura3", 10], ["ornamentos", 15]], [["somart", 5], ["estudos", 15], ["modos", 10], ["musicas", 10]], [["somart", 5], ["escalas3", 10], ["musicas", 25]]] },
    { foco: "O vocabulário do jazz", texto: "Pentatônicas, blues e escalas simétricas. Depois de cada escala, improvise um minuto só com as notas dela. Ouça os solos do guia antes de tocar os estudos de estilo.",
      sessoes: [[["somart", 5], ["escjazz", 15], ["arpejos", 10], ["estilos", 10]], [["somart", 5], ["escjazz", 10], ["leitura3", 10], ["escuta", 15]], [["somart", 5], ["escjazz", 10], ["modos", 10], ["jazz2", 15]], [["somart", 5], ["escjazz", 10], ["intervalos", 10], ["musicas", 15]]] },
    { foco: "Articulação a serviço da frase", texto: "Os doze padrões de articulação, aplicados às escalas e às músicas. A mesma frase muda de caráter com a língua.",
      sessoes: [[["somart", 5], ["artic", 15], ["escalas3", 10], ["estudos", 10]], [["somart", 5], ["artic", 10], ["escjazz", 10], ["musicas", 15]], [["somart", 5], ["artic", 10], ["ornamentos", 10], ["estilos", 15]], [["somart", 5], ["artic", 10], ["intervalos", 10], ["musicas", 15]]] },
    { foco: "Levadas brasileiras", texto: "Baião, maxixe, samba, xote e frevo no corpo e no sax. Toque cada levada antes das músicas brasileiras do repertório.",
      sessoes: [[["somart", 5], ["leitura3", 15], ["escjazz", 10], ["escuta", 10]], [["somart", 5], ["leitura3", 10], ["ornamentos", 10], ["musicas", 15]], [["somart", 5], ["leitura3", 10], ["escalas3", 10], ["estudos", 15]], [["somart", 5], ["leitura3", 10], ["arpejos", 10], ["musicas", 15]]] },
    { foco: "Fechar o oitavo mês", texto: "Última semana do oitavo mês. Grave uma música brasileira do repertório com o playback.",
      sessoes: [[["somart", 5], ["escalas3", 10], ["intervalos", 10], ["estudos", 15]], [["somart", 5], ["escjazz", 10], ["artic", 10], ["estilos", 15]], [["somart", 5], ["leitura3", 10], ["modos", 10], ["musicas", 15]], [["somart", 5], ["escalas3", 10], ["musicas", 25]]] },
    { foco: "Nono mês: rotina completa", texto: "As sessões reúnem tudo: som, escalas, intervalos, ritmo, estudos e repertório. É a rotina que você pode levar para a vida.",
      sessoes: [[["somart", 5], ["escalas3", 10], ["intervalos", 10], ["leitura3", 5], ["escuta", 15]], [["somart", 5], ["escjazz", 10], ["artic", 10], ["estilos", 10], ["musicas", 10]], [["somart", 5], ["arpejos", 10], ["modos", 10], ["estudos", 15], ["leitura3", 5]], [["somart", 5], ["escalas3", 10], ["ornamentos", 10], ["musicas", 20]]] },
    { foco: "Swing e bebop", texto: "Colcheias com swing, a escala bebop e os temas de jazz. Ouça Charlie Parker e Cannonball Adderley nesta semana.",
      sessoes: [[["somart", 5], ["escjazz", 10], ["leitura3", 10], ["estilos", 15]], [["somart", 5], ["artic", 10], ["escjazz", 10], ["musicas", 15]], [["somart", 5], ["intervalos", 10], ["jazz2", 15], ["modos", 10]], [["somart", 5], ["escjazz", 10], ["arpejos", 10], ["musicas", 15]]] },
    { foco: "Recital", texto: "Monte um pequeno recital com quatro músicas de estilos diferentes do repertório. Toque como se houvesse público: entrada, música, pausa, próxima.",
      sessoes: [[["somart", 5], ["escalas3", 10], ["escuta", 25]], [["somart", 5], ["artic", 10], ["musicas", 25]], [["somart", 5], ["ornamentos", 10], ["musicas", 25]], [["somart", 5], ["escjazz", 10], ["musicas", 25]]] },
    { foco: "Fechar os nove meses", texto: "Última semana do terceiro módulo. Na sessão final, grave o seu recital e ouça ao lado do som do primeiro dia: são nove meses de estudo organizado.",
      sessoes: [[["somart", 5], ["escalas3", 10], ["intervalos", 10], ["estudos", 15]], [["somart", 5], ["escjazz", 10], ["leitura3", 10], ["estilos", 15]], [["somart", 5], ["artic", 10], ["arpejos", 10], ["musicas", 15]], [["somart", 10], ["musicas", 30]]] },
  );
  const MARCOS_MES = ["primeiro", "segundo", "terceiro", "quarto", "quinto", "sexto", "sétimo", "oitavo", "nono"];
  const MODULOS = [
    { nome: "Módulo 1", periodo: "Meses 1 a 3", texto: "A base: rotina, técnica, leitura, ritmo, articulação, repertório e as primeiras colcheias de jazz.", de: 0, ate: 12 },
    { nome: "Módulo 2", periodo: "Meses 4 a 6", texto: "Marcel Mule, Ferling, Rubank Avançado, os cadernos do Naipe de arpejos, modos gregos e ornamentos, groove, os primeiros improvisos e as músicas do repertório essencial.", de: 12, ate: 24 },
    { nome: "Módulo 3", periodo: "Meses 7 a 9", texto: "Os cadernos do Naipe: escalas em toda a extensão, escalas do jazz, intervalos, som, articulação, leitura rítmica, estudos no estilo dos mestres e a escuta e transcrição dos grandes solos.", de: 24, ate: 36 },
  ];
  const UNIDADES_PLANO = SEMANAS.map((sem, w) => ({
    plano: true, titulo: `Semana ${w + 1} · ${sem.foco}`, foco: sem.foco, texto: sem.texto,
    marco: w === 11 ? "Completei três meses de estudo organizado no saxofone." : w === 23 ? "Completei seis meses de estudo organizado no saxofone." : w === 35 ? "Completei nove meses de estudo organizado no saxofone." : w % 4 === 3 ? `Completei o ${MARCOS_MES[(w + 1) / 4 - 1]} mês do meu plano de estudos no saxofone.` : `Completei a semana ${w + 1} do meu plano de estudos.`,
    licoes: sem.sessoes.map((blocos, k) => ({
      id: `s${w + 1}-${k + 1}`, titulo: `Sessão ${k + 1}`, resumo: blocos.map(([t]) => TRILHOS[t].nome).join(" · ") + ` · cerca de ${blocos.reduce((a, b) => a + b[1], 0)} min`,
      sessao: { semana: w, blocos, gravar: k === sem.sessoes.length - 1 && w % 4 === 3 ? `s${w + 1}` : null }, passos: [],
    })),
  }));

  const UNIDADES = [
    {
      titulo: "Primeiro som", marco: "Toquei minha primeira música no saxofone.", licoes: [
        {
          id: "som", titulo: "O primeiro som", resumo: "Respiração, embocadura e uma nota longa",
          passos: [
            { tipo: "info", titulo: "Antes das notas, o som", texto: ["O saxofone responde ao ar. Um som firme nasce de uma respiração calma e de uma embocadura relaxada.", "Nesta lição você não precisa ler nada. Só soprar e ouvir."] },
            { tipo: "info", titulo: "Embocadura em 3 pontos", lista: ["Dentes de cima apoiados na boquilha, a cerca de 1 cm da ponta.", "Lábio de baixo levemente dobrado sobre os dentes, como uma almofada.", "Cantos da boca firmes, para o ar não escapar. Bochechas sem inflar."], video: "Vídeo do Tiago: embocadura e postura" },
            { tipo: "escolha", pergunta: "Na respiração para tocar, o que deve acontecer com os ombros?", opcoes: ["Sobem a cada respiração", "Ficam parados e relaxados", "Vão para a frente"], certa: 1, explica: "O ar entra pela boca e enche a parte baixa do tronco. Ombro subindo é sinal de tensão." },
            { tipo: "tocar", livre: true, segundos: 3, titulo: "Sua vez: uma nota longa", texto: "Toque qualquer nota e sustente o som por 3 segundos, sem tremer." },
            { tipo: "gravar", chave: "primeira", titulo: "Guarde este momento", texto: "Grave alguns segundos do seu som de hoje. Daqui a algumas semanas você vai ouvir de novo e perceber o quanto mudou." },
            { tipo: "escolha", pergunta: "Para começar o som, a língua…", opcoes: ["Bate forte na palheta", "Encosta de leve, como quem diz “tu”", "Não participa"], certa: 1, explica: "A língua solta o ar com um “tu” leve. Quem faz o som é o ar." },
          ],
        },
        {
          id: "pauta", titulo: "A pauta e a clave de sol", resumo: "Onde as notas moram",
          passos: [
            { tipo: "info", titulo: "Cinco linhas, quatro espaços", texto: ["A música é escrita na pauta: cinco linhas e quatro espaços, contados de baixo para cima.", "Quanto mais alta a nota na pauta, mais agudo o som."], pauta: [] },
            { tipo: "escolha", pergunta: "Quantas linhas tem a pauta?", opcoes: ["Quatro", "Cinco", "Seis"], certa: 1 },
            { tipo: "info", titulo: "A clave de sol", texto: ["O sinal no começo da pauta é a clave de sol. Ela marca a 2ª linha: a nota escrita nessa linha se chama Sol.", "A partir do Sol você encontra todas as outras."], pauta: [["sol", 4]] },
            { tipo: "ondefica", nota: "sol", titulo: "Coloque o Sol na pauta", texto: "Toque na linha onde a nota Sol mora." },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual é o mais agudo?", sons: ["sol", "si"], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "O segundo som era o Si, que fica acima do Sol na pauta." },
          ],
        },
        {
          id: "notas", titulo: "Sol, Lá e Si", resumo: "As três primeiras notas, na pauta e no sax",
          passos: [
            { tipo: "info", titulo: "Três notas, três dedos", texto: ["As primeiras notas usam só a mão esquerda. Cada dedo que você fecha deixa o som mais grave."], dedos: ["si", "la", "sol"] },
            { tipo: "info", titulo: "Na pauta", texto: ["Sol na 2ª linha, Lá no espaço logo acima, Si na 3ª linha. Sobem como degraus."], pauta: [["sol", 4], ["la", 4], ["si", 4]], rotulos: true },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["si", "sol", "la"] },
            { tipo: "ondefica", nota: "la", titulo: "Coloque o Lá na pauta", texto: "Toque no lugar onde o Lá fica." },
            { tipo: "escolha", pergunta: "Que nota é esta?", pauta: [["si", 4]], opcoes: ["Sol", "Lá", "Si"], certa: 2 },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Sol?", nota: "sol", notas: ["si", "la", "sol"] },
            { tipo: "tocar", nota: "si", segundos: 2, titulo: "Toque o Si", texto: "Um dedo fechado. Sustente por 2 segundos." },
            { tipo: "tocar", nota: "la", segundos: 2, titulo: "Toque o Lá", texto: "Dois dedos fechados." },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Toque o Sol", texto: "Três dedos fechados." },
          ],
        },
        {
          id: "pulso", titulo: "O pulso", resumo: "Semibreve, mínima e semínima",
          passos: [
            { tipo: "info", titulo: "A música tem um coração", texto: ["O pulso é a batida regular da música, a mesma que faz você bater o pé.", "Cada figura diz por quantos pulsos (tempos) o som dura."], figuras: true },
            { tipo: "escolha", pergunta: "Quantos tempos dura a mínima?", pauta: [["sol", 2]], opcoes: ["Um", "Dois", "Quatro"], certa: 1 },
            { tipo: "ritmo", titulo: "Bata as semínimas", texto: "Depois da contagem, toque no botão em cada batida: quatro semínimas.", padrao: [1, 1, 1, 1] },
            { tipo: "ritmo", titulo: "Bata as mínimas", texto: "Agora duas mínimas: toque no 1 e no 3 e deixe o som durar.", padrao: [2, 2] },
            { tipo: "escolha", pergunta: "Qual figura dura quatro tempos?", opcoes: ["Semínima", "Mínima", "Semibreve"], certa: 2 },
            { tipo: "ritmo", titulo: "Misture as figuras", texto: "Mínima, semínima, semínima.", padrao: [2, 1, 1] },
          ],
        },
        {
          id: "ler", titulo: "Ler e tocar", resumo: "Nota e duração ao mesmo tempo",
          passos: [
            { tipo: "info", titulo: "Duas perguntas para cada nota", texto: ["Ao ler, pergunte sempre: que nota é? Quanto dura?", "A posição na pauta responde a primeira. O desenho da figura responde a segunda."], pauta: [["si", 2], ["la", 1], ["sol", 1]], rotulos: true },
            { tipo: "escolha", pergunta: "Qual é a primeira nota e quanto ela dura?", pauta: [["la", 2], ["sol", 2]], opcoes: ["Lá, dois tempos", "Sol, dois tempos", "Lá, um tempo"], certa: 0 },
            { tipo: "ritmo", titulo: "Primeiro o ritmo", texto: "Bata o ritmo deste compasso antes de tocar.", pauta: [["si", 2], ["la", 1], ["sol", 1]], padrao: [2, 1, 1] },
            { tipo: "tocar", nota: "si", segundos: 2, titulo: "Agora as notas", texto: "Toque o Si e sustente.", pauta: [["si", 2], ["la", 1], ["sol", 1]] },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "Lá", texto: "Passe para o Lá." },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "Sol", texto: "E termine no Sol." },
          ],
        },
        {
          id: "musica", titulo: "Primeira música", resumo: "“Primeiro Passo”, com Sol, Lá e Si", melodia: PRIMEIRO_PASSO,
          passos: [
            { tipo: "info", titulo: "Primeiro Passo", texto: ["Esta é a sua primeira música. Ela usa só o que você aprendeu: três notas e três figuras.", "Ouça uma vez acompanhando a partitura com os olhos."], melodia: true },
            { tipo: "escolha", pergunta: "Com que nota a música termina?", melodia: true, opcoes: ["Si", "Lá", "Sol"], certa: 2 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música. O app acompanha cada nota pelo microfone." },
            { tipo: "gravar", chave: "u1", comparar: true, titulo: "Antes e depois", texto: "Grave “Primeiro Passo” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Sete notas", marco: "Já leio partitura e toco sete notas no saxofone.", licoes: [
        {
          id: "do", titulo: "O Dó", resumo: "Uma nota acima do Si, com um dedo só",
          passos: [
            { tipo: "info", titulo: "Subindo um degrau", texto: ["Acima do Si vem o Dó. Na pauta ele fica no 3º espaço.", "No sax, o Dó usa só o dedo do meio da mão esquerda. O indicador levanta."], pauta: [["si", 4], ["do", 4]], rotulos: true, dedos: ["si", "do"] },
            { tipo: "escolha", pergunta: "Que nota é esta?", pauta: [["do", 4]], opcoes: ["Lá", "Si", "Dó"], certa: 2 },
            { tipo: "escolha", pergunta: "Qual dedo fecha para tocar o Dó?", opcoes: ["O indicador", "O dedo do meio", "O anelar"], certa: 1, dedos: ["do"] },
            { tipo: "tocar", nota: "do", segundos: 2, titulo: "Toque o Dó", texto: "Só o dedo do meio. Sustente por 2 segundos." },
            { tipo: "info", titulo: "A troca Si–Dó", texto: ["Passar do Si para o Dó é uma troca de dedos: um sobe enquanto o outro desce, ao mesmo tempo.", "Faça devagar. Se os dois dedos não se moverem juntos, aparece uma nota no meio."] },
            { tipo: "tocar", nota: "si", segundos: 1, titulo: "Si…", texto: "Comece no Si." },
            { tipo: "tocar", nota: "do", segundos: 1, titulo: "…Dó", texto: "Troque para o Dó sem parar o ar." },
          ],
        },
        {
          id: "compasso", titulo: "O compasso e a pausa", resumo: "Barras, 4 tempos e o silêncio que conta",
          passos: [
            { tipo: "info", ouvir: true, titulo: "A música em fatias", texto: ["As barras verticais dividem a música em compassos. Aqui, cada compasso tem 4 tempos.", "Contar “1, 2, 3, 4” e recomeçar a cada barra ajuda a não se perder."], pauta: [["sol", 2], ["la", 2], ["si", 1], ["si", 1], ["la", 2]], compassos: true },
            { tipo: "escolha", pergunta: "Quantos tempos cabem em cada compasso desta música?", pauta: [["sol", 2], ["la", 2], ["si", 4]], compassos: true, opcoes: ["Dois", "Três", "Quatro"], certa: 2 },
            { tipo: "info", ouvir: true, titulo: "A pausa de semínima", texto: ["Silêncio também é música. Este sinal é a pausa de semínima: um tempo sem som.", "Na pausa o pulso continua. Você conta, mas não toca."], pauta: [["sol", 1], [P, 1], ["sol", 1], [P, 1]] },
            { tipo: "escolha", pergunta: "Quanto dura a pausa de semínima?", pauta: [[P, 1]], opcoes: ["Um tempo de silêncio", "Dois tempos de silêncio", "Não tem duração"], certa: 0 },
            { tipo: "ritmo", titulo: "Bata com pausa", texto: "Toque, toque, silêncio, toque. No terceiro tempo, não bata.", pauta: [["sol", 1], ["sol", 1], [P, 1], ["sol", 1]], padrao: [1, 1, -1, 1] },
            { tipo: "ritmo", titulo: "Mais uma", texto: "Toque, silêncio, toque, silêncio.", pauta: [["sol", 1], [P, 1], ["sol", 1], [P, 1]], padrao: [1, -1, 1, -1] },
          ],
        },
        {
          id: "direita", titulo: "A mão direita: Fá, Mi e Ré", resumo: "Três notas para baixo do Sol",
          passos: [
            { tipo: "info", titulo: "Agora as duas mãos", texto: ["Com a mão esquerda fechada no Sol, cada dedo da mão direita que você fecha desce mais uma nota: Fá, Mi e Ré.", "Quanto mais grave, mais ar quente e garganta aberta."], dedos: ["fa", "mi", "re"] },
            { tipo: "info", titulo: "Na pauta", texto: ["Descendo a partir do Sol: Fá no 1º espaço, Mi na 1ª linha e Ré pendurado logo abaixo dela."], pauta: [["sol", 4], ["fa", 4], ["mi", 4], ["re", 4]], rotulos: true },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["mi", "re", "fa"] },
            { tipo: "ondefica", nota: "mi", titulo: "Coloque o Mi na pauta", texto: "Toque no lugar onde o Mi fica." },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Fá?", nota: "fa", notas: ["mi", "fa", "sol"] },
            { tipo: "tocar", nota: "fa", segundos: 2, titulo: "Toque o Fá", texto: "Mão esquerda fechada e o indicador da direita." },
            { tipo: "tocar", nota: "mi", segundos: 2, titulo: "Toque o Mi", texto: "Mais o dedo do meio da direita." },
            { tipo: "tocar", nota: "re", segundos: 2, titulo: "Toque o Ré", texto: "As duas mãos fechadas. Ar quente e contínuo." },
          ],
        },
        {
          id: "sete", titulo: "De Ré a Dó", resumo: "Ler as sete notas misturadas",
          passos: [
            { tipo: "info", titulo: "A escada inteira", texto: ["Você já tem sete notas seguidas. Subindo: Ré, Mi, Fá, Sol, Lá, Si, Dó.", "Linha, espaço, linha, espaço: as notas vizinhas sempre alternam."], pauta: [["re", 1], ["mi", 1], ["fa", 1], ["sol", 1], ["la", 1], ["si", 1], ["do", 1]], rotulos: true },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["do", "fa", "re", "la"] },
            { tipo: "ondefica", nota: "do", titulo: "Coloque o Dó na pauta", texto: "Toque no lugar onde o Dó fica." },
            { tipo: "ondefica", nota: "re", titulo: "Coloque o Ré na pauta", texto: "Agora a nota mais grave que você conhece." },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Mi?", nota: "mi", notas: ["re", "mi", "fa"] },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. A melodia sobe ou desce?", sons: ["la", "fa"], opcoes: ["Sobe", "Desce"], certa: 1, explica: "Foi do Lá para o Fá: desceu." },
            { tipo: "escolha", pergunta: "Estas três notas estão…", pauta: [["mi", 1], ["fa", 1], ["sol", 1]], opcoes: ["Subindo por degraus", "Descendo por degraus", "Repetindo a mesma nota"], certa: 0 },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. A melodia sobe ou desce?", sons: ["sol", "do"], opcoes: ["Sobe", "Desce"], certa: 0, explica: "Foi do Sol para o Dó: subiu." },
            { tipo: "escolha", pergunta: "Qual é a nota mais grave que você já sabe tocar?", opcoes: ["Sol", "Mi", "Ré"], certa: 2 },
          ],
        },
        {
          id: "frase", titulo: "Uma frase inteira", resumo: "Ritmo primeiro, notas depois",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O jeito Naipe de ler", texto: ["Diante de uma frase nova, siga sempre a mesma ordem: bata o ritmo, diga o nome das notas e só então toque.", "Parece mais lento. Na prática você acerta antes."], pauta: [["sol", 1], ["fa", 1], ["mi", 2]] },
            { tipo: "ritmo", titulo: "1. Bata o ritmo", texto: "Semínima, semínima, mínima.", pauta: [["sol", 1], ["fa", 1], ["mi", 2]], padrao: [1, 1, 2] },
            { tipo: "escolha", pergunta: "2. Diga as notas. Qual é a ordem?", pauta: [["sol", 1], ["fa", 1], ["mi", 2]], opcoes: ["Sol, Fá, Mi", "Sol, Lá, Si", "Mi, Fá, Sol"], certa: 0 },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "3. Toque: Sol", texto: "Comece no Sol.", pauta: [["sol", 1], ["fa", 1], ["mi", 2]] },
            { tipo: "tocar", nota: "fa", segundos: 1, titulo: "Fá", texto: "Desça para o Fá." },
            { tipo: "tocar", nota: "mi", segundos: 2, titulo: "Mi", texto: "E sustente o Mi por dois tempos." },
            { tipo: "ritmo", titulo: "Outra frase: o ritmo", texto: "Atenção à pausa no último tempo.", pauta: [["la", 1], ["si", 1], ["do", 1], [P, 1]], padrao: [1, 1, 1, -1] },
            { tipo: "tocar", nota: "do", segundos: 1, titulo: "E a nota de chegada", texto: "A frase sobe Lá, Si, Dó. Toque o Dó onde ela termina.", pauta: [["la", 1], ["si", 1], ["do", 1], [P, 1]] },
          ],
        },
        {
          id: "musica2", titulo: "Segunda música", resumo: "“Caminho de Casa”, com as sete notas", melodia: CAMINHO_DE_CASA,
          passos: [
            { tipo: "info", titulo: "Caminho de Casa", texto: ["Sua segunda música sobe até o Dó, desce até o Ré e volta para o Sol.", "Repare na pausa no fim do segundo compasso: é onde você respira."], melodia: true },
            { tipo: "escolha", pergunta: "Em qual compasso está a pausa?", melodia: true, opcoes: ["No primeiro", "No segundo", "No terceiro"], certa: 1 },
            { tipo: "ritmo", titulo: "O ritmo do segundo compasso", texto: "Mínima, semínima e pausa.", pauta: [["si", 2], ["sol", 1], [P, 1]], padrao: [2, 1, -1] },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira. Respire na pausa." },
            { tipo: "gravar", chave: "u2", comparar: true, titulo: "Antes e depois", texto: "Grave “Caminho de Casa” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Colcheias e ligaduras", marco: "Leio e toco colcheias, pontos e ligaduras no saxofone.", licoes: [
        {
          id: "colcheia", titulo: "A colcheia", resumo: "Duas notas dentro de um tempo",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Meio tempo", texto: ["A colcheia dura meio tempo: cabem duas em cada pulso. Quando vêm em par, elas aparecem unidas por uma trave.", "Para contar, diga “1 e 2 e 3 e 4 e”. O número cai no clique, o “e” cai no meio."], pauta: [["sol", 1], ["sol", 0.5], ["sol", 0.5], ["sol", 1], ["sol", 1]] },
            { tipo: "escolha", pergunta: "Quantas colcheias cabem em uma semínima?", opcoes: ["Uma", "Duas", "Quatro"], certa: 1 },
            { tipo: "ritmo", titulo: "Bata as colcheias", texto: "Semínima, duas colcheias, semínima, semínima.", pauta: [["sol", 1], ["sol", 0.5], ["sol", 0.5], ["sol", 1], ["sol", 1]], padrao: [1, 0.5, 0.5, 1, 1] },
            { tipo: "ritmo", titulo: "Colcheias no começo", texto: "Duas colcheias, semínima, mínima.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", 1], ["sol", 2]], padrao: [0.5, 0.5, 1, 2] },
            { tipo: "escolha", pergunta: "Na contagem “1 e 2 e”, onde cai a segunda colcheia de cada par?", opcoes: ["No número", "No “e”", "Depois do clique seguinte"], certa: 1 },
            { tipo: "ritmo", titulo: "Quatro colcheias seguidas", texto: "Quatro colcheias e uma mínima. Mantenha as colcheias iguais.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 2]], padrao: [0.5, 0.5, 0.5, 0.5, 2] },
          ],
        },
        {
          id: "colcheias-notas", titulo: "Colcheias com notas", resumo: "Dedos e língua no meio do tempo",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Língua leve", texto: ["Em colcheias, a língua toca a palheta de leve em cada nota, sem parar o ar.", "Ouça a frase com o pulso antes de tocar."], pauta: [["sol", 0.5], ["la", 0.5], ["si", 1], ["la", 0.5], ["sol", 0.5], ["la", 1]] },
            { tipo: "ritmo", titulo: "Primeiro o ritmo", texto: "Bata o ritmo da frase.", pauta: [["sol", 0.5], ["la", 0.5], ["si", 1], ["la", 0.5], ["sol", 0.5], ["la", 1]], padrao: [0.5, 0.5, 1, 0.5, 0.5, 1] },
            { tipo: "escolha", pergunta: "Qual é a ordem das notas?", pauta: [["sol", 0.5], ["la", 0.5], ["si", 1], ["la", 0.5], ["sol", 0.5], ["la", 1]], opcoes: ["Sol, Lá, Si, Lá, Sol, Lá", "Sol, Lá, Si, Si, Lá, Sol", "Si, Lá, Sol, Lá, Si, Lá"], certa: 0 },
            { tipo: "tocar", nota: "si", segundos: 1, titulo: "Toque até o Si", texto: "Ligue o pulso, toque Sol, Lá em colcheias e pare no Si.", pauta: [["sol", 0.5], ["la", 0.5], ["si", 1]] },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "A frase inteira", texto: "Agora a frase toda. Ela termina no Lá.", pauta: [["sol", 0.5], ["la", 0.5], ["si", 1], ["la", 0.5], ["sol", 0.5], ["la", 1]] },
          ],
        },
        {
          id: "pontuada", titulo: "A mínima pontuada", resumo: "O ponto que soma metade",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O ponto de aumento", texto: ["Um ponto ao lado da nota soma metade do valor dela. A mínima vale 2, então a mínima pontuada vale 3 tempos."], pauta: [["sol", 3], ["sol", 1]] },
            { tipo: "escolha", pergunta: "Quantos tempos dura a mínima pontuada?", pauta: [["la", 3]], opcoes: ["Dois", "Dois e meio", "Três"], certa: 2 },
            { tipo: "ritmo", titulo: "Três e um", texto: "Mínima pontuada e semínima: toque no 1 e no 4.", pauta: [["sol", 3], ["sol", 1]], padrao: [3, 1] },
            { tipo: "ritmo", titulo: "Um e três", texto: "Semínima e mínima pontuada: toque no 1 e no 2.", pauta: [["sol", 1], ["sol", 3]], padrao: [1, 3] },
            { tipo: "tocar", nota: "la", segundos: 3, titulo: "Sustente por três tempos", texto: "Ligue o pulso e segure o Lá por três cliques.", pauta: [["la", 3], [P, 1]] },
          ],
        },
        {
          id: "ligadura", titulo: "A ligadura", resumo: "Somar durações e tocar ligado",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Ligadura de valor", texto: ["Uma linha curva entre duas notas iguais soma as durações. Você toca a primeira e segura até o fim da segunda, sem dar nova língua."], pauta: [["sol", 2, L], ["sol", 1], ["la", 1]] },
            { tipo: "escolha", pergunta: "Mínima ligada a uma semínima da mesma nota. Quanto dura o som?", pauta: [["si", 2, L], ["si", 1]], opcoes: ["Dois tempos", "Três tempos", "Um tempo"], certa: 1 },
            { tipo: "ritmo", titulo: "Bata com a ligadura", texto: "A nota ligada não ganha batida nova: toque no 1 e no 4.", pauta: [["sol", 2, L], ["sol", 1], ["la", 1]], padrao: [3, 1] },
            { tipo: "info", ouvir: true, titulo: "Ligadura de expressão", texto: ["Quando a curva une notas diferentes, ela pede legato: língua só na primeira, e as outras saem no mesmo sopro.", "É assim que uma melodia soa cantada."], pauta: [["sol", 1, L], ["la", 1, L], ["si", 2]] },
            { tipo: "escolha", pergunta: "Em três notas ligadas, quantas vezes a língua toca a palheta?", opcoes: ["Uma vez, na primeira", "Três vezes", "Nenhuma"], certa: 0 },
            { tipo: "tocar", nota: "si", segundos: 2, titulo: "Toque ligado", texto: "Sol, Lá e Si num sopro só. Sustente o Si.", pauta: [["sol", 1, L], ["la", 1, L], ["si", 2]] },
          ],
        },
        {
          id: "frases3", titulo: "Frases com tudo", resumo: "Colcheias, pontos e ligaduras juntos",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Ler em blocos", texto: ["Em vez de ler nota por nota, olhe o tempo inteiro de uma vez: um par de colcheias é um bloco, uma mínima é outro.", "Ouça e acompanhe com os olhos."], pauta: [["fa", 0.5], ["sol", 0.5], ["la", 1], ["sol", 2], ["mi", 0.5], ["fa", 0.5], ["sol", 3]], compassos: true },
            { tipo: "ritmo", titulo: "O ritmo do primeiro compasso", texto: "Duas colcheias, semínima, mínima.", pauta: [["fa", 0.5], ["sol", 0.5], ["la", 1], ["sol", 2]], padrao: [0.5, 0.5, 1, 2] },
            { tipo: "ritmo", titulo: "O ritmo do segundo compasso", texto: "Duas colcheias e mínima pontuada.", pauta: [["mi", 0.5], ["fa", 0.5], ["sol", 3]], padrao: [0.5, 0.5, 3] },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["mi", "la", "fa", "sol"] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Primeiro compasso", texto: "Fá, Sol, Lá e pare no Sol.", pauta: [["fa", 0.5], ["sol", 0.5], ["la", 1], ["sol", 2]] },
            { tipo: "tocar", nota: "sol", segundos: 3, titulo: "Segundo compasso", texto: "Mi, Fá e sustente o Sol por três tempos.", pauta: [["mi", 0.5], ["fa", 0.5], ["sol", 3]] },
          ],
        },
        {
          id: "musica3", titulo: "Terceira música", resumo: "“Roda de Sábado”, com colcheias", melodia: RODA_DE_SABADO,
          passos: [
            { tipo: "info", titulo: "Roda de Sábado", texto: ["Uma melodia que anda: quase todo compasso começa com um par de colcheias.", "Escolha um andamento confortável, ouça com o pulso e só depois toque."], melodia: true },
            { tipo: "ritmo", titulo: "O ritmo do primeiro compasso", texto: "Duas colcheias e três semínimas.", pauta: [["sol", 0.5], ["la", 0.5], ["si", 1], ["si", 1], ["la", 1]], padrao: [0.5, 0.5, 1, 1, 1] },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira no andamento que você escolheu." },
            { tipo: "gravar", chave: "u3", comparar: true, titulo: "Antes e depois", texto: "Grave “Roda de Sábado” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "A escala de Sol maior", marco: "Toco a escala de Sol maior inteira no saxofone.", licoes: [
        {
          id: "oitava", titulo: "A chave de oitava", resumo: "Ré e Mi agudos com o polegar esquerdo",
          passos: [
            { tipo: "info", titulo: "O mesmo dedilhado, uma oitava acima", texto: ["Atrás do sax, o polegar esquerdo descansa sobre uma chave: a chave de oitava.", "Apertando ela, a mesma digitação soa uma oitava acima. Ré com a chave vira Ré agudo."], dedos: ["re", "re2"] },
            { tipo: "info", titulo: "Na pauta", texto: ["Depois do Dó, a escada continua: Ré agudo na 4ª linha e Mi agudo no 4º espaço.", "Repare que a haste dessas notas aponta para baixo. É só para caber melhor na pauta."], pauta: [["do", 2], ["re2", 2], ["mi2", 2]], rotulos: true },
            { tipo: "ondefica", nota: "re2", titulo: "Coloque o Ré agudo na pauta", texto: "Ele fica uma nota acima do Dó." },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Mi agudo?", nota: "mi2", notas: ["mi", "mi2", "re2"] },
            { tipo: "tocar", nota: "re2", segundos: 2, titulo: "Toque o Ré agudo", texto: "Tudo fechado e o polegar na chave de oitava. Ar rápido, sem morder." },
            { tipo: "tocar", nota: "mi2", segundos: 2, titulo: "Toque o Mi agudo", texto: "Levante o anelar da direita, sem soltar a chave de oitava." },
            { tipo: "info", titulo: "A passagem Dó–Ré", texto: ["Do Dó para o Ré agudo, quase todos os dedos fecham de uma vez e o polegar aperta a oitava.", "É a troca mais trabalhosa até aqui. Faça devagar, com os dedos perto das chaves."] },
            { tipo: "tocar", nota: "do", segundos: 1, titulo: "Dó…", texto: "Comece no Dó." },
            { tipo: "tocar", nota: "re2", segundos: 1, titulo: "…Ré agudo", texto: "Feche tudo junto, sem parar o ar." },
          ],
        },
        {
          id: "sustenido", titulo: "O sustenido e o Fá♯", resumo: "Meio tom acima",
          passos: [
            { tipo: "info", titulo: "O sinal ♯", texto: ["O sustenido, escrito antes da nota, sobe o som meio tom. Fá com sustenido é Fá♯: um pouco mais agudo que o Fá.", "Ele vale até o fim do compasso em que aparece."], pauta: [["fa", 2], ["fas", 2]], rotulos: true },
            { tipo: "info", titulo: "A digitação do Fá♯", texto: ["No Fá você fecha o indicador da mão direita. No Fá♯, troque pelo dedo do meio."], dedos: ["fa", "fas"] },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Fá♯?", nota: "fas", notas: ["fa", "fas", "mi"] },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual é o Fá♯?", sons: ["fa", "fas"], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "O Fá♯ é o mais agudo dos dois." },
            { tipo: "tocar", nota: "fas", segundos: 2, titulo: "Toque o Fá♯", texto: "Mão esquerda fechada e o dedo do meio da direita." },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "Fá♯ para Sol", texto: "Agora solte o dedo e chegue no Sol." },
          ],
        },
        {
          id: "agudos", titulo: "Fá♯ e Sol agudos", resumo: "O topo da escala",
          passos: [
            { tipo: "info", titulo: "Mais dois degraus", texto: ["Com a chave de oitava, o Fá♯ e o Sol também ganham a versão aguda.", "Fá♯ agudo na 5ª linha, Sol agudo logo acima da pauta."], pauta: [["mi2", 2], ["fas2", 2], ["sol2", 2]], rotulos: true, dedos: ["fas2", "sol2"] },
            { tipo: "ondefica", nota: "sol2", titulo: "Coloque o Sol agudo na pauta", texto: "Ele fica logo acima da última linha." },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["re2", "sol2", "mi2", "fas2"] },
            { tipo: "tocar", nota: "fas2", segundos: 2, titulo: "Toque o Fá♯ agudo", texto: "A digitação do Fá♯ com a chave de oitava." },
            { tipo: "tocar", nota: "sol2", segundos: 2, titulo: "Toque o Sol agudo", texto: "Garganta aberta. Pense no som indo para a frente, sem apertar a boquilha." },
          ],
        },
        {
          id: "escala", titulo: "A escala de Sol maior", resumo: "Oito notas em ordem, de Sol a Sol",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O que é uma escala", texto: ["Escala é uma fila de notas vizinhas, de uma nota até a mesma nota uma oitava acima.", "A de Sol maior tem um único sustenido: o Fá♯. É ele que dá o som de “dó-ré-mi” começando no Sol."], pauta: [["sol", 1], ["la", 1], ["si", 1], ["do", 1], ["re2", 1], ["mi2", 1], ["fas2", 1], ["sol2", 1]], compassos: true },
            { tipo: "escolha", pergunta: "Qual nota da escala de Sol maior leva sustenido?", opcoes: ["O Dó", "O Fá", "O Si"], certa: 1 },
            { tipo: "tocar", nota: "do", segundos: 1, titulo: "A primeira metade", texto: "Sol, Lá, Si, Dó. Pare no Dó.", pauta: [["sol", 1], ["la", 1], ["si", 1], ["do", 1]] },
            { tipo: "tocar", nota: "sol2", segundos: 1, titulo: "A segunda metade", texto: "Ré, Mi, Fá♯, Sol, todos com a chave de oitava. Pare no Sol agudo.", pauta: [["re2", 1], ["mi2", 1], ["fas2", 1], ["sol2", 1]] },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. A escala está subindo ou descendo?", sons: ["mi2", "re2"], opcoes: ["Subindo", "Descendo"], certa: 1, explica: "Foi do Mi agudo para o Ré agudo: descendo." },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "E a volta", texto: "Desça do Sol agudo até o Sol grave. Sustente a chegada.", pauta: [["sol2", 1], ["fas2", 1], ["mi2", 1], ["re2", 1], ["do", 1], ["si", 1], ["la", 1], ["sol", 1]] },
          ],
        },
        {
          id: "escala-pulso", titulo: "A escala no pulso", resumo: "Subir e descer sem parar", melodia: ESCALA_SOL,
          passos: [
            { tipo: "info", titulo: "Devagar se vai longe", texto: ["Escala se estuda no pulso, num andamento em que nenhuma nota tropeça.", "Comece em 60. Só aumente quando subir e descer sair limpo duas vezes seguidas."], melodia: true },
            { tipo: "ritmo", titulo: "Sinta as quatro semínimas", texto: "Bata um compasso da escala.", padrao: [1, 1, 1, 1] },
            { tipo: "musica", titulo: "Suba e desça com o pulso", texto: "Depois da contagem, toque a escala inteira, uma nota por clique." },
          ],
        },
        {
          id: "musica4", titulo: "Quarta música", resumo: "“Manhã de Sol”, em Sol maior", melodia: MANHA_DE_SOL,
          passos: [
            { tipo: "info", titulo: "Manhã de Sol", texto: ["Uma melodia em Sol maior que sobe até o Mi agudo e desce passando pelo Fá♯.", "Ouça com o pulso e repare na mínima pontuada do final."], melodia: true },
            { tipo: "escolha", pergunta: "Qual é a nota mais aguda desta música?", melodia: true, opcoes: ["Ré agudo", "Mi agudo", "Sol agudo"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira." },
            { tipo: "gravar", chave: "u4", comparar: true, titulo: "Antes e depois", texto: "Grave “Manhã de Sol” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Primeira música brasileira", marco: "Toquei meu primeiro baião no saxofone.", licoes: [
        {
          id: "sem-pontuada", titulo: "A semínima pontuada", resumo: "Um tempo e meio",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O ponto, de novo", texto: ["O ponto soma metade do valor. A semínima vale 1, então a semínima pontuada vale 1 tempo e meio.", "Quase sempre ela vem seguida de uma colcheia, que completa os 2 tempos."], pauta: [["sol", 1.5], ["sol", 0.5], ["sol", 2]] },
            { tipo: "escolha", pergunta: "Quanto dura a semínima pontuada?", opcoes: ["Um tempo", "Um tempo e meio", "Dois tempos"], certa: 1 },
            { tipo: "ritmo", titulo: "Longa e curta", texto: "Semínima pontuada, colcheia e mínima. A colcheia cai no “e” do 2.", pauta: [["sol", 1.5], ["sol", 0.5], ["sol", 2]], padrao: [1.5, 0.5, 2] },
            { tipo: "ritmo", titulo: "Duas vezes", texto: "Pontuada e colcheia, pontuada e colcheia.", pauta: [["sol", 1.5], ["sol", 0.5], ["sol", 1.5], ["sol", 0.5]], padrao: [1.5, 0.5, 1.5, 0.5] },
          ],
        },
        {
          id: "baiao", titulo: "O ritmo do baião", resumo: "Três, três e dois",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O sotaque do Nordeste", texto: ["O baião divide os 4 tempos em três partes desiguais: um tempo e meio, um tempo e meio e um tempo.", "É a batida da zabumba. Ouça com o pulso: os acentos não caem todos no clique."], pauta: [["sol", 1.5], ["sol", 1.5], ["sol", 1]] },
            { tipo: "ritmo", titulo: "Bata a célula do baião", texto: "Longa, longa, curta. A segunda batida cai entre o 2 e o 3.", pauta: [["sol", 1.5], ["sol", 1.5], ["sol", 1]], padrao: [1.5, 1.5, 1] },
            { tipo: "escolha", pergunta: "No baião, onde cai a segunda batida da célula?", opcoes: ["No tempo 2", "No “e” do 2", "No tempo 3"], certa: 1 },
            { tipo: "ritmo", titulo: "Dois compassos seguidos", texto: "Repita a célula sem perder o pulso.", pauta: [["sol", 1.5], ["sol", 1.5], ["sol", 1], ["sol", 1.5], ["sol", 1.5], ["sol", 1]], padrao: [1.5, 1.5, 1, 1.5, 1.5, 1] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "A célula no sax", texto: "Ligue o pulso e toque o Sol no ritmo do baião: longa, longa, curta.", pauta: [["sol", 1.5], ["sol", 1.5], ["sol", 1]] },
          ],
        },
        {
          id: "bequadro", titulo: "O Fá natural e o bequadro", resumo: "A cor da escala do baião",
          passos: [
            { tipo: "info", titulo: "O sinal ♮", texto: ["O bequadro cancela um sustenido: a nota volta a ser natural.", "O baião costuma usar a escala de Sol com o Fá natural no lugar do Fá♯. Essa única nota muda toda a cor da melodia."], pauta: [["fas", 2], ["fan", 2]], rotulos: true },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual é o Fá natural?", sons: ["fas", "fan"], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "O Fá natural é o mais grave dos dois." },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Fá natural?", nota: "fan", notas: ["fas", "fan", "sol"] },
            { tipo: "tocar", nota: "fan", segundos: 2, titulo: "Toque o Fá natural", texto: "Mão esquerda fechada e o indicador da direita." },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Fá para Sol", texto: "Suba do Fá natural para o Sol. Esse passo é a assinatura do baião." },
          ],
        },
        {
          id: "frases-baiao", titulo: "Frases de baião", resumo: "A célula com notas",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Sol, Si, Ré", texto: ["A melodia do baião gosta de saltar pelas notas do acorde: Sol, Si e Ré.", "Ouça a frase e repare que o ritmo é a célula que você já bateu."], pauta: [["sol", 1.5], ["si", 1.5], ["re2", 1]] },
            { tipo: "ritmo", titulo: "O ritmo da resposta", texto: "Quatro colcheias e uma mínima.", pauta: [["re2", 0.5], ["do", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2]], padrao: [0.5, 0.5, 0.5, 0.5, 2] },
            { tipo: "tocar", nota: "re2", segundos: 1, titulo: "A pergunta", texto: "Sol, Si e chegue no Ré agudo.", pauta: [["sol", 1.5], ["si", 1.5], ["re2", 1]] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "A resposta", texto: "Desça em colcheias do Ré até o Sol e sustente.", pauta: [["re2", 0.5], ["do", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2]] },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "A frase do Fá natural", texto: "Fá, Lá e Sol, no ritmo da célula.", pauta: [["fan", 1.5], ["la", 1.5], ["sol", 1]] },
          ],
        },
        {
          id: "musica5", titulo: "Baião de Estreia", resumo: "Sua primeira música brasileira", melodia: BAIAO_DE_ESTREIA,
          passos: [
            { tipo: "info", titulo: "Baião de Estreia", texto: ["Um baião com tudo o que você aprendeu: a célula, as colcheias, a chave de oitava e o Fá natural.", "Ouça com o pulso em 60 antes de tocar. Depois, experimente junto com o ritmo de Baião no naipe rit."], melodia: true },
            { tipo: "escolha", pergunta: "Que ritmo abre quase todos os compassos desta música?", melodia: true, opcoes: ["Quatro semínimas", "A célula do baião: longa, longa, curta", "Duas mínimas"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque o baião inteiro no andamento que você escolheu." },
            { tipo: "gravar", chave: "u5", comparar: true, titulo: "Antes e depois", texto: "Grave o “Baião de Estreia” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Fá maior e o Si bemol", marco: "Toco a escala de Fá maior, do Dó grave ao Fá agudo.", licoes: [
        {
          id: "bemol", titulo: "O bemol e o Si♭", resumo: "Meio tom abaixo",
          passos: [
            { tipo: "info", titulo: "O sinal ♭", texto: ["O bemol, escrito antes da nota, desce o som meio tom. Si com bemol é Si♭: um pouco mais grave que o Si.", "Como o sustenido, ele vale até o fim do compasso."], pauta: [["si", 2], ["sib", 2]], rotulos: true },
            { tipo: "info", titulo: "A digitação do Si♭", texto: ["Faça a digitação do Lá e acrescente a chave lateral, com a lateral do indicador da mão direita.", "É a forma mais usada no começo. Existem outras, que você vai conhecer depois."], dedos: ["la", "sib"] },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual é o Si♭?", sons: ["sib", "si"], opcoes: ["O primeiro", "O segundo"], certa: 0, explica: "O Si♭ é o mais grave dos dois." },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Si♭?", nota: "sib", notas: ["si", "sib", "la"] },
            { tipo: "tocar", nota: "sib", segundos: 2, titulo: "Toque o Si♭", texto: "Dedos do Lá e a chave lateral." },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "Si♭ para Lá", texto: "Solte só a chave lateral e chegue no Lá." },
          ],
        },
        {
          id: "fa-agudo", titulo: "O Fá agudo", resumo: "A oitava do Fá",
          passos: [
            { tipo: "info", titulo: "Fá com a chave de oitava", texto: ["O Fá agudo fica na 5ª linha, no mesmo lugar do Fá♯ agudo, só que sem o sustenido.", "A digitação é a do Fá, com a chave de oitava."], pauta: [["mi2", 2], ["fa2", 2]], rotulos: true, dedos: ["fa", "fa2"] },
            { tipo: "ondefica", nota: "fa2", titulo: "Coloque o Fá agudo na pauta", texto: "Ele mora na última linha." },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["fa2", "sib", "re2", "mi2"] },
            { tipo: "tocar", nota: "fa2", segundos: 2, titulo: "Toque o Fá agudo", texto: "Ar rápido e garganta aberta." },
            { tipo: "tocar", nota: "fa", segundos: 2, titulo: "E o Fá da oitava de baixo", texto: "Solte só o polegar. O resto fica igual." },
          ],
        },
        {
          id: "do-grave", titulo: "O Dó grave", resumo: "A primeira linha suplementar",
          passos: [
            { tipo: "info", titulo: "Abaixo da pauta", texto: ["Quando a pauta acaba, a música continua em linhas curtas, chamadas linhas suplementares.", "O Dó grave fica na primeira linha suplementar inferior, logo abaixo do Ré."], pauta: [["re", 2], ["dob", 2]], rotulos: true },
            { tipo: "info", titulo: "A digitação do Dó grave", texto: ["Tudo fechado, como no Ré, e o mindinho da mão direita na chave de baixo.", "Nos graves, solte o queixo e sopre um ar quente e largo. Se a nota falhar, quase sempre é aperto na boquilha."], dedos: ["re", "dob"] },
            { tipo: "ondefica", nota: "dob", titulo: "Coloque o Dó grave na pauta", texto: "Toque abaixo da primeira linha, no lugar da linha suplementar." },
            { tipo: "tocar", nota: "dob", segundos: 2, titulo: "Toque o Dó grave", texto: "Comece no Ré e desça. Ar quente, sem apertar." },
            { tipo: "tocar", nota: "fa", segundos: 2, titulo: "Do grave ao médio", texto: "Suba do Dó grave até o Fá e sustente." },
          ],
        },
        {
          id: "escala-fa", titulo: "A escala de Fá maior", resumo: "Oito notas, um bemol",
          passos: [
            { tipo: "info", ouvir: true, titulo: "De Fá a Fá", texto: ["A escala de Fá maior tem um único bemol: o Si♭.", "Ouça com o pulso e repare como ela soa parecida com a de Sol maior, só que começando em outro lugar."], pauta: [["fa", 1], ["sol", 1], ["la", 1], ["sib", 1], ["do", 1], ["re2", 1], ["mi2", 1], ["fa2", 1]], compassos: true },
            { tipo: "escolha", pergunta: "Qual nota da escala de Fá maior leva bemol?", opcoes: ["O Si", "O Mi", "O Lá"], certa: 0 },
            { tipo: "tocar", nota: "sib", segundos: 1, titulo: "A primeira metade", texto: "Fá, Sol, Lá, Si♭. Pare no Si♭.", pauta: [["fa", 1], ["sol", 1], ["la", 1], ["sib", 1]] },
            { tipo: "tocar", nota: "fa2", segundos: 1, titulo: "A segunda metade", texto: "Dó, Ré, Mi, Fá. Pare no Fá agudo.", pauta: [["do", 1], ["re2", 1], ["mi2", 1], ["fa2", 1]] },
            { tipo: "tocar", nota: "fa", segundos: 2, titulo: "E a volta", texto: "Desça do Fá agudo ao Fá e sustente a chegada.", pauta: [["fa2", 1], ["mi2", 1], ["re2", 1], ["do", 1], ["sib", 1], ["la", 1], ["sol", 1], ["fa", 1]] },
          ],
        },
        {
          id: "escala-fa-pulso", titulo: "Fá maior no pulso", resumo: "Subir e descer sem parar", melodia: ESCALA_FA,
          passos: [
            { tipo: "info", titulo: "Duas escalas na mão", texto: ["Com Sol maior e Fá maior você já toca em dois tons.", "Estude as duas do mesmo jeito: devagar, no pulso, e só aumente o andamento quando sair limpo."], melodia: true },
            { tipo: "musica", titulo: "Suba e desça com o pulso", texto: "Depois da contagem, toque a escala inteira, uma nota por clique." },
          ],
        },
        {
          id: "musica6", titulo: "Sexta música", resumo: "“Tarde em Fá”, com Si♭ e Dó grave", melodia: TARDE_EM_FA,
          passos: [
            { tipo: "info", titulo: "Tarde em Fá", texto: ["Uma melodia calma em Fá maior. Ela passa pelo Si♭ e visita o Dó grave antes de terminar.", "Ouça com o pulso e cante junto antes de tocar."], melodia: true },
            { tipo: "escolha", pergunta: "Em qual compasso aparece o Dó grave?", melodia: true, opcoes: ["No segundo", "No terceiro", "No último"], certa: 2 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira." },
            { tipo: "gravar", chave: "u6", comparar: true, titulo: "Antes e depois", texto: "Grave “Tarde em Fá” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Semicolcheias e síncope", marco: "Leio e toco semicolcheias e a síncope brasileira.", licoes: [
        {
          id: "semicolcheia", titulo: "A semicolcheia", resumo: "Quatro notas dentro de um tempo",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Um quarto de tempo", texto: ["A semicolcheia dura um quarto de tempo: cabem quatro em cada pulso. Elas aparecem unidas por duas traves.", "Se ficar rápido, baixe o andamento. Em 48 já dá para ouvir cada uma."], pauta: [["sol", 0.25], ["sol", 0.25], ["sol", 0.25], ["sol", 0.25], ["sol", 1], ["sol", 2]] },
            { tipo: "escolha", pergunta: "Quantas semicolcheias cabem em um tempo?", opcoes: ["Duas", "Três", "Quatro"], certa: 2 },
            { tipo: "ritmo", titulo: "Bata as semicolcheias", texto: "Quatro semicolcheias, semínima e mínima.", pauta: [["sol", 0.25], ["sol", 0.25], ["sol", 0.25], ["sol", 0.25], ["sol", 1], ["sol", 2]], padrao: [0.25, 0.25, 0.25, 0.25, 1, 2] },
            { tipo: "escolha", pergunta: "Quantas traves unem um grupo de semicolcheias?", opcoes: ["Uma", "Duas", "Nenhuma"], certa: 1 },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "Quatro notas num tempo", texto: "Sol, Lá, Si, Lá em semicolcheias e pare no Lá.", pauta: [["sol", 0.25], ["la", 0.25], ["si", 0.25], ["la", 0.25], ["la", 1]] },
          ],
        },
        {
          id: "galope", titulo: "Colcheia e duas semicolcheias", resumo: "Longa, curta, curta",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Misturando dentro do tempo", texto: ["Um tempo também pode ser uma colcheia e duas semicolcheias: longa, curta, curta.", "Ao contrário, duas semicolcheias e uma colcheia: curta, curta, longa."], pauta: [["sol", 0.5], ["sol", 0.25], ["sol", 0.25], ["sol", 0.25], ["sol", 0.25], ["sol", 0.5], ["sol", 2]] },
            { tipo: "ritmo", titulo: "Longa, curta, curta", texto: "Colcheia e duas semicolcheias, depois semínima e mínima.", pauta: [["sol", 0.5], ["sol", 0.25], ["sol", 0.25], ["sol", 1], ["sol", 2]], padrao: [0.5, 0.25, 0.25, 1, 2] },
            { tipo: "ritmo", titulo: "Curta, curta, longa", texto: "Duas semicolcheias e colcheia, depois semínima e mínima.", pauta: [["sol", 0.25], ["sol", 0.25], ["sol", 0.5], ["sol", 1], ["sol", 2]], padrao: [0.25, 0.25, 0.5, 1, 2] },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "Com notas", texto: "Ré agudo, Dó, Si e pare no Lá.", pauta: [["re2", 0.5], ["do", 0.25], ["si", 0.25], ["la", 1]] },
          ],
        },
        {
          id: "sincope", titulo: "A síncope", resumo: "A assinatura do samba e do choro",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Curta, longa, curta", texto: ["Semicolcheia, colcheia, semicolcheia: a nota longa fica no meio e desloca o acento para fora do clique.", "Esse balanço é a síncope. Ela está no samba, no choro, no baião e no maxixe."], pauta: [["sol", 0.25], ["sol", 0.5], ["sol", 0.25], ["sol", 1], ["sol", 2]] },
            { tipo: "ritmo", titulo: "Bata a síncope", texto: "Curta, longa, curta, depois semínima e mínima. Pense em “tá-táá-tá”.", pauta: [["sol", 0.25], ["sol", 0.5], ["sol", 0.25], ["sol", 1], ["sol", 2]], padrao: [0.25, 0.5, 0.25, 1, 2] },
            { tipo: "escolha", pergunta: "Na síncope, qual das três notas é a mais longa?", opcoes: ["A primeira", "A do meio", "A última"], certa: 1 },
            { tipo: "ritmo", titulo: "Duas síncopes seguidas", texto: "Síncope, síncope e mínima.", pauta: [["sol", 0.25], ["sol", 0.5], ["sol", 0.25], ["sol", 0.25], ["sol", 0.5], ["sol", 0.25], ["sol", 2]], padrao: [0.25, 0.5, 0.25, 0.25, 0.5, 0.25, 2] },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "A síncope no sax", texto: "Sol, Si, Sol em síncope e chegue no Lá.", pauta: [["sol", 0.25], ["si", 0.5], ["sol", 0.25], ["la", 1]] },
          ],
        },
        {
          id: "pontuada-semi", titulo: "Colcheia pontuada e semicolcheia", resumo: "O passo arrastado",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Três quartos e um quarto", texto: ["A colcheia pontuada vale três quartos de tempo. A semicolcheia que vem depois completa o tempo.", "O efeito é de um passo arrastado: longa, curtinha."], pauta: [["sol", 0.75], ["sol", 0.25], ["sol", 1], ["sol", 2]] },
            { tipo: "ritmo", titulo: "Longa, curtinha", texto: "Colcheia pontuada e semicolcheia, depois semínima e mínima.", pauta: [["sol", 0.75], ["sol", 0.25], ["sol", 1], ["sol", 2]], padrao: [0.75, 0.25, 1, 2] },
            { tipo: "escolha", pergunta: "Na colcheia pontuada com semicolcheia, onde cai a nota curta?", opcoes: ["Logo antes do próximo clique", "Bem no meio do tempo", "Junto com o clique"], certa: 0 },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "Com notas", texto: "Lá longo, Sol curtinho e volte ao Lá.", pauta: [["la", 0.75], ["sol", 0.25], ["la", 1]] },
          ],
        },
        {
          id: "frases7", titulo: "Frases sincopadas", resumo: "Ritmo primeiro, notas depois",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Dois compassos de balanço", texto: ["Ouça a frase com o pulso. O primeiro tempo de cada compasso é uma síncope."], pauta: [["sol", 0.25], ["si", 0.5], ["sol", 0.25], ["la", 1], ["si", 0.5], ["la", 0.5], ["sol", 1], ["la", 0.25], ["do", 0.5], ["la", 0.25], ["si", 1], ["re2", 2]], compassos: true },
            { tipo: "ritmo", titulo: "O ritmo do primeiro compasso", texto: "Síncope, semínima, duas colcheias, semínima.", pauta: [["sol", 0.25], ["si", 0.5], ["sol", 0.25], ["la", 1], ["si", 0.5], ["la", 0.5], ["sol", 1]], padrao: [0.25, 0.5, 0.25, 1, 0.5, 0.5, 1] },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "O primeiro compasso", texto: "Toque até chegar no Sol.", pauta: [["sol", 0.25], ["si", 0.5], ["sol", 0.25], ["la", 1], ["si", 0.5], ["la", 0.5], ["sol", 1]] },
            { tipo: "ritmo", titulo: "O ritmo do segundo compasso", texto: "Síncope, semínima e mínima.", pauta: [["la", 0.25], ["do", 0.5], ["la", 0.25], ["si", 1], ["re2", 2]], padrao: [0.25, 0.5, 0.25, 1, 2] },
            { tipo: "tocar", nota: "re2", segundos: 2, titulo: "O segundo compasso", texto: "Toque e sustente o Ré agudo.", pauta: [["la", 0.25], ["do", 0.5], ["la", 0.25], ["si", 1], ["re2", 2]] },
          ],
        },
        {
          id: "musica7", titulo: "Sétima música", resumo: "“Sincopado”", melodia: SINCOPADO,
          passos: [
            { tipo: "info", titulo: "Sincopado", texto: ["Quatro compassos com tudo desta unidade: síncope, semicolcheias e a colcheia pontuada.", "Comece devagar, em 48 ou 52. Balanço vem de precisão, não de velocidade."], melodia: true },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira no andamento que você escolheu." },
            { tipo: "gravar", chave: "u7", comparar: true, titulo: "Antes e depois", texto: "Grave “Sincopado” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Seu primeiro choro", marco: "Toquei meu primeiro choro no saxofone.", licoes: [
        {
          id: "choro", titulo: "O que é o choro", resumo: "A primeira música urbana do Brasil",
          passos: [
            { tipo: "info", titulo: "Música de roda", texto: ["O choro nasceu no Rio de Janeiro no fim do século XIX. É música instrumental, tocada em roda, com melodias ágeis e muita síncope.", "Pixinguinha, que também era saxofonista, é o grande nome do gênero."] },
            { tipo: "info", titulo: "Como se estuda um choro", lista: ["Ouça muitas vezes antes de tocar, até conseguir cantar a melodia.", "Divida em partes pequenas: dois compassos de cada vez.", "Bata o ritmo, diga as notas e só então toque.", "Junte as partes devagar, no pulso."] },
            { tipo: "escolha", pergunta: "Qual figura rítmica é a marca do choro?", opcoes: ["A semibreve", "A síncope", "A pausa"], certa: 1 },
            { tipo: "escolha", pergunta: "Qual é o primeiro passo para estudar um choro?", opcoes: ["Tocar rápido do começo ao fim", "Ouvir até conseguir cantar", "Decorar o nome das notas"], certa: 1 },
          ],
        },
        {
          id: "articulacao-choro", titulo: "A articulação do choro", resumo: "Duas ligadas, duas destacadas",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O sotaque está na língua", texto: ["No choro, grupos de semicolcheias costumam sair com as duas primeiras ligadas e as duas últimas destacadas.", "Língua na primeira, na terceira e na quarta. A segunda sai no mesmo sopro."], pauta: [["la", 0.25, L], ["sib", 0.25], ["do", 0.25], ["re2", 0.25], ["do", 1]] },
            { tipo: "escolha", pergunta: "Num grupo de quatro semicolcheias com as duas primeiras ligadas, quantas vezes a língua toca?", opcoes: ["Duas", "Três", "Quatro"], certa: 1 },
            { tipo: "ritmo", titulo: "O ritmo do grupo", texto: "Quatro semicolcheias e uma semínima.", pauta: [["la", 0.25, L], ["sib", 0.25], ["do", 0.25], ["re2", 0.25], ["do", 1]], padrao: [0.25, 0.25, 0.25, 0.25, 1] },
            { tipo: "tocar", nota: "do", segundos: 1, titulo: "Toque com a articulação", texto: "Lá e Si♭ ligados, Dó e Ré destacados, e pare no Dó.", pauta: [["la", 0.25, L], ["sib", 0.25], ["do", 0.25], ["re2", 0.25], ["do", 1]] },
          ],
        },
        {
          id: "choro-a", titulo: "A primeira parte", resumo: "Quatro compassos, dois de cada vez", melodia: CHORO_A,
          passos: [
            { tipo: "info", titulo: "Chorinho de Estreia, parte A", texto: ["O choro está em Fá maior: lembre do Si♭.", "Ouça os quatro compassos com o pulso em 52 e cante junto."], melodia: true },
            { tipo: "ritmo", titulo: "O ritmo do primeiro compasso", texto: "Síncope, semínima, duas colcheias, semínima.", pauta: [["fa", 0.25], ["la", 0.5], ["fa", 0.25], ["do", 1], ["la", 0.5], ["do", 0.5], ["fa2", 1]], padrao: [0.25, 0.5, 0.25, 1, 0.5, 0.5, 1] },
            { tipo: "tocar", nota: "fa2", segundos: 1, titulo: "O primeiro compasso", texto: "Toque até chegar no Fá agudo.", pauta: [["fa", 0.25], ["la", 0.5], ["fa", 0.25], ["do", 1], ["la", 0.5], ["do", 0.5], ["fa2", 1]] },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "O segundo compasso", texto: "Desça do Mi agudo e chegue no Lá.", pauta: [["mi2", 0.5], ["re2", 0.25], ["do", 0.25], ["sib", 1], ["la", 0.5], ["sol", 0.5], ["la", 1]] },
            { tipo: "musica", titulo: "A parte A no pulso", texto: "Depois da contagem, toque os quatro compassos." },
          ],
        },
        {
          id: "choro-b", titulo: "A segunda parte", resumo: "A resposta e o final", melodia: CHORO_B,
          passos: [
            { tipo: "info", titulo: "Chorinho de Estreia, parte B", texto: ["A segunda parte começa igual à primeira e depois toma outro caminho até o final em Fá.", "Repare no grupo de quatro semicolcheias do segundo compasso: use a articulação do choro."], melodia: true },
            { tipo: "ritmo", titulo: "O ritmo do segundo compasso", texto: "Colcheia e duas semicolcheias, semínima, quatro semicolcheias, semínima.", pauta: [["mi2", 0.5], ["re2", 0.25], ["do", 0.25], ["sib", 1], ["la", 0.25], ["sib", 0.25], ["do", 0.25], ["re2", 0.25], ["do", 1]], padrao: [0.5, 0.25, 0.25, 1, 0.25, 0.25, 0.25, 0.25, 1] },
            { tipo: "tocar", nota: "do", segundos: 1, titulo: "O segundo compasso", texto: "Toque até chegar no Dó.", pauta: [["mi2", 0.5], ["re2", 0.25], ["do", 0.25], ["sib", 1], ["la", 0.25], ["sib", 0.25], ["do", 0.25], ["re2", 0.25], ["do", 1]] },
            { tipo: "tocar", nota: "fa", segundos: 2, titulo: "O final", texto: "Fá longo, Mi curtinho e termine no Fá.", pauta: [["fa", 0.75], ["mi", 0.25], ["fa", 1], ["fa", 2]] },
            { tipo: "musica", titulo: "A parte B no pulso", texto: "Depois da contagem, toque os quatro compassos." },
          ],
        },
        {
          id: "musica8", titulo: "Chorinho de Estreia", resumo: "Seu primeiro choro, do começo ao fim", melodia: CHORINHO_DE_ESTREIA,
          passos: [
            { tipo: "info", titulo: "O choro inteiro", texto: ["Agora as duas partes juntas: oito compassos.", "Ouça com o pulso. Depois de tocar aqui, experimente com o ritmo de Choro no naipe rit."], melodia: true },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque o choro inteiro no andamento que você escolheu." },
            { tipo: "gravar", chave: "u8", comparar: true, titulo: "Antes e depois", texto: "Grave o “Chorinho de Estreia” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Compassos de 2 e de 3", marco: "Leio e toco em compassos de 2, 3 e 4 tempos.", licoes: [
        {
          id: "formula", titulo: "A fórmula de compasso", resumo: "Os dois números no começo da pauta",
          passos: [
            { tipo: "info", formula: 4, ouvir: true, titulo: "Quantos tempos por compasso", texto: ["Logo depois da clave aparecem dois números. O de cima diz quantos tempos cabem em cada compasso.", "O de baixo diz qual figura vale um tempo. O 4 quer dizer semínima. Até aqui você tocou sempre em 4 por 4."], pauta: [["sol", 1], ["la", 1], ["si", 1], ["la", 1], ["sol", 2], ["sol", 2]], compassos: true },
            { tipo: "escolha", pergunta: "Na fórmula de compasso, o que diz o número de cima?", opcoes: ["O andamento da música", "Quantos tempos cabem em cada compasso", "Quantas notas a música tem"], certa: 1 },
            { tipo: "info", formula: 3, comp: 3, ouvir: true, titulo: "Três por quatro", texto: ["Com o 3 em cima, cada compasso tem três tempos. O clique mais forte marca o primeiro.", "Ouça: forte, fraco, fraco. É o balanço da valsa."], pauta: [["sol", 1], ["si", 1], ["re2", 1], ["re2", 3]], compassos: true },
            { tipo: "info", formula: 2, comp: 2, ouvir: true, titulo: "Dois por quatro", texto: ["Com o 2 em cima, cada compasso tem dois tempos: forte, fraco.", "É o compasso da marcha, do baião, do samba e do choro."], pauta: [["sol", 1], ["si", 1], ["re2", 2]], compassos: true },
            { tipo: "escolha", pergunta: "Quantos tempos tem cada compasso desta música?", formula: 3, comp: 3, pauta: [["la", 1], ["la", 1], ["si", 1], ["la", 3]], compassos: true, opcoes: ["Dois", "Três", "Quatro"], certa: 1 },
          ],
        },
        {
          id: "tres", titulo: "O compasso de 3", resumo: "O balanço da valsa", comp: 3, formula: true,
          passos: [
            { tipo: "info", ouvir: true, titulo: "Um, dois, três", texto: ["Conte “1, 2, 3” e recomece. O primeiro tempo é o apoio, os outros dois são leves.", "A mínima pontuada, com seus três tempos, enche um compasso inteiro."], pauta: [["sol", 1], ["sol", 1], ["sol", 1], ["sol", 3]], compassos: true },
            { tipo: "ritmo", titulo: "Bata três semínimas", texto: "A contagem agora é de três. Bata um compasso.", pauta: [["sol", 1], ["sol", 1], ["sol", 1]], padrao: [1, 1, 1] },
            { tipo: "ritmo", titulo: "Mínima e semínima", texto: "Longa e curta: toque no 1 e no 3.", pauta: [["sol", 2], ["sol", 1]], padrao: [2, 1] },
            { tipo: "ritmo", titulo: "Dois compassos", texto: "Três semínimas e uma mínima pontuada.", pauta: [["sol", 1], ["sol", 1], ["sol", 1], ["sol", 3]], compassos: true, padrao: [1, 1, 1, 3] },
            { tipo: "tocar", nota: "re2", segundos: 3, titulo: "Uma frase em 3", texto: "Sol, Si, Ré e sustente o Ré agudo por um compasso inteiro.", pauta: [["sol", 1], ["si", 1], ["re2", 1], ["re2", 3]], compassos: true },
          ],
        },
        {
          id: "dois", titulo: "O compasso de 2", resumo: "Marcha, baião e choro", comp: 2, formula: true,
          passos: [
            { tipo: "info", ouvir: true, titulo: "Um, dois", texto: ["No 2 por 4 as barras de compasso aparecem com mais frequência, mas o som é o mesmo: o que muda é onde cai o apoio.", "Os grupos de colcheias e semicolcheias continuam valendo um tempo cada."], pauta: [["fa", 0.5], ["la", 0.5], ["do", 1], ["sib", 0.5], ["la", 0.5], ["sol", 1]], compassos: true },
            { tipo: "ritmo", titulo: "Bata em 2", texto: "A contagem são dois compassos: “1, 2, 1, 2”. Depois bata duas colcheias e uma semínima.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", 1]], padrao: [0.5, 0.5, 1] },
            { tipo: "ritmo", titulo: "A síncope em 2", texto: "Síncope e semínima: um compasso típico de choro.", pauta: [["sol", 0.25], ["sol", 0.5], ["sol", 0.25], ["sol", 1]], padrao: [0.25, 0.5, 0.25, 1] },
            { tipo: "escolha", pergunta: "Quantos compassos há neste trecho?", pauta: [["fa", 0.5], ["la", 0.5], ["do", 1], ["sib", 0.5], ["la", 0.5], ["sol", 1], ["fa", 2]], compassos: true, opcoes: ["Dois", "Três", "Quatro"], certa: 1 },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "Uma frase em 2", texto: "Fá, Lá, Dó e desça até o Sol.", pauta: [["fa", 0.5], ["la", 0.5], ["do", 1], ["sib", 0.5], ["la", 0.5], ["sol", 1]], compassos: true },
          ],
        },
        {
          id: "valsa", titulo: "Valsa de Domingo", resumo: "Uma música em 3 por 4", comp: 3, formula: true, melodia: VALSA_DE_DOMINGO,
          passos: [
            { tipo: "info", titulo: "Valsa de Domingo", texto: ["Uma valsa em Sol maior: lembre do Fá♯.", "Ouça com o pulso e sinta o apoio no primeiro tempo de cada compasso."], melodia: true },
            { tipo: "escolha", pergunta: "Quantos tempos dura a última nota da valsa?", melodia: true, opcoes: ["Dois", "Três", "Quatro"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem de três, toque a valsa inteira." },
          ],
        },
        {
          id: "musica9", titulo: "Dois por Quatro", resumo: "Uma música em 2 por 4, com síncope", comp: 2, formula: true, melodia: DOIS_POR_QUATRO,
          passos: [
            { tipo: "info", titulo: "Dois por Quatro", texto: ["Agora no compasso do choro. A melodia está em Fá maior e usa a síncope.", "Ouça devagar, em 52, antes de tocar."], melodia: true },
            { tipo: "ritmo", titulo: "O ritmo do segundo compasso", texto: "Síncope e semínima.", pauta: [["do", 0.25], ["re2", 0.5], ["do", 0.25], ["la", 1]], padrao: [0.25, 0.5, 0.25, 1] },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira." },
            { tipo: "gravar", chave: "u9", comparar: true, titulo: "Antes e depois", texto: "Grave “Dois por Quatro” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Ré maior e Si bemol maior", marco: "Toco em quatro tons: Sol, Fá, Ré e Si bemol maior.", licoes: [
        {
          id: "aq10", titulo: "Aquecimento", resumo: "Nota longa, escala e oitavas antes dos agudos", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Aquecer antes de subir", texto: ["Nesta unidade aparecem notas agudas novas. Três minutos de aquecimento deixam o som pronto para elas."], lista: ["Uma nota longa, para acordar o ar.", "A escala de Sol maior, que você já conhece.", "Um salto de oitava, para preparar os agudos."] },
            { tipo: "tocar", livre: true, segundos: 4, titulo: "Nota longa", texto: "Qualquer nota confortável. Sustente 4 segundos com o som parado." },
            { tipo: "tocar", nota: "sol2", segundos: 2, titulo: "Escala de Sol maior", texto: "Suba a escala em colcheias e sustente o Sol agudo.", pauta: [["sol", 0.5], ["la", 0.5], ["si", 0.5], ["do", 0.5], ["re2", 0.5], ["mi2", 0.5], ["fas2", 0.5], ["sol2", 2]] },
            { tipo: "tocar", nota: "la2", segundos: 2, titulo: "Oitava: Lá e Lá agudo", texto: "Ar rápido e só o polegar se mexe. Sem nova língua no Lá agudo.", pauta: [["la", 2, "liga"], ["la2", 2]] },
          ],
        },
        {
          id: "do-sustenido", titulo: "O Dó♯", resumo: "A nota de mão aberta",
          passos: [
            { tipo: "info", titulo: "Nenhum dedo fechado", texto: ["O Dó♯ é a única nota desta região tocada com todas as chaves abertas.", "Sem dedos para firmar o instrumento, o apoio fica no polegar direito e na correia. Ele também tende a soar baixo: mantenha o ar firme."], pauta: [["do", 2], ["dos", 2]], rotulos: true, dedos: ["do", "dos"] },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Dó♯?", nota: "dos", notas: ["do", "dos", "si"] },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual é o Dó♯?", sons: ["dos", "do"], opcoes: ["O primeiro", "O segundo"], certa: 0, explica: "O Dó♯ é o mais agudo dos dois." },
            { tipo: "tocar", nota: "dos", segundos: 2, titulo: "Toque o Dó♯", texto: "Solte todos os dedos, sem deixar o sax balançar." },
            { tipo: "tocar", nota: "re2", segundos: 2, titulo: "Dó♯ para Ré agudo", texto: "Feche tudo de uma vez, com a chave de oitava." },
          ],
        },
        {
          id: "escala-re", titulo: "A escala de Ré maior", resumo: "Dois sustenidos: Fá♯ e Dó♯",
          passos: [
            { tipo: "info", ouvir: true, titulo: "De Ré a Ré", texto: ["A escala de Ré maior tem dois sustenidos: o Fá♯ e o Dó♯.", "Ela começa com as duas mãos fechadas e termina no Ré agudo."], pauta: [["re", 1], ["mi", 1], ["fas", 1], ["sol", 1], ["la", 1], ["si", 1], ["dos", 1], ["re2", 1]], compassos: true },
            { tipo: "escolha", pergunta: "Quais notas levam sustenido em Ré maior?", opcoes: ["Fá e Dó", "Si e Mi", "Só o Fá"], certa: 0 },
            { tipo: "tocar", nota: "sol", segundos: 1, titulo: "A primeira metade", texto: "Ré, Mi, Fá♯, Sol. Pare no Sol.", pauta: [["re", 1], ["mi", 1], ["fas", 1], ["sol", 1]] },
            { tipo: "tocar", nota: "re2", segundos: 1, titulo: "A segunda metade", texto: "Lá, Si, Dó♯, Ré. Pare no Ré agudo.", pauta: [["la", 1], ["si", 1], ["dos", 1], ["re2", 1]] },
            { tipo: "tocar", nota: "re", segundos: 2, titulo: "E a volta", texto: "Desça do Ré agudo ao Ré grave e sustente.", pauta: [["re2", 1], ["dos", 1], ["si", 1], ["la", 1], ["sol", 1], ["fas", 1], ["mi", 1], ["re", 1]] },
          ],
        },
        {
          id: "escala-re-pulso", titulo: "Ré maior no pulso", resumo: "Subir e descer sem parar", melodia: ESCALA_RE,
          passos: [
            { tipo: "info", titulo: "A terceira escala", texto: ["O jeito de estudar é o mesmo: devagar, no pulso, sem tropeçar.", "A passagem Si, Dó♯, Ré agudo é o ponto que pede mais cuidado."], melodia: true },
            { tipo: "musica", titulo: "Suba e desça com o pulso", texto: "Depois da contagem, toque a escala inteira, uma nota por clique." },
          ],
        },
        {
          id: "agudos2", titulo: "Mi♭, Lá e Si♭ agudos", resumo: "Acima da pauta",
          passos: [
            { tipo: "info", titulo: "Linhas suplementares superiores", texto: ["Acima do Sol agudo, as notas ganham linhas suplementares para cima: o Lá agudo fica na primeira linha e o Si♭ agudo logo acima dela."], pauta: [["sol2", 2], ["la2", 2], ["sib2", 2]], rotulos: true },
            { tipo: "info", titulo: "O Mi♭ agudo", texto: ["O Mi♭ usa a digitação do Ré agudo com o mindinho direito na chave de cima.", "Na pauta ele fica no lugar do Mi agudo, com o bemol na frente."], pauta: [["re2", 2], ["mib2", 2]], rotulos: true, dedos: ["re2", "mib2"] },
            { tipo: "ondefica", nota: "la2", titulo: "Coloque o Lá agudo na pauta", texto: "Toque acima da última linha, no lugar da linha suplementar." },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["la2", "mib2", "sib2", "sol2"] },
            { tipo: "tocar", nota: "mib2", segundos: 2, titulo: "Toque o Mi♭ agudo", texto: "Ré agudo e o mindinho direito." },
            { tipo: "tocar", nota: "la2", segundos: 2, titulo: "Toque o Lá agudo", texto: "Garganta aberta e ar rápido." },
            { tipo: "tocar", nota: "sib2", segundos: 2, titulo: "Toque o Si♭ agudo", texto: "Lá agudo e a chave lateral." },
          ],
        },
        {
          id: "escala-sib", titulo: "A escala de Si♭ maior", resumo: "Dois bemóis: Si♭ e Mi♭", melodia: ESCALA_SIB,
          passos: [
            { tipo: "info", titulo: "De Si♭ a Si♭", texto: ["A escala de Si♭ maior tem dois bemóis: o Si♭ e o Mi♭.", "Ela sobe até a região aguda. Ouça com o pulso antes de tocar."], melodia: true },
            { tipo: "escolha", pergunta: "Quais notas levam bemol em Si♭ maior?", opcoes: ["Si e Mi", "Si e Lá", "Mi e Lá"], certa: 0 },
            { tipo: "tocar", nota: "mib2", segundos: 1, titulo: "A primeira metade", texto: "Si♭, Dó, Ré, Mi♭. Pare no Mi♭ agudo.", pauta: [["sib", 1], ["do", 1], ["re2", 1], ["mib2", 1]] },
            { tipo: "tocar", nota: "sib2", segundos: 1, titulo: "A segunda metade", texto: "Fá, Sol, Lá, Si♭. Pare no Si♭ agudo.", pauta: [["fa2", 1], ["sol2", 1], ["la2", 1], ["sib2", 1]] },
            { tipo: "musica", titulo: "Suba e desça com o pulso", texto: "Depois da contagem, toque a escala inteira, uma nota por clique." },
          ],
        },
        {
          id: "musica10", titulo: "Festa em Ré", resumo: "Uma música em Ré maior", melodia: FESTA_EM_RE,
          passos: [
            { tipo: "info", titulo: "Festa em Ré", texto: ["Uma melodia alegre em Ré maior. Atenção aos dois sustenidos: Fá♯ e Dó♯.", "Ouça com o pulso e repare na passagem Dó♯, Ré agudo, Dó♯ do segundo compasso."], melodia: true },
            { tipo: "escolha", pergunta: "Com que nota a música termina?", melodia: true, opcoes: ["Lá", "Ré", "Fá♯"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira." },
            { tipo: "gravar", chave: "u10", comparar: true, titulo: "Antes e depois", texto: "Grave “Festa em Ré” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Dinâmica e expressão", marco: "Toco com dinâmica: do piano ao forte, com intenção.", licoes: [
        {
          id: "aq11", titulo: "Aquecimento", resumo: "Som reto, crescendo e diminuendo", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Aquecer o som", texto: ["Antes de tocar com dinâmica, o som precisa estar firme. O aquecimento desta unidade treina o ar: parado, crescendo e diminuindo."] },
            { tipo: "vibrato", modo: "reto", titulo: "Som reto", texto: "Uma nota confortável, sem ondular a afinação." },
            { tipo: "dinamica", modo: "cresc", titulo: "Crescendo", texto: "Comece suave e cresça até forte, sem subir a afinação.", pauta: [["re2", 4]], forq: [[0, 0, "cresc"]] },
            { tipo: "dinamica", modo: "dim", titulo: "Diminuendo", texto: "Comece forte e vá sumindo, com o ar sempre apoiado.", pauta: [["re2", 4]], forq: [[0, 0, "dim"]] },
          ],
        },
        {
          id: "piano-forte", titulo: "Piano e forte", resumo: "As letras que pedem volume",
          passos: [
            { tipo: "info", ouvir: true, titulo: "p, mf, f", texto: ["As letras embaixo da pauta pedem a intensidade do som: p é piano (suave), mf é mezzo-forte (médio) e f é forte.", "A letra vale até aparecer outra. Ouça a mesma frase em piano e depois em forte."], pauta: [["sol", 1], ["la", 1], ["si", 2], ["sol", 1], ["la", 1], ["si", 2]], compassos: true, din: [[0, "p"], [3, "f"]] },
            { tipo: "escolha", pergunta: "O que pede a letra p embaixo da pauta?", opcoes: ["Tocar mais rápido", "Tocar suave", "Fazer uma pausa"], certa: 1 },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual foi tocado em forte?", sons: [["sol", 0.35], ["sol", 1.4]], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "A nota era a mesma. Só a intensidade mudou." },
            { tipo: "info", titulo: "Suave não é fraco", texto: ["No piano, o ar continua rápido e apoiado. O que muda é a quantidade.", "Se a nota falha ou desafina ao tocar suave, quase sempre faltou apoio, e não sobrou ar."] },
            { tipo: "dinamica", modo: "pf", titulo: "Piano, depois forte", texto: "O app vai medir o volume do seu som nas duas vezes.", pauta: [["sol", 2], ["sol", 2]], din: [[0, "p"], [1, "f"]] },
          ],
        },
        {
          id: "crescendo", titulo: "Crescendo e diminuendo", resumo: "O som que muda no caminho",
          passos: [
            { tipo: "info", ouvir: true, titulo: "As forquilhas", texto: ["O sinal que abre pede crescendo: o som aumenta aos poucos. O sinal que fecha pede diminuendo.", "Ouça: a frase cresce na subida e diminui na descida."], pauta: [["sol", 1], ["la", 1], ["si", 1], ["do", 1], ["si", 1], ["la", 1], ["sol", 2]], compassos: true, din: [[0, "p"]], forq: [[0, 3, "cresc"], [4, 6, "dim"]] },
            { tipo: "escolha", pergunta: "O que pede a forquilha que abre para a direita?", opcoes: ["Diminuir o som", "Aumentar o som aos poucos", "Acelerar"], certa: 1 },
            { tipo: "dinamica", modo: "cresc", titulo: "Uma nota que cresce", texto: "Toque uma nota longa começando suave e terminando forte.", pauta: [["la", 4]], forq: [[0, 0, "cresc"]] },
            { tipo: "dinamica", modo: "dim", titulo: "Uma nota que diminui", texto: "Agora o contrário: comece forte e vá sumindo, sem deixar a afinação cair.", pauta: [["la", 4]], forq: [[0, 0, "dim"]] },
            { tipo: "escolha", pergunta: "No diminuendo, o que não pode acontecer?", opcoes: ["O som ficar mais suave", "A afinação cair junto com o volume", "A nota durar o tempo todo"], certa: 1 },
          ],
        },
        {
          id: "staccato", titulo: "O staccato", resumo: "Notas curtas e separadas",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O ponto em cima ou embaixo", texto: ["Um ponto junto da cabeça da nota pede staccato: a nota sai curta, separada da seguinte.", "A língua corta o som de leve. O ar continua pronto para a próxima."], pauta: [["sol", 1, "st"], ["la", 1, "st"], ["si", 1, "st"], ["la", 1, "st"], ["sol", 2], ["sol", 2]], compassos: true },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual foi tocado em staccato?", sons: [["la", 1, 0.9], ["la", 1, 0.22]], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "O segundo foi curto: staccato." },
            { tipo: "escolha", pergunta: "Não confunda: o ponto de staccato fica…", opcoes: ["Ao lado da nota, e aumenta a duração", "Em cima ou embaixo da cabeça, e encurta a nota", "No começo do compasso"], certa: 1 },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Quatro curtas e uma longa", texto: "Sol, Lá, Si, Lá em staccato e sustente o Sol.", pauta: [["sol", 1, "st"], ["la", 1, "st"], ["si", 1, "st"], ["la", 1, "st"], ["sol", 2]] },
          ],
        },
        {
          id: "acento", titulo: "O acento", resumo: "Uma nota com mais peso",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O sinal >", texto: ["O acento pede que aquela nota comece com mais peso que as vizinhas.", "O impulso vem do ar, junto com a língua. Não é bater mais forte na palheta."], pauta: [["sol", 1, "ac"], ["la", 1], ["si", 1, "ac"], ["la", 1], ["sol", 2, "ac"], ["sol", 2]], compassos: true },
            { tipo: "escolha", pergunta: "De onde vem o acento?", opcoes: ["De um impulso de ar com a língua", "De apertar a boquilha", "De tocar mais rápido"], certa: 0 },
            { tipo: "ritmo", titulo: "Sinta o acento no 1 e no 3", texto: "Bata quatro semínimas, com mais intenção na primeira e na terceira.", pauta: [["sol", 1, "ac"], ["sol", 1], ["sol", 1, "ac"], ["sol", 1]], padrao: [1, 1, 1, 1] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Com acento", texto: "Sol acentuado, Lá, Si acentuado, Lá, e sustente o Sol.", pauta: [["sol", 1, "ac"], ["la", 1], ["si", 1, "ac"], ["la", 1], ["sol", 2, "ac"]] },
          ],
        },
        {
          id: "frase-expressiva", titulo: "A frase com intenção", resumo: "Ler tudo o que está escrito",
          passos: [
            { tipo: "info", ouvir: true, titulo: "As notas são só o começo", texto: ["Uma partitura completa traz notas, ritmo, dinâmica e articulação. Tocar bem é obedecer a tudo isso de uma vez.", "Ouça esta frase: ela começa suave, cresce e termina em notas curtas."], pauta: [["fa", 1], ["la", 1], ["do", 2], ["re2", 1, "ac"], ["do", 0.5, "st"], ["sib", 0.5, "st"], ["la", 2]], compassos: true, din: [[0, "p"], [3, "f"]], forq: [[1, 2, "cresc"]] },
            { tipo: "escolha", pergunta: "Como a frase começa?", pauta: [["fa", 1], ["la", 1], ["do", 2], ["re2", 1, "ac"], ["do", 0.5, "st"], ["sib", 0.5, "st"], ["la", 2]], compassos: true, din: [[0, "p"], [3, "f"]], forq: [[1, 2, "cresc"]], opcoes: ["Forte", "Suave", "Em staccato"], certa: 1 },
            { tipo: "escolha", pergunta: "Qual nota leva acento?", pauta: [["fa", 1], ["la", 1], ["do", 2], ["re2", 1, "ac"], ["do", 0.5, "st"], ["sib", 0.5, "st"], ["la", 2]], compassos: true, din: [[0, "p"], [3, "f"]], forq: [[1, 2, "cresc"]], opcoes: ["O Fá do começo", "O Ré agudo", "O Lá do final"], certa: 1 },
            { tipo: "tocar", nota: "do", segundos: 2, titulo: "O primeiro compasso", texto: "Comece suave e cresça até o Dó.", pauta: [["fa", 1], ["la", 1], ["do", 2]], din: [[0, "p"]], forq: [[1, 2, "cresc"]] },
            { tipo: "tocar", nota: "la", segundos: 2, titulo: "O segundo compasso", texto: "Ré acentuado, duas curtas e sustente o Lá.", pauta: [["re2", 1, "ac"], ["do", 0.5, "st"], ["sib", 0.5, "st"], ["la", 2]], din: [[0, "f"]] },
          ],
        },
        {
          id: "musica11", titulo: "Serenata", resumo: "Uma música para tocar com expressão", melodia: SERENATA, din: [[0, "p"], [7, "f"], [13, "p"]], forq: [[3, 6, "cresc"], [11, 12, "dim"]],
          passos: [
            { tipo: "info", titulo: "Serenata", texto: ["Esta música conta uma pequena história: começa suave, cresce até o ponto mais alto e volta ao silêncio.", "Ouça com o pulso. O exemplo já toca com a dinâmica escrita."], melodia: true },
            { tipo: "escolha", pergunta: "Onde está o ponto mais forte da música?", melodia: true, opcoes: ["No primeiro compasso", "No terceiro compasso", "Na última nota"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "O app confere as notas. A dinâmica fica por sua conta: é ela que faz a música." },
            { tipo: "gravar", chave: "u11", comparar: true, titulo: "Antes e depois", texto: "Grave a “Serenata” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "A armadura de clave", marco: "Leio músicas com armadura de clave, em quatro tons.", licoes: [
        {
          id: "aq12", titulo: "Aquecimento", resumo: "As escalas de Ré maior e Si♭ maior", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Escalas antes da armadura", texto: ["A armadura reúne os acidentes de uma escala. Tocar a escala antes de ler deixa os dedos prontos para o tom."] },
            { tipo: "tocar", nota: "re2", segundos: 2, titulo: "Escala de Ré maior", texto: "Fá♯ e Dó♯ no caminho. Sustente o Ré no fim.", pauta: [["re", 0.5], ["mi", 0.5], ["fas", 0.5], ["sol", 0.5], ["la", 0.5], ["si", 0.5], ["dos", 0.5], ["re2", 2]] },
            { tipo: "tocar", nota: "sib2", segundos: 2, titulo: "Escala de Si♭ maior", texto: "Si♭ e Mi♭ no caminho, até o Si♭ agudo.", pauta: [["sib", 0.5], ["do", 0.5], ["re2", 0.5], ["mib2", 0.5], ["fa2", 0.5], ["sol2", 0.5], ["la2", 0.5], ["sib2", 2]] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Escala de Sol maior, descendo", texto: "Agora descendo, com o Fá♯.", pauta: [["sol2", 0.5], ["fas2", 0.5], ["mi2", 0.5], ["re2", 0.5], ["do", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2]] },
          ],
        },
        {
          id: "armadura", titulo: "O que é a armadura", resumo: "Os acidentes que valem para a música toda",
          passos: [
            { tipo: "info", arm: "sol", ouvir: true, titulo: "Escrever uma vez só", texto: ["Em vez de repetir o sustenido em cada Fá, a partitura o coloca uma vez, logo depois da clave. Isso é a armadura de clave.", "Ela vale para a música inteira e para todas as oitavas: todo Fá passa a ser Fá♯."], pauta: [["sol", 1], ["la", 1], ["si", 1], ["do", 1], ["re2", 1], ["mi2", 1], ["fas2", 1], ["sol2", 1]], compassos: true },
            { tipo: "escolha", arm: "sol", pergunta: "Com esta armadura, que nota é esta?", pauta: [["fas", 2]], opcoes: ["Fá natural", "Fá♯", "Sol"], certa: 1, explica: "O sustenido da armadura está na linha do Fá. Todo Fá da música é sustenido, em qualquer oitava." },
            { tipo: "info", arm: "fa", ouvir: true, titulo: "Com bemol funciona igual", texto: ["Um bemol na linha do Si avisa: todo Si desta música é Si♭.", "É a armadura de Fá maior."], pauta: [["fa", 1], ["sol", 1], ["la", 1], ["sib", 1], ["do", 1], ["re2", 1], ["mi2", 1], ["fa2", 1]], compassos: true },
            { tipo: "escolha", arm: "fa", pergunta: "Com esta armadura, que nota é esta?", pauta: [["sib", 2]], opcoes: ["Si natural", "Si♭", "Lá"], certa: 1 },
            { tipo: "digitacao", arm: "fa", pergunta: "E qual é a digitação dela?", nota: "sib", notas: ["si", "sib", "la"] },
          ],
        },
        {
          id: "tons", titulo: "Descobrir o tom", resumo: "O que a armadura conta sobre a música",
          passos: [
            { tipo: "info", arm: "re", ouvir: true, titulo: "Dois sustenidos", texto: ["Os sustenidos entram sempre na mesma ordem: primeiro o Fá, depois o Dó.", "Com sustenidos, o tom maior fica meio tom acima do último sustenido. Último sustenido Dó♯: tom de Ré maior."], pauta: [["re", 1], ["mi", 1], ["fas", 1], ["sol", 1], ["la", 1], ["si", 1], ["dos", 1], ["re2", 1]], compassos: true },
            { tipo: "escolha", pergunta: "Uma armadura com um sustenido (Fá♯) indica qual tom maior?", opcoes: ["Sol maior", "Fá maior", "Ré maior"], certa: 0, explica: "Meio tom acima do Fá♯ está o Sol." },
            { tipo: "info", arm: "sib", ouvir: true, titulo: "Dois bemóis", texto: ["Os bemóis também têm ordem: primeiro o Si, depois o Mi.", "Com dois bemóis ou mais, o tom maior tem o nome do penúltimo bemol. Si♭ e Mi♭: tom de Si♭ maior. Com um bemol só, é Fá maior."], pauta: [["sib", 1], ["do", 1], ["re2", 1], ["mib2", 1], ["fa2", 1], ["sol2", 1], ["la2", 1], ["sib2", 1]], compassos: true },
            { tipo: "escolha", arm: "re", pergunta: "Em que tom está esta música?", pauta: [["re", 1], ["fas", 1], ["la", 2]], opcoes: ["Sol maior", "Ré maior", "Si♭ maior"], certa: 1 },
            { tipo: "escolha", arm: "sib", pergunta: "Com esta armadura, quais notas são bemóis?", pauta: [["sib", 2], ["mib2", 2]], opcoes: ["Si e Mi", "Si e Lá", "Só o Si"], certa: 0 },
          ],
        },
        {
          id: "ocorrente", titulo: "O acidente ocorrente", resumo: "Quando uma nota foge do tom",
          passos: [
            { tipo: "info", arm: "sol", ouvir: true, titulo: "O bequadro dentro da música", texto: ["Às vezes a melodia pede uma nota fora da armadura. Aí o sinal aparece ao lado da nota: é o acidente ocorrente.", "Ele vale só até o fim daquele compasso. Aqui, o bequadro transforma o Fá♯ em Fá natural por um compasso."], pauta: [["sol", 1], ["fas", 1], ["sol", 2], ["sol", 1], ["fan", 1], ["mi", 2]], compassos: true },
            { tipo: "escolha", pergunta: "Até quando vale um acidente ocorrente?", opcoes: ["Até o fim da música", "Até o fim do compasso", "Só naquela nota, nunca mais"], certa: 1 },
            { tipo: "escolha", arm: "sol", pergunta: "Qual é a segunda nota deste compasso?", pauta: [["sol", 1], ["fan", 1], ["mi", 2]], opcoes: ["Fá♯", "Fá natural", "Mi"], certa: 1 },
            { tipo: "tocar", arm: "sol", nota: "mi", segundos: 2, titulo: "Toque com o bequadro", texto: "Sol, Fá natural e sustente o Mi.", pauta: [["sol", 1], ["fan", 1], ["mi", 2]] },
            { tipo: "tocar", arm: "sol", nota: "sol", segundos: 2, titulo: "E de volta ao tom", texto: "Agora com o Fá♯ da armadura: Sol, Fá♯, Sol.", pauta: [["sol", 1], ["fas", 1], ["sol", 2]] },
          ],
        },
        {
          id: "ler-armadura", titulo: "Ler com armadura", resumo: "Lembrar do tom antes de tocar", arm: "re",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O primeiro olhar", texto: ["Antes de tocar qualquer música, olhe três coisas: a armadura, a fórmula de compasso e o andamento.", "Aqui a armadura tem dois sustenidos. Diga em voz alta: “Fá e Dó sustenidos”."], pauta: [["re", 0.5], ["fas", 0.5], ["la", 1], ["si", 0.5], ["dos", 0.5], ["re2", 1]] },
            { tipo: "escolha", pergunta: "Nesta frase, quais notas você toca com sustenido?", pauta: [["re", 0.5], ["fas", 0.5], ["la", 1], ["si", 0.5], ["dos", 0.5], ["re2", 1]], opcoes: ["Nenhuma, não há sinal ao lado delas", "O Fá e o Dó", "Só o Fá"], certa: 1 },
            { tipo: "ritmo", titulo: "O ritmo da frase", texto: "Duas colcheias, semínima, duas colcheias, semínima.", pauta: [["re", 0.5], ["fas", 0.5], ["la", 1], ["si", 0.5], ["dos", 0.5], ["re2", 1]], padrao: [0.5, 0.5, 1, 0.5, 0.5, 1] },
            { tipo: "tocar", nota: "la", segundos: 1, titulo: "A primeira metade", texto: "Ré, Fá♯ e pare no Lá.", pauta: [["re", 0.5], ["fas", 0.5], ["la", 1]] },
            { tipo: "tocar", nota: "re2", segundos: 1, titulo: "A segunda metade", texto: "Si, Dó♯ e chegue no Ré agudo.", pauta: [["si", 0.5], ["dos", 0.5], ["re2", 1]] },
          ],
        },
        {
          id: "musica12", titulo: "Cantiga em Ré", resumo: "Uma música escrita com armadura", arm: "re", formula: true, melodia: CANTIGA_EM_RE,
          passos: [
            { tipo: "info", titulo: "Cantiga em Ré", texto: ["Esta partitura já parece com as que você vai encontrar nos métodos: armadura, fórmula de compasso e nenhuma ajuda ao lado das notas.", "Ouça com o pulso e lembre dos dois sustenidos."], melodia: true },
            { tipo: "escolha", pergunta: "Em que tom está a Cantiga?", melodia: true, opcoes: ["Sol maior", "Ré maior", "Fá maior"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira." },
            { tipo: "gravar", chave: "u12", comparar: true, titulo: "Antes e depois", texto: "Grave a “Cantiga em Ré” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Tercinas e swing", marco: "Toco tercinas e colcheias com swing.", licoes: [
        {
          id: "aq13", titulo: "Aquecimento", resumo: "Ritmo no corpo antes de tocar", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Ritmo antes das notas", texto: ["Tercina e swing dividem o tempo em três. Bata primeiro, depois toque: o ritmo precisa estar no corpo."] },
            { tipo: "ritmo", titulo: "Colcheias e tercinas", texto: "Duas colcheias, uma tercina, duas colcheias, uma tercina e uma mínima.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", T], ["sol", T], ["sol", T], ["sol", 0.5], ["sol", 0.5], ["sol", T], ["sol", T], ["sol", T], ["sol", 2]], padrao: [0.5, 0.5, T, T, T, 0.5, 0.5, T, T, T, 2] },
            { tipo: "ritmo", swing: true, titulo: "Colcheias com swing", texto: "Seis colcheias com balanço e uma semínima: “tuu-dá, tuu-dá, tuu-dá, tá”.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 1]], padrao: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1] },
            { tipo: "tocar", swing: true, nota: "sol", segundos: 2, titulo: "Escala com swing", texto: "Desça do Ré com swing, faça a tercina e pare no Sol.", pauta: [["re2", 0.5], ["do", 0.5], ["si", 0.5], ["la", 0.5], ["si", T], ["la", T], ["si", T], ["sol", 2]] },
          ],
        },
        {
          id: "tercina", titulo: "A tercina", resumo: "Três notas no lugar de duas",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Três num tempo", texto: ["A tercina divide o tempo em três partes iguais. Ela aparece como três colcheias unidas, com um 3 em cima.", "Para sentir, diga “pês-se-go, pês-se-go”, uma sílaba para cada nota."], pauta: [["sol", T], ["sol", T], ["sol", T], ["sol", 1], ["sol", 2]] },
            { tipo: "escolha", pergunta: "Quantas notas de uma tercina cabem em um tempo?", opcoes: ["Duas", "Três", "Quatro"], certa: 1 },
            { tipo: "ritmo", titulo: "Bata a tercina", texto: "Três batidas iguais dentro do primeiro tempo, depois semínima e mínima.", pauta: [["sol", T], ["sol", T], ["sol", T], ["sol", 1], ["sol", 2]], padrao: [T, T, T, 1, 2] },
            { tipo: "ritmo", titulo: "Colcheias e tercina", texto: "Duas colcheias, uma tercina e uma mínima. Sinta o tempo se dividir em dois e depois em três.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", T], ["sol", T], ["sol", T], ["sol", 2]], padrao: [0.5, 0.5, T, T, T, 2] },
            { tipo: "tocar", nota: "si", segundos: 1, titulo: "Tercina com notas", texto: "Sol, Lá, Si em tercina, e sustente o Si.", pauta: [["sol", T], ["la", T], ["si", T], ["si", 1]] },
          ],
        },
        {
          id: "swing", titulo: "O swing", resumo: "Colcheias desiguais",
          passos: [
            { tipo: "info", swing: true, ouvir: true, titulo: "Escrito igual, tocado diferente", texto: ["No jazz, as colcheias são escritas iguais, mas tocadas com balanço: a primeira mais longa, a segunda mais curta.", "É como uma tercina com as duas primeiras notas ligadas. Ouça."], pauta: [["sol", 0.5], ["la", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2]] },
            { tipo: "info", swing: false, ouvir: true, titulo: "A mesma frase, sem swing", texto: ["Agora as mesmas notas com as colcheias retas, como no choro e no baião.", "Volte ao passo anterior se quiser comparar."], pauta: [["sol", 0.5], ["la", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2]] },
            { tipo: "escolha", pergunta: "No swing, como ficam as duas colcheias de cada tempo?", opcoes: ["Iguais", "Longa e curta", "Curta e longa"], certa: 1 },
            { tipo: "ritmo", swing: true, titulo: "Bata com swing", texto: "Quatro colcheias com balanço e uma mínima: “tuu-dá, tuu-dá”.", pauta: [["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 0.5], ["sol", 2]], padrao: [0.5, 0.5, 0.5, 0.5, 2] },
            { tipo: "tocar", swing: true, nota: "sol", segundos: 2, titulo: "Swing no sax", texto: "Ligue o pulso e toque a frase com balanço.", pauta: [["sol", 0.5], ["la", 0.5], ["si", 0.5], ["la", 0.5], ["sol", 2]] },
          ],
        },
        {
          id: "frases-swing", titulo: "Frases de swing", resumo: "A nota azul e o sotaque do jazz", swing: true,
          passos: [
            { tipo: "info", ouvir: true, titulo: "A nota azul", texto: ["O jazz e o blues gostam de abaixar algumas notas da escala. Em Sol, o Si♭ no lugar do Si dá o som de blues.", "Ouça a frase: ela passa pelo Si♭ antes de repousar no Sol."], pauta: [["re2", 0.5], ["do", 0.5], ["sib", 0.5], ["la", 0.5], ["sol", 2]] },
            { tipo: "ritmo", titulo: "O ritmo, com swing", texto: "Quatro colcheias com balanço e uma mínima.", pauta: [["re2", 0.5], ["do", 0.5], ["sib", 0.5], ["la", 0.5], ["sol", 2]], padrao: [0.5, 0.5, 0.5, 0.5, 2] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Toque a frase", texto: "Desça do Ré agudo, passando pelo Si♭, até o Sol.", pauta: [["re2", 0.5], ["do", 0.5], ["sib", 0.5], ["la", 0.5], ["sol", 2]] },
            { tipo: "info", ouvir: true, titulo: "Tercina dentro do swing", texto: ["A tercina combina com o swing porque os dois dividem o tempo em três.", "Ouça como ela entra na frase sem quebrar o balanço."], pauta: [["re2", T], ["mi2", T], ["re2", T], ["si", 1], ["la", 0.5], ["sol", 0.5], ["mi", 1]] },
            { tipo: "tocar", nota: "mi", segundos: 1, titulo: "Toque com a tercina", texto: "Tercina, semínima, duas colcheias com swing e pare no Mi.", pauta: [["re2", T], ["mi2", T], ["re2", T], ["si", 1], ["la", 0.5], ["sol", 0.5], ["mi", 1]] },
          ],
        },
        {
          id: "musica13", titulo: "Swing do Naipe", resumo: "Oito compassos com balanço", swing: true, melodia: SWING_DO_NAIPE,
          passos: [
            { tipo: "info", titulo: "Swing do Naipe", texto: ["Um tema de jazz em oito compassos, com a nota azul e uma tercina perto do fim.", "Ouça com o pulso. Depois de tocar aqui, experimente com o ritmo de Jazz Swing no naipe rit."], melodia: true },
            { tipo: "escolha", pergunta: "Em qual compasso aparece a tercina?", melodia: true, opcoes: ["No segundo", "No quinto", "No sétimo"], certa: 2 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque o tema inteiro, com swing." },
            { tipo: "gravar", chave: "u13", comparar: true, titulo: "Antes e depois", texto: "Grave o “Swing do Naipe” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Vibrato e ornamentos", marco: "Toco com vibrato, apojaturas e trinados.", licoes: [
        {
          id: "aq14", titulo: "Aquecimento", resumo: "Som parado, dedos leves", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Preparar o som e os dedos", texto: ["Vibrato pede um som parado e ornamento pede dedos leves. O aquecimento prepara os dois."] },
            { tipo: "vibrato", modo: "reto", titulo: "Som reto", texto: "Uma nota longa e parada. É dela que nasce o vibrato." },
            { tipo: "tocar", nota: "la", segundos: 2, titulo: "Notas vizinhas, rápidas", texto: "Lá e Si alternados em colcheias, dedos perto das chaves. Termine no Lá.", pauta: [["la", 0.5], ["si", 0.5], ["la", 0.5], ["si", 0.5], ["la", 0.5], ["si", 0.5], ["la", 0.5], ["si", 0.5], ["la", 2]] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Apojaturas", texto: "A notinha antes de cada nota é rápida e leve. Use o dedo, não a língua.", pauta: [["la", 1, "ap=si"], ["si", 1, "ap=do"], ["la", 1, "ap=si"], ["sol", 2]] },
          ],
        },
        {
          id: "som-reto", titulo: "Primeiro, o som reto", resumo: "A base de todo vibrato",
          passos: [
            { tipo: "info", titulo: "Antes de ondular, firmar", texto: ["Vibrato é uma ondulação controlada da afinação. Para controlar, é preciso primeiro saber deixar o som parado.", "No próximo passo o app desenha a sua afinação em tempo real. O objetivo é uma linha reta."] },
            { tipo: "vibrato", modo: "reto", titulo: "Uma nota reta", texto: "Escolha uma nota confortável, como o Sol ou o Lá." },
            { tipo: "escolha", pergunta: "Para que serve treinar o som reto antes do vibrato?", opcoes: ["Para ganhar volume", "Para ter controle sobre a afinação", "Para tocar mais rápido"], certa: 1 },
          ],
        },
        {
          id: "vibrato", titulo: "O vibrato", resumo: "O som que canta",
          passos: [
            { tipo: "info", titulo: "O movimento do queixo", texto: ["No saxofone, o vibrato vem de um movimento pequeno do queixo, para baixo e de volta, como quem diz “uá-uá-uá”.", "O ar não para e a garganta não participa. A afinação desce um pouco e volta, em ondas regulares."], video: "Vídeo do Tiago: o movimento do vibrato" },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual tem vibrato?", sons: [["la", 1, 2.2, 0], ["la", 1, 2.2, 0.014]], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "No segundo, a afinação ondula de forma regular." },
            { tipo: "info", titulo: "Como estudar", lista: ["Ligue o pulso em 60.", "Faça uma ondulação por clique, depois duas, três e quatro.", "Quatro ondulações por clique em 60 já é um vibrato bonito de balada.", "Use vibrato em notas longas e nos finais de frase. Em notas curtas, não precisa."] },
            { tipo: "vibrato", modo: "vibrato", titulo: "Seu vibrato", texto: "Toque uma nota longa com ondulação regular. O desenho mostra as ondas." },
            { tipo: "escolha", pergunta: "Onde o vibrato costuma soar melhor?", opcoes: ["Em todas as notas, sempre", "Em notas longas e finais de frase", "Só em notas curtas"], certa: 1 },
          ],
        },
        {
          id: "apojatura", titulo: "A apojatura", resumo: "Uma notinha antes da nota",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O enfeite mais simples", texto: ["A apojatura é uma nota pequena, cortada por um traço, escrita antes da nota principal.", "Ela é tocada bem rápida, quase em cima do tempo, e não rouba a duração de ninguém."], pauta: [["la", 2, "ap=sol"], ["do", 2, "ap=si"]] },
            { tipo: "escolha", pergunta: "Como se toca a apojatura?", opcoes: ["Longa, dividindo o tempo com a nota principal", "Bem rápida, colada na nota principal", "Depois da nota principal"], certa: 1 },
            { tipo: "tocar", nota: "la", segundos: 2, titulo: "Sol rapidinho, Lá longo", texto: "Encoste no Sol e caia no Lá. Língua só na apojatura.", pauta: [["la", 2, "ap=sol"]] },
            { tipo: "tocar", nota: "do", segundos: 2, titulo: "Si rapidinho, Dó longo", texto: "Agora com a troca de dedos Si–Dó.", pauta: [["do", 2, "ap=si"]] },
          ],
        },
        {
          id: "trinado", titulo: "O trinado", resumo: "Duas notas vizinhas, bem rápido",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O sinal tr", texto: ["O trinado alterna rapidamente a nota escrita com a nota de cima, durante todo o valor dela.", "Os dedos ficam leves e perto das chaves. Comece devagar e vá acelerando."], pauta: [["la", 2, "tr"], ["sol", 2]] },
            { tipo: "escolha", pergunta: "No trinado sobre o Lá, quais notas se alternam?", opcoes: ["Lá e Sol", "Lá e Si", "Lá e Lá agudo"], certa: 1 },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Trine e repouse", texto: "Trinado no Lá por dois tempos e repouso no Sol.", pauta: [["la", 2, "tr"], ["sol", 2]] },
          ],
        },
        {
          id: "musica14", titulo: "Seresta", resumo: "Uma melodia enfeitada", arm: "fa", melodia: SERESTA,
          passos: [
            { tipo: "info", titulo: "Seresta", texto: ["Uma melodia lenta em Fá maior, com apojaturas e trinados. Nas notas longas, use o seu vibrato.", "Ouça com o pulso em 56 e repare onde cada enfeite entra."], melodia: true },
            { tipo: "escolha", pergunta: "Quantos trinados há na Seresta?", melodia: true, opcoes: ["Um", "Dois", "Três"], certa: 1 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "O app confere as notas principais. Os enfeites e o vibrato ficam por sua conta." },
            { tipo: "gravar", chave: "u14", comparar: true, titulo: "Antes e depois", texto: "Grave a “Seresta” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Do grave ao agudo", marco: "Toco do Si♭ grave ao Ré superagudo.", licoes: [
        {
          id: "aq15", titulo: "Aquecimento", resumo: "Graves, agudos e o caminho entre eles", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Grave e agudo pedem coisas diferentes", texto: ["Nos graves, o maxilar solto e a garganta aberta. Nos agudos, o ar mais rápido, sem morder a boquilha."], lista: ["Grave: ar quente, como quem embaça um vidro.", "Agudo: ar rápido e frio, como quem apaga uma vela de longe."] },
            { tipo: "tocar", nota: "dob", segundos: 3, titulo: "Descer ao Dó grave", texto: "Desça devagar e sustente o Dó grave sem estourar.", pauta: [["sol", 1], ["mi", 1], ["dob", 2]] },
            { tipo: "tocar", nota: "do3", segundos: 2, titulo: "Oitava: Dó e Dó agudo", texto: "Só o polegar se mexe. O som do Dó agudo deve ser igual ao do Dó do meio.", pauta: [["do", 2, "liga"], ["do3", 2]] },
            { tipo: "tocar", nota: "re3", segundos: 2, titulo: "Até o Ré superagudo", texto: "Si, Dó e Ré agudos ligados. A mão encosta na chave da palma.", pauta: [["si2", 1], ["do3", 1], ["re3", 2]] },
          ],
        },
        {
          id: "si-grave", titulo: "Si e Si♭ graves", resumo: "As notas mais graves do saxofone",
          passos: [
            { tipo: "info", titulo: "O fundo do instrumento", texto: ["Abaixo do Dó grave ainda há duas notas: o Si e o Si♭. Na pauta, ficam logo abaixo da linha suplementar.", "As duas usam a digitação do Dó grave mais uma chave do mindinho esquerdo."], pauta: [["dob", 2], ["sig", 2], ["sibg", 2]], rotulos: true, dedos: ["dob", "sig"] },
            { tipo: "ondefica", nota: "sig", titulo: "Coloque o Si grave na pauta", texto: "Ele fica logo abaixo da linha suplementar do Dó." },
            { tipo: "info", titulo: "Como fazer o grave falar", lista: ["Queixo solto e garganta aberta, como num bocejo.", "Ar quente e largo, sem pressa.", "Comece numa nota fácil, como o Sol, e desça ligado até o grave.", "Se a nota pular para o agudo, você apertou a boquilha."] },
            { tipo: "tocar", nota: "sig", segundos: 2, titulo: "Toque o Si grave", texto: "Desça do Ré, passe pelo Dó e chegue no Si." },
            { tipo: "tocar", nota: "sibg", segundos: 2, titulo: "Toque o Si♭ grave", texto: "A nota mais grave do saxofone. Ar quente até o fim." },
          ],
        },
        {
          id: "agudos3", titulo: "Si e Dó agudos", resumo: "Duas linhas suplementares",
          passos: [
            { tipo: "info", titulo: "Subindo além do Lá", texto: ["Depois do Lá agudo vêm o Si agudo, acima da primeira linha suplementar, e o Dó agudo, na segunda linha suplementar.", "As digitações são as do Si e do Dó, com a chave de oitava."], pauta: [["la2", 2], ["si2", 2], ["do3", 2]], rotulos: true, dedos: ["si2", "do3"] },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["do3", "la2", "si2", "sol2"] },
            { tipo: "tocar", nota: "si2", segundos: 2, titulo: "Toque o Si agudo", texto: "Ar rápido e embocadura firme nos cantos, sem morder." },
            { tipo: "tocar", nota: "do3", segundos: 2, titulo: "Toque o Dó agudo", texto: "Só o dedo do meio e a chave de oitava." },
          ],
        },
        {
          id: "palma", titulo: "O Ré superagudo", resumo: "A primeira chave da palma",
          passos: [
            { tipo: "info", titulo: "As chaves da palma", texto: ["Acima do Dó♯ agudo, as notas usam chaves tocadas com a palma da mão esquerda.", "A primeira delas dá o Ré superagudo: todos os dedos soltos, chave de oitava e a chave da palma."], pauta: [["do3", 2], ["re3", 2]], rotulos: true, dedos: ["do3", "re3"] },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Ré superagudo?", nota: "re3", notas: ["re2", "re3", "do3"] },
            { tipo: "tocar", nota: "re3", segundos: 2, titulo: "Toque o Ré superagudo", texto: "A mão encosta na chave sem tirar o polegar da oitava." },
            { tipo: "info", titulo: "Ainda tem mais", texto: ["Acima do Ré vêm o Mi♭, o Mi, o Fá e o Fá♯, com as outras chaves da palma e da lateral.", "Você vai conhecer essas notas nos Pilares, junto com os estudos de sonoridade do registro agudo."] },
          ],
        },
        {
          id: "oitavas", titulo: "Saltos de oitava", resumo: "A mesma nota, dois registros",
          passos: [
            { tipo: "info", ouvir: true, titulo: "Um dedo muda tudo", texto: ["Tocar a mesma nota no grave e no agudo é o melhor estudo para igualar o som dos dois registros.", "Só o polegar se mexe. O ar e a embocadura quase não mudam."], pauta: [["sol", 2], ["sol2", 2], ["la", 2], ["la2", 2]], compassos: true },
            { tipo: "ouvir", pergunta: "Ouça os dois sons. O que aconteceu?", sons: ["re", "re2"], opcoes: ["Subiu uma oitava", "Desceu uma oitava", "Repetiu a mesma nota"], certa: 0 },
            { tipo: "tocar", nota: "sol2", segundos: 2, titulo: "Sol e Sol agudo", texto: "Toque o Sol, aperte a oitava sem dar nova língua e sustente o Sol agudo.", pauta: [["sol", 2, "liga"], ["sol2", 2]] },
            { tipo: "tocar", nota: "la", segundos: 2, titulo: "Lá agudo e Lá", texto: "Agora descendo: do Lá agudo para o Lá, soltando só o polegar.", pauta: [["la2", 2, "liga"], ["la", 2]] },
          ],
        },
        {
          id: "musica15", titulo: "De Ponta a Ponta", resumo: "Do Dó grave ao Dó agudo", melodia: DE_PONTA_A_PONTA,
          passos: [
            { tipo: "info", titulo: "De Ponta a Ponta", texto: ["Esta melodia atravessa duas oitavas: sai do Dó grave, sobe até o Dó agudo e volta.", "O desafio é manter o mesmo som cheio do começo ao fim."], melodia: true },
            { tipo: "escolha", pergunta: "Qual é a nota mais aguda da música?", melodia: true, opcoes: ["Sol agudo", "Si agudo", "Dó agudo"], certa: 2 },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música inteira." },
            { tipo: "gravar", chave: "u15", comparar: true, titulo: "Antes e depois", texto: "Grave “De Ponta a Ponta” e compare com o som do seu primeiro dia." },
          ],
        },
      ],
    },
    {
      titulo: "Formatura", marco: "Concluí a Teoria do Naipe: leio partitura e toco com expressão.", licoes: [
        {
          id: "aq16", titulo: "Aquecimento da formatura", resumo: "Staccato, síncope, tercina, acento e agudos", aquecimento: true,
          passos: [
            { tipo: "info", titulo: "Tudo o que a peça pede", texto: ["A peça de formatura junta staccato, síncope, tercina, acento, dinâmica e notas agudas. Este aquecimento passa por cada um, em pequenos trechos."] },
            { tipo: "tocar", nota: "sol2", segundos: 2, titulo: "Arpejo em staccato", texto: "Sol, Si e Ré curtos e leves, e sustente o Sol agudo.", pauta: [["sol", 1, "st"], ["si", 1, "st"], ["re2", 1, "st"], ["sol2", 2]] },
            { tipo: "ritmo", titulo: "Síncope e tercina", texto: "Os dois ritmos mais difíceis da peça, um depois do outro.", pauta: [["re2", 0.25], ["mi2", 0.5], ["re2", 0.25], ["si", 1], ["la", T], ["si", T], ["la", T], ["fas", 1], ["sol", 1]], padrao: [0.25, 0.5, 0.25, 1, T, T, T, 1, 1] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Acento e descida", texto: "O Lá agudo com acento e desça até o Sol.", pauta: [["la2", 1, "ac"], ["sol2", 0.5], ["fas2", 0.5], ["mi2", 0.5], ["re2", 0.5], ["si", 1], ["sol", 2]] },
            { tipo: "dinamica", modo: "cresc", titulo: "Crescendo final", texto: "A peça cresce perto do fim. Uma nota longa do piano ao forte.", pauta: [["re2", 4]], forq: [[0, 0, "cresc"]] },
          ],
        },
        {
          id: "revisao-leitura", titulo: "Revisão: leitura", resumo: "Tudo o que a partitura diz",
          passos: [
            { tipo: "info", titulo: "Olhe para trás", texto: ["Você começou sem saber onde ficava o Sol. Hoje lê armadura, compasso, ritmo, dinâmica e articulação.", "Esta lição passa por tudo isso de uma vez."] },
            { tipo: "escolha", arm: "re", formula: 3, comp: 3, pergunta: "Quantos tempos tem cada compasso, e em que tom está?", pauta: [["re", 1], ["fas", 1], ["la", 1], ["re2", 3]], compassos: true, opcoes: ["Três tempos, Ré maior", "Quatro tempos, Sol maior", "Três tempos, Fá maior"], certa: 0 },
            { tipo: "escolha", pergunta: "O que pede esta frase?", pauta: [["sol", 1], ["la", 1], ["si", 2]], din: [[0, "p"]], forq: [[0, 2, "cresc"]], opcoes: ["Começar forte e diminuir", "Começar suave e crescer", "Tocar tudo curto"], certa: 1 },
            { tipo: "pares", titulo: "Ligue cada nota ao seu nome", notas: ["dob", "la2", "fas", "sib"] },
            { tipo: "escolha", arm: "fa", pergunta: "Com esta armadura, que nota é esta?", pauta: [["sib", 2]], opcoes: ["Si natural", "Si♭", "Dó"], certa: 1 },
            { tipo: "escolha", pergunta: "Qual figura dura três quartos de tempo?", opcoes: ["A colcheia pontuada", "A semínima pontuada", "A tercina"], certa: 0 },
            { tipo: "digitacao", pergunta: "Qual é a digitação do Dó♯?", nota: "dos", notas: ["do", "dos", "re2"] },
          ],
        },
        {
          id: "revisao-ritmo", titulo: "Revisão: ritmo", resumo: "Do pulso à síncope",
          passos: [
            { tipo: "ritmo", titulo: "A síncope", texto: "Curta, longa, curta, semínima e mínima.", pauta: [["sol", 0.25], ["sol", 0.5], ["sol", 0.25], ["sol", 1], ["sol", 2]], padrao: [0.25, 0.5, 0.25, 1, 2] },
            { tipo: "ritmo", titulo: "A célula do baião", texto: "Longa, longa, curta.", pauta: [["sol", 1.5], ["sol", 1.5], ["sol", 1]], padrao: [1.5, 1.5, 1] },
            { tipo: "ritmo", titulo: "A tercina", texto: "Tercina, semínima e mínima.", pauta: [["sol", T], ["sol", T], ["sol", T], ["sol", 1], ["sol", 2]], padrao: [T, T, T, 1, 2] },
            { tipo: "ritmo", comp: 3, formula: 3, titulo: "Em três", texto: "Mínima, semínima e mínima pontuada.", pauta: [["sol", 2], ["sol", 1], ["sol", 3]], compassos: true, padrao: [2, 1, 3] },
            { tipo: "ritmo", titulo: "Com pausa", texto: "Colcheias, pausa, colcheias e semínima.", pauta: [["sol", 0.5], ["sol", 0.5], [P, 1], ["sol", 0.5], ["sol", 0.5], ["sol", 1]], padrao: [0.5, 0.5, -1, 0.5, 0.5, 1] },
          ],
        },
        {
          id: "formatura-partes", titulo: "A peça de formatura, por partes", resumo: "Dois compassos de cada vez", arm: "sol",
          passos: [
            { tipo: "info", ouvir: true, titulo: "O começo", texto: ["A peça está em Sol maior e abre subindo até o Sol agudo.", "Ouça os dois primeiros compassos. O segundo começa com uma síncope."], pauta: [["sol", 1], ["si", 0.5], ["re2", 0.5], ["sol2", 1], ["fas2", 0.5], ["mi2", 0.5], ["re2", 0.25], ["mi2", 0.5], ["re2", 0.25], ["si", 1], ["la", 0.5], ["si", 0.5], ["re2", 1]], compassos: true, din: [[0, "mf"]] },
            { tipo: "tocar", nota: "mi2", segundos: 1, titulo: "O primeiro compasso", texto: "Suba até o Sol agudo e desça ao Mi.", pauta: [["sol", 1], ["si", 0.5], ["re2", 0.5], ["sol2", 1], ["fas2", 0.5], ["mi2", 0.5]] },
            { tipo: "ritmo", titulo: "O ritmo do segundo compasso", texto: "Síncope, semínima, duas colcheias, semínima.", pauta: [["re2", 0.25], ["mi2", 0.5], ["re2", 0.25], ["si", 1], ["la", 0.5], ["si", 0.5], ["re2", 1]], padrao: [0.25, 0.5, 0.25, 1, 0.5, 0.5, 1] },
            { tipo: "tocar", nota: "sol", segundos: 2, titulo: "A tercina do quarto compasso", texto: "Tercina, Fá♯ e repouse no Sol.", pauta: [["la", T], ["si", T], ["la", T], ["fas", 1], ["sol", 2]] },
            { tipo: "info", ouvir: true, titulo: "O final", texto: ["O final cresce em staccato até o Lá agudo, acentuado e forte, e desce para terminar no Sol."], pauta: [["re2", 1, "st"], ["mi2", 1, "st"], ["fas2", 1, "st"], ["sol2", 1], ["la2", 2, "ac"], ["sol2", 0.5], ["fas2", 0.5], ["mi2", 0.5], ["re2", 0.5]], compassos: true, din: [[0, "p"], [4, "f"]], forq: [[0, 3, "cresc"]] },
            { tipo: "tocar", nota: "la2", segundos: 2, titulo: "A subida", texto: "Três notas curtas crescendo, Sol agudo e sustente o Lá agudo, forte.", pauta: [["re2", 1, "st"], ["mi2", 1, "st"], ["fas2", 1, "st"], ["sol2", 1], ["la2", 2, "ac"]], din: [[0, "p"], [4, "f"]], forq: [[0, 3, "cresc"]] },
          ],
        },
        {
          id: "formatura", titulo: "Formatura", resumo: "A sua peça de conclusão", arm: "sol", formula: true, melodia: FORMATURA, din: [[0, "mf"], [24, "p"], [34, "f"]], forq: [[30, 33, "cresc"]],
          passos: [
            { tipo: "info", titulo: "Formatura", texto: ["Oito compassos com tudo o que a trilha ensinou: armadura, síncope, tercina, staccato, acento e dinâmica.", "Ouça com o pulso. Depois, toque como quem conta uma história."], melodia: true },
            { tipo: "musica", titulo: "Toque junto com o pulso", texto: "O app confere as notas. A expressão é sua." },
            { tipo: "gravar", chave: "u16", comparar: true, titulo: "O antes e o depois", texto: "Grave a sua “Formatura” e ouça ao lado do som do primeiro dia. Esse é o caminho que você fez." },
            { tipo: "info", titulo: "E agora?", texto: ["Você terminou a Teoria. A partir daqui, o estudo continua na aba Estudo: um plano com os métodos da biblioteca, em que o professor virtual escolhe o exercício e o andamento de cada sessão.", "Com o que você já lê e toca, os métodos estão ao seu alcance."], link: { rotulo: "Começar o plano de estudos", href: "#/estudo" } },
          ],
        },
      ],
    },
  ];
  UNIDADES.push(...UNIDADES_PLANO);
  const LICOES = UNIDADES.flatMap(u => u.licoes);
  const PLANO_LICOES = UNIDADES_PLANO.flatMap(u => u.licoes);
  const PRINCIPAIS = UNIDADES.filter(u => !u.pilar).flatMap(u => u.licoes); // a trilha do zero à formatura
  const PROXIMAS = [];

  // ---------- Estado ----------
  const CHAVE = "naipe.trilha.v1";
  let prog = { feitas: {}, pontos: 0 };
  try { prog = Object.assign(prog, JSON.parse(localStorage.getItem(CHAVE) || "{}")); } catch { /* sem armazenamento */ }
  // Aquecimentos das unidades 10 a 16 entraram depois: quem já tinha concluído o resto da unidade ganha o aquecimento como feito.
  UNIDADES.forEach(u => { const aq = u.licoes.find(l => l.aquecimento); if (aq && !prog.feitas[aq.id] && u.licoes.every(l => l === aq || prog.feitas[l.id])) prog.feitas[aq.id] = true; });
  const salvar = () => { if (REVISAR) return; try { localStorage.setItem(CHAVE, JSON.stringify(prog)); } catch { /* segue sem salvar */ } };
  const saxDoApp = () => { try { return (JSON.parse(localStorage.getItem("cma.v1") || "{}").sax) || prog.sax || ""; } catch { return prog.sax || ""; } };

  const $ = s => document.querySelector(s);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const raiz = () => $("#trilha-conteudo");

  // ---------- Desenhos ----------
  const CLAVE = "M12.6 47.5c-2.9 0-5-1.7-5-4 0-1.6 1.2-2.8 2.7-2.8 1.4 0 2.5 1 2.5 2.4 0 1.2-.8 2-1.9 2.2.5.5 1.2.7 2 .7 2.6 0 4-2 3.6-5.6l-.5-4.2c-.9.2-1.9.3-2.9.3-5.300 0-9.5-3.900-9.500-9 0-4.200 2.700-7.300 6.200-10.600l2.300-2.200c-.4-2.400-.6-4-.6-5.800 0-3.900 1.900-7.600 4.600-8.900 1.600 2 2.600 5 2.600 7.800 0 4-1.900 7.100-4.800 10l.900 5.300c.3 0 .7-.1 1-.1 4 0 6.900 3 6.900 6.800 0 3.200-2 5.800-5.200 6.900l.5 4.100c.6 4.700-1.700 7.700-5.400 7.700zm3.100-13.300l-1.300-9.400c-2.300.4-3.800 2.200-3.800 4.200 0 1.400.7 2.500 1.900 3.200-.2.300-.4.500-.6.600-2-1-3.200-2.900-3.200-5.100 0-3.100 2.200-5.600 5.300-6.200l-.7-4.600-1.700 1.600c-3 2.900-5 5.400-5 8.700 0 4.100 3.300 7.300 7.500 7.300.6 0 1.100-.1 1.600-.3zm1.200-9.400l1.200 8.800c2.200-.9 3.600-2.800 3.600-4.900 0-2.200-1.800-3.900-4.800-3.900zm-1.600-9.900c2.300-2.300 3.900-4.900 3.900-7.700 0-1.300-.4-2.600-1.100-3.300-1.900 1-3.300 3.700-3.300 7 0 1.300.2 2.700.5 4z";

  // Pauta com notas: itens = [[nota, tempos, "liga"?], ...]. destaque = índice da nota ativa.
  // Figuras: 4 semibreve, 3 mínima pontuada, 2 mínima, 1.5 semínima pontuada, 1 semínima, 0.5 colcheia.
  // Compasso do passo atual (tempos por compasso), contagem inicial, fórmula visível e marcas de expressão.
  let COMP = 4, CONT = 4, FORMULA = 0, MARCAS = {}, ARM = null, SWING = false, COMPOSTO = false;
  // No compasso composto (6 por 8) o tempo é a semínima pontuada: 1 = semínima pontuada, T = colcheia, 2T = semínima, 2 = mínima pontuada.
  const S6 = 1 / 6;
  const q = x => Math.round(x * 12) / 12; // soma de tempos sem erro de arredondamento
  // Armaduras de clave: letra alterada (0 Mi, 1 Fá, 2 Sol, 3 Lá, 4 Si, 5 Dó, 6 Ré) e onde desenhar cada acidente.
  const ARMS = {
    sol: { alt: { 1: "#" }, des: [["#", 8]] },
    re: { alt: { 1: "#", 5: "#" }, des: [["#", 8], ["#", 5]] },
    fa: { alt: { 4: "b" }, des: [["b", 4]] },
    sib: { alt: { 4: "b", 0: "b" }, des: [["b", 4], ["b", 7]] },
  };
  const SIMBOLO = { "#": "♯", n: "♮", b: "♭" };
  // Com swing, a colcheia do contratempo atrasa: cai no último terço do tempo.
  const tReal = x => (SWING && Math.abs((x % 1) - 0.5) < 1e-6 ? Math.floor(x) + 2 / 3 : x);
  const tem = (it, f) => typeof it[2] === "string" && it[2].includes(f);
  const passoX = t => (t <= 0.25 ? 25 : t <= 0.75 ? 32 : 44);
  const largPauta = itens => 70 + itens.reduce((a, [, t]) => a + passoX(t), 0) + 16;
  function svgPauta(itens, { rotulos = false, destaque = -1, compassos = false, minLarg = 220, din = null, forq = null, formula = FORMULA, recuo = FORMULA } = {}) {
    const nArm = ARM ? ARM.des.length : 0, dx = (recuo ? 18 : 0) + nArm * 10;
    // Com os nomes embaixo, cada nota ganha espaço para o nome mais comprido.
    const largRot = rotulos ? Math.max(...itens.map(([n]) => (n === P ? 0 : NOTA[n].nome.length * 6.4 + 10))) : 0, esp = t => Math.max(passoX(t), largRot);
    const larg = Math.max(minLarg, 70 + itens.reduce((a, [, t]) => a + esp(t), 0) + 16) + dx, temDin = !!((din && din.length) || (forq && forq.length));
    let x = 74 + dx + (largRot > 44 ? (largRot - 44) / 2 : 0), tempos = 0, corpo = "", arcos = "", traves = "", marcas = "";
    const pos = [];
    itens.forEach(([n, t], i) => { pos.push({ x, ini: tempos, y: n === P ? 0 : 70 - NOTA[n].passo * 5 }); tempos = q(tempos + t); x += esp(t); });
    // Hastes: sozinha, a nota decide a direção; notas curtas do mesmo tempo formam um grupo com trave reta.
    const haste = itens.map(([n], i) => { const baixo = n !== P && NOTA[n].passo >= 5; return { baixo, hx: baixo ? pos[i].x - 6 : pos[i].x + 6, yb: baixo ? pos[i].y + 32 : pos[i].y - 32, grupo: false }; });
    const curta = i => itens[i] && itens[i][0] !== P && itens[i][1] < (COMPOSTO ? 0.5 : 1);
    const semi = t => Math.abs(t - (COMPOSTO ? S6 : 0.25)) < 0.01; // semicolcheia
    for (let i = 0; i < itens.length; i++) {
      if (!curta(i)) continue;
      const tempo = Math.floor(pos[i].ini + 1e-6); let f = i;
      while (curta(f + 1) && Math.floor(pos[f + 1].ini + 1e-6) === tempo) f++;
      if (f > i) {
        const idx = []; for (let k = i; k <= f; k++) idx.push(k);
        const baixo = idx.reduce((a, k) => a + NOTA[itens[k][0]].passo, 0) / idx.length >= 4.5;
        const yb = baixo ? Math.max(...idx.map(k => pos[k].y)) + 30 : Math.min(...idx.map(k => pos[k].y)) - 30;
        idx.forEach(k => { haste[k] = { baixo, hx: baixo ? pos[k].x - 6 : pos[k].x + 6, yb, grupo: true }; });
        const cls = idx.includes(destaque) ? "trave ativa" : "trave";
        if (!COMPOSTO && idx.every(k => Math.abs(itens[k][1] - T) < 0.01)) traves += `<text x="${(haste[i].hx + haste[f].hx) / 2}" y="${baixo ? yb + 13 : yb - 5}" text-anchor="middle" class="tr-tres">3</text>`;
        traves += `<line x1="${haste[i].hx}" y1="${yb}" x2="${haste[f].hx}" y2="${yb}" class="${cls}"/>`;
        const y2 = baixo ? yb - 6.5 : yb + 6.5;
        idx.forEach(k => {
          if (!semi(itens[k][1])) return;
          if (k < f && semi(itens[k + 1][1])) traves += `<line x1="${haste[k].hx}" y1="${y2}" x2="${haste[k + 1].hx}" y2="${y2}" class="${cls}"/>`;
          else if (!(k > i && semi(itens[k - 1][1]))) traves += `<line x1="${haste[k].hx}" y1="${y2}" x2="${haste[k].hx + (k === i ? 9 : -9)}" y2="${y2}" class="${cls}"/>`;
        });
      }
      i = f;
    }
    const barra = i => (compassos && q(pos[i].ini + itens[i][1]) % COMP === 0 && i < itens.length - 1 ? `<line x1="${pos[i].x + esp(itens[i][1]) - 14}" y1="30" x2="${pos[i].x + esp(itens[i][1]) - 14}" y2="70" class="tr-barra"/>` : "");
    itens.forEach((item, i) => {
      const [n, t] = item, liga = tem(item, "liga"), x = pos[i].x;
      if (n === P) {
        const cp = `tr-pausa${i === destaque ? " ativa" : ""}`;
        // pausa de colcheia: uma bolinha e uma haste inclinada; as mais longas usam a pausa de semínima (com ponto no composto)
        if (t < (COMPOSTO ? 0.5 : 1)) corpo += `<g class="${cp}"><circle cx="${x - 3}" cy="44" r="2.6"/><path class="tr-pausa-haste" d="M${x - 3} 46q5 1 8-4l-5 20"/></g>`;
        else corpo += `<path class="${cp}" d="M${x - 3} 36l6 8-5 6 6 8c-5-2-9 0-6 6-6-4-7-9-2-12l-5-7 5-5z"/>${COMPOSTO && Math.abs(t - 1) < 0.01 ? `<circle cx="${x + 8}" cy="47" r="1.8" class="${cp}"/>` : ""}`;
        corpo += barra(i); return;
      }
      const nt = NOTA[n], y = pos[i].y, cheio = COMPOSTO ? t < 1.9 : t <= 1.5, { baixo, hx, yb, grupo } = haste[i];
      const cls = i === destaque ? "tr-nota ativa" : i < destaque ? "tr-nota feita" : "tr-nota";
      let extra = "";
      if (nt.passo <= -2) extra += `<line x1="${x - 11}" y1="80" x2="${x + 11}" y2="80" class="tr-supl"/>`;
      if (nt.passo >= 14) extra += `<line x1="${x - 11}" y1="0" x2="${x + 11}" y2="0" class="tr-supl"/>`;
      if (nt.passo >= 12) extra += `<line x1="${x - 11}" y1="10" x2="${x + 11}" y2="10" class="tr-supl"/>`;
      if (nt.passo >= 10) extra += `<line x1="${x - 11}" y1="20" x2="${x + 11}" y2="20" class="tr-supl"/>`;
      if (t < 4) extra += `<line x1="${hx}" y1="${y + (baixo ? 1.5 : -1.5)}" x2="${hx}" y2="${yb}" class="haste"/>`;
      if (COMPOSTO ? (Math.abs(t - 1) < 0.01 || Math.abs(t - 2) < 0.01) : (t === 3 || t === 1.5 || t === 0.75)) extra += `<circle cx="${x + 11}" cy="${nt.passo % 2 === 0 ? y - 3 : y}" r="1.8" class="ponto"/>`;
      if (t < (COMPOSTO ? 0.5 : 1) && !grupo) { const f = (dy) => `<path class="bandeira" d="M${hx} ${yb + dy} q9 ${baixo ? -6 : 6} 6 ${baixo ? -16 : 16}"/>`; extra += f(0) + (semi(t) ? f(baixo ? -7 : 7) : ""); }
      if (tem(item, "st")) extra += `<circle cx="${x}" cy="${baixo ? y - 9 : y + 9}" r="1.9" class="ponto"/>`;
      if (tem(item, "ac")) extra += `<path class="tr-acento" d="M${x - 5} ${(baixo ? y - 15 : Math.min(yb, 30) - 9) - 3.5}l10 3.5-10 3.5"/>`;
      // Acidente: com armadura, só aparece quando a nota foge do tom (e o bequadro aparece sozinho).
      const acNota = nt.ac === "n" ? null : nt.ac || null, acTom = ARM ? ARM.alt[((nt.passo % 7) + 7) % 7] || null : null;
      const mostra = ARM ? (acNota === acTom ? null : acNota || "n") : nt.ac;
      if (mostra) extra += `<text x="${x - 16}" y="${y + 4}" class="tr-ac">${SIMBOLO[mostra]}</text>`;
      // Apojatura: notinha cortada antes da nota principal.
      const ap = typeof item[2] === "string" && (item[2].match(/ap=(\w+)/) || [])[1];
      if (ap && NOTA[ap]) { const ay = 70 - NOTA[ap].passo * 5, ax = x - 15; extra += `<g class="tr-apoj"><ellipse cx="${ax}" cy="${ay}" rx="4" ry="2.9" transform="rotate(-20 ${ax} ${ay})"/><line x1="${ax + 3.6}" y1="${ay - 1}" x2="${ax + 3.6}" y2="${ay - 19}"/><path d="M${ax + 3.6} ${ay - 19}q6 4 4 10"/><line x1="${ax - 2}" y1="${ay - 8}" x2="${ax + 9}" y2="${ay - 15}"/></g>`; }
      if (tem(item, "tr")) extra += `<text x="${x}" y="${Math.min(baixo ? y - 12 : yb - 6, 22)}" text-anchor="middle" class="tr-trinado">tr</text>`;
      if (liga && itens[i + 1] && itens[i + 1][0] !== P) { const x2 = pos[i + 1].x, y2 = pos[i + 1].y, d = baixo ? -9 : 9; arcos += `<path class="tr-liga" d="M${x + 3} ${y + d} Q${(x + x2) / 2} ${(y + y2) / 2 + d * 2.2} ${x2 - 3} ${y2 + d}"/>`; }
      corpo += `<g class="${cls}"><ellipse cx="${x}" cy="${y}" rx="6.6" ry="4.7" transform="rotate(-20 ${x} ${y})" ${cheio ? "" : 'fill="none" stroke-width="2"'} class="${cheio ? "cab cheia" : "cab oca"}"/>${extra}${rotulos ? `<text x="${x}" y="104" text-anchor="middle" class="tr-rot">${nt.nome}</text>` : ""}</g>` + barra(i);
    });
    // Dinâmica: letras (p, mf, f) e forquilhas de crescendo e diminuendo, abaixo da pauta.
    const yd = 100;
    (din || []).forEach(([i, txt]) => { if (pos[i]) marcas += `<text x="${pos[i].x - 4}" y="${yd + 5}" class="tr-din">${txt}</text>`; });
    (forq || []).forEach(([de, ate, tipo]) => { if (!pos[de] || !pos[ate]) return; const x1 = pos[de].x + (din && din.some(d => d[0] === de) ? 14 : -4), x2 = pos[ate].x + (de === ate ? 110 : 8); marcas += tipo === "cresc" ? `<path class="tr-forq" d="M${x2} ${yd - 5}L${x1} ${yd}L${x2} ${yd + 5}"/>` : `<path class="tr-forq" d="M${x1} ${yd - 5}L${x2} ${yd}L${x1} ${yd + 5}"/>`; });
    const armadura = ARM ? ARM.des.map(([ac, ps], k) => `<text x="${50 + k * 10}" y="${70 - ps * 5 + 4.5}" text-anchor="middle" class="tr-ac">${SIMBOLO[ac]}</text>`).join("") : "";
    const fx = 57 + nArm * 10, numeros = armadura + (formula ? `<text x="${fx}" y="49" text-anchor="middle" class="tr-formula">${COMPOSTO ? formula * 3 : formula}</text><text x="${fx}" y="69" text-anchor="middle" class="tr-formula">${COMPOSTO ? 8 : 4}</text>` : "");
    const topo = itens.some(([n]) => n !== P && NOTA[n].passo >= 12) ? -18 : -4;
    const linhas = [30, 40, 50, 60, 70].map(y => `<line x1="6" y1="${y}" x2="${larg - 6}" y2="${y}"/>`).join("");
    return `<svg class="tr-pauta" viewBox="0 ${topo} ${larg} ${(rotulos ? 114 : 104) + (temDin ? 10 : 0) - 4 - topo}" role="img" aria-label="Pauta musical"><g class="tr-linhas">${linhas}<line x1="${larg - 6}" y1="30" x2="${larg - 6}" y2="70"/></g><path class="tr-clave" transform="translate(12 13.5) scale(1.42)" d="${CLAVE}"/>${numeros}${arcos}${traves}${corpo}${marcas}</svg>`;
  }

  // Melodia longa: quebra em linhas, sempre numa barra de compasso, para as notas ficarem legíveis.
  function svgMelodia(mel, destaque = -1) {
    const linhas = []; let atual = [], tempos = 0, total = 0, base = 0;
    // Muitas notas por compasso (semicolcheias): um compasso por linha. Senão, dois.
    const porLinha = mel.length / (mel.reduce((x, [, d]) => x + d, 0) / COMP) > 5.5 ? COMP : COMP * 2;
    mel.forEach((it, i) => {
      atual.push(it); tempos = q(tempos + it[1]); total = q(total + it[1]);
      if ((total % COMP === 0 && tempos >= porLinha) || i === mel.length - 1) { linhas.push({ itens: atual, base }); base = i + 1; atual = []; tempos = 0; }
    });
    const minLarg = Math.max(...linhas.map(l => largPauta(l.itens)));
    const local = (lista, l, pares) => (lista || []).filter(m => m[0] >= l.base && m[pares ? 1 : 0] < l.base + l.itens.length).map(m => (pares ? [m[0] - l.base, m[1] - l.base, m[2]] : [m[0] - l.base, m[1]]));
    return linhas.map((l, k) => svgPauta(l.itens, { compassos: true, minLarg, formula: k === 0 ? FORMULA : 0, din: local(MARCAS.din, l, false), forq: local(MARCAS.forq, l, true), destaque: destaque >= l.base && destaque < l.base + l.itens.length ? destaque - l.base : destaque >= l.base + l.itens.length ? 99 : -1 })).join("");
  }

  // Saxofone desenhado (o mesmo traço da marca), com as chaves fechadas acesas.
  function svgSax(n) {
    const nt = NOTA[n];
    return `<svg class="tr-sax-des" viewBox="0 0 150 250" aria-hidden="true"><g transform="translate(8 6) scale(2.55)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g class="corpo" stroke-width="9"><path d="M8 8 L16 12 C22 15 24 19 24 25 L24 66 C24 88 46 88 46 66 L46 56"/><path d="M39 54 Q46 59 52 50"/></g><path class="brilho" stroke-width="1.6" d="M21.4 26 L21.4 66"/></g><rect class="boquilha" x="14" y="14" width="26" height="12" rx="5" transform="rotate(27 27 20)"/><circle cx="52" cy="62" r="6" class="${nt.oitava ? "chave fechada" : "chave"}"/>${nt.oitava ? `<text x="42" y="65" text-anchor="end" class="mao">oitava</text>` : ""}${nt.chaves.map((f, i) => `<circle cx="69.2" cy="${80 + i * 17.5 + (i > 2 ? 9 : 0)}" r="7.4" class="${f ? "chave fechada" : "chave"}"/>`).join("")}${(nt.extra || "").includes("lateral") ? `<rect x="84" y="96" width="9" height="20" rx="4" class="chave fechada"/><text x="97" y="109" class="mao">lateral</text>` : ""}${nt.extra === "mindinho" ? `<rect x="78" y="150" width="20" height="9" rx="4" class="chave fechada"/><text x="100" y="158" class="mao">mindinho</text>` : ""}${nt.extra === "mindinho-esq" ? `<rect x="80" y="118" width="20" height="9" rx="4" class="chave fechada"/><text x="103" y="126" class="mao">mindinho esq.</text><rect x="78" y="150" width="20" height="9" rx="4" class="chave fechada"/>` : ""}${(nt.extra || "").includes("palma") ? `<ellipse cx="50" cy="84" rx="5" ry="8" class="chave fechada"/><text x="42" y="88" text-anchor="end" class="mao">palma</text>` : ""}</svg>`;
  }
  function svgDedos(notas) {
    return `<div class="tr-dedos">${notas.map(n => `<figure>${svgSax(n)}<figcaption><strong>${NOTA[n].nome}</strong>${NOTA[n].dica}</figcaption></figure>`).join("")}</div>`;
  }

  function htmlFiguras() {
    const fig = (nome, t, n) => `<li>${svgPauta([[n, t]])}<span><strong>${nome}</strong>${t} ${t === 1 ? "tempo" : "tempos"}</span></li>`;
    return `<ul class="tr-figuras">${fig("Semibreve", 4, "sol")}${fig("Mínima", 2, "sol")}${fig("Semínima", 1, "sol")}</ul>`;
  }

  // ---------- Áudio ----------
  let ctx = null;
  function audio() {
    if (!mic.stream && window.NaipeMic) window.NaipeMic.sessao("playback"); // toca mesmo com o iPhone no silencioso
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function clique(quando, forte) {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = forte ? 1320 : 880; o.type = "square";
    g.gain.setValueAtTime(0.0001, quando); g.gain.exponentialRampToValueAtTime(forte ? 0.22 : 0.14, quando + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.07);
    o.connect(g).connect(a.destination); o.start(quando); o.stop(quando + 0.09);
  }
  function somRetorno(ok) {
    const a = audio(), t = a.currentTime + 0.01;
    (ok ? [[660, 0], [990, 0.09]] : [[196, 0]]).forEach(([f, d]) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = ok ? "sine" : "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.16, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + (ok ? 0.16 : 0.22));
      o.connect(g).connect(a.destination); o.start(t + d); o.stop(t + d + 0.25);
    });
  }
  // Som real que o sax produz para a nota escrita (alto: 9 semitons abaixo; tenor: 14 abaixo).
  // Alto e barítono: 9 semitons abaixo do escrito. Tenor e soprano: 2 abaixo (região do soprano, mais clara no celular).
  const somReal = midi => midi - (saxDoApp() === "Sib" ? 2 : 9);
  let onda = null;
  // Timbre de palheta: harmônicos fortes, ataque suave e um leve vibrato. Soa claro até em alto-falante pequeno.
  function tom(midi, quando, dur, ganho = 1, vibrato = 0.004) {
    const a = audio();
    if (!onda) { const re = new Float32Array([0, 1, 0.72, 0.55, 0.42, 0.3, 0.22, 0.16, 0.1, 0.07, 0.05]), im = new Float32Array(re.length); onda = a.createPeriodicWave(re, im); }
    const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(), vib = a.createOscillator(), vg = a.createGain();
    const freq = 440 * Math.pow(2, (somReal(midi) - 69) / 12);
    o.setPeriodicWave(onda); o.frequency.value = freq;
    f.type = "lowpass"; f.frequency.value = 3400; f.Q.value = 0.7;
    vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, quando); vg.gain.linearRampToValueAtTime(freq * vibrato, quando + Math.min(vibrato > 0.004 ? 0.9 : 0.5, dur));
    vib.connect(vg).connect(o.frequency);
    const fim = Math.max(quando + 0.08, quando + dur);
    g.gain.setValueAtTime(0.0001, quando); g.gain.exponentialRampToValueAtTime(0.34 * ganho, quando + 0.035); g.gain.setValueAtTime(0.3 * ganho, Math.max(quando + 0.04, fim - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, fim);
    o.connect(f).connect(g).connect(a.destination);
    o.start(quando); vib.start(quando); o.stop(fim + 0.03); vib.stop(fim + 0.03);
  }

  // ---------- Pulso (metrônomo das lições) ----------
  const bpmAtual = () => Math.min(208, Math.max(40, Number(prog.bpm) || 60));
  const pulso = { t: 0, prox: 0, n: 0 };
  function pararPulso() { clearInterval(pulso.t); pulso.t = 0; const b = $("#tr-pulso-liga"); if (b) { b.textContent = "▶ Ouvir o pulso"; b.classList.remove("ativo"); } }
  function ligarPulso() {
    const a = audio(); pulso.prox = a.currentTime + 0.12; pulso.n = 0;
    pulso.t = setInterval(() => {
      const bt = 60 / bpmAtual();
      while (pulso.prox < a.currentTime + 0.25) {
        clique(pulso.prox, pulso.n % COMP === 0);
        const n = pulso.n, espera = Math.max(0, (pulso.prox - a.currentTime) * 1000);
        setTimeout(() => { const l = $("#tr-pulso-luz"); if (l && pulso.t) { l.textContent = (n % COMP) + 1; l.classList.add("bate"); setTimeout(() => l.classList.remove("bate"), 110); } }, espera);
        pulso.prox += bt; pulso.n++;
      }
    }, 40);
    const b = $("#tr-pulso-liga"); if (b) { b.textContent = "■ Parar o pulso"; b.classList.add("ativo"); }
  }
  // Barra do pulso: escolher o andamento e, se "liga", ouvir o clique enquanto lê ou toca.
  const htmlPulso = (liga = true) => `${SWING ? `<p class="tr-swing">♪ Colcheias com swing: a primeira longa, a segunda curta</p>` : ""}<div class="tr-pulso"><span class="tr-pulso-luz" id="tr-pulso-luz">♩</span><span class="tr-pulso-bpm"><button type="button" id="tr-bpm-menos" aria-label="Mais lento">−</button><strong id="tr-bpm">${bpmAtual()}</strong><small>por minuto</small><button type="button" id="tr-bpm-mais" aria-label="Mais rápido">+</button></span>${liga ? `<button type="button" class="tr-pulso-liga" id="tr-pulso-liga">▶ Ouvir o pulso</button>` : `<small class="tr-pulso-nota">andamento da contagem</small>`}</div>`;
  function ativarPulso() {
    if (!$("#tr-bpm")) return;
    const muda = d => { prog.bpm = Math.min(208, Math.max(40, bpmAtual() + d)); salvar(); $("#tr-bpm").textContent = prog.bpm; };
    $("#tr-bpm-menos").addEventListener("click", () => muda(-4));
    $("#tr-bpm-mais").addEventListener("click", () => muda(4));
    const b = $("#tr-pulso-liga"); if (b) b.addEventListener("click", () => (pulso.t ? pararPulso() : ligarPulso()));
  }

  // ---------- Microfone ----------
  const mic = { stream: null, an: null, buf: null, raf: 0, ctx: null, erro: null };
  function detectar(buf, sr) {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / buf.length) < 0.012) return -1;
    const n = buf.length, c = new Float32Array(n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) c[i] += buf[j] * buf[j + i];
    let d = 0; while (d < n - 1 && c[d] > c[d + 1]) d++;
    let max = -1, pos = -1;
    for (let i = d; i < n; i++) if (c[i] > max) { max = c[i]; pos = i; }
    if (pos <= 0) return -1;
    const x1 = c[pos - 1], x2 = c[pos], x3 = c[pos + 1] || x2, a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    return sr / (a ? pos - b / (2 * a) : pos);
  }
  async function ligarMic() {
    if (mic.stream && mic.an) return true;
    mic.erro = null;
    try {
      mic.stream = await window.NaipeMic.abrir();
      const r = await window.NaipeMic.analisador(mic.stream, audio(), 2048);
      mic.an = r.an; mic.ctx = r.ctx; mic.proprio = !!r.proprio; mic.buf = new Float32Array(2048);
      return true;
    } catch (err) {
      mic.erro = err; desligarMic(); return false;
    }
  }
  function desligarMic() {
    cancelAnimationFrame(mic.raf);
    if (mic.stream) mic.stream.getTracks().forEach(t => t.stop());
    if (mic.proprio && mic.ctx) mic.ctx.close().catch(() => {});
    mic.stream = mic.an = mic.ctx = null; mic.proprio = false;
  }
  // Classe da nota ouvida, já convertida para a nota ESCRITA do sax (0 = Dó … 11 = Si), ou -1.
  function notaOuvida() {
    if (!mic.an) return -1;
    mic.an.getFloatTimeDomainData(mic.buf);
    const f = detectar(mic.buf, (mic.ctx || ctx).sampleRate);
    if (!(f > 60 && f < 1600)) return -1;
    const real = Math.round(69 + 12 * Math.log2(f / 440));
    return (((real + (saxDoApp() === "Sib" ? 2 : 9)) % 12) + 12) % 12;
  }

  // ---------- Telas ----------
  let sessao = null; // { licao, i, erros }
  const temporizadores = [];
  function limpar() {
    pararPulso();
    pararRec(); urls.splice(0).forEach(u => URL.revokeObjectURL(u));
    temporizadores.splice(0).forEach(clearTimeout);
    desligarMic();
    if (ctx && ctx.state === "running") ctx.suspend();
  }

  const completo = () => { if (LIVRE) return true; try { return !!JSON.parse(localStorage.getItem("cma.v1") || "{}").desbloqueado; } catch { return false; } };

  const ARTE = [
    '<svg viewBox="0 0 120 70" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M14 35h14"/><path d="M40 22q10 13 0 26"/><path d="M54 14q16 21 0 42"/><path d="M68 6q22 29 0 58"/></g><circle cx="98" cy="35" r="7" fill="currentColor"/></svg>',
    '<svg viewBox="0 0 120 70" aria-hidden="true"><g stroke="currentColor" stroke-width="1.6" opacity=".55"><path d="M6 15h108M6 25h108M6 35h108M6 45h108M6 55h108"/></g><g fill="currentColor"><ellipse cx="20" cy="60" rx="6" ry="4.4"/><ellipse cx="34" cy="55" rx="6" ry="4.4"/><ellipse cx="48" cy="50" rx="6" ry="4.4"/><ellipse cx="62" cy="45" rx="6" ry="4.4"/><ellipse cx="76" cy="40" rx="6" ry="4.4"/><ellipse cx="90" cy="35" rx="6" ry="4.4"/><ellipse cx="104" cy="30" rx="6" ry="4.4"/></g></svg>',
  ];
  const CORES = [["#5b8def", "#2b4a8f"], ["#3fbf8f", "#1d6b4f"], ["#ee8a45", "#9a4a15"], ["#a678f0", "#5a3a9a"], ["#ef5f8a", "#962c50"], ["#2bb3c4", "#136572"], ["#d9a547", "#8a5f1e"], ["#5b8def", "#2b4a8f"], ["#3fbf8f", "#1d6b4f"], ["#ee8a45", "#9a4a15"], ["#a678f0", "#5a3a9a"]];
  const DESVIO = [8, 44, 64, 44, 8, 28];

  function htmlCaminho(u, n, atual, paga) {
    const passo = 92, pts = u.licoes.map((l, k) => [DESVIO[k % DESVIO.length] + 30, 46 + k * passo]);
    const curva = pts.map((pt, k) => k === 0 ? `M${pt[0]} ${pt[1]}` : `C${pts[k - 1][0]} ${pts[k - 1][1] + passo / 2} ${pt[0]} ${pt[1] - passo / 2} ${pt[0]} ${pt[1]}`).join(" ");
    return `<ol class="tr-caminho" style="height:${u.licoes.length * passo}px"><svg class="tr-fio" viewBox="0 0 120 ${u.licoes.length * passo}" preserveAspectRatio="none" aria-hidden="true"><path d="${curva}"/></svg>${u.licoes.map((l, k) => {
      const i = LICOES.indexOf(l), feita = !!prog.feitas[l.id], aberta = ABERTO || (!paga && (feita || i === atual || atual === -1)), ehAtual = aberta && !feita && (!ABERTO || i === atual);
      const miolo = `<span class="tr-no" style="left:${DESVIO[k % DESVIO.length]}px">${feita ? "✓" : ehAtual ? "▶" : paga ? "★" : u.pilar || u.plano ? k + 1 : i + 1}</span><span class="tr-lic-txt"><strong>${esc(l.titulo)}</strong><small>${esc(l.resumo)}</small>${ehAtual ? `<em>Começar</em>` : ""}</span>`;
      return `<li class="${feita ? "feita" : ehAtual ? "atual" : aberta ? "livre" : "fechada"}" style="top:${k * passo}px">${aberta ? `<a href="#/trilha/${l.id}">${miolo}</a>` : `<div>${miolo}</div>`}</li>`;
    }).join("")}</ol>`;
  }

  // Teoria (#/trilha) reúne as 16 unidades de leitura; Estudo (#/estudo) reúne o plano de estudos.
  const ehPlano = licao => !!(licao && licao.sessao);
  const baseDe = licao => (ehPlano(licao) ? "#/estudo" : "#/trilha");
  const abaDe = id => { if (!id) return null; const m = /^marco-(\d+)$/.exec(id); if (m) return UNIDADES[Number(m[1])] && UNIDADES[Number(m[1])].plano ? "estudo" : "trilha"; return ehPlano(LICOES.find(l => l.id === id)) ? "estudo" : "trilha"; };

  function renderTrilha(modo = "teoria") {
    const estudo = modo === "estudo";
    if (!prog.porqueVisto && !REVISAR && !estudo) return renderPorque();
    limpar(); sessao = null;
    const primeiraAberta = lista => { const l = lista.find(x => !prog.feitas[x.id]); return l ? LICOES.indexOf(l) : -1; };
    const atual = primeiraAberta(PRINCIPAIS);
    const htmlUn = UNIDADES.map((u, n) => {
      if (u.pilar || !!u.plano !== estudo) return "";
      const feitas = u.licoes.filter(l => prog.feitas[l.id]).length;
      const paga = !ABERTO && n > 0 && !completo(), cor = CORES[n % CORES.length];
      const unAtual = atual < 0 ? -1 : UNIDADES.findIndex(x => x.licoes.includes(LICOES[atual]));
      const livreParaQuemToca = u.plano && prog.perfil === "toca";
      const completa = unidadeCompleta(n), futura = !ABERTO && unAtual >= 0 && n > unAtual && !(livreParaQuemToca && (n === UNIDADES.indexOf(UNIDADES_PLANO[0]) || unidadeCompleta(n - 1)));
      const primeiraDoPlano = n === UNIDADES.indexOf(UNIDADES_PLANO[0]);
      const estado = completa ? "Completa · toque para rever" : futura ? (u.plano ? (primeiraDoPlano ? "Abre ao concluir a Teoria" : "Abre ao concluir a semana anterior") : `Abre ao concluir a Unidade ${n}`) : `${feitas} de ${u.licoes.length} ${u.plano ? "sessões" : "lições"}`;
      const faixa = `<div class="tr-faixa"><div><span class="rotulo">${u.plano ? `Mês ${Math.floor(UNIDADES_PLANO.indexOf(u) / 4) + 1}` : `Unidade ${n + 1}${n === 0 && !LIVRE ? " · gratuita" : ""}`}</span><h2>${esc(u.titulo)}</h2><span class="tr-conta">${futura ? "🔒 " : completa ? "✓ " : ""}${estado}</span></div><span class="tr-arte">${ARTE[n % ARTE.length]}</span><div class="tr-barra-prog"><span style="width:${Math.round(feitas / u.licoes.length * 100)}%"></span></div>${futura ? "" : `<span class="tr-seta" aria-hidden="true">⌄</span>`}</div>`;
      if (futura) return `<section class="tr-unidade trancada" style="--u1:${cor[0]};--u2:${cor[1]}">${faixa}</section>`;
      return `<details class="tr-unidade${completa ? " completa" : ""}" style="--u1:${cor[0]};--u2:${cor[1]}">
          <summary>${faixa}</summary>
          ${paga ? `<p class="mudo tr-paga">Esta unidade faz parte do Naipe completo. A Unidade 1 é livre para você experimentar.</p>` : ""}
          ${u.plano && u.texto ? `<p class="mudo tr-semana-txt">${esc(u.texto)}</p>` : ""}
          ${htmlCaminho(u, n, livreParaQuemToca ? primeiraAberta(u.licoes) : atual, paga)}
          ${completa ? `<a class="btn tr-ver-marco" href="#/trilha/marco-${n}">Meu marco ${u.plano ? "desta semana" : "desta unidade"}</a>` : ""}
        </details>`;
    });
    const unidades = htmlUn.join("");
    const modoTxt = REVISAR ? " · modo de revisão do professor" : "";
    if (estudo) {
      const pl = estadoPlano(), teoriaFeita = PRINCIPAIS.filter(l => !l.sessao).every(l => prog.feitas[l.id]), bloqueado = !ABERTO && prog.perfil !== "toca" && !teoriaFeita;
      raiz().innerHTML = `
      <header class="cabecalho">
        <p class="sobretitulo">Estudo${modoTxt}</p>
        <h1>Plano de estudos</h1>
        <p class="mudo">Três módulos de três meses, com sessões de 30 a 45 minutos e os métodos da biblioteca. Em cada bloco você conta como foi, e o professor virtual ajusta o próximo passo: o exercício e o andamento. Toque num módulo para abrir as semanas.</p>
      </header>
      <div class="corpo tr-corpo">
        ${bloqueado ? `<section class="cartao tr-porque"><span class="rotulo">Quando começar</span><p class="mudo">O plano abre quando você conclui a Teoria. Se você já lê partitura e toca, pode começar agora.</p><button class="btn" id="tr-ja-toco" type="button">Já toco, quero começar o plano</button></section>` : pl.n ? `<section class="cartao tr-porque"><span class="rotulo">Meu plano</span><p class="mudo"><strong>${pl.n}</strong> ${pl.n === 1 ? "sessão feita" : "sessões feitas"}. O tempo de cada sessão fica no seu Diário.</p></section>` : ""}
        ${MODULOS.map((md, k) => {
          const us = UNIDADES_PLANO.slice(md.de, md.ate), lics = us.flatMap(u => u.licoes), feitas = lics.filter(l => prog.feitas[l.id]).length;
          const trancado = /tr-unidade trancada/.test(htmlUn[UNIDADES.indexOf(us[0])]), completo = feitas === lics.length;
          const minMod = minutosModulo(md);
          const estado = (completo ? "✓ Completo" : trancado ? `🔒 Abre ao concluir ${k ? `o ${MODULOS[k - 1].nome}` : "a Teoria"}` : `${feitas} de ${lics.length} sessões`) + (minMod ? ` · ${horasTxt(minMod)} praticadas` : "");
          return `<details class="tr-modulo${trancado ? " fechado" : ""}"><summary><span class="tr-mod-txt"><span class="rotulo">${md.periodo}</span><strong>${md.nome}</strong><small>${estado}</small></span><span class="tr-mod-prog" style="--p:${Math.round(feitas / lics.length * 100)}%"></span><span class="tr-seta" aria-hidden="true">⌄</span></summary><p class="mudo tr-mod-desc">${esc(md.texto)}</p>${us.map(u => htmlUn[UNIDADES.indexOf(u)]).join("")}</details>`;
        }).join("")}
        ${htmlRepertorio()}
      </div>`;
      ligarRepertorio();
      const jt = $("#tr-ja-toco"); if (jt) jt.addEventListener("click", () => { prog.perfil = "toca"; salvar(); renderTrilha("estudo"); });
      return;
    }
    raiz().innerHTML = `
      <header class="cabecalho">
        <p class="sobretitulo">Teoria${modoTxt}</p>
        <h1>Do zero à formatura</h1>
        <p class="mudo">Lições de 3 a 5 minutos. Você lê, bate o ritmo, ouve e toca. O Naipe escuta o seu sax.</p>
      </header>
      <div class="corpo tr-corpo">
        <section class="cartao tr-porque">${prog.porque || prog.sonho ? `<span class="rotulo">Meu porquê</span>${prog.porque ? `<p class="tr-porque-txt">${esc(prog.porque)}</p>` : ""}${prog.sonho ? `<p class="mudo">Música-sonho: <strong>${esc(prog.sonho)}</strong> · ${PRINCIPAIS.filter(l => !l.sessao && prog.feitas[l.id]).length} de ${PRINCIPAIS.filter(l => !l.sessao).length} lições já feitas no caminho até ela</p>` : ""}` : `<span class="rotulo">Meu porquê</span><p class="mudo">Diga por que você quer tocar e qual música sonha em tocar.</p>`}<button class="link-acao" id="tr-editar-porque" type="button">${prog.porque || prog.sonho ? "Editar" : "Escrever"}</button></section>
        ${unidades}
        <div id="tr-antes"></div>
        <section class="cartao tr-proximas"><span class="rotulo">Depois da Teoria</span><p class="mudo">Ao concluir as 16 unidades, siga para a aba Estudo: um plano de estudos com os métodos, guiado pelo professor virtual.</p><a class="link-acao" href="#/estudo">Ver o plano de estudos</a></section>
        ${prog.pontos ? `<p class="mudo tr-pontos">${prog.pontos} pontos de estudo nesta trilha</p>` : ""}
      </div>`;
    $("#tr-editar-porque").addEventListener("click", renderPorque);
    htmlAntesDepois().then(h => { const el = $("#tr-antes"); if (el) el.innerHTML = h; });
  }

  // ---------- Ponte com a Biblioteca de métodos ----------
  // Em que trilhos e módulos do plano cada livro aparece.
  function usosDoLivro(id) {
    const out = [];
    for (const [tid, tr] of Object.entries(TRILHOS)) {
      const itens = tr.itens.filter(it => it[0] === id);
      if (!itens.length) continue;
      const mods = MODULOS.filter(md => SEMANAS.slice(md.de, md.ate).some(sem => sem.sessoes.some(b => b.some(([t]) => t === tid)))).map(md => md.nome);
      out.push({ trilho: tid, nome: tr.nome, modulos: mods, itens: itens.map(it => ({ onde: it[1], oque: it[2] })) });
    }
    return out;
  }
  // Ficha do método aberta por cima da sessão, sem perder o progresso.
  function abrirFicha(id, podeSair) {
    const l = livroInfo(id), url = urlPdf(id), usos = usosDoLivro(id);
    let d = document.getElementById("tr-ficha");
    if (!d) { d = document.createElement("dialog"); d.id = "tr-ficha"; d.className = "tr-ficha"; document.body.appendChild(d); d.addEventListener("click", ev => { if (ev.target === d || ev.target.closest("[data-fechar]") || ev.target.closest('a[href^="#"]')) d.close(); }); window.addEventListener("hashchange", () => { if (d.open) d.close(); }); }
    d.innerHTML = `<div class="tr-ficha-corpo"><div class="tr-ficha-topo"><span class="rotulo">${esc(l.autor || "Material de apoio")}</span><button class="link-acao" type="button" data-fechar>Fechar</button></div>
      <h2>${esc(l.titulo)}</h2>${l.nota ? `<p class="mudo">${esc(l.nota)}</p>` : ""}
      ${url ? `<a class="btn primario largo" href="${esc(url)}" target="_blank" rel="noopener">Abrir o PDF</a>` : ""}
      ${usos.length ? `<p class="tr-hoje-titulo">No seu plano de estudos</p><ul class="tr-ficha-usos">${usos.map(u => `<li><strong>${esc(u.nome)}</strong><small>${esc(u.modulos.join(", "))}</small><span>${u.itens.map(i => esc(i.onde)).join(" · ")}</span></li>`).join("")}</ul>` : ""}
      ${podeSair ? `<a class="btn largo" href="#/metodo/${encodeURIComponent(id)}">Ver na Biblioteca de métodos</a>` : `<p class="mudo">A página completa do método fica na Biblioteca de métodos, em Pilares. Abra depois da sessão para não perder os blocos já avaliados.</p>`}
    </div>`;
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function ligarFichas(podeSair) {
    raiz().querySelectorAll("[data-ficha]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); abrirFicha(b.dataset.ficha, podeSair); }));
  }

  // Repertório essencial: as músicas que todo saxofonista toca, com partitura e playback do acervo.
  const NIVEIS = { 1: "Primeiras músicas", 2: "Intermediário", 3: "Desafio" };
  function htmlRepertorio() {
    if (!REP.musicas.length) return "";
    const meu = prog.rep || {}, total = REP.musicas.length, tenho = REP.musicas.filter(m => meu[m.id]).length;
    return `<details class="tr-modulo tr-repertorio"><summary><span class="tr-mod-txt"><span class="rotulo">Para a vida toda</span><strong>Repertório essencial</strong><small id="tr-rep-conta">${tenho} de ${total} músicas no meu repertório</small></span><span class="tr-mod-prog" style="--p:${Math.round(tenho / total * 100)}%"></span><span class="tr-seta" aria-hidden="true">⌄</span></summary>
      <p class="mudo tr-mod-desc">As músicas que todo saxofonista toca, da bossa nova ao jazz, do choro ao pop. Cada uma abre a partitura do acervo, e muitas têm playback para tocar junto. Quando uma música estiver pronta, marque “Já toco”.</p>
      <p class="mudo tr-mod-desc">Como estudar: ouça a gravação, cante a melodia, divida em frases de quatro compassos e só então toque com o playback. O guia do Wave mostra o passo a passo.</p>
      ${REP.estilos.map(e => { const ms = REP.musicas.filter(m => m.estilo === e.id).sort((a, b) => a.nivel - b.nivel); return `<details class="tr-rep-estilo"><summary><strong>${esc(e.nome)}</strong><small>${ms.filter(m => meu[m.id]).length} de ${ms.length}</small><span class="tr-seta" aria-hidden="true">⌄</span></summary><p class="mudo">${esc(e.texto)}</p><ul class="tr-rep-lista">${ms.map(m => `<li class="${meu[m.id] ? "tenho" : ""}"><div class="tr-rep-cab"><span><strong>${esc(m.titulo)}</strong><small>${esc(m.autor)}</small></span><span class="tr-rep-nivel n${m.nivel}">${NIVEIS[m.nivel]}</span></div>${fonteTxt(m) ? `<p class="tr-rep-fonte">${esc(fonteTxt(m))}</p>` : ""}${linksMusica(m)}<button type="button" class="tr-rep-tenho" data-rep="${esc(m.id)}" aria-pressed="${!!meu[m.id]}">${meu[m.id] ? "✓ Já toco" : "Já toco"}</button></li>`).join("")}</ul></details>`; }).join("")}
    </details>`;
  }
  function ligarRepertorio() {
    raiz().querySelectorAll(".tr-rep-tenho").forEach(b => b.addEventListener("click", () => {
      prog.rep = prog.rep || {}; const id = b.dataset.rep, sim = !prog.rep[id];
      if (sim) prog.rep[id] = new Date().toISOString().slice(0, 10); else delete prog.rep[id];
      salvar();
      b.textContent = sim ? "✓ Já toco" : "Já toco"; b.setAttribute("aria-pressed", String(sim)); b.closest("li").classList.toggle("tenho", sim);
      const det = b.closest(".tr-rep-estilo"), lis = [...det.querySelectorAll("li")]; det.querySelector("summary small").textContent = `${lis.filter(x => x.classList.contains("tenho")).length} de ${lis.length}`;
      const tenho = REP.musicas.filter(m => prog.rep[m.id]).length, c = $("#tr-rep-conta"); if (c) c.textContent = `${tenho} de ${REP.musicas.length} músicas no meu repertório`;
      const pg = c && c.closest("summary").querySelector(".tr-mod-prog"); if (pg) pg.style.setProperty("--p", `${Math.round(tenho / REP.musicas.length * 100)}%`);
    }));
  }

  // Cartão no Início (com as abas Teoria e Estudo): pergunta de entrada e "continuar a lição".
  function cartaoInicio() {
    if (!BETA) return;
    const pai = document.querySelector(".conteudo-inicio"); if (!pai) return;
    let el = document.getElementById("tr-inicio");
    if (!el) { el = document.createElement("div"); el.id = "tr-inicio"; const ref = pai.querySelector(".percurso-cartao"); pai.insertBefore(el, ref || pai.firstChild); }
    const lista = prog.perfil === "toca" ? PLANO_LICOES : PRINCIPAIS, prox = lista.find(l => !prog.feitas[l.id]);
    if (!prog.perfil) {
      el.innerHTML = `<section class="cartao tr-entrada"><span class="rotulo">Para começar</span><h2>Você já toca saxofone?</h2><div class="tr-entrada-ops"><button type="button" data-perfil="zero"><strong>Estou começando do zero</strong><small>Aprender a ler e tocar, passo a passo</small></button><button type="button" data-perfil="toca"><strong>Já toco</strong><small>Seguir um plano de estudos com os métodos</small></button></div></section>`;
      el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { prog.perfil = b.dataset.perfil; salvar(); location.hash = prog.perfil === "zero" ? "#/trilha" : "#/estudo"; }));
    } else if (prox && (prog.perfil === "zero" || prog.perfil === "toca" || Object.keys(prog.feitas).length)) {
      const i = LICOES.indexOf(prox), n = UNIDADES.findIndex(u => u.licoes.includes(prox)), paga = n > 0 && !completo();
      el.innerHTML = paga ? "" : `<a class="cartao tr-continuar" href="#/trilha/${prox.id}"><span class="tr-no">▶</span><span class="tr-lic-txt"><span class="rotulo">${prox.sessao ? `Estudo · Semana ${prox.sessao.semana + 1}` : `Teoria · lição ${i + 1} de ${PRINCIPAIS.length - PLANO_LICOES.length}`}</span><strong>${esc(prox.titulo)}</strong><small>${esc(prox.resumo)}</small></span></a>`;
    } else el.innerHTML = "";
  }

  function renderLicao(id) {
    const m = /^marco-(\d+)$/.exec(id);
    if (m) return renderMarco(Number(m[1]));
    const licao = LICOES.find(l => l.id === id);
    if (!licao) return renderTrilha();
    if (!ABERTO && UNIDADES.findIndex(u => u.licoes.includes(licao)) > 0 && !completo()) { location.hash = baseDe(licao); return; }
    limpar();
    sessao = { licao, i: 0, erros: 0 };
    if (licao.sessao) gerarSessao(licao);
    passo();
  }

  function moldura(miolo, { botao = "Continuar", pronto = true } = {}) {
    const { licao, i } = sessao;
    raiz().innerHTML = `
      <div class="tr-licao">
        <div class="tr-topo"><a class="tr-fechar" href="${baseDe(licao)}" aria-label="Sair da lição">✕</a><div class="tr-barra-prog"><span style="width:${Math.round(i / licao.passos.length * 100)}%"></span></div><span class="tr-conta">${i + 1}/${licao.passos.length}</span></div>
        <div class="tr-passo">${miolo}</div>
        <div class="tr-rodape"><p class="tr-retorno" id="tr-retorno" aria-live="polite"></p><button class="btn primario largo" id="tr-avancar" type="button" ${pronto || REVISAR ? "" : "disabled"}>${pronto || !REVISAR ? botao : "Continuar (revisão)"}</button></div>
      </div>`;
    $("#tr-avancar").addEventListener("click", avancar);
    window.scrollTo(0, 0);
  }
  function liberar(texto, ok = true) {
    const r = $("#tr-retorno"), b = $("#tr-avancar");
    if (r) { r.textContent = texto || ""; r.className = "tr-retorno " + (ok ? "ok" : "nao"); }
    if (ok) somRetorno(true);
    if (b) { b.disabled = false; b.textContent = "Continuar"; }
  }
  function avancar() {
    limparPasso();
    sessao.i++;
    if (sessao.i >= sessao.licao.passos.length) return concluir();
    passo();
  }
  function limparPasso() { temporizadores.splice(0).forEach(clearTimeout); cancelAnimationFrame(mic.raf); pararPulso(); if (sessao && sessao.paraCrono) { sessao.paraCrono(); sessao.paraCrono = null; } }

  const melodiaAtual = () => (sessao && sessao.licao.melodia) || PRIMEIRO_PASSO;
  const apoio = p => (p.pauta ? svgPauta(p.pauta, { rotulos: p.rotulos, compassos: p.compassos, din: p.din, forq: p.forq }) : "") + (p.melodia ? svgMelodia(melodiaAtual()) : "") + (p.dedos ? svgDedos(p.dedos) : "") + (p.figuras ? htmlFiguras() : "");

  function passo() {
    const p = sessao.licao.passos[sessao.i], lic = sessao.licao;
    COMP = p.comp || lic.comp || 4; CONT = COMP === 2 ? 4 : COMP;
    FORMULA = p.formula || (p.formula !== 0 && lic.formula ? COMP : 0);
    MARCAS = p.pauta ? { din: p.din, forq: p.forq } : { din: lic.din, forq: lic.forq };
    ARM = ARMS[p.arm === undefined ? lic.arm : p.arm] || null;
    SWING = !!(p.swing === undefined ? lic.swing : p.swing);
    COMPOSTO = !!(p.composto === undefined ? lic.composto : p.composto);
    ({ info: passoInfo, escolha: passoEscolha, ouvir: passoEscolha, ritmo: passoRitmo, tocar: passoTocar, musica: passoMusica, gravar: passoGravar, pares: passoPares, ondefica: passoOndeFica, digitacao: passoDigitacao, dinamica: passoDinamica, vibrato: passoVibrato, metodos: passoMetodos, plano: passoPlano, bloco: passoBloco, fechamento: passoFechamento })[p.tipo](p);
  }

  // Toca a melodia com contagem de 4 e clique em cada tempo, acendendo a nota da vez em "alvo".
  const GANHO = { pp: 0.22, p: 0.36, mp: 0.6, mf: 0.85, f: 1.3, ff: 1.6 };
  // Volume de cada nota conforme as letras de dinâmica e as forquilhas.
  function ganhos(mel) {
    const g = new Array(mel.length).fill(GANHO.mf); let atual = GANHO.mf;
    const letras = new Map((MARCAS.din || []).map(([i, t]) => [i, GANHO[t] || GANHO.mf]));
    mel.forEach((_, i) => { if (letras.has(i)) atual = letras.get(i); g[i] = atual; });
    (MARCAS.forq || []).forEach(([de, ate, tipo]) => { const ini = g[de], fim = letras.get(ate + 1) || (tipo === "cresc" ? ini * 2.2 : ini / 2.2); for (let i = de; i <= ate; i++) g[i] = ini + (fim - ini) * ((i - de + 1) / (ate - de + 2)); });
    return g;
  }
  function ouvirMelodia(mel, alvo, aoFim) {
    const a = audio(), bt = 60 / bpmAtual(), t0 = a.currentTime + 0.15, total = mel.reduce((x, [, d]) => x + d, 0), vol = ganhos(mel);
    for (let k = 0; k < CONT + Math.ceil(total); k++) clique(t0 + k * bt, k % COMP === 0);
    const ini0 = t0 + CONT * bt; let lugar = 0, t = ini0;
    mel.forEach((item, i) => {
      const [n, d] = item, anterior = mel[i - 1], fimNota = q(lugar + d);
      t = ini0 + tReal(lugar) * bt;
      if (n !== P && !(anterior && tem(anterior, "liga") && anterior[0] === n)) {
        let ate = fimNota; if (tem(item, "liga") && mel[i + 1] && mel[i + 1][0] === n) ate = q(ate + mel[i + 1][1]);
        const dur = (tReal(ate) - tReal(lugar)) * bt * (tem(item, "st") ? 0.4 : 0.94), g = vol[i] * (tem(item, "ac") ? 1.5 : 1);
        const ap = typeof item[2] === "string" && (item[2].match(/ap=(\w+)/) || [])[1];
        if (ap && NOTA[ap]) tom(NOTA[ap].midi, t - 0.09, 0.085, g);
        if (tem(item, "tr")) { const passo = 0.085, cima = NOTA[n].midi + (item[2].includes("tr1") ? 1 : 2); for (let k = 0; k * passo < dur - 0.01; k++) tom(k % 2 ? cima : NOTA[n].midi, t + k * passo, passo * 1.05, g * 0.9); }
        else tom(NOTA[n].midi, t, dur, g);
      }
      temporizadores.push(setTimeout(() => { const el = $(alvo); if (el) el.innerHTML = svgMelodia(mel, i); }, (t - a.currentTime) * 1000));
      lugar = fimNota; t = ini0 + tReal(lugar) * bt;
    });
    temporizadores.push(setTimeout(() => { const el = $(alvo); if (el) el.innerHTML = svgMelodia(mel); if (aoFim) aoFim(); }, (t - a.currentTime) * 1000 + 150));
  }

  function passoInfo(p) {
    const lida = p.melodia ? melodiaAtual() : p.ouvir && p.pauta && p.pauta.length ? p.pauta : null;
    const desenho = lida ? `<div id="tr-mel">${svgMelodia(lida)}</div>${p.dedos ? svgDedos(p.dedos) : ""}` : apoio(p);
    moldura(`<h2>${esc(p.titulo)}</h2>${(p.texto || []).map(t => `<p>${esc(t)}</p>`).join("")}${p.lista ? `<ol class="tr-lista">${p.lista.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}${desenho}${lida ? `${htmlPulso(false)}<button class="btn" id="tr-ouvir" type="button">▶ Ouvir com o pulso</button>` : ""}${p.video ? `<div class="tr-video"><span>▶</span>${esc(p.video)}<small>entra aqui na versão final</small></div>` : ""}${p.link ? `<a class="btn" href="${esc(p.link.href)}">${esc(p.link.rotulo)}</a>` : ""}`);
    ativarPulso();
    const b = $("#tr-ouvir");
    if (b) b.addEventListener("click", () => { if (b.disabled) return; b.disabled = true; ouvirMelodia(lida, "#tr-mel", () => { b.disabled = false; }); });
  }

  function passoEscolha(p) {
    moldura(`<h2>${esc(p.pergunta)}</h2>${apoio(p)}${p.tipo === "ouvir" ? `<button class="btn" id="tr-ouvir" type="button">▶ Ouvir</button>` : ""}<div class="tr-opcoes">${p.opcoes.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join("")}</div>`, { botao: "Escolha uma resposta", pronto: false });
    const tocarSons = () => { let t = audio().currentTime + 0.1; p.sons.forEach(x => { const [n, g = 1, d = 0.9, v = 0.004] = Array.isArray(x) ? x : [x]; tom(NOTA[n].midi, t, d, g, v); t += d > 1 ? d + 0.3 : 1.1; }); };
    if (p.tipo === "ouvir") $("#tr-ouvir").addEventListener("click", tocarSons);
    raiz().querySelectorAll(".tr-opcoes button").forEach(b => b.addEventListener("click", () => {
      if (raiz().querySelector(".tr-opcoes .certa")) return;
      const i = Number(b.dataset.i);
      if (i === p.certa) {
        b.classList.add("certa");
        raiz().querySelectorAll(".tr-opcoes button").forEach(x => { x.disabled = true; });
        liberar(p.explica || "Isso mesmo.");
      } else {
        b.classList.add("errada"); b.disabled = true; sessao.erros++; somRetorno(false);
        const r = $("#tr-retorno"); r.textContent = "Ainda não. Olhe de novo e tente outra."; r.className = "tr-retorno nao";
      }
    }));
  }

  const embaralhar = v => { const a = v.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Ligar pares: nota na pauta ↔ nome.
  function passoPares(p) {
    const nomes = embaralhar(p.notas);
    moldura(`<h2>${esc(p.titulo)}</h2><p>Toque numa nota e depois no nome dela.</p><div class="tr-pares"><div>${p.notas.map(n => `<button type="button" class="tr-par pauta" data-n="${n}">${svgPauta([[n, 4]], { minLarg: 150 })}</button>`).join("")}</div><div>${nomes.map(n => `<button type="button" class="tr-par nome" data-n="${n}">${NOTA[n].nome}</button>`).join("")}</div></div>`, { botao: "Ligue os pares", pronto: false });
    let marcado = null, feitos = 0;
    raiz().querySelectorAll(".tr-par").forEach(b => b.addEventListener("click", () => {
      if (b.classList.contains("certa")) return;
      if (!marcado || marcado.classList.contains("pauta") === b.classList.contains("pauta")) { if (marcado) marcado.classList.remove("marcada"); marcado = b; b.classList.add("marcada"); return; }
      const a = marcado; marcado = null; a.classList.remove("marcada");
      if (a.dataset.n === b.dataset.n) {
        [a, b].forEach(x => { x.classList.add("certa"); x.disabled = true; }); feitos++;
        if (feitos === p.notas.length) liberar("Todos os pares certos."); else somRetorno(true);
      } else { sessao.erros++; somRetorno(false); [a, b].forEach(x => { x.classList.add("errada"); setTimeout(() => x.classList.remove("errada"), 500); }); }
    }));
  }

  // Tocar na pauta, no lugar da nota pedida.
  function passoOndeFica(p) {
    const alvo = NOTA[p.nota], linhas = [30, 40, 50, 60, 70].map(y => `<line x1="6" y1="${y}" x2="254" y2="${y}"/>`).join("");
    const zonas = []; for (let ps = -3; ps <= 13; ps++) zonas.push(`<rect class="tr-zona" data-p="${ps}" x="66" y="${70 - ps * 5 - 2.5}" width="184" height="5"/>`);
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p><svg class="tr-pauta tr-pauta-toque" viewBox="0 -8 260 104" role="img" aria-label="Pauta para tocar"><g class="tr-linhas">${linhas}</g><path class="tr-clave" transform="translate(12 13.5) scale(1.42)" d="${CLAVE}"/><g id="tr-posta"></g>${zonas.join("")}</svg>`, { botao: "Toque na pauta", pronto: false });
    let fim = false;
    raiz().querySelectorAll(".tr-zona").forEach(z => z.addEventListener("click", () => {
      if (fim) return;
      const ps = Number(z.dataset.p), y = 70 - ps * 5, certo = ps === alvo.passo;
      $("#tr-posta").innerHTML = `<ellipse cx="158" cy="${y}" rx="7.4" ry="5.2" transform="rotate(-20 158 ${y})" fill="none" stroke-width="2.2" class="${certo ? "posta certa" : "posta errada"}"/>`;
      if (certo) { fim = true; liberar(ps < -1 || ps > 8 ? `Isso. É aí que fica o ${alvo.nome}.` : `Isso. O ${alvo.nome} fica ${ps % 2 === 0 ? "na " + (ps / 2 + 1) + "ª linha" : ps < 0 ? "logo abaixo da 1ª linha" : "no " + ((ps + 1) / 2) + "º espaço"}.`); }
      else { sessao.erros++; somRetorno(false); const r = $("#tr-retorno"); r.textContent = ps > alvo.passo ? "Mais para baixo." : "Mais para cima."; r.className = "tr-retorno nao"; }
    }));
  }

  // Escolher o desenho do sax com a digitação certa.
  function passoDigitacao(p) {
    const ops = embaralhar(p.notas);
    moldura(`<h2>${esc(p.pergunta)}</h2><div class="tr-digitacoes">${ops.map(n => `<button type="button" data-n="${n}">${svgSax(n)}</button>`).join("")}</div>`, { botao: "Escolha um desenho", pronto: false });
    raiz().querySelectorAll(".tr-digitacoes button").forEach(b => b.addEventListener("click", () => {
      if (raiz().querySelector(".tr-digitacoes .certa")) return;
      if (b.dataset.n === p.nota) { b.classList.add("certa"); liberar(`${NOTA[p.nota].nome}: ${NOTA[p.nota].dica}.`); }
      else { b.classList.add("errada"); b.disabled = true; sessao.erros++; somRetorno(false); const r = $("#tr-retorno"); r.textContent = `Essa é a digitação do ${NOTA[b.dataset.n].nome}.`; r.className = "tr-retorno nao"; }
    }));
  }

  function passoRitmo(p) {
    let bt = 60 / bpmAtual();
    const total = p.padrao.reduce((a, b) => a + Math.abs(b), 0), fr = t => ({ 0.25: "¼", 0.5: "½", 0.75: "¾", 1.5: "1½" }[t] || (Math.abs(t - T) < 0.01 ? "⅓" : t));
    const blocos = p.padrao.map(t => t < 0 ? `<span class="silencio" style="flex:${-t}">–<small>pausa</small></span>` : (COMPOSTO ? `<span style="flex:${t}">${Math.round(t * 3)}<small>${Math.round(t * 3) === 1 ? "colcheia" : "colcheias"}</small></span>` : `<span style="flex:${t}">${fr(t)}<small>${t <= 1 ? "tempo" : "tempos"}</small></span>`)).join("");
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${apoio(p)}<div class="tr-ritmo-linha" id="tr-linha">${blocos}<i id="tr-cursor"></i></div>${htmlPulso(false)}<p class="tr-conta-voz" id="tr-voz">Toque em “Começar” e ouça a contagem.</p><button class="tr-bater" id="tr-bater" type="button">Começar</button>`, { botao: "Bata o ritmo", pronto: false });
    ativarPulso();
    const bater = $("#tr-bater"), voz = $("#tr-voz");
    let fase = "espera", inicio = 0, toques = [];
    const esperados = []; p.padrao.reduce((t, d) => { if (d > 0) esperados.push(tReal(t)); return q(t + Math.abs(d)); }, 0);
    function comecar() {
      bt = 60 / bpmAtual();
      const a = audio(); inicio = a.currentTime + 0.15 + CONT * bt; toques = []; fase = "contagem";
      for (let k = 0; k < CONT + Math.ceil(total); k++) clique(a.currentTime + 0.15 + k * bt, k % COMP === 0);
      bater.textContent = "Toque aqui"; bater.classList.add("ativo");
      for (let k = 0; k < CONT; k++) temporizadores.push(setTimeout(() => { voz.textContent = `Contagem: ${(k % COMP) + 1}`; }, (0.15 + k * bt) * 1000));
      temporizadores.push(setTimeout(() => { fase = "valendo"; voz.textContent = "Agora!"; const c = $("#tr-cursor"); if (c) { c.style.transition = `left ${total * bt}s linear`; c.style.left = "100%"; } }, (0.15 + CONT * bt - 0.2) * 1000));
      temporizadores.push(setTimeout(avaliar, (0.15 + (CONT + total) * bt + 0.25) * 1000));
    }
    function avaliar() {
      fase = "espera"; bater.classList.remove("ativo");
      const usados = new Set(); let soma = 0, certos = 0;
      esperados.forEach(e => {
        let melhor = -1, dist = 9;
        toques.forEach((t, i) => { const d = Math.abs(t - e * bt); if (!usados.has(i) && d < dist) { dist = d; melhor = i; } });
        if (melhor >= 0 && dist < Math.min(SWING ? bt * 0.13 : 0.28, bt * 0.42 * Math.min(1, ...p.padrao.map(Math.abs)))) { usados.add(melhor); certos++; soma += dist; }
      });
      const extras = toques.length - usados.size;
      if (certos === esperados.length && extras === 0) {
        const media = Math.round(soma / certos * 1000);
        liberar(media < 90 ? "No pulso. Muito bem." : "Certo. Tente ficar ainda mais junto do clique na próxima.");
        bater.textContent = "Repetir"; voz.textContent = "";
      } else {
        sessao.erros++;
        voz.textContent = extras > 0 ? (p.padrao.some(d => d < 0) ? "Você bateu onde havia pausa. Na pausa, só conte." : "Você tocou mais vezes do que o ritmo pede. Ouça a contagem e tente de novo.") : "Faltou alguma batida ou ela saiu fora do pulso. Tente de novo.";
        bater.textContent = "Tentar de novo";
        const c = $("#tr-cursor"); if (c) { c.style.transition = "none"; c.style.left = "0"; }
      }
    }
    const toque = ev => {
      ev.preventDefault();
      if (fase === "espera") return comecar();
      toques.push(audio().currentTime - inicio);
      bater.classList.add("pulso"); setTimeout(() => bater.classList.remove("pulso"), 90);
    };
    bater.addEventListener("pointerdown", toque);
    bater.addEventListener("keydown", ev => { if (ev.key === " " || ev.key === "Enter") toque(ev); });
  }

  function htmlMic(p) {
    return `<div class="tr-mic"><div class="tr-medidor"><span id="tr-nivel"></span></div><p id="tr-ouvindo" class="tr-ouvindo">Ligue o microfone e toque.</p><button class="btn primario" id="tr-mic" type="button">Ligar o microfone</button>${saxDoApp() ? "" : `<div class="tr-sax"><span>Meu sax é:</span><button type="button" data-sax="Mib">Alto ou barítono</button><button type="button" data-sax="Sib">Tenor ou soprano</button></div>`}<button class="link-acao" id="tr-pular" type="button">Estou sem o sax agora: pular</button></div>`;
  }
  function ligarControlesMic(aoLigar) {
    raiz().querySelectorAll(".tr-sax button").forEach(b => b.addEventListener("click", () => { prog.sax = b.dataset.sax; salvar(); b.parentNode.querySelectorAll("button").forEach(x => x.classList.toggle("ativo", x === b)); }));
    $("#tr-pular").addEventListener("click", () => liberar("Tudo bem. Volte a esta lição com o sax na mão.", false));
    $("#tr-mic").addEventListener("click", async () => {
      const b = $("#tr-mic"); audio(); b.disabled = true; b.textContent = "Ligando…";
      const ok = await ligarMic();
      if (!$("#tr-mic")) return;
      b.disabled = false; b.textContent = "Tentar de novo";
      if (!ok) { const o = $("#tr-ouvindo"); o.innerHTML = window.NaipeMic.htmlAviso(mic.erro); return; }
      b.hidden = true; aoLigar();
    });
  }
  const NOMES = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];

  function passoTocar(p) {
    const alvo = p.livre ? null : NOTA[p.nota];
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${p.pauta ? svgPauta(p.pauta) : alvo ? svgPauta([[p.nota, 4]], { rotulos: true }) : ""}${alvo ? svgDedos([p.nota]) : ""}${htmlPulso(true)}${htmlMic(p)}`, { botao: "Toque para continuar", pronto: false });
    ativarPulso();
    ligarControlesMic(() => {
      let acumulado = 0, ultimo = performance.now(), anterior = -1, pronto = false;
      const ouvindo = $("#tr-ouvindo"), nivel = $("#tr-nivel");
      ouvindo.textContent = alvo ? `Ouvindo… toque o ${alvo.nome}.` : "Ouvindo… toque uma nota longa.";
      (function quadro() {
        if (!$("#tr-nivel") || pronto) return;
        const agora = performance.now(), dt = (agora - ultimo) / 1000; ultimo = agora;
        const n = notaOuvida(), certa = n >= 0 && (alvo ? n === alvo.midi % 12 : (anterior < 0 || n === anterior));
        if (certa) acumulado += dt; else if (n >= 0 || acumulado < 0.3) acumulado = Math.max(0, acumulado - dt * 2);
        anterior = n >= 0 ? n : anterior;
        nivel.style.width = Math.min(100, acumulado / p.segundos * 100) + "%";
        if (n >= 0 && alvo && !certa) ouvindo.textContent = `Ouvi ${NOMES[n]}. Procure o ${alvo.nome}.`;
        else if (certa) ouvindo.textContent = alvo ? `${alvo.nome}! Sustente…` : "Bom som. Sustente…";
        if (acumulado >= p.segundos) { pronto = true; nivel.style.width = "100%"; ouvindo.textContent = ""; liberar(alvo ? `${alvo.nome} firme. Muito bem.` : "Som firme por 3 segundos. Muito bem."); return; }
        mic.raf = requestAnimationFrame(quadro);
      })();
    });
  }

  function nivelMic() {
    if (!mic.an) return 0;
    mic.an.getFloatTimeDomainData(mic.buf);
    let q = 0; for (let i = 0; i < mic.buf.length; i++) q += mic.buf[i] * mic.buf[i];
    return Math.sqrt(q / mic.buf.length);
  }
  // Dinâmica pelo microfone. modo "pf": piano e depois forte. "cresc" e "dim": uma nota longa que cresce ou diminui.
  function passoDinamica(p) {
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${apoio(p)}<div class="tr-volume"><span id="tr-vol"></span></div>${htmlMic(p)}`, { botao: "Toque para continuar", pronto: false });
    ligarControlesMic(() => {
      const ouvindo = $("#tr-ouvindo"), barra = $("#tr-nivel"), vol = $("#tr-vol");
      const SOM = 0.014, media = v => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
      let etapa = 0, amostras = [], guardado = 0, silencio = 0, fim = false;
      const pede = () => { ouvindo.textContent = p.modo === "pf" ? (etapa === 0 ? "1 de 2: toque uma nota piano, bem suave, por 2 segundos." : "2 de 2: agora a mesma nota forte, por 2 segundos.") : p.modo === "cresc" ? "Comece suave e vá crescendo por 3 segundos." : "Comece forte e vá diminuindo por 3 segundos."; };
      pede();
      const alvoQ = p.modo === "pf" ? 110 : 160; // quadros de som (cerca de 2 e 3 segundos)
      (function quadro() {
        if (!$("#tr-vol") || fim) return;
        const r = nivelMic();
        vol.style.width = Math.min(100, r * 380) + "%";
        if (r > SOM) { amostras.push(r); silencio = 0; } else if (++silencio > 25 && amostras.length < alvoQ) { if (amostras.length > 12) ouvindo.textContent = "O som parou antes da hora. Respire e tente de novo."; amostras = []; }
        barra.style.width = Math.min(100, amostras.length / alvoQ * 100) + "%";
        if (amostras.length >= alvoQ) {
          if (p.modo === "pf") {
            if (etapa === 0) { guardado = media(amostras); etapa = 1; amostras = []; silencio = 0; barra.style.width = "0"; pede(); }
            else if (media(amostras) >= guardado * 1.5) { fim = true; return liberar("Deu para ouvir a diferença entre o piano e o forte."); }
            else { sessao.erros++; somRetorno(false); etapa = 0; amostras = []; ouvindo.textContent = "Os dois saíram com volume parecido. Exagere: piano bem suave, forte bem cheio."; temporizadores.push(setTimeout(pede, 2600)); }
          } else {
            const t = Math.floor(amostras.length / 3), ini = media(amostras.slice(0, t)), fin = media(amostras.slice(-t));
            const ok = p.modo === "cresc" ? fin >= ini * 1.4 : ini >= fin * 1.4;
            if (ok) { fim = true; return liberar(p.modo === "cresc" ? "O som cresceu do começo ao fim." : "O som diminuiu sem quebrar."); }
            sessao.erros++; somRetorno(false); amostras = []; ouvindo.textContent = p.modo === "cresc" ? "O volume ficou quase igual. Comece mais suave e solte mais ar no final." : "O volume ficou quase igual. Comece mais forte e vá soltando menos ar."; temporizadores.push(setTimeout(pede, 2600));
          }
        }
        mic.raf = requestAnimationFrame(quadro);
      })();
    });
  }

  function freqOuvida() {
    if (!mic.an) return -1;
    mic.an.getFloatTimeDomainData(mic.buf);
    const f = detectar(mic.buf, (mic.ctx || ctx).sampleRate);
    return f > 60 && f < 1600 ? f : -1;
  }
  // modo "reto": 3 s de som sem oscilar. modo "vibrato": 3 s com ondulação regular da afinação.
  function passoVibrato(p) {
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${apoio(p)}<div class="tr-onda"><svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="30" x2="300" y2="30"/><polyline id="tr-onda" points=""/></svg></div>${htmlMic(p)}`, { botao: "Toque para continuar", pronto: false });
    ligarControlesMic(() => {
      const ouvindo = $("#tr-ouvindo"), barra = $("#tr-nivel"), onda = $("#tr-onda");
      let serie = [], silencio = 0, fim = false; // [tempo em s, cents em relação ao Lá 440]
      const pede = () => { ouvindo.textContent = p.modo === "reto" ? "Toque uma nota longa, o mais reta possível, por 3 segundos." : "Toque uma nota longa com vibrato por 3 segundos."; };
      pede();
      (function quadro() {
        if (!$("#tr-onda") || fim) return;
        const f = freqOuvida(), agora = performance.now() / 1000;
        if (f > 0) { const c = 1200 * Math.log2(f / 440); if (serie.length && Math.abs(c - serie[serie.length - 1][1]) > 150) serie = []; serie.push([agora, c]); silencio = 0; }
        else if (++silencio > 20) { if (serie.length > 20) ouvindo.textContent = "O som parou antes da hora. Respire e tente de novo."; serie = []; }
        const dur = serie.length ? agora - serie[0][0] : 0;
        barra.style.width = Math.min(100, dur / 3 * 100) + "%";
        if (serie.length > 4) {
          const ult = serie.slice(-90), med = ult.map(x => x[1]).sort((a, b) => a - b)[Math.floor(ult.length / 2)];
          onda.setAttribute("points", ult.map((x, i) => `${(i / 89 * 300).toFixed(1)},${Math.max(2, Math.min(58, 30 - (x[1] - med) * 0.7)).toFixed(1)}`).join(" "));
        }
        if (dur >= 3) {
          const v = serie.map(x => x[1]), med = v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)], des = v.map(x => x - med);
          const amp = des.reduce((a, b) => a + Math.abs(b), 0) / des.length;
          // ondas por segundo: conta as passagens pelo centro, ignorando tremores pequenos
          let cruz = 0, lado = 0; des.forEach(d => { const l = d > 4 ? 1 : d < -4 ? -1 : 0; if (l && lado && l !== lado) cruz++; if (l) lado = l; });
          const hz = cruz / 2 / dur;
          let ok, msg;
          if (p.modo === "reto") { ok = amp < 7; msg = ok ? "Som reto e firme. Essa é a base do vibrato." : "A afinação oscilou. Apoie o ar e mantenha a embocadura parada."; }
          else { ok = amp >= 6 && hz >= 2.5 && hz <= 8.5; msg = ok ? `Vibrato regular, cerca de ${Math.round(hz)} ondas por segundo.` : amp < 6 ? "Quase não ouvi ondulação. Movimente o queixo como quem diz “uá-uá-uá”." : hz < 2.5 ? "A ondulação ficou lenta demais. Tente umas 5 por segundo." : "A ondulação ficou rápida e nervosa. Faça mais devagar e mais larga."; }
          if (ok) { fim = true; return liberar(msg); }
          sessao.erros++; somRetorno(false); serie = []; ouvindo.textContent = msg; temporizadores.push(setTimeout(pede, 3000));
        }
        mic.raf = requestAnimationFrame(quadro);
      })();
    });
  }

  // Ponte para os métodos: onde continuar o assunto nos livros da biblioteca.
  function passoMetodos(p) {
    const livros = (window.CMA_METODOS && window.CMA_METODOS.livros) || {};
    moldura(`<h2>${esc(p.titulo)}</h2>${(p.texto || []).map(t => `<p>${esc(t)}</p>`).join("")}<ul class="tr-metodos">${p.itens.map(([id, onde, assunto]) => { const l = livros[id] || { titulo: id, autor: "" }; return `<li><a href="#/metodo/${encodeURIComponent(id)}"><span class="tr-met-txt"><strong>${esc(l.titulo)}</strong><small>${esc(l.autor || "")}</small><em>${esc(assunto)}</em></span><span class="tr-met-onde">${esc(onde)}</span></a></li>`; }).join("")}</ul><p class="mudo">Toque num método para abrir a página dele. Para voltar a esta lição, use a aba Aprender.</p>`);
  }


  // ---------- Professor virtual ----------
  const NOTAS_AV = { 3: "Fácil, saiu limpo", 2: "Consegui, com alguns erros", 1: "Difícil" };
  const estadoPlano = () => { prog.plano = prog.plano || { t: {}, n: 0, ultima: null }; return prog.plano; };
  const trilho = id => { const pl = estadoPlano(); pl.t[id] = pl.t[id] || { i: 0, bpm: null }; return pl.t[id]; };
  function itemAtual(id) {
    const tr = TRILHOS[id], st = trilho(id), n = tr.itens.length;
    const i = tr.gira ? st.i % n : Math.min(st.i, n - 1);
    const [livro, onde, oque, bpm] = tr.itens[i];
    return { i, livro, onde, oque, bpm, fim: !tr.gira && st.i >= n, inicio: bpm ? Math.max(bpm[0], Math.min(bpm[1], st.bpm || bpm[0])) : null };
  }
  // Itens "rep:<id>" apontam para uma música do repertório essencial (repertorio.js).
  const REP = window.NAIPE_REPERTORIO || { fontes: {}, estilos: [], musicas: [] };
  const musicaRep = id => REP.musicas.find(m => `rep:${m.id}` === id);
  const driveUrl = arq => `https://drive.google.com/file/d/${arq}/view`;
  const urlPdf = id => { const m = musicaRep(id); if (m) return ""; const l = ((window.CMA_METODOS || {}).livros || {})[id]; return l && l.arquivo ? (/\.pdf$/i.test(l.arquivo) ? l.arquivo : driveUrl(l.arquivo)) : ""; };
  const livroInfo = id => { const m = musicaRep(id); if (m) return { titulo: m.titulo, autor: m.autor }; return ((window.CMA_METODOS || {}).livros || {})[id] || { titulo: id, autor: "" }; };
  // Botões de uma música: partitura em Mi♭, em Si♭, songbook e playback.
  function linksMusica(m, principal) {
    const b = [], cls = k => `btn${principal && k === 0 ? " primario" : ""}`;
    const livro = (lv, rot) => { const f = REP.fontes[lv[0]]; if (f) b.push(`<a class="${cls(b.length)}" href="${driveUrl(f.arquivo)}" target="_blank" rel="noopener">${rot} · ${esc(lv[1].split(" (")[0])}</a>`); };
    if (m.alto) b.push(`<a class="${cls(b.length)}" href="${driveUrl(m.alto)}" target="_blank" rel="noopener">Partitura alto (Mi♭)</a>`);
    else if (m.livro) livro(m.livro, "Real Book alto");
    if (m.tenor) b.push(`<a class="${cls(b.length)}" href="${driveUrl(m.tenor)}" target="_blank" rel="noopener">Partitura tenor (Si♭)</a>`);
    else if (m.livroBb) livro(m.livroBb, m.livroBb[0].startsWith("choro") ? "Songbook tenor" : "Real Book tenor");
    if (m.playback) b.push(`<a class="${cls(b.length)}" href="${driveUrl(m.playback)}" target="_blank" rel="noopener">▶ Playback</a>`);
    if (m.guia) b.push(`<a class="btn" href="#/metodo/${encodeURIComponent(m.guia)}">Guia de estudo</a>`);
    return `<div class="tr-rep-links">${b.join("")}</div>`;
  }
  const fonteTxt = m => { const lv = m.livro || m.livroBb, f = lv && REP.fontes[lv[0]]; return f ? `${f.titulo}, ${lv[1]}${m.livro && m.livroBb ? ". A mesma página na edição em Si♭." : ""}` : ""; };

  // Decide o próximo passo do trilho a partir da avaliação (3 fácil, 2 com erros, 1 difícil) e do andamento alcançado.
  function avaliarTrilho(id, ev, alcancado) {
    const tr = TRILHOS[id], st = trilho(id), it = itemAtual(id);
    const nome = `${livroInfo(it.livro).titulo}, ${it.onde.split(" · ")[0]}`;
    if (tr.gira) { st.i++; const prox = itemAtual(id); return `Aquecimento feito. Na próxima sessão: ${livroInfo(prox.livro).titulo}, ${prox.onde.split(" · ")[0]}.`; }
    const avanca = () => { st.i++; st.bpm = null; if (st.i >= tr.itens.length) return `Você concluiu toda a sequência de ${tr.nome.toLowerCase()} do plano. Siga revisando o último exercício, agora com a meta de andamento mais alta.`; const prox = itemAtual(id); return `Meta alcançada em ${nome}. Na próxima sessão: ${livroInfo(prox.livro).titulo}, ${prox.onde.split(" · ")[0]}${prox.bpm ? `, começando em ${prox.bpm[0]}` : ""}.`; };
    if (!it.bpm) { if (ev === 3) return avanca(); return ev === 2 ? `Mais uma sessão em ${nome} antes de seguir.` : `Vamos repetir ${nome}. ${tr.dica}`; }
    const [ini, meta] = it.bpm, r = alcancado || it.inicio;
    if (alcancado) { // histórico do andamento alcançado em cada exercício do plano
      const pl = estadoPlano(); pl.hist = pl.hist || {};
      const h = (pl.hist[`${id}:${it.i}`] = pl.hist[`${id}:${it.i}`] || []), hoje = new Date().toISOString().slice(0, 10);
      if (h.length && h[h.length - 1].d === hoje) h[h.length - 1].b = Math.max(h[h.length - 1].b, alcancado); else h.push({ d: hoje, b: alcancado });
      if (h.length > 30) h.splice(0, h.length - 30);
    }
    if (ev === 3 && r >= meta) return avanca();
    if (ev === 3) { st.bpm = Math.min(meta, r + 8); return `Boa. Na próxima vez, ${nome} começa em ${st.bpm} (meta ${meta}).`; }
    if (ev === 2) { st.bpm = Math.min(meta, Math.max(ini, r + 4)); return `Mais uma sessão em ${nome}, começando em ${st.bpm}. Corrija os trechos que falharam antes de subir.`; }
    st.bpm = Math.max(ini, r - 8); return `Na próxima vez, ${nome} volta para ${st.bpm}. ${tr.dica}`;
  }

  // Gera os passos de uma sessão: recado e plano, um passo por bloco, gravação (no fim da semana) e resumo.
  function gerarSessao(licao) {
    const se = licao.sessao;
    licao.passos = [{ tipo: "plano" }, ...se.blocos.map(([t, min], k) => ({ tipo: "bloco", trilho: t, min, k }))];
    if (se.gravar) licao.passos.push({ tipo: "gravar", chave: se.gravar, comparar: true, titulo: "A gravação do mês", texto: "Grave a peça do repertório de que você mais gostou neste mês. Ouça ao lado do som do primeiro dia." });
    licao.passos.push({ tipo: "fechamento" });
    sessao.res = {};
  }

  function passoPlano() {
    const { licao } = sessao, se = licao.sessao, pl = estadoPlano(), un = UNIDADES_PLANO[se.semana];
    const nome = nomeAluno().split(" ")[0];
    const total = se.blocos.reduce((a, b) => a + b[1], 0);
    const ultima = pl.ultima && pl.ultima.recados && pl.ultima.recados.length ? `<p>Da última sessão:</p><ul class="tr-recados">${pl.ultima.recados.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : `<p>${esc(un.texto)}</p>`;
    const linhas = se.blocos.map(([t, min]) => { const it = itemAtual(t), l = livroInfo(it.livro), rep = musicaRep(it.livro); return `<li><span><strong>${esc(TRILHOS[t].nome)}</strong><small>${rep ? esc(l.titulo) : `<button type="button" class="tr-livro-link" data-ficha="${esc(it.livro)}">${esc(l.titulo)}</button>`} · ${esc(it.onde)}${it.inicio ? ` · ♩ ${it.inicio}` : ""}</small></span><b>${min} min</b></li>`; }).join("");
    moldura(`<p class="sobretitulo">Semana ${se.semana + 1} · ${esc(un.foco)}</p><h2>${esc(licao.titulo)}</h2><div class="tr-recado"><span class="rotulo">Recado do professor</span><p>${nome ? `${esc(nome)}, ` : ""}${pl.n ? `esta é a sua sessão número ${pl.n + 1} do plano.` : "vamos começar o seu plano de estudos."}</p>${ultima}</div><p class="tr-hoje-titulo">Hoje, cerca de ${total} minutos:</p><ol class="tr-plano-hoje">${linhas}</ol><p class="mudo">Deixe o sax montado e os PDFs à mão. Cada bloco abre o método na página certa.</p>`, { botao: "Começar a sessão" });
    ligarFichas(true);
  }

  function passoBloco(p) {
    const it = itemAtual(p.trilho), tr = TRILHOS[p.trilho], l = livroInfo(it.livro), url = urlPdf(it.livro), nb = sessao.licao.sessao.blocos.length;
    const rep = musicaRep(it.livro);
    if (it.inicio) { prog.bpm = it.inicio; salvar(); }
    moldura(`<p class="sobretitulo">Bloco ${p.k + 1} de ${nb} · cerca de ${p.min} min</p><h2>${esc(tr.nome)}</h2>
      <div class="tr-bloco"><span class="rotulo">${esc(l.autor || "Material de apoio")}</span><strong>${rep ? esc(l.titulo) : `<button type="button" class="tr-livro-link" data-ficha="${esc(it.livro)}">${esc(l.titulo)}</button>`}</strong><p class="tr-bloco-onde">${esc(rep ? fonteTxt(rep) || it.onde : it.onde)}</p><p>${esc(it.oque)}</p>${rep ? linksMusica(rep, true) : url ? `<a class="btn primario" href="${esc(url)}" target="_blank" rel="noopener">Abrir o PDF</a>` : ""}</div>
      ${it.bpm ? `<p class="tr-meta-bpm">Comece em <b>${it.inicio}</b> · meta <b>${it.bpm[1]}</b>. Suba de 4 em 4 quando sair limpo.</p>${htmlPulso(true)}` : ""}
      <div class="tr-crono"><span id="tr-crono">00:00</span><small>de ${String(p.min).padStart(2, "0")}:00</small><button class="btn" id="tr-crono-btn" type="button">Iniciar o bloco</button></div>
      <p class="tr-hoje-titulo">Como foi?</p><div class="tr-opcoes tr-aval">${[3, 2, 1].map(v => `<button type="button" data-ev="${v}">${NOTAS_AV[v]}</button>`).join("")}</div>${it.bpm ? `<p class="mudo">O andamento marcado no pulso quando você avaliar é o que eu guardo como alcançado.</p>` : ""}`, { botao: "Avalie o bloco", pronto: false });
    ligarFichas(false);
    ativarPulso();
    let ini = 0, acum = 0, tick = 0;
    const mostra = () => { const sg = Math.floor((acum + (ini ? Date.now() - ini : 0)) / 1000), el = $("#tr-crono"); if (el) el.textContent = `${String(Math.floor(sg / 60)).padStart(2, "0")}:${String(sg % 60).padStart(2, "0")}`; if (ini && sg === p.min * 60) { somRetorno(true); const r = $("#tr-retorno"); if (r && !r.textContent) { r.textContent = "Tempo do bloco completo. Avalie quando terminar."; r.className = "tr-retorno ok"; } } };
    $("#tr-crono-btn").addEventListener("click", ev => {
      if (ini) { acum += Date.now() - ini; ini = 0; clearInterval(tick); ev.target.textContent = "Continuar o bloco"; }
      else { ini = Date.now(); tick = setInterval(mostra, 250); ev.target.textContent = "Pausar"; }
    });
    sessao.paraCrono = () => { if (ini) { acum += Date.now() - ini; ini = 0; } clearInterval(tick); return Math.round(acum / 1000); };
    raiz().querySelectorAll(".tr-aval button").forEach(b => b.addEventListener("click", () => {
      if (sessao.res[p.k]) return;
      const ev = Number(b.dataset.ev), alcancado = it.bpm ? bpmAtual() : null, seg = sessao.paraCrono();
      const recado = avaliarTrilho(p.trilho, ev, alcancado);
      sessao.res[p.k] = { trilho: p.trilho, titulo: `${l.titulo} · ${it.onde.split(" · ")[0]}`, ev, alcancado, seg, recado };
      salvar();
      b.classList.add("certa"); raiz().querySelectorAll(".tr-aval button").forEach(x => { x.disabled = true; });
      liberar(recado, ev > 1);
      if (ev === 1) { const r = $("#tr-retorno"); r.className = "tr-retorno nao"; }
    }));
  }

  function passoFechamento() {
    const { licao } = sessao, res = Object.values(sessao.res || {}), pl = estadoPlano();
    const minutos = Math.round(res.reduce((a, r) => a + r.seg, 0) / 60);
    const media = res.length ? res.reduce((a, r) => a + r.ev, 0) / res.length : 0;
    if (!sessao.registrado) {
      sessao.registrado = true;
      pl.n++; pl.ultima = { data: new Date().toISOString(), recados: res.filter(r => !TRILHOS[r.trilho].gira).map(r => r.recado) };
      // horas acumuladas: o tempo medido nos blocos ou, sem cronômetro, a duração prevista da sessão
      const previsto = licao.sessao.blocos.reduce((a, b) => a + b[1], 0);
      pl.min = pl.min || {}; pl.min[licao.sessao.semana] = (pl.min[licao.sessao.semana] || 0) + (minutos >= 1 ? minutos : previsto);
      salvar();
      if (!REVISAR && minutos >= 1 && window.NaipeRegistrarPratica) window.NaipeRegistrarPratica(minutos, Math.max(1, Math.round(media / 3 * 5)), `Plano de estudos · ${licao.titulo} da Semana ${licao.sessao.semana + 1}: ${res.map(r => r.titulo).join("; ")}`);
    }
    moldura(`<p class="sobretitulo">Fim da sessão</p><h2>O que eu anotei</h2><ul class="tr-resumo">${res.map(r => `<li><span><strong>${esc(TRILHOS[r.trilho].nome)}</strong><small>${esc(r.titulo)}${r.alcancado ? ` · chegou a ♩ ${r.alcancado}` : ""} · ${esc(NOTAS_AV[r.ev])}</small></span><p>${esc(r.recado)}</p></li>`).join("") || "<li>Nenhum bloco avaliado.</li>"}</ul><p class="mudo">${minutos >= 1 ? `${minutos} minutos registrados no seu Diário.` : "Use o cronômetro de cada bloco para o tempo entrar no seu Diário."}</p>`, { botao: "Concluir a sessão" });
  }

  function passoMusica(p) {
    let bt = 60 / bpmAtual(); const MEL = melodiaAtual();
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p><div id="tr-partitura">${svgMelodia(MEL)}</div>${htmlPulso(false)}<p class="tr-conta-voz" id="tr-voz"></p>${htmlMic(p)}`, { botao: "Toque a música", pronto: false });
    ativarPulso();
    ligarControlesMic(() => {
      const voz = $("#tr-voz"), ouvindo = $("#tr-ouvindo");
      ouvindo.innerHTML = `<button class="btn primario" id="tr-iniciar" type="button">Começar com contagem</button>`;
      $("#tr-iniciar").addEventListener("click", function iniciar() {
        bt = 60 / bpmAtual();
        const a = audio(), t0 = a.currentTime + 0.2, total = MEL.reduce((s, [, d]) => s + d, 0);
        for (let k = 0; k < CONT + Math.ceil(total); k++) clique(t0 + k * bt, k % COMP === 0);
        ouvindo.textContent = "";
        for (let k = 0; k < CONT; k++) temporizadores.push(setTimeout(() => { voz.textContent = `Contagem: ${(k % COMP) + 1}`; }, (0.2 + k * bt) * 1000));
        const inicio = t0 + CONT * bt; let pos = 0; const janelas = MEL.map(([n, d]) => { const j = { n, de: tReal(pos) * bt, ate: tReal(q(pos + d)) * bt, bons: 0, quadros: 0 }; pos = q(pos + d); return j; });
        let atual = -1;
        (function quadro() {
          if (!$("#tr-partitura")) return;
          const t = audio().currentTime - inicio;
          if (t >= total * bt) return fim();
          if (t >= 0) {
            const i = janelas.findIndex(j => t >= j.de && t < j.ate);
            if (i !== atual) { atual = i; $("#tr-partitura").innerHTML = svgMelodia(MEL, i); voz.textContent = MEL[i][0] === P ? "pausa" : NOTA[MEL[i][0]].nome; }
            const j = janelas[i];
            if (j.n !== P && t - j.de > Math.min(0.12, (j.ate - j.de) * 0.3)) { j.quadros++; if (notaOuvida() === NOTA[j.n].midi % 12) j.bons++; }
          }
          mic.raf = requestAnimationFrame(quadro);
        })();
        function fim() {
          const notas = janelas.filter(j => j.n !== P), certas = notas.filter(j => j.quadros && j.bons / j.quadros >= 0.4).length;
          $("#tr-partitura").innerHTML = svgMelodia(MEL);
          voz.textContent = `${certas} de ${notas.length} notas no lugar.`;
          if (certas >= Math.ceil(notas.length * 0.6)) liberar("Música tocada do começo ao fim. Muito bem.");
          else { sessao.erros++; ouvindo.innerHTML = `<button class="btn primario" id="tr-iniciar" type="button">Tentar de novo</button>`; $("#tr-iniciar").addEventListener("click", iniciar); }
        }
      });
    });
  }

  // ---------- Gravações (antes e depois) ----------
  const bd = () => new Promise((ok, no) => {
    const r = indexedDB.open("naipe-trilha", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("grav");
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  });
  const gravLer = async chave => { try { const b = await bd(); return await new Promise(ok => { const r = b.transaction("grav").objectStore("grav").get(chave); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }); } catch { return null; } };
  const gravGuardar = async (chave, valor) => { const b = await bd(); return new Promise((ok, no) => { const t = b.transaction("grav", "readwrite"); t.objectStore("grav").put(valor, chave); t.oncomplete = ok; t.onerror = () => no(t.error); }); };
  const dataCurta = iso => new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const urls = [];
  const htmlAudio = (g, rotulo) => { const u = URL.createObjectURL(g.blob); urls.push(u); return `<div class="tr-grav"><span><strong>${esc(rotulo)}</strong><small>${dataCurta(g.data)}</small></span><audio controls preload="metadata" src="${u}"></audio></div>`; };
  const ROTULO_GRAV = { primeira: "Meu primeiro som", u1: "Primeiro Passo", u2: "Caminho de Casa", u3: "Roda de Sábado", u4: "Manhã de Sol", u5: "Baião de Estreia", u6: "Tarde em Fá", u7: "Sincopado", u8: "Chorinho de Estreia", u9: "Dois por Quatro", u10: "Festa em Ré", u11: "Serenata", u12: "Cantiga em Ré", u13: "Swing do Naipe", u14: "Seresta", u15: "De Ponta a Ponta", u16: "Formatura", s4: "Fim do primeiro mês", s8: "Fim do segundo mês", s12: "Fim do terceiro mês" };

  const rec = { mr: null, stream: null, partes: [], t: 0 };
  function pararRec() { clearInterval(rec.t); if (rec.mr && rec.mr.state !== "inactive") rec.mr.stop(); if (rec.stream) rec.stream.getTracks().forEach(t => t.stop()); rec.stream = null; }

  async function passoGravar(p) {
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p><div id="tr-gravs"></div><div class="tr-mic"><p class="tr-ouvindo" id="tr-ouvindo"></p><button class="tr-rec" id="tr-rec" type="button"><i></i><span>Gravar</span></button><button class="link-acao" id="tr-pular" type="button">Agora não: pular</button></div>`, { botao: "Grave para continuar", pronto: false });
    const caixa = $("#tr-gravs"), botao = $("#tr-rec"), txt = $("#tr-ouvindo");
    async function mostrar() {
      const primeira = p.comparar ? await gravLer("primeira") : null, minha = await gravLer(p.chave);
      if (!$("#tr-gravs")) return;
      caixa.innerHTML = (primeira ? htmlAudio(primeira, "Primeiro dia") : "") + (minha ? htmlAudio(minha, p.comparar ? "Hoje" : ROTULO_GRAV[p.chave]) : "");
      if (minha) { botao.querySelector("span").textContent = p.chave === "primeira" ? "Gravado" : "Gravar de novo"; if (p.chave === "primeira") botao.hidden = true; liberar(p.comparar && primeira ? "Ouça as duas. Essa diferença é sua." : "Guardado. Você vai ouvir de novo no fim da unidade."); }
    }
    mostrar();
    $("#tr-pular").addEventListener("click", () => { pararRec(); liberar("Tudo bem. Você pode gravar quando refizer esta lição.", false); });
    botao.addEventListener("click", async () => {
      if (rec.mr && rec.mr.state === "recording") return pararRec();
      if (!window.MediaRecorder) { txt.textContent = "Este navegador não grava áudio."; return; }
      try { rec.stream = await window.NaipeMic.abrir(); }
      catch (err) { txt.innerHTML = window.NaipeMic.htmlAviso(err); return; }
      rec.partes = [];
      try { rec.mr = new MediaRecorder(rec.stream); } catch { rec.stream.getTracks().forEach(t => t.stop()); txt.textContent = "Este navegador não grava áudio. Atualize o navegador do celular."; return; }
      rec.mr.ondataavailable = e => { if (e.data.size) rec.partes.push(e.data); };
      rec.mr.onstop = async () => {
        botao.classList.remove("gravando");
        const blob = new Blob(rec.partes, { type: rec.mr.mimeType || "audio/webm" });
        if (blob.size < 800) { txt.textContent = "A gravação ficou vazia. Tente de novo."; return; }
        try { await gravGuardar(p.chave, { blob, data: new Date().toISOString() }); txt.textContent = ""; mostrar(); }
        catch { txt.textContent = "Não consegui guardar a gravação neste aparelho."; }
      };
      rec.mr.start(); botao.classList.add("gravando");
      const limite = p.comparar ? 30 : 12; let seg = 0;
      botao.querySelector("span").textContent = "Parar"; txt.textContent = `Gravando… 0 s de ${limite}`;
      rec.t = setInterval(() => { seg++; txt.textContent = `Gravando… ${seg} s de ${limite}`; if (seg >= limite) pararRec(); }, 1000);
    });
  }

  // ---------- Meu porquê e a música-sonho ----------
  const PORQUES = ["Tocar na igreja", "Tocar para a família e os amigos", "Tocar numa banda ou numa roda", "Realizar um sonho antigo", "Voltar a tocar depois de anos"];
  function renderPorque() {
    limpar();
    raiz().innerHTML = `<div class="tr-licao"><div class="tr-passo">
        <p class="sobretitulo">Antes de começar</p>
        <h2>Por que você quer tocar saxofone?</h2>
        <p>Guardar o seu motivo ajuda nos dias em que o estudo pesa. Ele fica só neste aparelho.</p>
        <div class="tr-opcoes" id="tr-porques">${PORQUES.map(t => `<button type="button" class="${prog.porque === t ? "certa" : ""}">${esc(t)}</button>`).join("")}</div>
        <label class="tr-campo"><span>Ou escreva com as suas palavras</span><input id="tr-porque-livre" type="text" maxlength="80" value="${PORQUES.includes(prog.porque || "") ? "" : esc(prog.porque || "")}"></label>
        <label class="tr-campo"><span>Qual música você sonha em tocar?</span><input id="tr-sonho" type="text" maxlength="60" placeholder="Ex.: Carinhoso" value="${esc(prog.sonho || "")}"></label>
      </div><div class="tr-rodape"><button class="btn primario largo" id="tr-porque-ok" type="button">Guardar e começar</button><button class="link-acao" id="tr-porque-pular" type="button">Prefiro não dizer</button></div></div>`;
    let escolhido = PORQUES.includes(prog.porque || "") ? prog.porque : "";
    raiz().querySelectorAll("#tr-porques button").forEach(b => b.addEventListener("click", () => { escolhido = b.textContent; $("#tr-porque-livre").value = ""; raiz().querySelectorAll("#tr-porques button").forEach(x => x.classList.toggle("certa", x === b)); }));
    $("#tr-porque-livre").addEventListener("input", () => { escolhido = ""; raiz().querySelectorAll("#tr-porques button").forEach(x => x.classList.remove("certa")); });
    const fechar = () => { prog.porqueVisto = true; salvar(); location.hash === "#/trilha" ? renderTrilha() : (location.hash = "#/trilha"); };
    $("#tr-porque-ok").addEventListener("click", () => { prog.porque = $("#tr-porque-livre").value.trim() || escolhido; prog.sonho = $("#tr-sonho").value.trim(); fechar(); });
    $("#tr-porque-pular").addEventListener("click", fechar);
    window.scrollTo(0, 0);
  }

  // ---------- Marco da unidade (imagem para compartilhar) ----------
  const nomeAluno = () => { try { return (JSON.parse(localStorage.getItem("cma.v1") || "{}").nome || "").trim(); } catch { return ""; } };
  const unidadeCompleta = n => UNIDADES[n].licoes.every(l => prog.feitas[l.id]);
  function quebrar(c, texto, larg) {
    const linhas = []; let atual = "";
    texto.split(" ").forEach(pal => { const t = atual ? atual + " " + pal : pal; if (c.measureText(t).width > larg && atual) { linhas.push(atual); atual = pal; } else atual = t; });
    if (atual) linhas.push(atual);
    return linhas;
  }
  async function desenharMarco(n) {
    try { await Promise.all([document.fonts.load('600 120px "Outfit"'), document.fonts.load('700 60px "Figtree"')]); } catch { /* usa a fonte do sistema */ }
    const L = 1080, A = 1350, cv = document.createElement("canvas"); cv.width = L; cv.height = A;
    const c = cv.getContext("2d"), corpo = '"Figtree", system-ui, sans-serif';
    const g = c.createLinearGradient(0, 0, L, A); g.addColorStop(0, "#0b241b"); g.addColorStop(1, "#16483a"); c.fillStyle = g; c.fillRect(0, 0, L, A);
    c.strokeStyle = "#d9a547"; c.lineWidth = 4; c.strokeRect(44, 44, L - 88, A - 88);
    c.textAlign = "center"; c.fillStyle = "#f2c14e"; c.font = '600 128px "Outfit", ' + corpo; c.fillText("naipe", L / 2, 250);
    c.fillStyle = "#d9a547"; c.font = "700 30px " + corpo; c.fillText(UNIDADES[n].pilar ? `A P R O F U N D A R   ·   ${UNIDADES[n].pilar.toUpperCase().split("").join(" ")}` : `M A R C O   ·   U N I D A D E   ${n + 1}`, L / 2, 400);
    c.fillStyle = "#f4efe3"; c.font = "700 76px " + corpo;
    const linhas = quebrar(c, UNIDADES[n].marco, L - 220); let y = 640 - (linhas.length - 1) * 48;
    linhas.forEach(l => { c.fillText(l, L / 2, y); y += 96; });
    c.fillStyle = "#d9a547"; c.fillRect(L / 2 - 60, y - 20, 120, 4);
    const data = prog.marcos && prog.marcos[n] ? prog.marcos[n] : new Date().toISOString();
    c.fillStyle = "#f4efe3"; c.font = "600 44px " + corpo; c.fillText(nomeAluno() || "Estudante de saxofone", L / 2, y + 80);
    c.fillStyle = "#b9c4bd"; c.font = "500 34px " + corpo; c.fillText(dataCurta(data), L / 2, y + 134);
    if (prog.sonho) { c.font = "500 34px " + corpo; quebrar(c, `A caminho de “${prog.sonho}”`, L - 240).forEach((l, i) => c.fillText(l, L / 2, y + 230 + i * 46)); }
    c.fillStyle = "#d9a547"; c.font = "600 34px " + corpo; c.fillText("naipesax.com.br   ·   @naipesax", L / 2, A - 120);
    return cv;
  }
  async function renderMarco(n) {
    limpar();
    if (!UNIDADES[n] || !unidadeCompleta(n)) return renderTrilha();
    raiz().innerHTML = `<div class="tr-licao"><div class="tr-topo"><a class="tr-fechar" href="${UNIDADES[n].plano ? "#/estudo" : "#/trilha"}" aria-label="Voltar">✕</a><span class="tr-conta">Meu marco · ${UNIDADES[n].pilar ? esc(UNIDADES[n].pilar) : `Unidade ${n + 1}`}</span></div><div class="tr-passo tr-marco"><p class="mudo" id="tr-marco-espera">Preparando a imagem…</p></div><div class="tr-rodape"><button class="btn primario largo" id="tr-marco-enviar" type="button" disabled>Compartilhar meu marco</button><a class="btn largo" href="${UNIDADES[n].plano ? "#/estudo" : "#/trilha"}">Voltar</a></div></div>`;
    const cv = await desenharMarco(n);
    if (!$("#tr-marco-espera")) return;
    const blob = await new Promise(ok => cv.toBlob(ok, "image/png"));
    const u = URL.createObjectURL(blob); urls.push(u);
    raiz().querySelector(".tr-marco").innerHTML = `<img src="${u}" alt="${esc(UNIDADES[n].marco)}" width="1080" height="1350">`;
    const b = $("#tr-marco-enviar"); b.disabled = false;
    b.addEventListener("click", async () => {
      const arq = new File([blob], `naipe-marco-unidade-${n + 1}.png`, { type: "image/png" });
      try { if (navigator.canShare && navigator.canShare({ files: [arq] })) { await navigator.share({ files: [arq], text: `${UNIDADES[n].marco} #naipesax` }); return; } }
      catch (e) { if (e && e.name === "AbortError") return; }
      const a = document.createElement("a"); a.href = u; a.download = arq.name; document.body.appendChild(a); a.click(); a.remove();
    });
    window.scrollTo(0, 0);
  }

  async function htmlAntesDepois() {
    const itens = [];
    for (const k of ["primeira", "u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12", "u13", "u14", "u15", "u16", "s4", "s8", "s12"]) { const g = await gravLer(k); if (g) itens.push(htmlAudio(g, ROTULO_GRAV[k])); }
    return itens.length ? `<section class="cartao tr-antes"><span class="rotulo">Meu antes e depois</span>${itens.join("")}</section>` : "";
  }

  function concluir() {
    if (REVISAR) { // revisão: não mexe no progresso de ninguém
      const lr = sessao.licao, prox = LICOES[LICOES.indexOf(lr) + 1], t = lr.titulo; limpar(); sessao = null;
      raiz().innerHTML = `<div class="tr-licao tr-fim"><div class="tr-passo"><p class="sobretitulo">Fim da lição · revisão</p><h2>${esc(t)}</h2><p class="mudo">No modo de revisão o progresso não é salvo.</p></div><div class="tr-rodape">${prox ? `<a class="btn primario largo" href="#/trilha/${prox.id}">Próxima: ${esc(prox.titulo)}</a>` : ""}<a class="btn largo" href="${baseDe(lr)}">Voltar</a></div></div>`;
      window.scrollTo(0, 0); return;
    }
    const { licao, erros } = sessao, primeira = !prog.feitas[licao.id];
    const ganho = primeira ? 10 + (erros === 0 ? 5 : 0) : 2;
    prog.feitas[licao.id] = true; prog.pontos += ganho;
    const i = LICOES.indexOf(licao), prox = LICOES[i + 1], n = UNIDADES.findIndex(u => u.licoes.includes(licao));
    const fechou = UNIDADES[n].licoes[UNIDADES[n].licoes.length - 1] === licao;
    if (fechou) { prog.marcos = prog.marcos || {}; if (!prog.marcos[n]) prog.marcos[n] = new Date().toISOString(); }
    salvar(); limpar();
    const sonho = prog.sonho ? `<p class="mudo">Mais um passo em direção a “${esc(prog.sonho)}”.</p>` : "";
    raiz().innerHTML = `<div class="tr-licao tr-fim"><div class="tr-passo"><div class="tr-selo">✓</div><p class="sobretitulo">${fechou ? (UNIDADES[n].pilar ? `${esc(UNIDADES[n].pilar)} · unidade completa` : `Unidade ${n + 1} completa`) : "Lição concluída"}</p><h2>${esc(fechou ? UNIDADES[n].marco : licao.titulo)}</h2><p>${erros === 0 ? "Sem nenhum erro." : "Feita. Errar faz parte de aprender a ler."}</p><p class="tr-ganho">+${ganho} pontos de estudo</p>${sonho}</div><div class="tr-rodape">${fechou ? `<a class="btn primario largo" href="#/trilha/marco-${n}">Ver e compartilhar meu marco</a>` : ""}${prox ? `<a class="btn ${fechou ? "" : "primario "}largo" href="#/trilha/${prox.id}">Próxima: ${esc(prox.titulo)}</a>` : ""}<a class="btn largo" href="${baseDe(licao)}">${ehPlano(licao) ? "Voltar para o plano" : "Voltar para a Teoria"}</a></div></div>`;
    sessao = null; window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", () => { if (!/^#\/(trilha|estudo)/.test(location.hash)) limpar(); });
  // Evolução do andamento nos exercícios do plano (para o Diário).
  function evolucaoPlano() {
    const hist = (prog.plano && prog.plano.hist) || {};
    return Object.entries(hist).filter(([, h]) => h.length).map(([k, h]) => {
      const [tid, i] = k.split(":"), tr = TRILHOS[tid], it = tr && tr.itens[Number(i)];
      if (!it || !it[3]) return null;
      return { titulo: `${livroInfo(it[0]).titulo} · ${it[1].split(" · ")[0]}`, trilho: tr.nome, inicial: it[3][0], alvo: it[3][1], pontos: h.map(x => x.b), ultima: h[h.length - 1].d };
    }).filter(Boolean).sort((a, b) => b.ultima.localeCompare(a.ultima)).slice(0, 6);
  }
  // Minutos de estudo registrados em cada módulo do plano.
  function minutosModulo(md) { const m = (prog.plano && prog.plano.min) || {}; let t = 0; for (let w = md.de; w < md.ate; w++) t += m[w] || 0; return t; }
  const horasTxt = min => min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` : `${min} min`;

  window.NaipeTrilha = { render: (id, modo) => (id ? renderLicao(id) : renderTrilha(modo)), inicio: cartaoInicio, aba: abaDe, usos: usosDoLivro, evolucao: evolucaoPlano };
})();
