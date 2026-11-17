"""
Caderno "Estudos no estilo dos mestres" (Tiago Veloso · Naipe).
Sete estudos originais escritos em som real (Dó) e impressos transpostos
para sax alto (Mi♭: uma sexta maior acima) e sax tenor (Si♭: uma nona maior acima).
Extensão em som real: Sol 3 a Mi♭ 5, para caber nos dois saxofones.
"""
from gerar import cabecalho, texto, secao, gerar

# (título, mestre, andamento, texto sobre o estilo, discos para ouvir, armadura, compasso, acordes, melodia)
ESTUDOS = [
    ("Blues para Bird", "Charlie Parker", r'\tempo "Swing" 4 = 160',
     "O bebop de Charlie Parker: colcheias com swing, notas do acorde nos tempos fortes, aproximações cromáticas e frases que começam no contratempo. Blues em Fá (som real).",
     "Ouça: Charlie Parker, “Now's the Time” e “Billie's Bounce” (1945); “Confirmation” (1953).",
     r"\key f \major", r"\time 4/4",
     r"f1:7 | bes:7 | f:7 | c2:m7 f:7 | bes1:7 | b:dim7 | f:7 | d:7 | g:m7 | c:7 | f2:7 d:7 | g:m7 c:7 | f1:7",
     r"r8 c'8 d' f' a' c'' bes' a' | as'8 g' f' d' bes4 r8 c'8 | f'8 a' c'' es'' d'' c'' a' f' | g'8 bes' d'' c'' a' f' es' c' | "
     r"d'4 r8 d'8 f' as' c'' bes' | c''8 b' as' f' d'4 r4 | r8 a8 c' f' a' g' f' e' | es'8 fis' a' c'' es''4 d''8 c'' | "
     r"bes'8 a' g' f' d' bes g a | bes8 c' e' g' bes' a' g' e' | f'4 a'8 c'' fis' a' c'' es'' | d''8 bes' g' f' e' g' bes' g' | f'2. r4"),
    ("Passos gigantes", "John Coltrane", r'\tempo "Swing rápido" 4 = 132',
     "Coltrane e os ciclos de terças maiores: os acordes mudam a cada dois tempos e a melodia usa o padrão 1-2-3-5, que ele estudou em todos os tons. Comece bem devagar.",
     "Ouça: John Coltrane, “Giant Steps” (1960) e “Blue Train” (1957).",
     r"\key c \major", r"\time 4/4",
     r"b2:maj7 d:7 | g:maj7 bes:7 | es1:maj7 | a2:m7 d:7 | g:maj7 bes:7 | es:maj7 fis:7 | b1:maj7 | f2:m7 bes:7 | es1:maj7",
     r"b8 cis' dis' fis' d' e' fis' a' | g'8 a' b' d'' f' d' c' bes | es'8 f' g' bes' g' f' es' d' | a8 c' e' g' fis' a' c'' a' | "
     r"b'8 a' g' d' d' f' as' f' | es'8 f' g' bes' fis' ais' cis'' ais' | b'4 dis''8 cis'' b' ais' fis' dis' | f'8 as' c'' es'' d'' c'' as' f' | es'2. r4"),
    ("Bossa para Getz", "Stan Getz", r'\tempo "Bossa nova" 4 = 120',
     "O som de Stan Getz na bossa nova: colcheias iguais (sem swing), som macio e quase sem vibrato, notas longas que flutuam sobre o violão.",
     "Ouça: Stan Getz e João Gilberto, “Getz/Gilberto” (1964); Stan Getz e Charlie Byrd, “Jazz Samba” (1962).",
     r"\key f \major", r"\time 4/4",
     r"f1:maj7 | a2:m7 d:7 | g1:m7 | c:7 | f:maj7 | bes:maj7 | g2:m7 c:7 | f1:maj7 | "
     r"f1:maj7 | a2:m7 d:7 | g1:m7 | c:7 | f:maj7 | bes:maj7 | g2:m7 c:7 | f1:maj7",
     r"a'4. g'8 ~ g'4 e'4 | c''2 fis'4 a'4 | bes'4. a'8 ~ a'4 f'4 | g'2 e'4 c'4 | a'4. c''8 ~ c''4 a'4 | d''2 a'4 f'4 | g'4 bes'4 e'4 g'4 | f'1 | "
     r"c''4. a'8 ~ a'4 g'4 | e'2 a'4 c''4 | d''4. bes'8 ~ bes'4 g'4 | bes'2 g'4 e'4 | f'4 a'4 c''4 e'4 | d'2 f'4 a'4 | bes'4 a'4 g'4 e'4 | f'1"),
    ("Soul para Cannonball", "Cannonball Adderley", r'\tempo "Shuffle" 4 = 112',
     "O soul jazz de Cannonball Adderley: blues com a blue note (a terça menor sobre o acorde maior), frases de igreja e muito balanço. Blues em Si♭ (som real).",
     "Ouça: Cannonball Adderley, “Somethin' Else” (1958) e “Mercy, Mercy, Mercy!” (1966).",
     r"\key bes \major", r"\time 4/4",
     r"bes1:7 | es:7 | bes:7 | bes:7 | es:7 | es:7 | bes:7 | g:7 | c:m7 | f:7 | bes2:7 g:7 | c:m7 f:7 | bes1:7",
     r"r8 f'8 bes' des'' d''4 bes'4 | des''8 bes' g' f' es'4 r4 | r8 f'8 bes' des'' d''4 bes'8 g' | f'2 r2 | "
     r"r8 bes'8 des'' es'' ~ es''4 des''8 bes' | g'8 bes' des'' bes' g'4 es'4 | d'8 f' bes' d'' des'' bes' g' f' | b'4 d''8 b' g'4 f'4 | "
     r"es'8 g' bes' d'' c''4 g'4 | a'8 c'' es'' c'' a'4 f'4 | bes'4 d''4 b'4 f'4 | es'4 g'4 a'4 c''4 | bes'1"),
    ("Balada para a noite", "Ben Webster e Dexter Gordon", r'\tempo "Balada" 4 = 60',
     "A balada dos grandes tenores: som cheio e soprado (subtone) no grave, vibrato largo no fim das notas longas e a frase sempre cantada. Respire onde a frase respira.",
     "Ouça: Ben Webster, “Soulville” (1957); Dexter Gordon, “Go” (1962); Coleman Hawkins, “Body and Soul” (1939).",
     r"\key es \major", r"\time 4/4",
     r"es1:maj7 | c2:m7 f:7 | f:m7 bes:7 | es1:maj7 | as:maj7 | g2:m7 c:7 | f:m7 bes:7 | es1:6",
     r"g'2 bes'4. g'8 | es''4 d''8 c'' a'4 c''4 | as'2 f'8 g' as' c'' | bes'1 | c''4. es''8 c''4 as'4 | bes'4 g'4 e'4 g'4 | as'8 g' f' es' d'4 f'4 | es'1\fermata"),
    ("Groove suave", "David Sanborn", r'\tempo "Funk suave" 4 = 92',
     "O smooth jazz de David Sanborn: semicolcheias com balanço de funk, notas curtas e secas, e notas longas com muita expressão. Colcheias iguais.",
     "Ouça: David Sanborn, “Hideaway” (1980) e “A Change of Heart” (1987); Grover Washington Jr., “Winelight” (1980).",
     r"\key f \major", r"\time 4/4",
     r"d1:m7 | g:7 | d:m7 | g:7 | d:m7 | g:7 | d:m7 | g:7 | d:m7",
     r"r8 a'16 c'' d''8 c''16 a' ~ a'4 r4 | r16 g' a' c'' d''8 c''8 ~ c''4 r4 | f'16 a' c'' a' d''8 c'' a'4 r4 | b'8. a'16 g'8 f' ~ f'2 | "
     r"r8 d''16 d'' c''8 a'16 c'' ~ c''4 a'8 g' | f'8 g'16 a' ~ a'8 b' d''4 r4 | a'16 c'' d'' c'' a'8 g' f' d' ~ d'4 | r2 r8 a'8 d''4 | d''1"),
    ("Chorinho para Pixinguinha", "Pixinguinha", r'\tempo "Choro" 4 = 80',
     "O choro de Pixinguinha: semicolcheias leves e articuladas, arpejos que desenham a harmonia e a ginga da síncope brasileira. Toque sem swing, com a língua leve.",
     "Ouça: Pixinguinha e Benedito Lacerda, gravações de 1946 a 1950 (“Um a Zero”, “Ingênuo”, “Naquele Tempo”); “Carinhoso”.",
     r"\key c \major", r"\time 2/4",
     r"c2 | g:7 | g:7 | c | c:7 | f | d:7 | g:7 | c | g:7 | g:7 | c | a:7 | d:m | g:7 | c",
     r"g'16 e' c' e' g' c'' b' c'' | d''16 b' g' f' d' f' g' b' | a'16 g' fis' g' d''8 b' | c''16 g' e' g' c''4 | "
     r"bes'16 c'' bes' g' e' g' c'' bes' | a'16 f' c' f' a'8 c'' | c''16 a' fis' d' fis' a' c'' a' | b'8 g'16 f' d'4 | "
     r"e'16 g' c'' g' e' g' c'' d'' | b'16 d'' b' g' f' d' b g | a16 b c' d' f' g' a' b' | c''8 g'16 e' c'4 | "
     r"cis''16 a' e' a' cis'' a' g' e' | f'16 a' d'' a' f' d' f' a' | g'16 b' d'' b' a' g' f' d' | c'4 r4"),
]

