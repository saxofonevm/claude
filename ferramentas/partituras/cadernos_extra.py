"""
Cadernos do Naipe, parte 2: escalas, escalas do jazz e da música brasileira, intervalos,
som e articulação, leitura rítmica. Usa as ferramentas de gerar.py.
"""
import random
from gerar import (Nota, nota, nome_pt, lykey, frase, cabecalho, texto, secao, pauta, gerar,
                   escala_modo, GRAVE, AGUDO, NAT, LETRAS)

CICLO_MAIOR = ["c", "f", "bb", "eb", "ab", "db", "gb", "b", "e", "a", "d", "g"]
CICLO_MENOR = ["a", "d", "g", "c", "f", "bb", "eb", "g#", "c#", "f#", "b", "e"]

MAIOR = [(0, 0), (1, 2), (2, 4), (3, 5), (4, 7), (5, 9), (6, 11)]
MENOR_NAT = [(0, 0), (1, 2), (2, 3), (3, 5), (4, 7), (5, 8), (6, 10)]
MENOR_HARM = [(0, 0), (1, 2), (2, 3), (3, 5), (4, 7), (5, 8), (6, 11)]
MENOR_MEL = [(0, 0), (1, 2), (2, 3), (3, 5), (4, 7), (5, 9), (6, 11)]


def notas_escala(tonica, graus):
    """Todas as notas da escala dentro da extensão do sax, do grave ao agudo."""
    base = Nota(tonica.l, tonica.a, 2)
    out = []
    for k in range(6):
        r = base.oitava(k)
        for p, s in graus:
            n = r.mais(p, s)
            if GRAVE <= n.midi <= AGUDO:
                out.append(n)
    return sorted(out, key=lambda n: n.midi)


def tonica_grave(tonica):
    t = Nota(tonica.l, tonica.a, 3)
    while t.midi < GRAVE:
        t = t.oitava()
    return t


def extensao(tonica, graus):
    """Da tônica grave sobe até a nota mais aguda, desce até a mais grave e volta à tônica."""
    todas = notas_escala(tonica, graus)
    t = tonica_grave(tonica)
    i = next(k for k, n in enumerate(todas) if n.midi == t.midi)
    seq = todas[i:] + todas[-2::-1] + todas[1:i + 1]
    return frase(seq)


def duas_oitavas(tonica, sobe, desce=None):
    """Duas oitavas (ou uma, se não couber), subindo com 'sobe' e descendo com 'desce'."""
    t = tonica_grave(tonica)
    oit = 2 if t.midi + 24 <= AGUDO else 1
    up = [t.oitava(o).mais(p, s) for o in range(oit) for p, s in sobe] + [t.oitava(oit)]
    dn_graus = desce or sobe
    dn = [t.oitava(o).mais(p, s) for o in range(oit) for p, s in dn_graus] + [t.oitava(oit)]
    seq = up + list(reversed(dn))[1:]
    return frase(seq)


