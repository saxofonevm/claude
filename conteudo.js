/*
 * CMA — Consciência Musical Aplicada
 * CONTEÚDO DO APP — edite este arquivo para mudar o que os alunos veem.
 *
 * ✅ Conteúdo revisado com o professor, raiz por raiz, em 03/11/2026.
 *    Pendente: vídeo do professor sobre setup (raiz Escuta).
 *
 * Estrutura:
 *   RAIZ  → tem várias RAMIFICAÇÕES → cada uma tem EXERCÍCIOS e REFERÊNCIAS
 *
 * Regras importantes:
 *   - Cada "id" deve ser único e não deve mudar depois de publicado
 *     (é ele que guarda o progresso e os prazos do aluno).
 *   - Referência: { titulo, detalhe, busca } abre uma busca no YouTube;
 *                 { titulo, detalhe, url }   abre o link informado.
 *   - Exercício com "andamento": { inicial, alvo } mostra o metrônomo e o
 *     acompanhamento de BPM (estudo devagar, crescendo aos poucos).
 *   - "icone": um destes desenhos: escuta, ritmo, melodia, articulacao,
 *     dinamica, ornamentos.  "cor" é o tom da raiz e "cor2" a variação clara.
 *   - "curto": nome curto usado no diagrama das raízes.
 *   - "frase": frase de destaque da raiz. "porQue": explica por que ela importa.
 *   - "drive": links dos PDFs/pastas do Google Drive desta raiz.
 *     O arquivo precisa estar compartilhado como "Qualquer pessoa com o link".
 */
