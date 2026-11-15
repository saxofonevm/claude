/*
 * Naipe — Trilha "Aprender" (protótipo da Unidade 1)
 * Lições curtas em passos: ler, ritmo, ouvir e tocar (o app escuta pelo microfone).
 * Fica em #/trilha e #/trilha/<lição>. O progresso é salvo em localStorage "naipe.trilha.v1".
 */
(function () {
  "use strict";

  // ---------- Versão de teste ----------
  // naipesax.com.br/?beta=1 liga a nova organização (aba Aprender); ?beta=0 desliga.
  try {
    const q = new URLSearchParams(location.search).get("beta");
    if (q === "1") localStorage.setItem("naipe.beta", "1");
    if (q === "0") localStorage.removeItem("naipe.beta");
  } catch { /* sem armazenamento */ }
  let BETA = false;
  try { BETA = localStorage.getItem("naipe.beta") === "1"; } catch { /* segue desligado */ }
  window.NAIPE_BETA = BETA;
  if (BETA) {
    document.documentElement.classList.add("beta");
    const aba = document.querySelector('.abas a[data-aba="metodos"]');
    if (aba) { aba.href = "#/trilha"; aba.dataset.aba = "trilha"; aba.innerHTML = '<span data-icone="nota"></span>Aprender'; const pil = document.querySelector('.abas a[data-aba="raizes"]'); if (pil) pil.parentNode.insertBefore(aba, pil); }
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
  };
  const P = "pausa"; // pausa na pauta e nas melodias

  // Melodias originais: [nota ou pausa, tempos]
  const PRIMEIRO_PASSO = [["si", 2], ["la", 2], ["sol", 4], ["si", 1], ["si", 1], ["la", 1], ["la", 1], ["sol", 4]];
  const CAMINHO_DE_CASA = [["sol", 1], ["la", 1], ["si", 1], ["do", 1], ["si", 2], ["sol", 1], [P, 1], ["fa", 1], ["mi", 1], ["re", 1], ["mi", 1], ["sol", 4]];

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
            { tipo: "info", titulo: "A música em fatias", texto: ["As barras verticais dividem a música em compassos. Aqui, cada compasso tem 4 tempos.", "Contar “1, 2, 3, 4” e recomeçar a cada barra ajuda a não se perder."], pauta: [["sol", 2], ["la", 2], ["si", 1], ["si", 1], ["la", 2]], compassos: true },
            { tipo: "escolha", pergunta: "Quantos tempos cabem em cada compasso desta música?", pauta: [["sol", 2], ["la", 2], ["si", 4]], compassos: true, opcoes: ["Dois", "Três", "Quatro"], certa: 2 },
            { tipo: "info", titulo: "A pausa de semínima", texto: ["Silêncio também é música. Este sinal é a pausa de semínima: um tempo sem som.", "Na pausa o pulso continua. Você conta, mas não toca."], pauta: [["sol", 1], [P, 1], ["sol", 1], [P, 1]] },
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
            { tipo: "info", titulo: "O jeito Naipe de ler", texto: ["Diante de uma frase nova, siga sempre a mesma ordem: bata o ritmo, diga o nome das notas e só então toque.", "Parece mais lento. Na prática você acerta antes."], pauta: [["sol", 1], ["fa", 1], ["mi", 2]] },
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
  ];
  const LICOES = UNIDADES.flatMap(u => u.licoes);
  const PROXIMAS = ["Unidade 3 · Colcheias e ligaduras", "Unidade 4 · A escala de Sol maior e o Fá sustenido", "Unidade 5 · Sua primeira música brasileira"];

  // ---------- Estado ----------
  const CHAVE = "naipe.trilha.v1";
  let prog = { feitas: {}, pontos: 0 };
  try { prog = Object.assign(prog, JSON.parse(localStorage.getItem(CHAVE) || "{}")); } catch { /* sem armazenamento */ }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(prog)); } catch { /* segue sem salvar */ } };
  const saxDoApp = () => { try { return (JSON.parse(localStorage.getItem("cma.v1") || "{}").sax) || prog.sax || ""; } catch { return prog.sax || ""; } };

  const $ = s => document.querySelector(s);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const raiz = () => $("#trilha-conteudo");

  // ---------- Desenhos ----------
  const CLAVE = "M12.6 47.5c-2.9 0-5-1.7-5-4 0-1.6 1.2-2.8 2.7-2.8 1.4 0 2.5 1 2.5 2.4 0 1.2-.8 2-1.9 2.2.5.5 1.2.7 2 .7 2.6 0 4-2 3.6-5.6l-.5-4.2c-.9.2-1.9.3-2.9.3-5.300 0-9.5-3.900-9.500-9 0-4.200 2.700-7.300 6.200-10.600l2.300-2.200c-.4-2.400-.6-4-.6-5.800 0-3.900 1.900-7.600 4.600-8.900 1.600 2 2.600 5 2.600 7.800 0 4-1.900 7.100-4.800 10l.900 5.300c.3 0 .7-.1 1-.1 4 0 6.900 3 6.900 6.800 0 3.200-2 5.800-5.200 6.900l.5 4.100c.6 4.700-1.700 7.700-5.400 7.700zm3.100-13.300l-1.300-9.400c-2.300.4-3.800 2.200-3.800 4.200 0 1.400.7 2.500 1.900 3.200-.2.300-.4.500-.6.600-2-1-3.200-2.900-3.200-5.100 0-3.100 2.200-5.600 5.300-6.200l-.7-4.600-1.700 1.600c-3 2.900-5 5.400-5 8.700 0 4.100 3.300 7.300 7.500 7.300.6 0 1.100-.1 1.600-.3zm1.200-9.400l1.200 8.800c2.200-.9 3.600-2.800 3.600-4.900 0-2.200-1.800-3.900-4.800-3.900zm-1.600-9.900c2.300-2.300 3.900-4.900 3.900-7.700 0-1.300-.4-2.600-1.100-3.300-1.900 1-3.300 3.700-3.300 7 0 1.300.2 2.700.5 4z";

  // Pauta com notas: itens = [[nota, tempos], ...]. destaque = índice da nota ativa.
  function svgPauta(itens, { rotulos = false, destaque = -1, compassos = false, minLarg = 220 } = {}) {
    const larg = Math.max(minLarg, 70 + itens.length * 46 + 16);
    let x = 74, tempos = 0, corpo = "";
    itens.forEach(([n, t], i) => {
      if (n === P) {
        corpo += `<path class="tr-pausa${i === destaque ? " ativa" : ""}" d="M${x - 3} 36l6 8-5 6 6 8c-5-2-9 0-6 6-6-4-7-9-2-12l-5-7 5-5z"/>`;
        tempos += t; x += 46;
        if (compassos && tempos % 4 === 0 && i < itens.length - 1) corpo += `<line x1="${x - 20}" y1="30" x2="${x - 20}" y2="70" class="tr-barra"/>`;
        return;
      }
      const nt = NOTA[n], y = 70 - nt.passo * 5, cheio = t === 1, cls = i === destaque ? "tr-nota ativa" : i < destaque ? "tr-nota feita" : "tr-nota";
      corpo += `<g class="${cls}"><ellipse cx="${x}" cy="${y}" rx="6.6" ry="4.7" transform="rotate(-20 ${x} ${y})" ${cheio ? "" : 'fill="none" stroke-width="2"'} class="${cheio ? "cab cheia" : "cab oca"}"/>${t < 4 ? `<line x1="${x + 6}" y1="${y - 1.5}" x2="${x + 6}" y2="${y - 32}" class="haste"/>` : ""}${rotulos ? `<text x="${x}" y="98" text-anchor="middle" class="tr-rot">${nt.nome}</text>` : ""}</g>`;
      tempos += t; x += 46;
      if (compassos && tempos % 4 === 0 && i < itens.length - 1) { corpo += `<line x1="${x - 20}" y1="30" x2="${x - 20}" y2="70" class="tr-barra"/>`; }
    });
    const linhas = [30, 40, 50, 60, 70].map(y => `<line x1="6" y1="${y}" x2="${larg - 6}" y2="${y}"/>`).join("");
    return `<svg class="tr-pauta" viewBox="0 0 ${larg} ${rotulos ? 106 : 92}" role="img" aria-label="Pauta musical"><g class="tr-linhas">${linhas}<line x1="${larg - 6}" y1="30" x2="${larg - 6}" y2="70"/></g><path class="tr-clave" transform="translate(12 13.5) scale(1.42)" d="${CLAVE}"/>${corpo}</svg>`;
  }

  // Melodia longa: quebra em linhas de 2 compassos para as notas ficarem legíveis.
  function svgMelodia(mel, destaque = -1) {
    const linhas = []; let atual = [], tempos = 0, base = 0;
    mel.forEach((it, i) => { atual.push(it); tempos += it[1]; if (tempos >= 8 || i === mel.length - 1) { linhas.push({ itens: atual, base }); base = i + 1; atual = []; tempos = 0; } });
    const minLarg = Math.max(...linhas.map(l => 70 + l.itens.length * 46 + 16));
    return linhas.map(l => svgPauta(l.itens, { compassos: true, minLarg, destaque: destaque >= l.base && destaque < l.base + l.itens.length ? destaque - l.base : destaque >= l.base + l.itens.length ? 99 : -1 })).join("");
  }

  // Saxofone desenhado (o mesmo traço da marca), com as chaves fechadas acesas.
  function svgSax(n) {
    const nt = NOTA[n];
    return `<svg class="tr-sax-des" viewBox="0 0 150 250" aria-hidden="true"><g transform="translate(8 6) scale(2.55)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g class="corpo" stroke-width="9"><path d="M8 8 L16 12 C22 15 24 19 24 25 L24 66 C24 88 46 88 46 66 L46 56"/><path d="M39 54 Q46 59 52 50"/></g><path class="brilho" stroke-width="1.6" d="M21.4 26 L21.4 66"/></g><rect class="boquilha" x="14" y="14" width="26" height="12" rx="5" transform="rotate(27 27 20)"/>${nt.chaves.map((f, i) => `<circle cx="69.2" cy="${80 + i * 17.5 + (i > 2 ? 9 : 0)}" r="7.4" class="${f ? "chave fechada" : "chave"}"/>`).join("")}</svg>`;
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
  const somReal = midi => midi - (saxDoApp() === "Sib" ? 14 : 9);
  function tom(midi, quando, dur) {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (somReal(midi) - 69) / 12);
    g.gain.setValueAtTime(0.0001, quando); g.gain.exponentialRampToValueAtTime(0.25, quando + 0.03); g.gain.setValueAtTime(0.25, quando + dur - 0.08); g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
    o.connect(g).connect(a.destination); o.start(quando); o.stop(quando + dur + 0.02);
  }

  // ---------- Microfone ----------
  const mic = { stream: null, an: null, buf: null, raf: 0 };
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
    if (mic.stream) return true;
    try {
      mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch { return false; }
    const a = audio();
    mic.an = a.createAnalyser(); mic.an.fftSize = 2048; mic.buf = new Float32Array(2048);
    a.createMediaStreamSource(mic.stream).connect(mic.an);
    return true;
  }
  function desligarMic() {
    cancelAnimationFrame(mic.raf);
    if (mic.stream) mic.stream.getTracks().forEach(t => t.stop());
    mic.stream = mic.an = null;
  }
  // Classe da nota ouvida, já convertida para a nota ESCRITA do sax (0 = Dó … 11 = Si), ou -1.
  function notaOuvida() {
    if (!mic.an) return -1;
    mic.an.getFloatTimeDomainData(mic.buf);
    const f = detectar(mic.buf, ctx.sampleRate);
    if (!(f > 60 && f < 1600)) return -1;
    const real = Math.round(69 + 12 * Math.log2(f / 440));
    return (((real + (saxDoApp() === "Sib" ? 2 : 9)) % 12) + 12) % 12;
  }

  // ---------- Telas ----------
  let sessao = null; // { licao, i, erros }
  const temporizadores = [];
  function limpar() {
    pararRec(); urls.splice(0).forEach(u => URL.revokeObjectURL(u));
    temporizadores.splice(0).forEach(clearTimeout);
    desligarMic();
    if (ctx && ctx.state === "running") ctx.suspend();
  }

  const completo = () => { try { return !!JSON.parse(localStorage.getItem("cma.v1") || "{}").desbloqueado; } catch { return false; } };

  const ARTE = [
    '<svg viewBox="0 0 120 70" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M14 35h14"/><path d="M40 22q10 13 0 26"/><path d="M54 14q16 21 0 42"/><path d="M68 6q22 29 0 58"/></g><circle cx="98" cy="35" r="7" fill="currentColor"/></svg>',
    '<svg viewBox="0 0 120 70" aria-hidden="true"><g stroke="currentColor" stroke-width="1.6" opacity=".55"><path d="M6 15h108M6 25h108M6 35h108M6 45h108M6 55h108"/></g><g fill="currentColor"><ellipse cx="20" cy="60" rx="6" ry="4.4"/><ellipse cx="34" cy="55" rx="6" ry="4.4"/><ellipse cx="48" cy="50" rx="6" ry="4.4"/><ellipse cx="62" cy="45" rx="6" ry="4.4"/><ellipse cx="76" cy="40" rx="6" ry="4.4"/><ellipse cx="90" cy="35" rx="6" ry="4.4"/><ellipse cx="104" cy="30" rx="6" ry="4.4"/></g></svg>',
  ];
  const CORES = [["#5b8def", "#2b4a8f"], ["#3fbf8f", "#1d6b4f"]];
  const DESVIO = [8, 44, 64, 44, 8, 28];

  function htmlCaminho(u, n, atual, paga) {
    const passo = 92, pts = u.licoes.map((l, k) => [DESVIO[k % DESVIO.length] + 30, 46 + k * passo]);
    const curva = pts.map((pt, k) => k === 0 ? `M${pt[0]} ${pt[1]}` : `C${pts[k - 1][0]} ${pts[k - 1][1] + passo / 2} ${pt[0]} ${pt[1] - passo / 2} ${pt[0]} ${pt[1]}`).join(" ");
    return `<ol class="tr-caminho" style="height:${u.licoes.length * passo}px"><svg class="tr-fio" viewBox="0 0 120 ${u.licoes.length * passo}" preserveAspectRatio="none" aria-hidden="true"><path d="${curva}"/></svg>${u.licoes.map((l, k) => {
      const i = LICOES.indexOf(l), feita = !!prog.feitas[l.id], aberta = !paga && (feita || i === atual || atual === -1), ehAtual = aberta && !feita;
      const miolo = `<span class="tr-no" style="left:${DESVIO[k % DESVIO.length]}px">${feita ? "✓" : ehAtual ? "▶" : paga ? "★" : i + 1}</span><span class="tr-lic-txt"><strong>${esc(l.titulo)}</strong><small>${esc(l.resumo)}</small>${ehAtual ? `<em>Começar</em>` : ""}</span>`;
      return `<li class="${feita ? "feita" : ehAtual ? "atual" : "fechada"}" style="top:${k * passo}px">${aberta ? `<a href="#/trilha/${l.id}">${miolo}</a>` : `<div>${miolo}</div>`}</li>`;
    }).join("")}</ol>`;
  }

  function renderTrilha() {
    if (!prog.porqueVisto) return renderPorque();
    limpar(); sessao = null;
    const atual = LICOES.findIndex(l => !prog.feitas[l.id]);
    const unidades = UNIDADES.map((u, n) => {
      const feitas = u.licoes.filter(l => prog.feitas[l.id]).length;
      const paga = n > 0 && !completo(), cor = CORES[n % CORES.length];
      return `<section class="tr-unidade" style="--u1:${cor[0]};--u2:${cor[1]}">
          <div class="tr-faixa"><div><span class="rotulo">Unidade ${n + 1}${n === 0 ? " · gratuita" : ""}</span><h2>${esc(u.titulo)}</h2><span class="tr-conta">${feitas} de ${u.licoes.length} lições</span></div><span class="tr-arte">${ARTE[n % ARTE.length]}</span><div class="tr-barra-prog"><span style="width:${Math.round(feitas / u.licoes.length * 100)}%"></span></div></div>
          ${paga ? `<p class="mudo tr-paga">Esta unidade faz parte do Naipe completo. A Unidade 1 é livre para você experimentar.</p>` : ""}
          ${htmlCaminho(u, n, atual, paga)}
          ${unidadeCompleta(n) ? `<a class="btn tr-ver-marco" href="#/trilha/marco-${n}">Meu marco desta unidade</a>` : ""}
        </section>`;
    }).join("");
    raiz().innerHTML = `
      <header class="cabecalho">
        ${BETA ? "" : `<a class="btn-voltar" href="#/inicio">‹ Início</a>`}
        <p class="sobretitulo">Aprender · versão de teste</p>
        <h1>Do zero à primeira música</h1>
        <p class="mudo">Lições de 3 a 5 minutos. Você lê, bate o ritmo, ouve e toca. O Naipe escuta o seu sax.</p>
      </header>
      <div class="corpo tr-corpo">
        <section class="cartao tr-porque">${prog.porque || prog.sonho ? `<span class="rotulo">Meu porquê</span>${prog.porque ? `<p class="tr-porque-txt">${esc(prog.porque)}</p>` : ""}${prog.sonho ? `<p class="mudo">Música-sonho: <strong>${esc(prog.sonho)}</strong> · ${LICOES.filter(l => prog.feitas[l.id]).length} de ${LICOES.length} lições já feitas no caminho até ela</p>` : ""}` : `<span class="rotulo">Meu porquê</span><p class="mudo">Diga por que você quer tocar e qual música sonha em tocar.</p>`}<button class="link-acao" id="tr-editar-porque" type="button">${prog.porque || prog.sonho ? "Editar" : "Escrever"}</button></section>
        ${unidades}
        <div id="tr-antes"></div>
        <section class="cartao tr-proximas"><span class="rotulo">Em seguida</span><ul>${PROXIMAS.map(p => `<li>${esc(p)}</li>`).join("")}</ul><p class="mudo">Em construção. Cada unidade termina com uma música.</p></section>
        ${prog.pontos ? `<p class="mudo tr-pontos">${prog.pontos} pontos de estudo nesta trilha</p>` : ""}
      </div>`;
    $("#tr-editar-porque").addEventListener("click", renderPorque);
    htmlAntesDepois().then(h => { const el = $("#tr-antes"); if (el) el.innerHTML = h; });
  }

  // Cartão no Início (só na versão de teste): pergunta de entrada e "continuar a lição".
  function cartaoInicio() {
    if (!BETA) return;
    const pai = document.querySelector(".conteudo-inicio"); if (!pai) return;
    let el = document.getElementById("tr-inicio");
    if (!el) { el = document.createElement("div"); el.id = "tr-inicio"; const ref = pai.querySelector(".percurso-cartao"); pai.insertBefore(el, ref || pai.firstChild); }
    const prox = LICOES.find(l => !prog.feitas[l.id]);
    if (!prog.perfil) {
      el.innerHTML = `<section class="cartao tr-entrada"><span class="rotulo">Para começar</span><h2>Você já toca saxofone?</h2><div class="tr-entrada-ops"><button type="button" data-perfil="zero"><strong>Estou começando do zero</strong><small>Aprender a ler e tocar, passo a passo</small></button><button type="button" data-perfil="toca"><strong>Já toco</strong><small>Organizar o estudo pelos pilares</small></button></div></section>`;
      el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { prog.perfil = b.dataset.perfil; salvar(); if (prog.perfil === "zero") location.hash = "#/trilha"; else cartaoInicio(); }));
    } else if (prox && (prog.perfil === "zero" || Object.keys(prog.feitas).length)) {
      const i = LICOES.indexOf(prox), n = UNIDADES.findIndex(u => u.licoes.includes(prox)), paga = n > 0 && !completo();
      el.innerHTML = paga ? "" : `<a class="cartao tr-continuar" href="#/trilha/${prox.id}"><span class="tr-no">▶</span><span class="tr-lic-txt"><span class="rotulo">Aprender · lição ${i + 1} de ${LICOES.length}</span><strong>${esc(prox.titulo)}</strong><small>${esc(prox.resumo)}</small></span></a>`;
    } else el.innerHTML = "";
  }

  function renderLicao(id) {
    const m = /^marco-(\d+)$/.exec(id);
    if (m) return renderMarco(Number(m[1]));
    const licao = LICOES.find(l => l.id === id);
    if (!licao) return renderTrilha();
    if (UNIDADES.findIndex(u => u.licoes.includes(licao)) > 0 && !completo()) { location.hash = "#/trilha"; return; }
    limpar();
    sessao = { licao, i: 0, erros: 0 };
    passo();
  }

  function moldura(miolo, { botao = "Continuar", pronto = true } = {}) {
    const { licao, i } = sessao;
    raiz().innerHTML = `
      <div class="tr-licao">
        <div class="tr-topo"><a class="tr-fechar" href="#/trilha" aria-label="Sair da lição">✕</a><div class="tr-barra-prog"><span style="width:${Math.round(i / licao.passos.length * 100)}%"></span></div><span class="tr-conta">${i + 1}/${licao.passos.length}</span></div>
        <div class="tr-passo">${miolo}</div>
        <div class="tr-rodape"><p class="tr-retorno" id="tr-retorno" aria-live="polite"></p><button class="btn primario largo" id="tr-avancar" type="button" ${pronto ? "" : "disabled"}>${botao}</button></div>
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
  function limparPasso() { temporizadores.splice(0).forEach(clearTimeout); cancelAnimationFrame(mic.raf); }

  const melodiaAtual = () => (sessao && sessao.licao.melodia) || PRIMEIRO_PASSO;
  const apoio = p => (p.pauta ? svgPauta(p.pauta, { rotulos: p.rotulos, compassos: p.compassos }) : "") + (p.melodia ? svgMelodia(melodiaAtual()) : "") + (p.dedos ? svgDedos(p.dedos) : "") + (p.figuras ? htmlFiguras() : "");

  function passo() {
    const p = sessao.licao.passos[sessao.i];
    ({ info: passoInfo, escolha: passoEscolha, ouvir: passoEscolha, ritmo: passoRitmo, tocar: passoTocar, musica: passoMusica, gravar: passoGravar, pares: passoPares, ondefica: passoOndeFica, digitacao: passoDigitacao })[p.tipo](p);
  }

  function passoInfo(p) {
    moldura(`<h2>${esc(p.titulo)}</h2>${(p.texto || []).map(t => `<p>${esc(t)}</p>`).join("")}${p.lista ? `<ol class="tr-lista">${p.lista.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}${apoio(p)}${p.melodia ? `<button class="btn" id="tr-ouvir" type="button">▶ Ouvir a música</button>` : ""}${p.video ? `<div class="tr-video"><span>▶</span>${esc(p.video)}<small>entra aqui na versão final</small></div>` : ""}`);
    const b = $("#tr-ouvir");
    if (b) b.addEventListener("click", () => { let t = audio().currentTime + 0.1; const bt = 60 / 76; melodiaAtual().forEach(([n, d]) => { if (n !== P) tom(NOTA[n].midi, t, d * bt * 0.95); t += d * bt; }); });
  }

  function passoEscolha(p) {
    moldura(`<h2>${esc(p.pergunta)}</h2>${apoio(p)}${p.tipo === "ouvir" ? `<button class="btn" id="tr-ouvir" type="button">▶ Ouvir</button>` : ""}<div class="tr-opcoes">${p.opcoes.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join("")}</div>`, { botao: "Escolha uma resposta", pronto: false });
    const tocarSons = () => { let t = audio().currentTime + 0.1; p.sons.forEach(n => { tom(NOTA[n].midi, t, 0.9); t += 1.1; }); };
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
    const zonas = []; for (let ps = -1; ps <= 9; ps++) zonas.push(`<rect class="tr-zona" data-p="${ps}" x="66" y="${70 - ps * 5 - 2.5}" width="184" height="5"/>`);
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p><svg class="tr-pauta tr-pauta-toque" viewBox="0 0 260 96" role="img" aria-label="Pauta para tocar"><g class="tr-linhas">${linhas}</g><path class="tr-clave" transform="translate(12 13.5) scale(1.42)" d="${CLAVE}"/><g id="tr-posta"></g>${zonas.join("")}</svg>`, { botao: "Toque na pauta", pronto: false });
    let fim = false;
    raiz().querySelectorAll(".tr-zona").forEach(z => z.addEventListener("click", () => {
      if (fim) return;
      const ps = Number(z.dataset.p), y = 70 - ps * 5, certo = ps === alvo.passo;
      $("#tr-posta").innerHTML = `<ellipse cx="158" cy="${y}" rx="7.4" ry="5.2" transform="rotate(-20 158 ${y})" fill="none" stroke-width="2.2" class="${certo ? "posta certa" : "posta errada"}"/>`;
      if (certo) { fim = true; liberar(`Isso. O ${alvo.nome} fica ${ps % 2 === 0 ? "na " + (ps / 2 + 1) + "ª linha" : ps < 0 ? "logo abaixo da 1ª linha" : "no " + ((ps + 1) / 2) + "º espaço"}.`); }
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
    const bpm = 72, bt = 60 / bpm, total = p.padrao.reduce((a, b) => a + Math.abs(b), 0);
    const blocos = p.padrao.map(t => t < 0 ? `<span class="silencio" style="flex:${-t}">–<small>pausa</small></span>` : `<span style="flex:${t}">${t}<small>${t === 1 ? "tempo" : "tempos"}</small></span>`).join("");
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${apoio(p)}<div class="tr-ritmo-linha" id="tr-linha">${blocos}<i id="tr-cursor"></i></div><p class="tr-conta-voz" id="tr-voz">Toque em “Começar” e ouça a contagem de 4.</p><button class="tr-bater" id="tr-bater" type="button">Começar</button>`, { botao: "Bata o ritmo", pronto: false });
    const bater = $("#tr-bater"), voz = $("#tr-voz");
    let fase = "espera", inicio = 0, toques = [];
    const esperados = []; p.padrao.reduce((t, d) => { if (d > 0) esperados.push(t); return t + Math.abs(d); }, 0);
    function comecar() {
      const a = audio(); inicio = a.currentTime + 0.15 + 4 * bt; toques = []; fase = "contagem";
      for (let k = 0; k < 4 + total; k++) clique(a.currentTime + 0.15 + k * bt, k % 4 === 0);
      bater.textContent = "Toque aqui"; bater.classList.add("ativo");
      for (let k = 0; k < 4; k++) temporizadores.push(setTimeout(() => { voz.textContent = `Contagem: ${k + 1}`; }, (0.15 + k * bt) * 1000));
      temporizadores.push(setTimeout(() => { fase = "valendo"; voz.textContent = "Agora!"; const c = $("#tr-cursor"); if (c) { c.style.transition = `left ${total * bt}s linear`; c.style.left = "100%"; } }, (0.15 + 4 * bt - 0.2) * 1000));
      temporizadores.push(setTimeout(avaliar, (0.15 + (4 + total) * bt + 0.25) * 1000));
    }
    function avaliar() {
      fase = "espera"; bater.classList.remove("ativo");
      const usados = new Set(); let soma = 0, certos = 0;
      esperados.forEach(e => {
        let melhor = -1, dist = 9;
        toques.forEach((t, i) => { const d = Math.abs(t - e * bt); if (!usados.has(i) && d < dist) { dist = d; melhor = i; } });
        if (melhor >= 0 && dist < 0.28) { usados.add(melhor); certos++; soma += dist; }
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
      audio();
      if (!(await ligarMic())) { $("#tr-ouvindo").textContent = "Não consegui usar o microfone. Libere o acesso nas permissões do navegador."; return; }
      $("#tr-mic").hidden = true; aoLigar();
    });
  }
  const NOMES = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];

  function passoTocar(p) {
    const alvo = p.livre ? null : NOTA[p.nota];
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${p.pauta ? svgPauta(p.pauta) : alvo ? svgPauta([[p.nota, 4]], { rotulos: true }) : ""}${alvo ? svgDedos([p.nota]) : ""}${htmlMic(p)}`, { botao: "Toque para continuar", pronto: false });
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

  function passoMusica(p) {
    const bpm = 66, bt = 60 / bpm, MEL = melodiaAtual();
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p><div id="tr-partitura">${svgMelodia(MEL)}</div><p class="tr-conta-voz" id="tr-voz"></p>${htmlMic(p)}`, { botao: "Toque a música", pronto: false });
    ligarControlesMic(() => {
      const voz = $("#tr-voz"), ouvindo = $("#tr-ouvindo");
      ouvindo.innerHTML = `<button class="btn primario" id="tr-iniciar" type="button">Começar com contagem</button>`;
      $("#tr-iniciar").addEventListener("click", function iniciar() {
        const a = audio(), t0 = a.currentTime + 0.2, total = MEL.reduce((s, [, d]) => s + d, 0);
        for (let k = 0; k < 4 + total; k++) clique(t0 + k * bt, k % 4 === 0);
        ouvindo.textContent = "";
        for (let k = 0; k < 4; k++) temporizadores.push(setTimeout(() => { voz.textContent = `Contagem: ${k + 1}`; }, (0.2 + k * bt) * 1000));
        const inicio = t0 + 4 * bt; let pos = 0; const janelas = MEL.map(([n, d]) => { const j = { n, de: pos * bt, ate: (pos + d) * bt, bons: 0, quadros: 0 }; pos += d; return j; });
        let atual = -1;
        (function quadro() {
          if (!$("#tr-partitura")) return;
          const t = audio().currentTime - inicio;
          if (t >= total * bt) return fim();
          if (t >= 0) {
            const i = janelas.findIndex(j => t >= j.de && t < j.ate);
            if (i !== atual) { atual = i; $("#tr-partitura").innerHTML = svgMelodia(MEL, i); voz.textContent = MEL[i][0] === P ? "pausa" : NOTA[MEL[i][0]].nome; }
            const j = janelas[i];
            if (j.n !== P && t - j.de > 0.12) { j.quadros++; if (notaOuvida() === NOTA[j.n].midi % 12) j.bons++; }
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
  const ROTULO_GRAV = { primeira: "Meu primeiro som", u1: "Primeiro Passo", u2: "Caminho de Casa" };

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
      try { rec.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
      catch { txt.textContent = "Não consegui usar o microfone. Libere o acesso nas permissões do navegador."; return; }
      rec.partes = []; rec.mr = new MediaRecorder(rec.stream);
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
    c.fillStyle = "#d9a547"; c.font = "700 30px " + corpo; c.fillText(`M A R C O   ·   U N I D A D E   ${n + 1}`, L / 2, 400);
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
    raiz().innerHTML = `<div class="tr-licao"><div class="tr-topo"><a class="tr-fechar" href="#/trilha" aria-label="Voltar para a trilha">✕</a><span class="tr-conta">Meu marco · Unidade ${n + 1}</span></div><div class="tr-passo tr-marco"><p class="mudo" id="tr-marco-espera">Preparando a imagem…</p></div><div class="tr-rodape"><button class="btn primario largo" id="tr-marco-enviar" type="button" disabled>Compartilhar meu marco</button><a class="btn largo" href="#/trilha">Voltar para a trilha</a></div></div>`;
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
    for (const k of ["primeira", "u1", "u2"]) { const g = await gravLer(k); if (g) itens.push(htmlAudio(g, ROTULO_GRAV[k])); }
    return itens.length ? `<section class="cartao tr-antes"><span class="rotulo">Meu antes e depois</span>${itens.join("")}</section>` : "";
  }

  function concluir() {
    const { licao, erros } = sessao, primeira = !prog.feitas[licao.id];
    const ganho = primeira ? 10 + (erros === 0 ? 5 : 0) : 2;
    prog.feitas[licao.id] = true; prog.pontos += ganho;
    const i = LICOES.indexOf(licao), prox = LICOES[i + 1], n = UNIDADES.findIndex(u => u.licoes.includes(licao));
    const fechou = UNIDADES[n].licoes[UNIDADES[n].licoes.length - 1] === licao;
    if (fechou) { prog.marcos = prog.marcos || {}; if (!prog.marcos[n]) prog.marcos[n] = new Date().toISOString(); }
    salvar(); limpar();
    const sonho = prog.sonho ? `<p class="mudo">Mais um passo em direção a “${esc(prog.sonho)}”.</p>` : "";
    raiz().innerHTML = `<div class="tr-licao tr-fim"><div class="tr-passo"><div class="tr-selo">✓</div><p class="sobretitulo">${fechou ? `Unidade ${n + 1} completa` : "Lição concluída"}</p><h2>${esc(fechou ? UNIDADES[n].marco : licao.titulo)}</h2><p>${erros === 0 ? "Sem nenhum erro." : "Feita. Errar faz parte de aprender a ler."}</p><p class="tr-ganho">+${ganho} pontos de estudo</p>${sonho}</div><div class="tr-rodape">${fechou ? `<a class="btn primario largo" href="#/trilha/marco-${n}">Ver e compartilhar meu marco</a>` : ""}${prox ? `<a class="btn ${fechou ? "" : "primario "}largo" href="#/trilha/${prox.id}">Próxima: ${esc(prox.titulo)}</a>` : ""}<a class="btn largo" href="#/trilha">Voltar para a trilha</a></div></div>`;
    sessao = null; window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", () => { if (!/^#\/trilha/.test(location.hash)) limpar(); });
  window.NaipeTrilha = { render: id => (id ? renderLicao(id) : renderTrilha()), inicio: cartaoInicio };
})();
