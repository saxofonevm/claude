/*
 * CMA — Consciência Musical Aplicada
 * CONTEÚDO DO APP — edite este arquivo para mudar o que os alunos veem.
 *
 * ⚠️ RASCUNHO: ramificações e exercícios abaixo são uma proposta inicial
 *    para o professor revisar, cortar e completar.
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
 *   - "drive": links dos PDFs/pastas do Google Drive desta raiz.
 *     O arquivo precisa estar compartilhado como "Qualquer pessoa com o link".
 */
window.CMA = {
  raizes: [
    // ───────────────────────────── 1. ESCUTA ─────────────────────────────
    {
      id: "escuta",
      titulo: "Escuta",
      icone: "🎧",
      cor: "#4f7cac",
      resumo: "Referências que inspiram: saxofonistas, estilos e setup.",
      descricao: "Tudo começa pelo ouvido. Antes de tocar, o aluno conhece a sonoridade que quer alcançar: ouve os grandes saxofonistas, compara timbres e entende como o setup (boquilha, palheta, abraçadeira) influencia o som.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "escuta-saxofonistas",
          titulo: "Saxofonistas de referência",
          descricao: "Ouvir com atenção: timbre, fraseado, respiração e intenção de cada músico.",
          referencias: [
            { titulo: "Charlie Parker", detalhe: "Sax alto · bebop", busca: "Charlie Parker Confirmation" },
            { titulo: "Cannonball Adderley", detalhe: "Sax alto · hard bop / soul jazz", busca: "Cannonball Adderley Autumn Leaves" },
            { titulo: "John Coltrane", detalhe: "Sax tenor e soprano", busca: "John Coltrane Blue Train" },
            { titulo: "Stan Getz", detalhe: "Sax tenor · bossa nova", busca: "Stan Getz Desafinado" },
            { titulo: "Sonny Rollins", detalhe: "Sax tenor", busca: "Sonny Rollins St. Thomas" },
            { titulo: "Paulo Moura", detalhe: "Sax alto e clarinete · choro e gafieira", busca: "Paulo Moura Tarde de Chuva" },
            { titulo: "Proveta (Nailor Azevedo)", detalhe: "Sax e clarinete · música brasileira", busca: "Proveta saxofone choro" },
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
      icone: "🥁",
      cor: "#c0703a",
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
            { titulo: "Samba instrumental", detalhe: "Ouvir a levada do tamborim", busca: "levada tamborim samba" },
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
            { titulo: "Luiz Gonzaga · Asa Branca", detalhe: "Levada de baião", busca: "Luiz Gonzaga Asa Branca" }
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
          id: "ritmo-swing",
          titulo: "Swing e jazz",
          descricao: "Colcheias swingadas (sensação de tercina) e acentos nos contratempos.",
          referencias: [
            { titulo: "Count Basie · swing", detalhe: "Sentir a 'balança' das colcheias", busca: "Count Basie Orchestra swing" }
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
      icone: "🎼",
      cor: "#3f8f6b",
      resumo: "Músicas, escalas, intervalos e arpejos, com leveza e devagar.",
      descricao: "O aluno entende a importância de estudar e aplicar o estudo melódico. Método: cantarolar a frase → fatiar em pedaços pequenos → tocar devagar → aumentar o andamento gradativamente até o alvo.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
        {
          id: "melodia-metodo",
          titulo: "Como estudar uma frase",
          descricao: "O método CMA para qualquer melodia.",
          referencias: [],
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
          referencias: [],
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
            }
          ]
        },
        {
          id: "melodia-intervalos",
          titulo: "Intervalos",
          descricao: "Reconhecer e tocar intervalos com afinação e controle.",
          referencias: [],
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
          referencias: [],
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
          descricao: "Aplicar tudo em repertório real (partituras no Drive).",
          referencias: [],
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
      icone: "👅",
      cor: "#8a5aa8",
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
          id: "art-estilos",
          titulo: "Articulação nos estilos",
          descricao: "Como articular no jazz, no choro e no pop.",
          referencias: [
            { titulo: "Articulação no jazz", detalhe: "Ligar do contratempo para o tempo", busca: "jazz saxophone articulation lesson" },
            { titulo: "Articulação no choro", detalhe: "Notas destacadas e leves", busca: "choro saxofone articulação" }
          ],
          exercicios: [
            {
              id: "art-03",
              titulo: "Mesma frase, três estilos",
              passos: [
                "Escolha uma frase curta de uma música",
                "Toque com articulação de jazz (ligando contratempo → tempo)",
                "Toque com articulação de choro e depois de pop; grave e compare"
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
      icone: "🌊",
      cor: "#2f8c9a",
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
            }
          ]
        },
        {
          id: "din-variacoes",
          titulo: "Crescendo e diminuendo",
          descricao: "Mudar a intensidade aos poucos, com controle do ar.",
          referencias: [],
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
          id: "din-emocao",
          titulo: "Dinâmica e emoção",
          descricao: "Aplicar as dinâmicas em uma música para contar uma história.",
          referencias: [
            { titulo: "Baladas no sax", detalhe: "Observe como o som cresce e diminui", busca: "John Coltrane Naima" }
          ],
          exercicios: [
            {
              id: "din-03",
              titulo: "Planejar a dinâmica de uma música",
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
      icone: "🍒",
      cor: "#b5485d",
      resumo: "A cereja do bolo: os mais diversos ornamentos.",
      descricao: "Os ornamentos dão personalidade à interpretação. O aluno aprende cada ornamento, entende em que estilo ele aparece e o aplica com bom gosto nas músicas.",
      drive: { pasta: null, arquivos: [] },
      ramificacoes: [
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
          id: "orn-popular",
          titulo: "Ornamentos do jazz e da música popular",
          descricao: "Bend, scoop, fall, glissando e ghost notes.",
          referencias: [
            { titulo: "Efeitos no sax", detalhe: "Bend, fall e scoop", busca: "saxophone bend scoop fall lesson" }
          ],
          exercicios: [
            {
              id: "orn-04",
              titulo: "Bend, scoop e fall",
              passos: [
                "Bend: comece a nota abaixo e suba até a afinação com a embocadura",
                "Scoop: entre na nota 'por baixo' rapidamente",
                "Fall: termine a nota caindo; aplique cada efeito em uma frase de blues"
              ]
            }
          ]
        }
      ]
    }
  ]
};