def caderno_escalas():
    s = cabecalho("Escalas maiores e menores", "Em todos os tons e em toda a extensão do saxofone")
    s += texto(
        "Escala bonita é escala igual: mesmo som, mesmo volume e mesmo tempo em todas as notas, do grave ao agudo.",
        "Como estudar: um tom por dia. Primeiro em semínimas a ♩ = 60, depois em colcheias. Toque ligado, depois destacado, depois com as articulações do caderno Som e articulação. Os tons seguem o ciclo das quartas.",
        "Cada escala percorre toda a extensão: começa na tônica grave, sobe até a nota mais aguda que cabe no sax, desce até a mais grave e volta à tônica.")
    s += secao("1 · Escalas maiores")
    for nm in CICLO_MAIOR:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} maior", extensao(r, MAIOR), r"\key %s \major" % lykey(r))
    s += r"\pageBreak" + "\n" + secao("2 · Escalas menores naturais")
    s += texto("A menor natural tem as mesmas notas da maior relativa, começando no sexto grau.")
    for nm in CICLO_MENOR:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} menor natural", extensao(r, MENOR_NAT), r"\key %s \minor" % lykey(r))
    s += r"\pageBreak" + "\n" + secao("3 · Escalas menores harmônicas")
    s += texto("A menor harmônica sobe o sétimo grau meio tom. O salto de um tom e meio entre o sexto e o sétimo grau dá o som árabe e é a base dos acordes dominantes no tom menor.")
    for nm in CICLO_MENOR:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} menor harmônica", extensao(r, MENOR_HARM), r"\key %s \minor" % lykey(r))
    s += r"\pageBreak" + "\n" + secao("4 · Escalas menores melódicas")
    s += texto("Na forma tradicional, a menor melódica sobe com o sexto e o sétimo graus elevados e desce como a menor natural. No jazz ela é tocada igual nos dois sentidos.")
    for nm in CICLO_MENOR:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} menor melódica", duas_oitavas(r, MENOR_MEL, MENOR_NAT), r"\key %s \minor" % lykey(r))
    s += r"\pageBreak" + "\n" + secao("5 · Escalas maiores em terças")
    s += texto("Terças: 1-3, 2-4, 3-5… subindo e descendo. Treina o ouvido e a digitação ao mesmo tempo.")
    for nm in CICLO_MAIOR:
        r = tonica_grave(nota(nm, 4))
        esc = escala_modo(r, 0)
        duas = esc[:-1] + [n.oitava() for n in esc[:-1]]
        seq = []
        for i in range(8):
            seq += [duas[i], duas[i + 2]]
        for i in range(8, 0, -1):
            seq += [duas[i + 1] if i + 1 < len(duas) else duas[i], duas[i - 1]][::-1][::-1] if False else [duas[i + 1], duas[i - 1]] if i + 1 < len(duas) else [duas[i], duas[i - 2]]
        seq.append(duas[0])
        seq = [n.oitava(-1) if n.midi > AGUDO else n for n in seq]
        s += pauta(f"{nome_pt(r)} maior em terças", frase(seq), r"\key %s \major" % lykey(r))
    gerar("naipe-escalas", s)


# ---------- Escalas do jazz e da música brasileira ----------
SUST = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"]
BEMOL = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"]


