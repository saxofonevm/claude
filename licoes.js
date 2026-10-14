/*
 * CONTEÚDO DAS LIÇÕES — edite este arquivo para mudar o que os alunos veem.
 *
 * Cada lição tem:
 *   id        identificador único (sem espaços; não mude depois de publicar,
 *             senão o progresso dos alunos naquela lição se perde)
 *   nivel     "Iniciante", "Intermediário" ou "Avançado"
 *   titulo    nome da lição
 *   resumo    uma frase curta que aparece na lista
 *   objetivos lista do que o aluno deve conseguir fazer
 *   exercicios lista de passos de prática
 *   materiais  lista de links: { tipo: "video" | "partitura" | "audio" | "link", titulo, url }
 *              Pode ser um link externo (YouTube, Google Drive) ou um arquivo
 *              colocado na pasta "materiais/", ex.: url: "materiais/escala-do.pdf"
 */
window.LICOES = [
  {
    id: "postura-embocadura",
    nivel: "Iniciante",
    titulo: "Postura e embocadura",
    resumo: "Montar o sax, segurar corretamente e formar a embocadura.",
    objetivos: [
      "Montar o saxofone e posicionar a palheta na boquilha",
      "Manter postura relaxada, sentado e em pé",
      "Formar a embocadura e produzir um som estável só com a boquilha"
    ],
    exercicios: [
      "Monte e desmonte o instrumento 3 vezes, com calma",
      "Só boquilha: sustente uma nota por 5 segundos, 10 vezes",
      "Em frente ao espelho, confira ombros soltos e cabeça reta"
    ],
    materiais: []
  },
  {
    id: "respiracao-notas-longas",
    nivel: "Iniciante",
    titulo: "Respiração e notas longas",
    resumo: "Respiração diafragmática e controle do ar.",
    objetivos: [
      "Respirar pelo diafragma sem levantar os ombros",
      "Sustentar uma nota com volume e afinação constantes"
    ],
    exercicios: [
      "Inspire em 4 tempos, expire em 8 (sem o sax), 5 vezes",
      "Notas longas em Sol, Lá e Si: 8 tempos cada, metrônomo a 60",
      "Repita fazendo crescendo e diminuendo"
    ],
    materiais: []
  },
  {
    id: "primeiras-notas",
    nivel: "Iniciante",
    titulo: "Primeiras notas: Si, Lá, Sol",
    resumo: "Digitação da mão esquerda e primeiras melodias.",
    objetivos: [
      "Tocar Si, Lá e Sol com som limpo",
      "Trocar entre as notas sem interromper o ar"
    ],
    exercicios: [
      "Si – Lá – Sol – Lá – Si, devagar, 10 vezes",
      "Leia e toque melodias simples usando só essas três notas",
      "Grave-se tocando e ouça: o som está igual nas três notas?"
    ],
    materiais: []
  },
  {
    id: "escala-do-maior",
    nivel: "Iniciante",
    titulo: "Escala de Dó maior",
    resumo: "Primeira escala completa, subindo e descendo.",
    objetivos: [
      "Tocar a escala de Dó maior em uma oitava, de memória",
      "Manter pulsação estável com metrônomo"
    ],
    exercicios: [
      "Escala em semínimas, metrônomo a 60",
      "Quando estiver limpa, suba para 72 e depois 80",
      "Toque em terças: Dó-Mi, Ré-Fá, Mi-Sol..."
    ],
    materiais: []
  },
  {
    id: "articulacao",
    nivel: "Intermediário",
    titulo: "Articulação: legato e staccato",
    resumo: "Uso da língua para dar forma às notas.",
    objetivos: [
      "Diferenciar legato, staccato e acentos",
      "Articular com a ponta da língua sem mexer a mandíbula"
    ],
    exercicios: [
      "Escala de Dó toda ligada, depois toda em staccato",
      "Padrão 2 ligadas + 2 articuladas na escala",
      "Notas repetidas em colcheias (\"ta-ta-ta\") a 80 bpm"
    ],
    materiais: []
  },
  {
    id: "escalas-sol-fa",
    nivel: "Intermediário",
    titulo: "Escalas de Sol e Fá maior",
    resumo: "Primeiros sustenidos e bemóis.",
    objetivos: [
      "Tocar Sol maior (Fá#) e Fá maior (Sib) em uma oitava",
      "Conhecer as digitações alternativas de Sib"
    ],
    exercicios: [
      "Cada escala subindo e descendo, metrônomo a 72",
      "Arpejo de cada escala (1-3-5-8)",
      "Toque uma melodia conhecida nas duas tonalidades"
    ],
    materiais: []
  },
  {
    id: "registro-agudo",
    nivel: "Intermediário",
    titulo: "Registro agudo e chave de oitava",
    resumo: "Passagem entre os registros grave e médio/agudo.",
    objetivos: [
      "Usar a chave de oitava sem \"quebrar\" o som",
      "Tocar a escala de Dó em duas oitavas"
    ],
    exercicios: [
      "Saltos de oitava: Sol grave → Sol médio, devagar",
      "Notas longas no registro agudo com o mesmo apoio de ar",
      "Escala de Dó em duas oitavas, metrônomo a 60"
    ],
    materiais: []
  },
  {
    id: "escala-blues",
    nivel: "Avançado",
    titulo: "Escala blues e improvisação",
    resumo: "Primeiros passos para improvisar.",
    objetivos: [
      "Tocar a escala blues em Sol e Dó",
      "Criar frases curtas sobre uma base de blues"
    ],
    exercicios: [
      "Escala blues subindo e descendo, com swing",
      "Pergunta e resposta: invente uma frase de 2 compassos e responda a ela",
      "Improvise 5 minutos sobre uma base de blues usando só 3 notas da escala"
    ],
    materiais: []
  },
  {
    id: "vibrato-expressao",
    nivel: "Avançado",
    titulo: "Vibrato e expressão",
    resumo: "Vibrato de mandíbula e dinâmica musical.",
    objetivos: [
      "Produzir vibrato regular e controlado",
      "Aplicar dinâmicas e vibrato numa balada"
    ],
    exercicios: [
      "Vibrato com metrônomo a 60: 2, 3 e depois 4 ondulações por tempo",
      "Notas longas começando retas e terminando com vibrato",
      "Toque uma balada lenta prestando atenção às dinâmicas"
    ],
    materiais: []
  }
];
