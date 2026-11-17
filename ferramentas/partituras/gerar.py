#!/usr/bin/env python3
"""
Gera os cadernos de exercícios do Naipe (Tiago Veloso) em LilyPond e PDF:
  - Arpejos em todos os tons (maiores, menores, aumentados e diminutos)
  - Modos gregos
  - Ornamentos
Uso: python3 ferramentas/partituras/gerar.py  (precisa do LilyPond 2.24)
Saída: pdf/naipe-arpejos.pdf, pdf/naipe-modos-gregos.pdf, pdf/naipe-ornamentos.pdf
Escrita para saxofone (notas escritas, servem para alto, tenor, soprano e barítono).
"""
import os, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, "pdf")
TMP = os.path.join(RAIZ, "ferramentas", "partituras", "ly")

# ---------- Teoria: notas com grafia correta ----------
LETRAS = "cdefgab"
NAT = [0, 2, 4, 5, 7, 9, 11]
GRAVE, AGUDO = 58, 89  # Si♭ grave (Bb3) até Fá agudo (F6), notas escritas do saxofone


class Nota:
    def __init__(self, l, a, o):
        self.l, self.a, self.o = l, a, o  # letra 0-6, alteração (-2..2), oitava (C4 = dó central)

    @property
    def midi(self):
        return 12 * (self.o + 1) + NAT[self.l] + self.a

    def mais(self, passos, semitons):
        nl = self.l + passos
        o = self.o + nl // 7
        nl %= 7
        a = self.midi + semitons - (12 * (o + 1) + NAT[nl])
        return Nota(nl, a, o)

    def oitava(self, k=1):
        return Nota(self.l, self.a, self.o + k)

    def ly(self, dur=""):
        nome = LETRAS[self.l] + {-2: "eses", -1: "es", 0: "", 1: "is", 2: "isis"}[self.a]
        nome = nome.replace("ees", "es").replace("aes", "as")
        marcas = "'" * (self.o - 3) if self.o >= 3 else "," * (3 - self.o)
        return f"{nome}{marcas}{dur}"


def nota(nome, o):
    """nome tipo 'f#', 'bb', 'c' -> Nota."""
    l = LETRAS.index(nome[0])
    a = nome[1:].count("#") - nome[1:].count("b")
    return Nota(l, a, o)


PT = {"c": "Dó", "d": "Ré", "e": "Mi", "f": "Fá", "g": "Sol", "a": "Lá", "b": "Si"}


def nome_pt(n):
    return PT[LETRAS[n.l]] + {-2: "𝄫", -1: "♭", 0: "", 1: "♯", 2: "𝄪"}[n.a]


def lykey(n):
    return n.ly().rstrip("',")


# ---------- Acordes ----------
ACORDES = {
    "maior": [(0, 0), (2, 4), (4, 7)],
    "menor": [(0, 0), (2, 3), (4, 7)],
    "aumentado": [(0, 0), (2, 4), (4, 8)],
    "diminuto": [(0, 0), (2, 3), (4, 6)],
    "dim7": [(0, 0), (2, 3), (4, 6), (6, 9)],
}


def tons_do_acorde(raiz, tipo):
    """Todas as notas do acorde dentro da extensão do sax, do grave ao agudo."""
    base = Nota(raiz.l, raiz.a, 2)
    notas = []
    for k in range(0, 6):
        r = base.oitava(k)
        for p, s in ACORDES[tipo]:
            n = r.mais(p, s)
            if tipo in ("aumentado", "diminuto", "dim7"):
                n = simples(n)
            if GRAVE <= n.midi <= AGUDO:
                notas.append(n)
    return sorted(notas, key=lambda n: n.midi)


def simples(n):
    """Troca dobrados e Dó♭/Fá♭/Mi♯/Si♯ pela nota enarmônica mais fácil de ler."""
    if abs(n.a) < 2 and (LETRAS[n.l], n.a) not in (("c", -1), ("f", -1), ("e", 1), ("b", 1)):
        return n
    m = n.midi
    for l in range(7):
        for a in (0, -1 if n.a < 0 else 1):
            for o in (n.o - 1, n.o, n.o + 1):
                c = Nota(l, a, o)
                if c.midi == m and (LETRAS[l], a) not in (("c", -1), ("f", -1), ("e", 1), ("b", 1)):
                    return c
    return n