def por_altura(m, bemol=False):
    nm = (BEMOL if bemol else SUST)[m % 12]
    return nota(nm, m // 12 - 1)


def caderno_jazz():
    s = cabecalho("Escalas do jazz e da música brasileira", "Cromática, tons inteiros, diminutas, pentatônicas, blues e bebop")
    s += texto(
        "Estas escalas são o vocabulário do improviso. Toque cada uma devagar, ouça a cor e depois experimente improvisar só com as notas dela sobre um playback.",
        "Os tons seguem o ciclo das quartas. Nas escalas simétricas (cromática, tons inteiros e diminutas) poucas formas diferentes cobrem todos os tons.")
    s += secao("1 · Escala cromática")
    s += texto("Todas as notas, de meio em meio tom. Sustenidos na subida e bemóis na descida. Dedos relaxados e bem perto das chaves.")
    up = [por_altura(m) for m in range(GRAVE, AGUDO + 1)]
    dn = [por_altura(m, True) for m in range(AGUDO - 1, GRAVE - 1, -1)]
    s += pauta("Toda a extensão, do Si♭ grave ao Fá agudo", frase(up + dn))
    grupos = []
    for m in range(60, 77):
        grupos += [por_altura(m), por_altura(m + 1), por_altura(m + 2)]
    s += pauta("Em grupos de três notas", frase(grupos + [por_altura(79)]))
    s += secao("2 · Escala de tons inteiros")
    s += texto("Seis notas, todas a um tom de distância. Só existem duas escalas de tons inteiros. Som de sonho, usada sobre o acorde dominante com quinta aumentada.")
    for ini, nome in [(60, "Dó"), (61, "Ré♭")]:
        seq = [por_altura(m, ini == 61) for m in range(ini, ini + 25, 2)]
        seq = [n for n in seq if n.midi <= AGUDO]
        s += pauta(f"Tons inteiros a partir de {nome}", frase(seq + seq[-2::-1]))
    s += secao("3 · Escalas diminutas")
    s += texto("Oito notas, alternando tom e semitom. A diminuta tom-semitom vai sobre o acorde diminuto; a semitom-tom (diminuta dominante) vai sobre o acorde dominante. Três formas de cada cobrem os doze tons.")
    for ini, nome in [(60, "Dó"), (61, "Ré♭"), (62, "Ré")]:
        seq, m = [], ini
        for k in range(17):
            seq.append(por_altura(m, ini == 61)); m += 2 if k % 2 == 0 else 1
        s += pauta(f"Diminuta tom-semitom a partir de {nome}", frase(seq[:17] + seq[15::-1]))
    for ini, nome in [(60, "Dó"), (61, "Ré♭"), (62, "Ré")]:
        seq, m = [], ini
        for k in range(17):
            seq.append(por_altura(m, ini == 61)); m += 1 if k % 2 == 0 else 2
        s += pauta(f"Diminuta semitom-tom a partir de {nome}", frase(seq[:17] + seq[15::-1]))
    s += r"\pageBreak" + "\n" + secao("4 · Pentatônica maior")
    s += texto("Cinco notas: 1, 2, 3, 5 e 6 da escala maior. Sem semitons, por isso soa bem sobre quase tudo no tom. A escala do baião, do country e do pop.")
    PM = [(0, 0), (1, 2), (2, 4), (4, 7), (5, 9)]
    for nm in CICLO_MAIOR:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} pentatônica maior", duas_oitavas(r, PM), r"\key %s \major" % lykey(r))
    s += r"\pageBreak" + "\n" + secao("5 · Pentatônica menor")
    s += texto("Cinco notas: 1, ♭3, 4, 5 e ♭7. A escala do rock, do soul e do primeiro improviso.")
    Pm = [(0, 0), (2, 3), (3, 5), (4, 7), (6, 10)]
    for nm in CICLO_MENOR:
        r = nota(nm, 4)
        s += pauta(f"{nome_pt(r)} pentatônica menor", duas_oitavas(r, Pm), r"\key %s \minor" % lykey(r))
    s += r"\pageBreak" + "\n" + secao("6 · Escala blues")
    s += texto("A pentatônica menor com a ♭5, a blue note. Arraste levemente a blue note e resolva na quinta ou na quarta.")
    BL = [(0, 0), (2, 3), (3, 5), (4, 6), (4, 7), (6, 10)]
    for nm in CICLO_MAIOR:
        r = nota(nm, 4)
        s += pauta(f"Blues em {nome_pt(r)}", duas_oitavas(r, BL), r"\key c \major")
    s += r"\pageBreak" + "\n" + secao("7 · Escala bebop dominante")
    s += texto("O mixolídio com a sétima maior de passagem: oito notas, que fazem as notas do acorde caírem nos tempos. Toque descendo, a partir da tônica, em colcheias com swing.")
    for nm in CICLO_MAIOR:
        r = tonica_grave(nota(nm, 4)).oitava()
        if r.midi + 12 > AGUDO:
            r = r.oitava(-1)
        graus = [(0, 0), (1, 2), (2, 4), (3, 5), (4, 7), (5, 9), (6, 10), (6, 11)]
        topo = r.oitava()
        desce = [topo] + [r.mais(p, s_) for p, s_ in reversed(graus)][:-1] + [r]
        sobe = [r.mais(p, s_) for p, s_ in graus] + [topo]
        s += pauta(f"{nome_pt(r)} bebop dominante", frase(desce + sobe[1:]), r"\key c \major")
    gerar("naipe-escalas-jazz", s)


# ---------- Intervalos ----------
INTERVALOS = [(2, "terças"), (3, "quartas"), (4, "quintas"), (5, "sextas"), (6, "sétimas"), (7, "oitavas")]
TONS_INT = ["c", "f", "g", "bb", "d", "eb"]