window.CMA = {
  // Professor que recebe o relatório semanal pelo WhatsApp.
  // whatsapp: só números, com país e DDD (ex.: "5511999998888").
  // Se ficar vazio, o WhatsApp abre e o aluno escolhe o contato.
  professor: { nome: "Tiago Veloso", whatsapp: "" },

  // Frases que aparecem na tela inicial (uma por dia).
  frases: [
    "Pouco todo dia vence muito de vez em quando.",
    "Estude com leveza: tensão não toca bem.",
    "Ouvir é o primeiro passo de qualquer grande músico.",
    "Devagar e limpo hoje, rápido e seguro amanhã.",
    "Toda frase difícil é feita de pedaços fáceis.",
    "Cante antes de tocar: se você consegue cantar, consegue tocar.",
    "Errar estudando é aprender. Errar sem perceber é repetir.",
    "Seu som é a sua assinatura. Cuide dele em cada nota longa.",
    "Música é emoção organizada no tempo.",
    "Constância transforma exercício em música."
  ],

  raizes: [
    // ───────────────────────────── 1. ESCUTA ─────────────────────────────
    {
      id: "escuta",
      titulo: "Escuta",
      icone: "escuta",
      curto: "Escuta",
      cor: "#5b8def",
      cor2: "#9dbcff",
      frase: "Quem aprende a ouvir, aprende a tocar.",
      porQue: "O ouvido é o primeiro instrumento do músico. Quando você sabe exatamente qual som quer, seu corpo encontra o caminho para produzi-lo. Ouvir com atenção treina o gosto, o estilo e a memória musical.",
      resumo: "Referências que inspiram: saxofonistas, estilos e setup.",
      descricao: "Tudo começa pelo ouvido. Antes de tocar, o aluno conhece a sonoridade que quer alcançar: ouve os grandes saxofonistas, compara timbres e entende como o setup (boquilha, palheta, abraçadeira) influencia o som.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "escuta-saxofonistas",
          titulo: "Saxofonistas internacionais",
          descricao: "Ouvir com atenção: timbre, fraseado, respiração e intenção de cada músico.",
          referencias: [
            { titulo: "Charlie Parker", detalhe: "Sax alto · bebop", busca: "Charlie Parker Confirmation" },
            { titulo: "Cannonball Adderley", detalhe: "Sax alto · hard bop / soul jazz", busca: "Cannonball Adderley Autumn Leaves" },
            { titulo: "John Coltrane", detalhe: "Sax tenor e soprano", busca: "John Coltrane Blue Train" },
            { titulo: "Stan Getz", detalhe: "Sax tenor · bossa nova", busca: "Stan Getz Desafinado" },
            { titulo: "Sonny Rollins", detalhe: "Sax tenor", busca: "Sonny Rollins St. Thomas" },
            { titulo: "Michael Brecker", detalhe: "Sax tenor · jazz contemporâneo", busca: "Michael Brecker Naked Soul" }
          ],
          exercicios: [
            {
              id: "esc-01",
              titulo: "Diário de escuta",
              passos: [
                "Escolha um saxofonista da lista e ouça uma música inteira sem fazer mais nada",
                "Anote 3 características do som dele (ex.: brilhante, escuro, aerado, vibrato largo)",
                "Ouça de novo e anote onde ele respira e como começa as frases"
              ]
            },
            {
              id: "esc-02",
              titulo: "Comparar dois timbres",
              passos: [
                "Ouça a mesma música (ou o mesmo estilo) com dois saxofonistas diferentes",
                "Descreva a diferença de timbre, articulação e vibrato entre eles",
                "Escolha qual sonoridade você quer buscar e explique por quê"
              ]
            },
            {
              id: "esc-06",
              titulo: "Cantar junto com a gravação",
              passos: [
                "Escolha um trecho curto (4 a 8 compassos) de um solo ou melodia",
                "Ouça várias vezes e cante junto até acompanhar sem errar",
                "Cante sozinho, sem a gravação, imitando a respiração e a articulação"
              ]
            },
            {
              id: "esc-07",
              titulo: "Tirar de ouvido",
              passos: [
                "Use o mesmo trecho que você já canta",
                "No YouTube, reduza a velocidade para 0,75 (Configurações › Velocidade de reprodução)",
                "Encontre as notas no sax, frase por frase, e toque junto com a gravação",
                "Volte à velocidade normal quando conseguir tocar o trecho inteiro"
              ]
            }
          ]
        },
        {
          id: "escuta-brasil",
          titulo: "Sax brasileiro",
          descricao: "A nossa escola: do choro ao samba-jazz e ao frevo. Ouvir como o sax fala com sotaque brasileiro.",
          referencias: [
            { titulo: "Pixinguinha", detalhe: "Sax tenor · contracantos no choro (1946–1950)", busca: "Pixinguinha Benedito Lacerda Um a Zero" },
            { titulo: "K-Ximbinho", detalhe: "Sax e clarinete · choro", busca: "K-Ximbinho Sonoroso" },
            { titulo: "Zé Bodega", detalhe: "Sax tenor · gafieira", busca: "Zé Bodega sax tenor gafieira" },
            { titulo: "J. T. Meirelles", detalhe: "Sax tenor · samba-jazz (O Som, 1964)", busca: "Meirelles e os Copa 5 O Som" },
            { titulo: "Moacir Santos", detalhe: "Sax barítono e arranjos (Coisas, 1965)", busca: "Moacir Santos Coisas Nanã" },
            { titulo: "Victor Assis Brasil", detalhe: "Sax alto · jazz brasileiro (Desenhos, 1965)", busca: "Victor Assis Brasil Desenhos" },
            { titulo: "Paulo Moura", detalhe: "Sax alto e clarinete · choro e gafieira", busca: "Paulo Moura Tarde de Chuva" },
            { titulo: "Proveta (Nailor Azevedo)", detalhe: "Sax e clarinete · Banda Mantiqueira (Aldeia)", busca: "Banda Mantiqueira Aldeia" },
            { titulo: "Leo Gandelman", detalhe: "Sax · música instrumental brasileira", busca: "Leo Gandelman saxofone" },
            { titulo: "Carlos Malta", detalhe: "Saxes e flautas · Pife Muderno", busca: "Carlos Malta saxofone" },
            { titulo: "Spok", detalhe: "Sax alto · SpokFrevo Orquestra (Passo de Anjo)", busca: "SpokFrevo Orquestra Passo de Anjo" }
          ],
          exercicios: [
            {
              id: "esc-05",
              titulo: "Linha do tempo do sax brasileiro",
              passos: [
                "Ouça um saxofonista brasileiro por semana, seguindo a ordem da lista (do choro ao frevo)",
                "Anote o gênero, o sax que ele toca e o que mais chamou sua atenção no som",
                "Compare com um saxofonista internacional: o que muda no jeito de frasear?"
              ]
            }
          ]
        },
        {
          id: "escuta-estilos",
          titulo: "Estilos e gêneros",
          descricao: "Reconhecer como o sax se comporta em cada gênero musical.",
          referencias: [
            { titulo: "Choro", detalhe: "Pixinguinha e Benedito Lacerda", busca: "Pixinguinha Benedito Lacerda Um a Zero" },
            { titulo: "Bossa nova", detalhe: "Getz/Gilberto", busca: "Getz Gilberto Garota de Ipanema" },
            { titulo: "Swing / Big band", detalhe: "Count Basie Orchestra", busca: "Count Basie Orchestra Shiny Stockings" },
            { titulo: "Soul / Funk", detalhe: "Maceo Parker", busca: "Maceo Parker Pass the Peas" }
          ],
          exercicios: [
            {
              id: "esc-03",
              titulo: "Mapa de gêneros",
              passos: [
                "Ouça uma referência de cada gênero",
                "Para cada uma anote: andamento (lento/médio/rápido), papel do sax (melodia, contracanto, solo) e sensação",
                "Traga suas anotações para a próxima aula"
              ]
            }
          ]
        },
        {
          id: "escuta-setup",
          titulo: "Setup do saxofone",
          descricao: "Boquilha, palheta e abraçadeira: como cada escolha muda o som e qual setup é mais adequado para o seu momento.",
          referencias: [
            { titulo: "Boquilha de ebonite x metal", detalhe: "Diferença de timbre e projeção", busca: "boquilha saxofone ebonite vs metal comparação" },
            { titulo: "Dureza da palheta", detalhe: "Como escolher a numeração", busca: "como escolher palheta saxofone dureza" }
          ],
          exercicios: [
            {
              id: "esc-04",
              titulo: "Conhecer o meu setup",
              passos: [
                "Anote a marca e o modelo da sua boquilha, palheta (com a dureza) e abraçadeira",
                "Toque notas longas e grave 30 segundos do seu som",
                "Compare com as referências e converse com o professor sobre ajustes"
              ]
            }
          ]
        }
      ]
    },

    // ─────────────────────── 2. FIGURAS RÍTMICAS ────────────────────────
    {
      id: "ritmo",
      titulo: "Figuras Rítmicas",
      icone: "ritmo",
      curto: "Ritmo",
      cor: "#ee8a45",
      cor2: "#ffc08f",
      frase: "A nota certa no tempo errado ainda é a nota errada.",
      porQue: "O ritmo é a base de toda música. Quem entende as figuras rítmicas lê com mais facilidade, toca junto com outros músicos com segurança e consegue tocar qualquer gênero com o balanço certo.",
      resumo: "Codificar as rítmicas dentro dos gêneros musicais.",
      descricao: "O aluno aprende a reconhecer, ler e reproduzir as figuras rítmicas típicas de cada gênero. O caminho é sempre: ouvir a referência → bater/cantar o ritmo → escrever (codificar) → tocar no sax.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "ritmo-base",
          titulo: "Figuras e pulsação",
          descricao: "Semibreve, mínima, semínima, colcheia, semicolcheia e pausas, sempre com pulsação estável.",
          referencias: [],
          exercicios: [
            {
              id: "rit-01",
              titulo: "Subdivisão com metrônomo",
              andamento: { inicial: 60, alvo: 100 },
              passos: [
                "Com o metrônomo, bata palmas: 4 semínimas, 8 colcheias, 16 semicolcheias (um compasso cada)",
                "Repita tocando uma única nota no sax (ex.: Sol)",
                "Quando estiver estável, suba o andamento de 5 em 5 bpm"
              ]
            },
            {
              id: "rit-02",
              titulo: "Pausas e contratempo",
              andamento: { inicial: 60, alvo: 92 },
              passos: [
                "Toque só nos contratempos (no 'e' de cada tempo) com o metrônomo marcando os tempos",
                "Alterne um compasso no tempo e um no contratempo",
                "Faça o mesmo com pausas de semicolcheia"
              ]
            }
          ]
        },
        {
          id: "ritmo-samba-choro",
          titulo: "Samba e choro",
          descricao: "Síncope brasileira e a divisão em semicolcheias característica do choro.",
          referencias: [
            { titulo: "Teleco-teco do tamborim", detalhe: "A levada que guia a síncope do samba", busca: "teleco-teco tamborim levada samba" },
            { titulo: "Jacob do Bandolim · Noites Cariocas", detalhe: "Divisão em semicolcheias do choro", busca: "Jacob do Bandolim Noites Cariocas" },
            { titulo: "Choro no sax", detalhe: "Pixinguinha · Um a Zero", busca: "Um a Zero Pixinguinha saxofone" }
          ],
          exercicios: [
            {
              id: "rit-03",
              titulo: "Codificar a síncope",
              andamento: { inicial: 60, alvo: 90 },
              passos: [
                "Ouça a referência e cante a levada do tamborim",
                "Escreva o ritmo no papel (semicolcheia – colcheia – semicolcheia)",
                "Toque o ritmo em uma nota e depois aplique na escala de Dó"
              ]
            }
          ]
        },
        {
          id: "ritmo-baiao",
          titulo: "Baião e forró",
          descricao: "A célula do baião (colcheia pontuada + semicolcheia + colcheia).",
          referencias: [
            { titulo: "Luiz Gonzaga · Baião", detalhe: "A música que batizou o gênero (1946)", busca: "Luiz Gonzaga Baião 1946" },
            { titulo: "Luiz Gonzaga · Asa Branca", detalhe: "Levada de baião", busca: "Luiz Gonzaga Asa Branca" },
            { titulo: "Levada da zabumba", detalhe: "Ouvir e cantar a célula do baião", busca: "levada zabumba baião" }
          ],
          exercicios: [
            {
              id: "rit-04",
              titulo: "Célula do baião",
              andamento: { inicial: 70, alvo: 110 },
              passos: [
                "Cante a levada da zabumba junto com a referência",
                "Escreva a célula rítmica",
                "Toque a célula em notas repetidas e depois em arpejos simples"
              ]
            }
          ]
        },
        {
          id: "ritmo-frevo",
          titulo: "Frevo",
          descricao: "Compasso 2/4, andamento rápido, semicolcheias e síncopes com muita energia: o sax é protagonista no frevo de rua.",
          referencias: [
            { titulo: "Vassourinhas", detalhe: "O frevo de rua mais conhecido", busca: "Vassourinhas frevo orquestra" },
            { titulo: "SpokFrevo Orquestra · Passo de Anjo", detalhe: "Frevo com sax e improviso", busca: "SpokFrevo Orquestra Passo de Anjo" }
          ],
          exercicios: [
            {
              id: "rit-06",
              titulo: "Semicolcheias do frevo",
              andamento: { inicial: 70, alvo: 140 },
              passos: [
                "Ouça Vassourinhas e cante a levada da caixa junto com a gravação",
                "Escreva um compasso típico: semicolcheias com acentos nas síncopes",
                "Toque o ritmo numa nota só, depois na escala de Dó, mantendo o acento",
                "Suba o andamento aos poucos: o frevo pede leveza mesmo rápido"
              ]
            }
          ]
        },
        {
          id: "ritmo-bossa",
          titulo: "Bossa nova",
          descricao: "Colcheias iguais (sem swing), a batida sincopada do violão e um fraseado leve e relaxado.",
          referencias: [
            { titulo: "João Gilberto · Chega de Saudade", detalhe: "A batida do violão que criou a bossa", busca: "João Gilberto Chega de Saudade 1959" },
            { titulo: "Getz/Gilberto · Desafinado", detalhe: "O sax de Stan Getz na bossa nova", busca: "Getz Gilberto Desafinado" }
          ],
          exercicios: [
            {
              id: "rit-07",
              titulo: "Batida da bossa nova",
              andamento: { inicial: 60, alvo: 120 },
              passos: [
                "Ouça João Gilberto e bata a batida: polegar no tempo, dedos nas síncopes",
                "Toque a escala de Fá maior em colcheias iguais, sem swingar",
                "Toque a melodia de uma bossa conhecida (ex.: Corcovado) com som leve e pouca dinâmica",
                "Grave e compare com Stan Getz: as colcheias estão iguais?"
              ]
            }
          ]
        },
        {
          id: "ritmo-swing",
          titulo: "Swing e jazz",
          descricao: "Colcheias swingadas (sensação de tercina) e acentos nos contratempos.",
          referencias: [
            { titulo: "Count Basie · Jumpin' at the Woodside", detalhe: "Sentir a 'balança' das colcheias", busca: "Count Basie Jumpin at the Woodside" },
            { titulo: "Dexter Gordon · Cheese Cake", detalhe: "Colcheias swingadas no sax tenor", busca: "Dexter Gordon Cheese Cake" }
          ],
          exercicios: [
            {
              id: "rit-05",
              titulo: "Colcheias swingadas",
              andamento: { inicial: 80, alvo: 140 },
              passos: [
                "Fale 'du-ba du-ba' sobre o metrônomo nos tempos 2 e 4",
                "Toque a escala de Fá maior em colcheias swingadas",
                "Grave e compare com a referência"
              ]
            }
          ]
        }
      ]
    },

    // ─────────────────────── 3. ESTUDOS MELÓDICOS ───────────────────────
    {
      id: "melodia",
      titulo: "Estudos Melódicos",
      icone: "melodia",
      curto: "Melodia",
      cor: "#33bd8c",
      cor2: "#86e6c2",
      frase: "Devagar se vai longe: o andamento lento é onde o som nasce.",
      porQue: "Escalas, intervalos e arpejos são o vocabulário da música. Estudar devagar, cantando e fatiando as frases, grava o caminho certo nos dedos e no ouvido, e a velocidade vem como consequência.",
      resumo: "Músicas, escalas, intervalos e arpejos, com leveza e devagar.",
      descricao: "O aluno entende a importância de estudar e aplicar o estudo melódico. Método: cantarolar a frase → fatiar em pedaços pequenos → tocar devagar → aumentar o andamento gradativamente até o alvo.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "melodia-metodo",
          titulo: "Como estudar uma frase",
          descricao: "O método CMA para qualquer melodia.",
          referencias: [
            { titulo: "Stan Getz · Corcovado", detalhe: "Melodia cantável para cantarolar e fatiar", busca: "Stan Getz Corcovado" },
            { titulo: "Sonny Rollins · St. Thomas", detalhe: "Tema curto e fácil de memorizar", busca: "Sonny Rollins St. Thomas" }
          ],
          exercicios: [
            {
              id: "mel-01",
              titulo: "Cantarolar, fatiar e acelerar",
              andamento: { inicial: 50, alvo: 100 },
              passos: [
                "Cantarole a frase inteira até ela ficar na memória",
                "Fatie a frase em pedaços de 2 a 4 notas",
                "Toque cada pedaço bem devagar, sem erros, 3 vezes seguidas",
                "Junte os pedaços e suba o metrônomo de 4 em 4 bpm só quando estiver limpo"
              ]
            }
          ]
        },
        {
          id: "melodia-escalas",
          titulo: "Escalas",
          descricao: "Escalas maiores e menores em toda a extensão do instrumento.",
          referencias: [
            { titulo: "Ciclo das quintas", detalhe: "A ordem das tonalidades", busca: "ciclo das quintas explicação" },
            { titulo: "Escalas menores", detalhe: "Natural, harmônica e melódica", busca: "escala menor natural harmônica melódica explicação" }
          ],
          exercicios: [
            {
              id: "mel-02",
              titulo: "Escalas maiores (Dó, Sol, Fá)",
              andamento: { inicial: 60, alvo: 120 },
              passos: [
                "Toque cada escala subindo e descendo em semínimas",
                "Depois em colcheias, mantendo o som igual em toda a extensão",
                "Suba o andamento aos poucos até o alvo"
              ]
            },
            {
              id: "mel-03",
              titulo: "Escalas em todas as tonalidades",
              andamento: { inicial: 60, alvo: 120 },
              passos: [
                "Siga o ciclo das quintas: Dó, Fá, Sib, Mib, Láb...",
                "Cante a escala antes de tocar",
                "Anote no diário quais tonalidades ainda estão difíceis"
              ]
            },
            {
              id: "mel-07",
              titulo: "Escalas menores (natural, harmônica e melódica)",
              andamento: { inicial: 60, alvo: 120 },
              passos: [
                "Comece por Lá menor: toque a natural, depois a harmônica (7º grau elevado) e a melódica (6º e 7º graus elevados na subida)",
                "Cante cada uma antes de tocar e perceba a diferença de cor",
                "Repita em Mi menor e Ré menor, depois siga o ciclo das quintas"
              ]
            },
            {
              id: "mel-08",
              titulo: "Escala cromática",
              andamento: { inicial: 60, alvo: 120 },
              passos: [
                "Toque a cromática da nota mais grave à mais aguda que você alcança, em semínimas",
                "Use os dedilhados cromáticos corretos (sem arrastar dedos) e mantenha o som igual",
                "Depois em colcheias e semicolcheias, subindo o andamento aos poucos"
              ]
            }
          ]
        },
        {
          id: "melodia-intervalos",
          titulo: "Intervalos",
          descricao: "Reconhecer e tocar intervalos com afinação e controle.",
          referencias: [
            { titulo: "Treino de ouvido: intervalos", detalhe: "Exercício online (musictheory.net)", url: "https://www.musictheory.net/exercises/ear-interval" },
            { titulo: "Intervalos com músicas conhecidas", detalhe: "Associe cada intervalo a uma melodia", busca: "intervalos musicais músicas para reconhecer" }
          ],
          exercicios: [
            {
              id: "mel-04",
              titulo: "Terças e quartas na escala",
              andamento: { inicial: 60, alvo: 110 },
              passos: [
                "Escala em terças: Dó-Mi, Ré-Fá, Mi-Sol...",
                "Escala em quartas: Dó-Fá, Ré-Sol, Mi-Lá...",
                "Cante cada intervalo antes de tocar"
              ]
            }
          ]
        },
        {
          id: "melodia-arpejos",
          titulo: "Arpejos",
          descricao: "Tríades e tétrades: a base da harmonia aplicada à melodia.",
          referencias: [
            { titulo: "John Coltrane · Giant Steps", detalhe: "Melodia construída com arpejos", busca: "John Coltrane Giant Steps" },
            { titulo: "Arpejos no sax", detalhe: "Tríades e tétrades explicadas", busca: "arpejos tríades tétrades saxofone" }
          ],
          exercicios: [
            {
              id: "mel-05",
              titulo: "Tríades maiores e menores",
              andamento: { inicial: 60, alvo: 110 },
              passos: [
                "Toque o arpejo de cada grau da escala (Dó-Mi-Sol, Ré-Fá-Lá...)",
                "Repita invertendo a direção (descendo)",
                "Depois faça com tétrades (Dó-Mi-Sol-Si)"
              ]
            }
          ]
        },
        {
          id: "melodia-musicas",
          titulo: "Músicas",
          descricao: "Aplicar tudo em repertório real. Músicas sugeridas por nível: 1 (iniciante), 2 (intermediário) e 3 (avançado). Partituras no Drive.",
          referencias: [
            { titulo: "Asa Branca", detalhe: "Nível 1 · Luiz Gonzaga", busca: "Asa Branca saxofone" },
            { titulo: "Carinhoso", detalhe: "Nível 1 · Pixinguinha", busca: "Carinhoso Pixinguinha saxofone" },
            { titulo: "Autumn Leaves", detalhe: "Nível 1 · Cannonball Adderley", busca: "Cannonball Adderley Autumn Leaves" },
            { titulo: "Corcovado", detalhe: "Nível 2 · Tom Jobim", busca: "Stan Getz Corcovado" },
            { titulo: "Blue Bossa", detalhe: "Nível 2 · Kenny Dorham", busca: "Joe Henderson Blue Bossa" },
            { titulo: "Lamentos", detalhe: "Nível 2 · Pixinguinha", busca: "Lamentos Pixinguinha saxofone" },
            { titulo: "Tico-Tico no Fubá", detalhe: "Nível 3 · Zequinha de Abreu", busca: "Tico-Tico no Fubá saxofone" },
            { titulo: "Brasileirinho", detalhe: "Nível 3 · Waldir Azevedo", busca: "Brasileirinho saxofone" },
            { titulo: "Vassourinhas", detalhe: "Nível 3 · frevo", busca: "Vassourinhas frevo saxofone" }
          ],
          exercicios: [
            {
              id: "mel-06",
              titulo: "Música do mês",
              andamento: { inicial: 50, alvo: 100 },
              passos: [
                "Ouça a gravação de referência da música escolhida com o professor",
                "Aplique o método: cantarolar → fatiar → devagar → acelerar",
                "Grave a música inteira no andamento alvo"
              ]
            }
          ]
        }
      ]
    },

    // ───────────────────────── 4. ARTICULAÇÕES ──────────────────────────
    {
      id: "articulacao",
      titulo: "Articulações",
      icone: "articulacao",
      curto: "Articulação",
      cor: "#a379f0",
      cor2: "#d2bbff",
      frase: "Cada nota tem começo, meio e fim. Cuide dos três.",
      porQue: "A articulação é a pronúncia da música. A mesma melodia muda completamente de caráter quando ligada ou destacada. Saber escolher a articulação certa é o que faz o seu som falar o idioma de cada estilo.",
      resumo: "Conhecer e aplicar as articulações no momento certo.",
      descricao: "Articulação é a forma de começar, ligar e terminar as notas. O aluno aprende cada tipo e, principalmente, quando usar cada um de acordo com o estilo da música.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "art-basicas",
          titulo: "Legato e staccato",
          descricao: "Notas ligadas (só o ar) e notas curtas e destacadas (língua).",
          referencias: [],
          exercicios: [
            {
              id: "art-01",
              titulo: "Legato x staccato na escala",
              andamento: { inicial: 60, alvo: 100 },
              passos: [
                "Escala de Dó toda em legato, ar contínuo",
                "A mesma escala toda em staccato, notas curtas e iguais",
                "Alterne: 2 ligadas + 2 destacadas"
              ]
            }
          ]
        },
        {
          id: "art-acentos",
          titulo: "Acentos, tenuto e marcato",
          descricao: "Dar peso e duração diferentes a cada nota.",
          referencias: [],
          exercicios: [
            {
              id: "art-02",
              titulo: "Acento no tempo e no contratempo",
              andamento: { inicial: 60, alvo: 100 },
              passos: [
                "Colcheias em uma nota, acentuando o primeiro de cada tempo",
                "Agora acentue o contratempo",
                "Aplique tenuto (nota cheia) e marcato (forte e curta)"
              ]
            }
          ]
        },
        {
          id: "art-jazz",
          titulo: "Jazz: língua no legato e ghost notes",
          descricao: "No swing a língua quase nunca para: ligamos do contratempo para o tempo (\"doo-dah\") e escondemos algumas notas (ghost notes) para a frase balançar.",
          referencias: [
            { titulo: "Cannonball Adderley · Work Song", detalhe: "Articulação de jazz clara e cheia de balanço", busca: "Cannonball Adderley Work Song" },
            { titulo: "Charlie Parker · Confirmation", detalhe: "Ghost notes e acentos nas notas agudas", busca: "Charlie Parker Confirmation" },
            { titulo: "Ghost notes no sax", detalhe: "Como fazer a nota fantasma", busca: "ghost notes saxophone lesson" }
          ],
          exercicios: [
            {
              id: "art-04",
              titulo: "Doo-dah: língua no legato",
              andamento: { inicial: 80, alvo: 160 },
              passos: [
                "Fale \"doo-dah doo-dah\" sobre o metrônomo nos tempos 2 e 4",
                "Toque a escala de Fá maior em colcheias swingadas: língua leve no contratempo, ligando para o tempo",
                "A língua toca a palheta de leve, sem cortar o ar",
                "Grave e compare com Cannonball Adderley"
              ]
            },
            {
              id: "art-05",
              titulo: "Ghost notes",
              andamento: { inicial: 70, alvo: 140 },
              passos: [
                "Toque uma linha de colcheias e deixe a língua quase abafar uma nota (a nota é sentida, mas quase não soa)",
                "Comece escondendo a nota mais grave de cada grupo de três, como no bebop",
                "Combine: acento na nota aguda, ghost note na grave",
                "Aplique num tema de jazz que você já toca"
              ]
            }
          ]
        },
        {
          id: "art-choro",
          titulo: "Choro e samba",
          descricao: "Notas destacadas, leves e precisas; ligaduras curtas que valorizam a síncope e os ornamentos.",
          referencias: [
            { titulo: "Paulo Moura · Tarde de Chuva", detalhe: "Articulação de choro no sax", busca: "Paulo Moura Tarde de Chuva" },
            { titulo: "Pixinguinha · Um a Zero", detalhe: "Staccato leve e contracantos", busca: "Pixinguinha Benedito Lacerda Um a Zero" }
          ],
          exercicios: [
            {
              id: "art-06",
              titulo: "Staccato leve do choro",
              andamento: { inicial: 60, alvo: 110 },
              passos: [
                "Toque a escala de Ré menor em semicolcheias, todas destacadas, curtas e leves",
                "Agora ligue de 2 em 2, começando a ligadura na nota da síncope",
                "Aplique num trecho de choro que você está estudando"
              ]
            }
          ]
        },
        {
          id: "art-frevo",
          titulo: "Frevo",
          descricao: "Ataques firmes, acentos fortes nas síncopes e staccato rápido com muita energia.",
          referencias: [
            { titulo: "Vassourinhas", detalhe: "Acentos e ataques do frevo de rua", busca: "Vassourinhas frevo orquestra" },
            { titulo: "SpokFrevo Orquestra · Passo de Anjo", detalhe: "Articulação dos saxes no frevo", busca: "SpokFrevo Orquestra Passo de Anjo" }
          ],
          exercicios: [
            {
              id: "art-07",
              titulo: "Ataque e acento do frevo",
              andamento: { inicial: 70, alvo: 140 },
              passos: [
                "Semicolcheias numa nota só, com acento forte nas síncopes",
                "Mantenha as notas não acentuadas curtas e leves, para o acento aparecer",
                "Leve para a escala de Dó e depois para um trecho de Vassourinhas"
              ]
            }
          ]
        },
        {
          id: "art-bossa",
          titulo: "Bossa nova",
          descricao: "Legato macio, ataques suaves e quase sem acentos: a voz do sax imita o canto.",
          referencias: [
            { titulo: "Getz/Gilberto · Corcovado", detalhe: "O legato macio de Stan Getz", busca: "Getz Gilberto Corcovado" },
            { titulo: "João Gilberto · Chega de Saudade", detalhe: "O canto que o sax imita", busca: "João Gilberto Chega de Saudade 1959" }
          ],
          exercicios: [
            {
              id: "art-08",
              titulo: "Legato cantado",
              andamento: { inicial: 60, alvo: 100 },
              passos: [
                "Cante a melodia de Corcovado e repare onde você respira",
                "Toque com legato longo, língua bem suave (\"du\") só onde for preciso",
                "Termine as notas sem cortar com a língua: o ar é que para",
                "Grave e compare com Stan Getz"
              ]
            }
          ]
        },
        {
          id: "art-estilos",
          titulo: "Mesma frase, vários estilos",
          descricao: "Juntar tudo: a mesma frase muda de caráter conforme a articulação de cada gênero.",
          referencias: [],
          exercicios: [
            {
              id: "art-03",
              titulo: "Mesma frase, três estilos",
              andamento: { inicial: 70, alvo: 120 },
              passos: [
                "Escolha uma frase curta de uma música",
                "Toque com articulação de jazz (ligando contratempo → tempo)",
                "Toque com articulação de choro e depois de bossa nova; grave e compare"
              ]
            }
          ]
        }
      ]
    },

    // ────────────────────────── 5. DINÂMICAS ────────────────────────────
    {
      id: "dinamica",
      titulo: "Dinâmicas",
      icone: "dinamica",
      curto: "Dinâmica",
      cor: "#27b3c4",
      cor2: "#8ae3ec",
      frase: "Dinâmica é a forma de a música respirar.",
      porQue: "Sem dinâmica, a música fica plana, como uma fala sem emoção. Controlar o volume do pianíssimo ao fortíssimo permite contar uma história e emocionar quem escuta.",
      resumo: "Transmitir a emoção da música com as intensidades.",
      descricao: "Dinâmica é a variação de intensidade (do pianíssimo ao fortíssimo). O aluno aprende a controlar o som em todas as intensidades e aplica as dinâmicas nas músicas para transmitir a emoção que cada uma pede.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "din-niveis",
          titulo: "Do pp ao ff",
          descricao: "pp, p, mp, mf, f, ff, mantendo afinação e qualidade do som.",
          referencias: [],
          exercicios: [
            {
              id: "din-01",
              titulo: "Notas longas em cada dinâmica",
              andamento: { inicial: 60, alvo: 60 },
              passos: [
                "Nota longa de 8 tempos em p, depois mf, depois f",
                "Confira a afinação em cada intensidade",
                "Repita em notas graves, médias e agudas"
              ]
            },
            {
              id: "din-04",
              titulo: "Notas longas com afinador",
              andamento: { inicial: 60, alvo: 60 },
              passos: [
                "Abra um app de afinador no celular e deixe na estante",
                "Toque uma nota longa em p, depois em mf, depois em f, olhando o ponteiro",
                "Atenção: no piano o sax tende a subir e no forte tende a baixar. Corrija com a embocadura e o ar, não com a boca apertada",
                "Repita em Sol, Ré grave, Dó médio e Ré agudo, e anote no diário onde a afinação foge"
              ]
            }
          ]
        },
        {
          id: "din-variacoes",
          titulo: "Crescendo e diminuendo",
          descricao: "Mudar a intensidade aos poucos, com controle do ar.",
          referencias: [
            { titulo: "Count Basie · Li'l Darlin'", detalhe: "Uma big band inteira tocando baixinho, com crescendos controlados", busca: "Count Basie Lil Darlin" }
          ],
          exercicios: [
            {
              id: "din-02",
              titulo: "Notas em 'garfo' < >",
              andamento: { inicial: 60, alvo: 60 },
              passos: [
                "Nota de 8 tempos: 4 tempos crescendo de p a f, 4 tempos diminuindo",
                "Mantenha a afinação estável durante toda a nota",
                "Faça a escala de Dó inteira assim"
              ]
            }
          ]
        },
        {
          id: "din-subitas",
          titulo: "Dinâmicas súbitas",
          descricao: "Mudanças de intensidade de uma vez: subito piano, fp (forte-piano) e sfz (sforzando). Muito usadas em big band, frevo e arranjos de sopro.",
          referencias: [
            { titulo: "fp, sfz e subito piano", detalhe: "O que cada sinal pede", busca: "forte piano sforzando subito piano explicação" },
            { titulo: "Vassourinhas", detalhe: "Ataques fortes e cortes súbitos dos sopros", busca: "Vassourinhas frevo orquestra" }
          ],
          exercicios: [
            {
              id: "din-05",
              titulo: "fp, sfz e subito p",
              andamento: { inicial: 60, alvo: 90 },
              passos: [
                "fp: ataque forte e caia para piano logo em seguida, segurando a nota por 4 tempos",
                "sfz: um acento forte e isolado no meio de uma frase em mf",
                "subito p: toque 2 compassos em f e passe direto para p, sem diminuendo",
                "Em todos, mantenha a afinação: confira no afinador"
              ]
            }
          ]
        },
        {
          id: "din-emocao",
          titulo: "Dinâmica e emoção",
          descricao: "Aplicar as dinâmicas em uma música para contar uma história.",
          referencias: [
            { titulo: "John Coltrane · Naima", detalhe: "Observe como o som cresce e diminui", busca: "John Coltrane Naima" },
            { titulo: "Coleman Hawkins · Body and Soul", detalhe: "A balada clássica do sax tenor (1939)", busca: "Coleman Hawkins Body and Soul 1939" },
            { titulo: "Ben Webster · Chelsea Bridge", detalhe: "Som sussurrado e dinâmica no limite do piano", busca: "Ben Webster Chelsea Bridge" },
            { titulo: "Carinhoso no sax", detalhe: "Pixinguinha: a dinâmica do choro-canção", busca: "Carinhoso Pixinguinha saxofone" }
          ],
          exercicios: [
            {
              id: "din-03",
              titulo: "Planejar a dinâmica de uma música",
              andamento: { inicial: 60, alvo: 72 },
              passos: [
                "Escolha uma balada e marque na partitura onde é p, mf e f",
                "Escreva qual emoção você quer transmitir em cada parte",
                "Grave e ouça: a emoção ficou clara?"
              ]
            }
          ]
        }
      ]
    },

    // ───────────────────────── 6. ORNAMENTOS ────────────────────────────
    {
      id: "ornamentos",
      titulo: "Ornamentos",
      icone: "ornamentos",
      curto: "Ornamentos",
      cor: "#ec5a7d",
      cor2: "#ffa3b8",
      frase: "O ornamento é o tempero: na medida certa, transforma a música.",
      porQue: "Os ornamentos são a cereja do bolo. Eles dão personalidade e elegância à interpretação. Usados com bom gosto, mostram maturidade musical e deixam o seu jeito de tocar único.",
      resumo: "A cereja do bolo: os mais diversos ornamentos.",
      descricao: "Os ornamentos dão personalidade à interpretação. O aluno aprende cada ornamento, entende em que estilo ele aparece e o aplica com bom gosto nas músicas.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "orn-vibrato",
          titulo: "Vibrato",
          descricao: "A ondulação do som feita com a mandíbula. É o ornamento mais importante do sax: dá vida às notas longas e muda conforme o estilo.",
          referencias: [
            { titulo: "Johnny Hodges · Passion Flower", detalhe: "Vibrato largo e expressivo", busca: "Johnny Hodges Passion Flower" },
            { titulo: "Stan Getz · Corcovado", detalhe: "Vibrato leve, no fim das notas", busca: "Stan Getz Corcovado" },
            { titulo: "Vibrato no sax", detalhe: "Como fazer com a mandíbula", busca: "vibrato saxofone mandíbula aula" }
          ],
          exercicios: [
            {
              id: "orn-05",
              titulo: "Vibrato medido",
              andamento: { inicial: 60, alvo: 80 },
              passos: [
                "Nota longa (Sol médio): ondule a mandíbula 2 vezes por tempo, devagar e igual",
                "Depois 3 por tempo (tercinas) e 4 por tempo (semicolcheias)",
                "A afinação deve ondular para baixo e voltar: confira no afinador",
                "Aplique numa balada: comece a nota reta e coloque o vibrato só no final"
              ]
            }
          ]
        },
        {
          id: "orn-classicos",
          titulo: "Apojatura, mordente e trinado",
          descricao: "Ornamentos tradicionais escritos na partitura.",
          referencias: [],
          exercicios: [
            {
              id: "orn-01",
              titulo: "Apojatura e mordente",
              andamento: { inicial: 60, alvo: 90 },
              passos: [
                "Toque a escala de Dó com uma apojatura (nota de cima) antes de cada nota",
                "Repita com mordente (nota principal – vizinha – principal)",
                "Aplique em uma frase de música"
              ]
            },
            {
              id: "orn-02",
              titulo: "Trinado",
              andamento: { inicial: 50, alvo: 90 },
              passos: [
                "Trinado lento entre Sol e Lá, contando as notas (4 por tempo)",
                "Acelere aos poucos mantendo as notas iguais",
                "Experimente trinados em outras notas e com as chaves de trinado"
              ]
            }
          ]
        },
        {
          id: "orn-grupeto",
          titulo: "Grupeto e floreios",
          descricao: "Contornar a nota principal (de cima e de baixo).",
          referencias: [],
          exercicios: [
            {
              id: "orn-03",
              titulo: "Grupeto na escala",
              andamento: { inicial: 50, alvo: 80 },
              passos: [
                "Para cada nota da escala: nota de cima – principal – nota de baixo – principal",
                "Toque bem devagar e com som igual",
                "Aplique em uma nota longa de uma balada"
              ]
            }
          ]
        },
        {
          id: "orn-choro",
          titulo: "Ornamentos do choro",
          descricao: "Apojaturas rápidas, bordaduras e floreios que dão o sotaque do choro. Aprenda ouvindo os mestres.",
          referencias: [
            { titulo: "Pixinguinha · Lamentos", detalhe: "Floreios e apojaturas no sax", busca: "Pixinguinha Lamentos" },
            { titulo: "Abel Ferreira · Chorando Baixinho", detalhe: "Ornamentos do choro no clarinete e no sax", busca: "Abel Ferreira Chorando Baixinho" },
            { titulo: "Paulo Moura · Tarde de Chuva", detalhe: "Ornamentos com elegância", busca: "Paulo Moura Tarde de Chuva" }
          ],
          exercicios: [
            {
              id: "orn-06",
              titulo: "Apojaturas e bordaduras do choro",
              andamento: { inicial: 50, alvo: 90 },
              passos: [
                "Ouça uma das referências e anote onde aparecem notas rápidas antes da nota principal",
                "Apojatura rápida: nota de cima ou de baixo, bem curta, caindo na nota principal no tempo",
                "Bordadura: principal – vizinha – principal, leve e rápida, sem pesar",
                "Aplique numa frase de choro que você já toca, sem exagerar"
              ]
            }
          ]
        },
        {
          id: "orn-popular",
          titulo: "Ornamentos do jazz e da música popular",
          descricao: "Bend, scoop, fall, glissando, growl e subtone. (As ghost notes estão em Articulações.)",
          referencias: [
            { titulo: "Efeitos no sax", detalhe: "Bend, fall e scoop", busca: "saxophone bend scoop fall lesson" },
            { titulo: "Ben Webster · My Romance", detalhe: "Subtone: o som soprado e aveludado", busca: "Ben Webster My Romance" },
            { titulo: "King Curtis · Soul Serenade", detalhe: "Growl e efeitos do R&B", busca: "King Curtis Soul Serenade" },
            { titulo: "Growl e subtone", detalhe: "Como fazer cada efeito", busca: "saxophone growl subtone lesson" }
          ],
          exercicios: [
            {
              id: "orn-04",
              titulo: "Bend, scoop e fall",
              andamento: { inicial: 60, alvo: 90 },
              passos: [
                "Bend: comece a nota abaixo e suba até a afinação com a embocadura",
                "Scoop: entre na nota 'por baixo' rapidamente",
                "Fall: termine a nota caindo; aplique cada efeito em uma frase de blues"
              ]
            },
            {
              id: "orn-07",
              titulo: "Growl e subtone",
              andamento: { inicial: 60, alvo: 80 },
              passos: [
                "Subtone: nas notas graves, solte a embocadura, toque bem piano e deixe o ar aparecer no som",
                "Growl: cante ou rosne uma nota grave com a garganta enquanto toca",
                "Comece com notas longas, depois use em uma frase de blues ou balada",
                "Use com moderação: são temperos, não o prato principal"
              ]
            }
          ]
        }
      ]
    }
  ]
};