def raiz_grave(raiz):
    """A tônica mais grave que cabe no sax."""
    r = Nota(raiz.l, raiz.a, 3)
    while r.midi < GRAVE:
        r = r.oitava()
    return r


def frase(notas, dur="8", fim=None):
    """Colcheias seguidas; a última nota fecha o compasso 4/4 (com pausa, se preciso).
    O Completion_heads_engraver divide nas barras as notas que atravessam o compasso."""
    partes = [n.ly(dur if i == 0 else "") for i, n in enumerate(notas[:-1])]
    resto = (len(notas) - 1) % 8
    falta = 8 - resto if resto else 8
    nota_fim, pausa = {8: ("1", ""), 7: ("2..", ""), 6: ("2.", ""), 5: ("2", "r8"), 4: ("2", ""),
                       3: ("4.", ""), 2: ("4", ""), 1: ("8", "")}[falta]
    partes.append(notas[-1].ly(nota_fim))
    if pausa:
        partes.append(pausa)
    return " ".join(partes)


def completar(n):
    return None


# ---------- Cabeçalho comum ----------
def cabecalho(titulo, subtitulo):
    return r'''\version "2.24.0"
#(set-default-paper-size "a4")
\paper {
  top-margin = 12\mm bottom-margin = 14\mm left-margin = 15\mm right-margin = 15\mm
  markup-system-spacing.padding = #2.5
  system-system-spacing.basic-distance = #13
  score-markup-spacing.padding = #2
  print-page-number = ##t
  ragged-bottom = ##t
  ragged-last-bottom = ##t
  oddHeaderMarkup = \markup \fill-line { \null \fontsize #-2 \fromproperty #'page:page-number-string }
  evenHeaderMarkup = \markup \fill-line { \fontsize #-2 \fromproperty #'page:page-number-string \null }
  oddFooterMarkup = \markup \fill-line { \fontsize #-2 \concat { "Tiago Veloso  ·  Naipe  ·  naipesax.com.br" } }
  evenFooterMarkup = \oddFooterMarkup
}
\header {
  title = "''' + titulo + r'''"
  subtitle = "''' + subtitulo + r'''"
  composer = \markup \bold "Tiago Veloso"
  arranger = \markup \italic "Naipe · método de saxofone"
  subsubtitle = \markup \fontsize #-1 \italic "Para todos os saxofones (notas escritas: soprano, alto, tenor e barítono)"
  tagline = ##f
}
\layout {
  indent = 0
  ragged-right = ##f
  ragged-last = ##f
  \context { \Voice \remove Note_heads_engraver \consists Completion_heads_engraver
             \remove Rest_engraver \consists Completion_rest_engraver }
  \context { \Score \override BarNumber.break-visibility = ##(#f #f #f) }
}
'''


def texto(*paragrafos, tam=0):
    out = []
    for p in paragrafos:
        out.append(r'\markup \fontsize #%d \wordwrap-string #"%s"' % (tam, p.replace('"', '\\"')))
    return "\n".join(out) + "\n"


def secao(titulo):
    return r'\markup \vspace #1.2' + "\n" + r'\markup \fontsize #3 \bold "%s"' % titulo + "\n" + r'\markup \vspace #0.4' + "\n"


def pauta(rotulo, musica, chave=r"\key c \major", tempo=r"\time 4/4", extra=""):
    return r'''\score {
  \new Staff {
    \clef treble %s %s %s
    \once \override Score.RehearsalMark.self-alignment-X = #LEFT
    \mark \markup \fontsize #-1 \bold "%s"
    %s \bar "|."
  }
  \layout { }
}
''' % (tempo, chave, extra, rotulo.replace('"', '\\"'), musica)