def caderno_intervalos():
    s = cabecalho("Intervalos", "Terças, quartas, quintas, sextas, sétimas e oitavas na escala maior")
    s += texto(
        "Intervalo é a distância entre duas notas. Tocar intervalos treina o ouvido, a afinação e a troca de registro, e prepara para ler saltos e improvisar.",
        "Como estudar: cante a nota de cima antes de tocar. Nos saltos grandes, mantenha o ar firme e a embocadura parada: quem muda é o dedo. Primeiro ligado, depois destacado.")
    for passos, nome in INTERVALOS:
        s += (r"\pageBreak" + "\n" if passos > 2 else "") + secao(f"Intervalos de {nome}")
        for nm in TONS_INT:
            r = tonica_grave(nota(nm, 4))
            esc = escala_modo(r, 0)
            graus = esc[:-1] + [n.oitava() for n in esc[:-1]] + [n.oitava(2) for n in esc[:-1]]
            seq = []
            for i in range(8):
                seq += [graus[i], graus[i + passos]]
            for i in range(7, -1, -1):
                seq += [graus[i + passos], graus[i]]
            if max(n.midi for n in seq) > AGUDO:
                # desce uma oitava se a tônica permitir; se não, encurta a subida
                if min(n.midi for n in seq) - 12 >= GRAVE:
                    seq = [n.oitava(-1) for n in seq]
                else:
                    pares = [(seq[k], seq[k + 1]) for k in range(0, len(seq), 2)]
                    pares = [p for p in pares if max(p[0].midi, p[1].midi) <= AGUDO]
                    seq = [x for p in pares for x in p]
            seq.append(seq[0] if seq[0].midi == r.midi else r)
            s += pauta(f"{nome.capitalize()} em {nome_pt(r)} maior", frase(seq), r"\key %s \major" % lykey(r))
    gerar("naipe-intervalos", s)


# ---------- Som e articulação ----------
ARTICULACOES = [
    ("Tudo ligado", ["(", "", "", ")"]),
    ("Tudo destacado (língua leve)", ["", "", "", ""]),
    ("Staccato", ["-.", "-.", "-.", "-."]),
    ("Tenuto: notas longas e separadas", ["--", "--", "--", "--"]),
    ("Duas ligadas, duas destacadas", ["(", ")", "", ""]),
    ("Duas destacadas, duas ligadas", ["", "", "(", ")"]),
    ("Ligadas de duas em duas", ["(", ")", "(", ")"]),
    ("Uma destacada, três ligadas", ["", "(", "", ")"]),
    ("Três ligadas, uma destacada", ["(", "", ")", ""]),
    ("Acento no tempo", ["->", "", "->", ""]),
    ("Acento no contratempo", ["", "->", "", "->"]),
    ("Articulação do swing: ligar o contratempo ao tempo", ["", "(", ")", "("]),
]


def escala_artic(sufixos):
    do = nota("c", 4)
    esc = escala_modo(do, 0)
    duas = esc[:-1] + [n.oitava() for n in esc[:-1]] + [do.oitava(2), do.oitava(2).mais(1, 2)]
    up = duas[:16]
    dn = [duas[14 - k] if 14 - k >= 0 else None for k in range(15)] + [Nota(6, 0, 3)]
    seq = up + dn
    swing = sufixos[3] == "(" and sufixos[1] == "("
    out = []
    for i, n in enumerate(seq):
        suf = sufixos[i % 4]
        if swing:
            suf = "(" if i % 2 == 1 and i < len(seq) - 1 else ")" if i % 2 == 0 and i > 0 else ""
        out.append(n.ly("8" if i == 0 else "") + suf.replace("-.", "-.").replace("--", "--"))
    fecho = ")" if swing else ""
    return " ".join(out) + fecho + " " + do.ly("1")