INSTR = [
    ("alto", "Sax alto (Mi♭)", r"\transpose es c'"),
    ("tenor", "Sax tenor (Si♭)", r"\transpose bes, c'"),
]


def partitura(e, transp, rotulo):
    tit, mestre, tempo, _, _, chave, comp, acordes, mel = e
    return r'''\score {
  %s <<
    \new ChordNames \chordmode { \set chordChanges = ##t %s }
    \new Staff { \clef treble %s %s %s
      %s \bar "|." }
  >>
  \layout { }
}
''' % (transp, acordes, chave, comp, tempo, mel)


def caderno_estilos():
    s = cabecalho("Estudos no estilo dos mestres", "Sete estudos originais para aprender a linguagem dos grandes saxofonistas")
    s += texto(
        "Estes estudos não são transcrições: são melodias minhas, compostas para ensinar a linguagem de cada escola, do bebop ao choro. Cada um aparece em duas versões: sax alto (Mi♭) e sax tenor (Si♭). Soprano usa a versão do tenor; barítono, a do alto.",
        "Como estudar: primeiro ouça os discos indicados. Depois cante o estudo, toque devagar e só então suba o andamento. Os acordes estão escritos acima da pauta, já transpostos para o seu sax: use-os para improvisar depois de tocar o estudo.")
    for k, (chave_instr, nome_instr, transp) in enumerate(INSTR):
        s += (r"\pageBreak" + "\n" if k else "") + secao(f"Parte {k + 1} · {nome_instr}")
        for i, e in enumerate(ESTUDOS):
            s += secao(f"{i + 1} · {e[0]} (no estilo de {e[1]})")
            s += texto(e[3], e[4], tam=-1)
            s += partitura(e, transp, nome_instr)
    gerar("naipe-estudos-estilo", s)