def gerar(nome, conteudo):
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(SAIDA, exist_ok=True)
    ly = os.path.join(TMP, nome + ".ly")
    with open(ly, "w", encoding="utf-8") as f:
        f.write(conteudo)
    r = subprocess.run(["lilypond", "-s", "-o", os.path.join(SAIDA, nome), ly], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-3000:])
        sys.exit(1)
    print("ok", nome + ".pdf")


# ================= 1. ARPEJOS =================
CICLO_MAIOR = ["c", "f", "bb", "eb", "ab", "db", "gb", "b", "e", "a", "d", "g"]
CICLO_MENOR = ["a", "d", "g", "c", "f", "bb", "eb", "g#", "c#", "f#", "b", "e"]
RAIZES_AUM = ["c", "f", "bb", "eb", "ab", "db", "gb", "b", "e", "a", "d", "g"]
RAIZES_DIM = ["c", "f", "bb", "eb", "g#", "c#", "f#", "b", "e", "a", "d", "g"]


def ex_extensao(raiz, tipo):
    t = tons_do_acorde(raiz, tipo)
    seq = t + t[-2::-1]
    return frase(seq, "8", completar(len(seq) - 1))


def ex_grupos(raiz, tipo):
    """Grupos de quatro: 1-3-5-3, 3-5-8-5 ... subindo uma oitava e meia e descendo."""
    r = raiz_grave(raiz)
    tons = [n for n in tons_do_acorde(raiz, tipo) if n.midi >= r.midi]
    k = len(ACORDES[tipo])
    sobe = []
    for i in range(k + 1):
        sobe += [tons[i], tons[i + 1], tons[i + 2], tons[i + 1]]
    desce = []
    for i in range(k + 2, 1, -1):
        desce += [tons[i], tons[i - 1], tons[i - 2], tons[i - 1]]
    seq = sobe + desce + [tons[0]]
    return frase(seq, "8", completar(len(seq) - 1))


def ex_inversoes(raiz, tipo):
    """Estado fundamental, 1ª e 2ª inversão: cada uma sobe e desce num compasso."""
    r = raiz_grave(raiz)
    tons = [n for n in tons_do_acorde(raiz, tipo) if n.midi >= r.midi]
    k = len(ACORDES[tipo])
    seq = []
    for inv in range(3):
        g = tons[inv:inv + 4]
        seq += g + list(reversed(g))
    musica = " ".join(n.ly("8" if i == 0 else "") for i, n in enumerate(seq)) + " " + tons[0].ly("1")
    return musica


def caderno_arpejos():
    s = cabecalho("Arpejos em todos os tons", "Maiores, menores, aumentados e diminutos")
    s += texto(
        "Arpejo é o acorde tocado nota por nota. Saber os arpejos de cor em todos os tons é a base para ler com fluência, improvisar e entender a harmonia.",
        "Como estudar: um tom por dia, primeiro em ♩ = 60, tudo ligado. Depois destacado. Suba o metrônomo de 4 em 4 só quando sair limpo três vezes seguidas. Os tons seguem o ciclo das quartas.",
        "Exercício 1 percorre toda a extensão do saxofone, do Si♭ grave ao Fá agudo. Exercício 2 trabalha grupos de quatro notas. Exercício 3 mostra o acorde no estado fundamental, na primeira e na segunda inversão.",
        tam=0)
    partes = [
        ("maior", "Arpejos maiores", "Tríade maior: tônica, terça maior e quinta justa. Som claro e estável.", CICLO_MAIOR, "major"),
        ("menor", "Arpejos menores", "Tríade menor: tônica, terça menor e quinta justa. Som escuro e cantado.", CICLO_MENOR, "minor"),
        ("aumentado", "Arpejos aumentados", "Tríade aumentada: duas terças maiores seguidas, com a quinta aumentada. Som de suspense, muito usado em passagens do choro e do jazz. Só existem quatro sons diferentes; aqui estão os doze nomes.", RAIZES_AUM, None),
        ("diminuto", "Arpejos diminutos", "Tríade diminuta: duas terças menores seguidas, com a quinta diminuta. Base dos acordes de passagem do choro e do samba. Algumas notas aparecem com o nome enarmônico, mais fácil de ler.", RAIZES_DIM, None),
    ]
    for tipo, titulo, expl, raizes, modo in partes:
        s += r"\pageBreak" + "\n" if tipo != "maior" else ""
        s += secao(titulo) + texto(expl)
        for ex, fn, nomeex in [(1, ex_extensao, "toda a extensão"), (2, ex_grupos, "grupos de quatro"), (3, ex_inversoes, "inversões")]:
            s += secao(f"Exercício {ex} · {nomeex}")
            for nm in raizes:
                r = nota(nm, 4)
                rot = f"{nome_pt(r)}{'' if tipo == 'maior' else ' menor' if tipo == 'menor' else ' aumentado' if tipo == 'aumentado' else ' diminuto'}"
                chave = (r"\key %s \%s" % (lykey(r), modo)) if modo else r"\key c \major"
                s += pauta(rot, fn(r, tipo), chave)
    # bônus: sétima diminuta
    s += r"\pageBreak" + "\n" + secao("Exercício 4 · acorde de sétima diminuta") + texto(
        "O acorde diminuto com sétima (tétrade diminuta) empilha três terças menores e divide a oitava em quatro partes iguais. Na prática do choro e do jazz é o diminuto mais usado.")
    for nm in RAIZES_DIM:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} diminuto com sétima", ex_extensao(r, "dim7"))
    gerar("naipe-arpejos", s)