def caderno_som():
    s = cabecalho("Som e articulação", "Notas longas, dinâmica, harmônicos e padrões de articulação")
    s += texto(
        "O som é o cartão de visita do saxofonista. Dez minutos por dia destes exercícios mudam o seu timbre em poucas semanas.",
        "Como estudar: use o afinador nas notas longas. Respire fundo, apoie o ar e deixe a garganta aberta. Grave e ouça.")
    s += secao("1 · Notas longas com crescendo e diminuendo")
    s += texto("Cada nota dura um compasso: comece em pianíssimo, cresça até forte na metade e volte ao pianíssimo, sem mudar a afinação. ♩ = 60.")
    def longas(ms, bemol=False):
        partes = []
        for m in ms:
            n = por_altura(m, bemol).ly()
            partes.append(f"{n}2\\pp\\< ~ {n}2\\f\\> r4\\! r4 r2")
        return " ".join(partes)
    s += pauta("Do meio para o grave", longas(range(67, GRAVE - 1, -1), True))
    s += pauta("Do meio para o agudo", longas(range(67, AGUDO + 1)))
    s += r"\pageBreak" + "\n" + secao("2 · Dinâmica na escala")
    s += texto("A mesma escala em seis níveis de volume. O som não pode afinar para cima no forte nem para baixo no piano.")
    for din in ["pp", "p", "mp", "mf", "f", "ff"]:
        esc = escala_modo(nota("c", 4), 0)
        seq = esc + esc[-2::-1]
        mus = " ".join(n.ly("4" if i == 0 else "") + (f"\\{din}" if i == 0 else "") for i, n in enumerate(seq[:-1])) + " " + seq[-1].ly("4") + " r2."
        s += pauta(f"Escala de Dó em {din}", mus)
    s += secao("3 · Harmônicos")
    s += texto("Dedilhe a nota grave (a primeira de cada compasso) e, sem trocar o dedo, faça soar as notas de cima só com o ar, a língua e a garganta, como quem diz “ô-ê-i”. O círculo sobre a nota quer dizer: dedilhado da nota grave. É o melhor exercício para timbre e para o registro agudo.")
    for fund, nm in [(58, "Si♭"), (59, "Si"), (60, "Dó"), (61, "Dó♯"), (62, "Ré")]:
        serie = [fund, fund + 12, fund + 19, fund + 24, fund + 28]
        notas = [por_altura(m, fund == 58) for m in serie]
        mus = notas[0].ly("2") + " " + " ".join(n.ly("2") + "\\flageolet" for n in notas[1:]) + " " + notas[0].ly("1")
        s += pauta(f"Dedilhado de {nm} grave", mus)
    s += r"\pageBreak" + "\n" + secao("4 · Doze padrões de articulação")
    s += texto("A escala de Dó em duas oitavas com doze articulações diferentes. Depois de dominar, aplique os mesmos padrões às escalas e arpejos dos outros cadernos.")
    for nome, suf in ARTICULACOES:
        s += pauta(nome, escala_artic(suf))
    gerar("naipe-som-articulacao", s)


# ---------- Leitura rítmica ----------
N = "b'"
CEL = {
    "q": f"{N}4", "qq": f"{N}4 {N}4", "ee": f"{N}8 {N}8", "h": f"{N}2",
    "ssss": f"{N}16 {N} {N} {N}", "ess": f"{N}8 {N}16 {N}", "sse": f"{N}16 {N} {N}8",
    "ses": f"{N}16 {N}8 {N}16", "es.": f"{N}8. {N}16", "se.": f"{N}16 {N}8.",
    "re": f"r8 {N}8", "rs": f"r16 {N} {N} {N}", "t": f"\\tuplet 3/2 {{ {N}8 {N} {N} }}",
    "tq": f"\\tuplet 3/2 {{ {N}4 {N}8 }}", "r4": "r4",
}


def linha(alvo, apoio, semente, compassos=8):
    """Oito compassos de 2/4: o ritmo novo nos compassos ímpares, os já conhecidos nos pares."""
    rnd = random.Random(semente)
    out = []
    for c in range(compassos):
        if c == compassos - 1:
            out.append(f"{N}4 r4")
            continue
        cels = [rnd.choice(alvo) if (c % 2 == 0 or rnd.random() < .3) else rnd.choice(apoio) for _ in range(2)]
        if c % 2 == 0 and not any(x in alvo for x in cels):
            cels[0] = rnd.choice(alvo)
        out.append(" ".join(CEL[x] for x in cels))
    return " | ".join(out)


def caderno_ritmo():
    s = cabecalho("Leitura rítmica", "Das figuras básicas às levadas brasileiras e ao swing")
    s += texto(
        "Ritmo se aprende primeiro com o corpo. Em cada linha: bata o pé nos tempos, diga o ritmo em voz alta (“tá-ta-ta”) e só depois toque, numa nota só (Si).",
        "Comece com o metrônomo em ♩ = 60. Em cada lição o ritmo novo aparece nos compassos ímpares, misturado com os que você já conhece.")
    licoes = [
        ("1 · Semínimas e colcheias", ["ee"], ["q", "r4"]),
        ("2 · Quatro semicolcheias", ["ssss"], ["q", "ee"]),
        ("3 · Colcheia e duas semicolcheias", ["ess"], ["ssss", "ee", "q"]),
        ("4 · Duas semicolcheias e colcheia", ["sse"], ["ess", "ssss", "ee"]),
        ("5 · Colcheia pontuada e semicolcheia", ["es."], ["ess", "sse", "ee"]),
        ("6 · Síncope: semicolcheia, colcheia, semicolcheia", ["ses"], ["ssss", "ess", "sse", "ee"]),
        ("7 · Contratempo", ["re", "rs"], ["ee", "ssss", "q"]),
        ("8 · Semicolcheia e colcheia pontuada", ["se."], ["es.", "ses", "ee"]),
        ("9 · Tercinas", ["t", "tq"], ["ee", "q"]),
        ("10 · Revisão geral", ["ses", "es.", "se.", "t", "re"], ["ssss", "ess", "sse", "ee"]),
    ]
    for k, (tit, alvo, apoio) in enumerate(licoes):
        s += secao(tit)
        for j in range(3):
            s += pauta(f"Linha {j + 1}", linha(alvo, apoio, 100 * k + j), r"\key c \major", r"\time 2/4")
    s += r"\pageBreak" + "\n" + secao("11 · Compasso 6/8")
    s += texto("Seis colcheias por compasso, sentidas em dois tempos (duas semínimas pontuadas). O compasso da tarantela, da ciranda e de muita música africana.")
    c68 = [f"{N}4.", f"{N}4 {N}8", f"{N}8 {N} {N}", f"{N}8. {N}16 {N}8", f"{N}8 {N}4", "r8 " + f"{N}8 {N}"]
    rnd = random.Random(7)
    for j in range(3):
        comp = [" ".join(rnd.choice(c68) for _ in range(2)) for _ in range(7)] + [f"{N}4. r4."]
        s += pauta(f"Linha {j + 1}", " | ".join(comp), r"\key c \major", r"\time 6/8")
    s += secao("12 · Levadas brasileiras")
    s += texto("Os ritmos que todo saxofonista brasileiro precisa ter no corpo. Toque cada levada repetindo até soar natural e depois ouça uma gravação do estilo.")
    lev = [
        ("Baião (o ritmo da zabumba e do triângulo)", f"{N}8. {N}16 ~ {N}8 {N}8"),
        ("Maxixe e choro (a síncope brasileira)", f"{N}16 {N}8 {N}16 {N}8 {N}8"),
        ("Samba: teleco-teco do tamborim", f"{N}16 r {N} r {N} {N} r {N} | r {N} r {N} {N} r {N} r"),
        ("Xote", f"{N}8. {N}16 {N}8 {N}8 | {N}4 {N}4"),
        ("Frevo", f"{N}16 {N} {N} {N} {N}8 {N}8 | {N}16 {N}8 {N}16 {N}8 r8"),
    ]
    for nome, cel in lev:
        s += pauta(nome, " | ".join([cel] * (4 if "|" not in cel else 2)) + f" | {N}4 r4", r"\key c \major", r"\time 2/4")
    s += r"\pageBreak" + "\n" + secao("13 · Swing")
    s += texto("No swing as colcheias escritas iguais são tocadas como tercina: a primeira longa e a segunda curta (“dú-ba”). Acentue levemente o contratempo e ligue o contratempo ao tempo seguinte.")
    sw = [f"{N}8 {N}8", f"\\tuplet 3/2 {{ {N}4 {N}8 }}", f"r8 {N}8", f"{N}4", f"{N}8 {N}8->"]
    rnd = random.Random(11)
    for j in range(3):
        comp = [" ".join(rnd.choice(sw) for _ in range(4)) for _ in range(7)] + [f"{N}4 r4 r2"]
        s += pauta(f"Linha {j + 1} (colcheias com swing)", " | ".join(comp), r"\key c \major", r"\time 4/4")
    gerar("naipe-leitura-ritmica", s)


def todos():
    caderno_escalas()
    caderno_jazz()
    caderno_intervalos()
    caderno_som()
    caderno_ritmo()