# ================= 2. MODOS GREGOS =================
MAIOR = [(0, 0), (1, 2), (2, 4), (3, 5), (4, 7), (5, 9), (6, 11)]
MODOS = [
    ("Jônio", "ionian", 0, "É a escala maior. Ponto de partida para todos os outros modos.", None),
    ("Dórico", "dorian", 1, "Menor com sexta maior. O som do samba-jazz, de So What e de muito funk.", 5),
    ("Frígio", "phrygian", 2, "Menor com segunda menor. Som espanhol e flamenco.", 1),
    ("Lídio", "lydian", 3, "Maior com quarta aumentada. Som aberto, de trilha de cinema.", 3),
    ("Mixolídio", "mixolydian", 4, "Maior com sétima menor. O som do baião, do forró e do blues.", 6),
    ("Eólio", "aeolian", 5, "A escala menor natural. Melancólico.", 5),
    ("Lócrio", "locrian", 6, "Menor com segunda menor e quinta diminuta. Usado sobre o acorde meio-diminuto.", 4),
]


def escala_modo(tonica, grau):
    """Escala do modo a partir da tônica, com a grafia da escala maior de origem."""
    rot = MAIOR[grau:] + [(p + 7, s + 12) for p, s in MAIOR[:grau]]
    p0, s0 = rot[0]
    return [tonica.mais(p - p0, s - s0) for p, s in rot] + [tonica.oitava()]


def tonica_modo(pc, grau):
    """Escolhe a grafia da tônica que deixa a armadura de origem mais simples."""
    melhor = None
    for l in range(7):
        a = (pc - NAT[l] + 6) % 12 - 6
        if abs(a) > 1:
            continue
        t = Nota(l, a, 4)
        p0, s0 = MAIOR[grau]
        orig = t.mais(-p0, -s0)
        # número de acidentes da escala maior de origem
        quintas = {(0, 0): 0}
        acid = sum(abs(n.a) for n in escala_modo(orig, 0)[:7])
        if melhor is None or acid < melhor[0]:
            melhor = (acid, t)
    t = melhor[1]
    while t.midi > 66:
        t = t.oitava(-1)
    while t.midi < GRAVE:
        t = t.oitava()
    return t


def ex_modo_simples(esc):
    seq = esc + esc[-2::-1]
    return frase(seq, "8", completar(len(seq) - 1))


def ex_modo_tercas(esc):
    """Em terças: 1-3, 2-4, 3-5 ... subindo; e descendo."""
    duas = esc[:-1] + [n.oitava() for n in esc[:-1]]
    sobe = []
    for i in range(7):
        sobe += [duas[i], duas[i + 2]]
    sobe.append(duas[7])
    desce = []
    for i in range(7, 0, -1):
        desce += [duas[i], duas[i - 2] if i >= 2 else duas[i - 2 + 7].oitava(-1)]
    seq = sobe + desce + [duas[0]]
    seq = [n.oitava(-1) if n.midi > AGUDO else n.oitava() if n.midi < GRAVE else n for n in seq]
    return frase(seq, "8", completar(len(seq) - 1))


def caderno_modos():
    s = cabecalho("Modos gregos", "Os sete modos em todos os tons")
    s += texto(
        "Os modos gregos são as sete escalas que nascem da escala maior quando começamos em cada um dos seus graus. Cada modo tem uma cor própria, dada por uma nota característica.",
        "Como estudar: toque cada modo devagar e cante a nota característica. Depois toque sobre um bordão (uma nota longa na tônica) para ouvir a cor do modo. A armadura usada é a da escala maior de origem.")
    s += secao("Parte 1 · os modos da escala de Dó maior")
    s += texto("As mesmas sete notas, começando em cada grau. Repare que nenhuma nota muda: o que muda é o centro.")
    do = nota("c", 4)
    for nm, lyn, g, expl, car in MODOS:
        t = escala_modo(do, 0)[g]
        while t.midi < GRAVE:
            t = t.oitava()
        s += pauta(f"{nome_pt(t)} {nm.lower()}", ex_modo_simples(escala_modo(t, g)), r"\key %s \%s" % (lykey(t), lyn))
    s += r"\pageBreak" + "\n" + secao("Parte 2 · os sete modos sobre o Dó")
    s += texto("Agora a tônica é sempre Dó e as notas mudam. É assim que se ouve a diferença de cor entre os modos.")
    for nm, lyn, g, expl, car in MODOS:
        esc = escala_modo(do, g)
        caract = f" Nota característica: {nome_pt(esc[car])}." if car is not None else ""
        s += texto(f"{nm}: {expl}{caract}", tam=-1)
        s += pauta(f"Dó {nm.lower()}", ex_modo_simples(esc), r"\key c \%s" % lyn)
    s += r"\pageBreak" + "\n" + secao("Parte 3 · os sete modos sobre o Dó, em terças")
    for nm, lyn, g, expl, car in MODOS:
        s += pauta(f"Dó {nm.lower()} em terças", ex_modo_tercas(escala_modo(do, g)), r"\key c \%s" % lyn)
    s += r"\pageBreak" + "\n" + secao("Parte 4 · cada modo nos doze tons")
    s += texto("Um modo por semana: toque os doze tons, ligado e destacado. Os tons seguem o ciclo das quartas.")
    ciclo = [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7]
    for i, (nm, lyn, g, expl, car) in enumerate(MODOS):
        if i:
            s += r"\pageBreak" + "\n"
        s += secao(f"{nm}") + texto(expl)
        for pc in ciclo:
            t = tonica_modo(pc, g)
            s += pauta(f"{nome_pt(t)} {nm.lower()}", ex_modo_simples(escala_modo(t, g)), r"\key %s \%s" % (lykey(t), lyn))
    gerar("naipe-modos-gregos", s)


# ================= 3. ORNAMENTOS =================
def caderno_ornamentos():
    s = cabecalho("Ornamentos", "Apojaturas, mordentes, grupeto, trinado e os enfeites do choro e do jazz")
    s += texto(
        "Ornamento é a nota de enfeite que dá vida à melodia. Cada ornamento aparece primeiro como se escreve e logo abaixo como se toca. Depois vêm os exercícios em vários tons.",
        "Como estudar: toque a versão escrita por extenso até soar leve; só então leia o sinal. O ornamento nunca atrasa o tempo: ele cabe dentro da nota principal.")

    def par(rot_esc, esc, rot_toca, toca, chave=r"\key c \major", tempo=r"\time 4/4"):
        return pauta(rot_esc, esc, chave, tempo) + pauta(rot_toca, toca, chave, tempo)

    # Apojatura breve
    s += secao("1 · Apojatura breve (acciaccatura)")
    s += texto("A notinha cortada é rapidíssima, quase junto com a nota principal. Use o dedo, não a língua: articule só a primeira.")
    s += par("Como se escreve", r"\acciaccatura d''8 c''4 \acciaccatura f''8 e''4 \acciaccatura a''8 g''2",
             "Como se toca", r"\tuplet 3/2 { d''16 c''8 } c''8 r8 \tuplet 3/2 { f''16 e''8 } e''8 r8 \tuplet 3/2 { a''16 g''8 } g''4.")
    escalas = [("c", "major"), ("g", "major"), ("f", "major"), ("bes", "major"), ("d", "major")]
    nomes = {"c": "Dó", "g": "Sol", "f": "Fá", "bes": "Si♭", "d": "Ré", "es": "Mi♭", "a": "Lá"}
    for k, (t, m) in enumerate(escalas):
        r = nota({"bes": "bb"}.get(t, t), 4)
        esc = escala_modo(r, 0)
        cima = " ".join(r"\acciaccatura %s %s" % (n.mais(1, (escala_modo(r, 0) + [r.oitava().mais(1, 2)])[i + 1].midi - n.midi).ly("8"), n.ly("4")) for i, n in enumerate(esc))
        s += pauta(f"Exercício {k + 1} · {nomes[t]} maior, apojatura de cima", cima + " r2", r"\key %s \%s" % (t, m))
    s += pauta("Exercício 6 · Dó maior, apojatura cromática de baixo",
               " ".join(r"\acciaccatura %s %s" % (Nota(n.l, n.a, n.o).mais(0, -1).ly("8"), n.ly("4")) for n in escala_modo(nota("c", 4), 0)) + " r2")

    # Apojatura longa
    s += r"\pageBreak" + "\n" + secao("2 · Apojatura longa (appoggiatura)")
    s += texto("A notinha sem corte vale metade da nota principal e cai no tempo, com apoio. Dá um suspiro à melodia, muito usado na seresta e no choro-canção.")
    s += par("Como se escreve", r"\appoggiatura d''8 c''2 \appoggiatura a''8 g''2 \appoggiatura f''8 e''2 \appoggiatura d''8 c''2",
             "Como se toca", r"d''4( c''4) a''4( g''4) f''4( e''4) d''4( c''4)")
    s += pauta("Exercício 7 · melodia com apojaturas longas (Tiago Veloso)",
               r"\key f \major \time 3/4 c''4 \appoggiatura g''8 f''2 \appoggiatura e''8 d''2 c''4 \appoggiatura c''8 bes'2 a'4 \appoggiatura a'8 g'2. "
               r"a'4 \appoggiatura d''8 c''2 \appoggiatura bes'8 a'2 g'4 \appoggiatura g'8 f'2. ~ f'2.", "", "", "")

    # Mordentes
    s += r"\pageBreak" + "\n" + secao("3 · Mordente superior e inferior")
    s += texto("O mordente superior (sinal em zigue-zague) é nota, vizinha de cima, nota. O inferior (com o risco) vai à vizinha de baixo. As três notas são rápidas e o resto do tempo fica na nota principal.")
    s += par("Como se escreve", r"c''4\prall e''4\prall g''4\mordent c'''4\mordent",
             "Como se toca", r"c''32 d'' c''16 ~ c''8 e''32 f'' e''16 ~ e''8 g''32 fis'' g''16 ~ g''8 c'''32 b'' c'''16 ~ c'''8")
    for k, (t, m) in enumerate(escalas):
        r = nota({"bes": "bb"}.get(t, t), 4)
        esc = escala_modo(r, 0)
        musica = " ".join(n.ly("4") + ("\\prall" if i % 2 == 0 else "\\mordent") for i, n in enumerate(esc + esc[-2::-1]))
        s += pauta(f"Exercício {8 + k} · {nomes[t]} maior, mordentes alternados", musica + " r4", r"\key %s \%s" % (t, m))

    # Grupeto
    s += r"\pageBreak" + "\n" + secao("4 · Grupeto")
    s += texto("O grupeto (sinal deitado como um S) contorna a nota: vizinha de cima, nota, vizinha de baixo, nota. Toque as quatro notas iguais e leves.")
    s += par("Como se escreve", r"c''2\turn e''2\turn g''2\turn c'''2",
             "Como se toca", r"d''16 c'' b' c'' ~ c''4 f''16 e'' d'' e'' ~ e''4 a''16 g'' f'' g'' ~ g''4 c'''2")
    for k, (t, m) in enumerate(escalas):
        r = nota({"bes": "bb"}.get(t, t), 4)
        esc = escala_modo(r, 0)
        musica = " ".join(n.ly("2") + "\\turn" for n in esc[:7]) + " " + esc[7].ly("2")
        s += pauta(f"Exercício {13 + k} · {nomes[t]} maior com grupeto", musica, r"\key %s \%s" % (t, m))

    # Trinado
    s += r"\pageBreak" + "\n" + secao("5 · Trinado")
    s += texto("O trinado alterna rapidamente a nota escrita com a vizinha de cima, pela escala. Comece devagar e em ritmo medido (semicolcheias, depois sextinas), só depois solte. Mantenha o ar firme e os dedos perto das chaves.")
    s += par("Como se escreve", r"c''1\trill",
             "Como se toca (medido)", r"c''16 d'' c'' d'' c'' d'' c'' d'' c'' d'' c'' d'' c'' d'' c''8")
    for k, (t, m) in enumerate(escalas):
        r = nota({"bes": "bb"}.get(t, t), 4)
        esc = escala_modo(r, 0)
        musica = " ".join(n.ly("2") + "\\trill" for n in esc)
        s += pauta(f"Exercício {18 + k} · {nomes[t]} maior, trinado em cada grau", musica, r"\key %s \%s" % (t, m))

    # Choro e jazz
    s += r"\pageBreak" + "\n" + secao("6 · Enfeites do choro e do jazz")
    s += texto("Glissando: deslize entre duas notas sem cortar o som. Fall (caída): a nota escorrega para baixo no fim. Scoop: a nota entra um pouco abaixo e sobe até a altura certa. Ghost note (nota entre parênteses): quase sem som, só a língua encostando.")
    s += pauta("Glissando, fall e scoop", r"g'2 \glissando d''2 g''2 \bendAfter #-4 r2 "
               r"e''2^\markup \italic \fontsize #-2 scoop c''2 "
               r"c''8 \parenthesize d''8 e''8 \parenthesize f''8 g''2", "", "", "")
    s += pauta("Exercício 23 · estudo de ornamentos no choro (Tiago Veloso)",
               r"\key g \major \time 2/4 \acciaccatura cis''16 d''8 b'16 g' \acciaccatura fis''16 g''8 d''16 b' a'8\prall b'16 c'' d''8 e''16 fis'' "
               r"g''4\turn fis''16 e'' d'' c'' b'8\mordent a'16 g' fis'8 e'16 d' \appoggiatura a'8 g'4 r4 "
               r"d''8. e''16 \acciaccatura e''16 fis''8 g'' a''4\trill g''8 d'' \acciaccatura c''16 b'8 g' \tuplet 3/2 { a'16 b' a' } g'8 g'4 r4", "", "", "")
    s += pauta("Exercício 24 · estudo de ornamentos no jazz (Tiago Veloso)",
               r"\key bes \major \time 4/4 r8 f'8 \glissando bes'4 \parenthesize c''8 d''8 f''4 \bendAfter #-3 "
               r"es''8 d''8 c''8 \parenthesize bes'8 a'8 c''8 es''4 "
               r"d''4.\turn bes'8 \acciaccatura e''8 f''4 d''4 bes'2 \glissando f''4 \bendAfter #-4 r4", "", "", "")
    gerar("naipe-ornamentos", s)


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import cadernos_extra
    so = sys.argv[1:]
    for nome, fn in [("arpejos", caderno_arpejos), ("modos", caderno_modos), ("ornamentos", caderno_ornamentos),
                     ("escalas", cadernos_extra.caderno_escalas), ("jazz", cadernos_extra.caderno_jazz),
                     ("intervalos", cadernos_extra.caderno_intervalos), ("som", cadernos_extra.caderno_som),
                     ("ritmo", cadernos_extra.caderno_ritmo)]:
        if not so or nome in so:
            fn()
