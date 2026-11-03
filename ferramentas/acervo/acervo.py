#!/usr/bin/env python3
"""Monta acervo.js (na raiz do app) a partir do inventário do Drive.

Entrada: arquivos.json e pastas.json (inventário do Drive, nesta pasta).
Saída:   ../../acervo.js  -> window.CMA_ACERVO = { ramos: { <ramo>: {...} } }

Cada ramificação recebe:
  pastas:  play-alongs e coleções inteiras (link para a pasta)
  livros:  métodos, songbooks e real books (link para o PDF)
  musicas: músicas avulsas, com as versões Sib, Mib e Playback juntas
"""
import json, re, unicodedata as ud, os

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = json.load(open(os.path.join(AQUI, "arquivos.json"), encoding="utf-8"))
PASTAS = json.load(open(os.path.join(AQUI, "pastas.json"), encoding="utf-8"))


def norm(t):
    t = ud.normalize("NFKD", t or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def raiz_de(pid):
    titulo = None
    while pid in PASTAS:
        titulo = ud.normalize("NFC", PASTAS[pid]["t"])
        pid = PASTAS[pid]["p"]
    return titulo or ""


# ---------- Pastas inteiras (play-alongs) por ramificação ----------
PASTAS_RAMO = [
    ("16kM8nbJUPcDHi6LtcXsoA0FlUpISuqru", "Ernesto Nazareth · Classics of the Brazilian Choro (play-along)", ["ritmo-samba-choro", "orn-choro"]),
    ("1ARPIZupVelSCx3BbBZip_RQs_jL2CIP7", "Maurício Carrilho · choros (play-along)", ["ritmo-samba-choro", "art-choro"]),
    ("1HadeEkSVDV6Y9rRKZyoe8Ll6V_YjFa3K", "Maurício Carrilho e Paula Borghi (play-along)", ["ritmo-samba-choro", "art-choro"]),
    ("1IqgNxpR0cmCGUrTqAusurEuIWzZvVaXc", "Chorinhos didáticos, com contagem (play-along)", ["ritmo-samba-choro", "art-choro"]),
    ("1DuqD0i_7DTSJhv4IaL4yJsQopMzXtOwl", "Choros em dueto · Pixinguinha", ["orn-choro", "escuta-brasil"]),
    ("18Uj2De4RrIwFno2pSM7T19Smqa0jv_f0", "Jack Long · Latin Playalong (sax alto)", ["ritmo-bossa"]),
    ("1nFydjJ_4_DeLmoWcsaMdjvKuD6pBWEwT", "Alto Sax Playalongs · Jazz Standards", ["ritmo-swing"]),
    ("1_cS6_-zGiavmCxkQAMaOBTKnqdpb0xra", "Carl Strommen · Jazz Standards (sax alto)", ["ritmo-swing"]),
    ("1CzKDnpzbDyUX748yL46iLeQLejQegdsQ", "In Session with Charlie Parker (Mib e Sib)", ["art-jazz", "escuta-saxofonistas"]),
    ("1gg5NOUKeVmH4vNY8wy-7t2yJtkTTEJ-4", "Niehaus · Jazz Conception Vol. 1, exercícios 1–12 (play-along)", ["ritmo-swing", "art-jazz"]),
    ("1lIciaLULwCmSAxoWh04lwEo5qlKLGqlg", "Niehaus · Jazz Conception Vol. 2 (play-along)", ["art-jazz"]),
    ("1cmnL4d3Xx5wH6VSXufC5Flxmw7PKgPUf", "Niehaus · Jazz Conception Vol. 3 (play-along)", ["art-jazz"]),
    ("1jgVQjFMNDU3Yx1mF6HX7QrddmBwSemsL", "Bob Mintzer · 14 Jazz & Funk Etudes (play-along)", ["ritmo-swing", "art-acentos"]),
    ("1e6KJfV1wSL-evEdFZjuWPYWxFjLcWWf1", "Bob Mintzer · 14 Blues & Funk Etudes (play-along)", ["ritmo-swing", "orn-popular"]),
    ("1330bZHIfrPWjcy4gDnyF2cr43qCYPEq6", "Bob Mintzer · 12 Contemporary Jazz Etudes (Sib)", ["art-jazz"]),
    ("13tC9wTqQSH-7KohxgfhdKXKnKcJAytNO", "Bob Mintzer · 15 Easy Jazz, Blues & Funk Etudes (Sib, com mp3)", ["ritmo-swing"]),
    ("10IONfIVeq5xRVQ7zVeFJyWYYw1bw6nrg", "Jack Long · Jazz & Blues Playalong Solos (sax alto)", ["orn-popular"]),
    ("1Gj7cFGK4wnCMtS-zPl8wH1IPYcHX7O38", "100 Blues Riffs for Tenor Sax (Sib)", ["orn-popular"]),
    ("18GSvQHgQHoH17lvTPRjuO40UH7OKfbbS", "Bob Stoloff · Blues Scatitudes", ["orn-popular", "escuta-saxofonistas"]),
    ("1MX_xwty8V_0woPU29k5lMvKGDwGWhjE5", "Greg Fishman · Hip Licks Vol. 1 (play-along)", ["art-jazz"]),
    ("1LC0_Qp1hg7kjq2j0iIcm_mH-ALjQg_c9", "David Liebman (play-along)", ["melodia-arpejos"]),
    ("1AY_w4quMQo101b0MOjjpFwuYeU70Hm8P", "Electric Jazz Jam Along Vol. 1 (Sib)", ["art-acentos"]),
    ("1novDFOR4hmE-o-Y5Rea1gNCE5hUnkdw0", "Alto Sax Playalongs · Performance Vol. 3", ["din-emocao"]),
    ("1Z3LJXpi2PY1kEqAI-_rS2N7fzvmEMnMJ", "Arturo Himmer · Sax Plus!", ["melodia-musicas"]),
    ("1JSrUZ-nALAjDLn0vvKfgMKxBk7QX8MDJ", "26 duetos (Mib e Sib)", ["melodia-intervalos"]),
    ("19zyr2vAQP-vs26u5bGfiwh03KXdU4i9B", "Áudios das lições do método Amadeu Russo", ["escuta-setup"]),
]

# ---------- Livros (métodos, songbooks, real books) ----------
# (regex no título normalizado, nome exibido, ramificações)
LIVROS = [
    # Songbooks brasileiros
    (r"bossa nova songbook 1", "Bossa Nova Songbook 1 · Almir Chediak", ["ritmo-bossa", "art-bossa"]),
    (r"bossa nova songbook 2", "Bossa Nova Songbook 2 · Almir Chediak", ["ritmo-bossa", "art-bossa"]),
    (r"bossa nova songbook 3", "Bossa Nova Songbook 3 · Almir Chediak", ["ritmo-bossa", "art-bossa"]),
    (r"tom jobim songbook vol iii", "Tom Jobim Songbook Vol. III", ["ritmo-bossa"]),
    (r"tom jobim songbook vol ii$", "Tom Jobim Songbook Vol. II", ["ritmo-bossa"]),
    (r"tom jobim songbook vol i$", "Tom Jobim Songbook Vol. I", ["ritmo-bossa"]),
    (r"the brazil real book", "The Brazil Real Book (bossa e jazz)", ["ritmo-bossa", "melodia-musicas"]),
    (r"songbook choro chediak vol 2", "Songbook Choro Vol. 2 · Almir Chediak", ["ritmo-samba-choro", "orn-choro"]),
    (r"^choro brasileiro ii", "Choro Brasileiro II", ["ritmo-samba-choro"]),
    (r"omelhordepixinguinha", "O Melhor de Pixinguinha (sax tenor)", ["orn-choro", "escuta-brasil"]),
    (r"omelhordochorobrasileiroparasaxofonetenorvol1", "O Melhor do Choro Brasileiro Vol. 1 (sax tenor)", ["ritmo-samba-choro", "art-choro"]),
    (r"omelhordochorobrasileiroparasaxofonetenorvol2", "O Melhor do Choro Brasileiro Vol. 2 (sax tenor)", ["ritmo-samba-choro", "art-choro"]),
    (r"omelhordochorobrasileiroparasaxofonetenorvol3", "O Melhor do Choro Brasileiro Vol. 3 (sax tenor)", ["ritmo-samba-choro", "art-choro"]),
    (r"o melhor do choro brasileiro vol i sax alto", "O Melhor do Choro Brasileiro Vol. I (sax alto)", ["ritmo-samba-choro", "art-choro"]),
    (r"o melhor do choro brasileiro vol ii sax alto", "O Melhor do Choro Brasileiro Vol. II (sax alto)", ["ritmo-samba-choro", "art-choro"]),
    (r"pixiguinha brazilian composer", "Pixinguinha · Master of Choro", ["orn-choro"]),
    (r"pixinguinha songbook chorinho", "Pixinguinha Songbook · Chorinho", ["orn-choro"]),
    (r"roda de choro vol3", "Roda de Choro Vol. 3", ["ritmo-samba-choro"]),
    (r"roda de choro vol5", "Roda de Choro Vol. 5", ["ritmo-samba-choro"]),
    (r"noel rosa songbook vol 1", "Noel Rosa Songbook Vol. 1", ["ritmo-samba-choro"]),
    (r"noel rosa songbook vol 2", "Noel Rosa Songbook Vol. 2", ["ritmo-samba-choro"]),
    (r"noel rosa songbook vol 3", "Noel Rosa Songbook Vol. 3", ["ritmo-samba-choro"]),
    (r"songbook o melhor de luiz gonzaga", "O Melhor de Luiz Gonzaga", ["ritmo-baiao"]),
    (r"songbook tributo a luiz gonzaga", "Tributo a Luiz Gonzaga", ["ritmo-baiao"]),
    (r"songbook baiao varios", "Songbook Baião (vários)", ["ritmo-baiao"]),
    (r"mpb jazz songbook 261", "MPB Jazz Songbook (261 partituras)", ["melodia-musicas"]),
    (r"djavan vol ii", "Djavan Songbook Vol. II · Almir Chediak", ["melodia-musicas"]),
    (r"ivan lins songbook vol 1", "Ivan Lins Songbook Vol. 1", ["melodia-musicas"]),
    (r"ivan lins songbook vol 2", "Ivan Lins Songbook Vol. 2", ["melodia-musicas"]),
    (r"songbook chico buarque brazilian", "Chico Buarque · Brazilian Composer", ["melodia-musicas"]),
    (r"gil songbook vol 1 e 2", "Gilberto Gil Songbook Vol. 1 e 2", ["melodia-musicas"]),
    (r"ed motta songbook", "Ed Motta Songbook", ["melodia-musicas"]),
    (r"kind of blue", "Miles Davis · Kind of Blue (partitura completa)", ["escuta-saxofonistas", "ritmo-swing"]),
    (r"kenny g the moment book$", "Kenny G · The Moment", ["din-emocao"]),
    (r"kenny g breathless", "Kenny G · Breathless", ["din-emocao"]),
    (r"kenny g innocence", "Kenny G · Innocence", ["din-emocao"]),
    (r"50 pop tunes for alto sax", "50 Pop Tunes for Alto Sax", ["melodia-musicas"]),
    (r"mancini song book", "Henry Mancini Song Book", ["din-emocao"]),
    # Real Books
    (r"^the real book vol 1 eb$", "The Real Book Vol. 1 (Mib)", ["ritmo-swing"]),
    (r"^the real book vol 2 eb$", "The Real Book Vol. 2 (Mib)", ["ritmo-swing"]),
    (r"^real book vol 1 in bb$", "Real Book Vol. 1 (Sib)", ["ritmo-swing"]),
    (r"^real book vol 2 in bb$", "Real Book Vol. 2 (Sib)", ["ritmo-swing"]),
    (r"^real book vol 3 in bb$", "Real Book Vol. 3 (Sib)", ["ritmo-swing"]),
    (r"the new real book vol 1 bb", "The New Real Book Vol. 1 (Sib)", ["ritmo-swing"]),
    (r"the new real book vol 3 eb", "The New Real Book Vol. 3 (Mib)", ["ritmo-swing"]),
    (r"real book of blues", "The Real Book of Blues", ["orn-popular"]),
    (r"real easy book vol 1", "The Real Easy Book Vol. 1 (jazz fácil)", ["ritmo-swing", "melodia-musicas"]),
    (r"the standards real book", "The Standards Real Book", ["din-emocao"]),
    (r"bill evans fake book", "Bill Evans Fake Book", ["melodia-arpejos"]),
    # Métodos e estudos
    (r"m mule 25 estudos diarios", "Marcel Mule · 25 Estudos Diários", ["melodia-escalas"]),
    (r"15 etudes de rythme", "15 Études de Rythme", ["ritmo-base"]),
    (r"altissimo fingerings", "Haimovich · Dedilhados do registro altíssimo", ["melodia-escalas"]),
    (r"haimovich chromatic scale", "Haimovich · Escala cromática (exercício)", ["melodia-escalas"]),
    (r"haimovich daily exercises", "Haimovich · Exercícios diários", ["melodia-escalas"]),
    (r"rochut melodious etudes", "Rochut · Melodious Etudes (estudos de legato)", ["art-basicas"]),
    (r"danhiggins giantsteps", "Dan Higgins · Giant Steps (estudo)", ["melodia-arpejos"]),
    (r"liebman how to approach standards", "David Liebman · Standards cromaticamente", ["melodia-arpejos"]),
    (r"greg fishman hip licks", "Greg Fishman · Hip Licks Vol. 1", ["art-jazz"]),
    (r"improvisacao jazz para sax charles mcneal", "Charles McNeal · Improvisação jazz para sax", ["ritmo-swing"]),
    (r"improvisacao para sax daniel zinn", "Daniel Zinn · Improvisação para sax", ["ritmo-swing"]),
    (r"john coltrane improvised saxophone solos", "John Coltrane · Solos transcritos", ["escuta-saxofonistas", "melodia-arpejos"]),
    (r"john coltrane patterns", "John Coltrane · Patterns", ["melodia-arpejos"]),
    (r"sonny rollins improvised saxophone solos", "Sonny Rollins · Solos transcritos", ["escuta-saxofonistas"]),
    (r"transcription giant steps", "Giant Steps · transcrição de Brecker e Mintzer", ["escuta-saxofonistas"]),
    (r"lennie niehaus jazz improvisation", "Lennie Niehaus · Jazz Improvisation", ["art-jazz"]),
    (r"advanced jazz conception", "Lennie Niehaus · Advanced Jazz Conception", ["art-jazz"]),
    (r"basic jazz conception for saxophone vol 2", "Lennie Niehaus · Jazz Conception Vol. 2", ["art-jazz"]),
    (r"metodo de solfejo bona", "Bona · Método de solfejo", ["ritmo-base"]),
    (r"principios basicos da musica", "Priolli · Princípios Básicos da Música", ["ritmo-base"]),
    (r"refaceamento de boquilhas", "Refaceamento de boquilhas", ["escuta-setup"]),
    (r"rubank advanced method vol 2", "Rubank · Advanced Method Vol. 2", ["melodia-escalas"]),
    (r"rubank elementary method", "Rubank · Elementary Method", ["ritmo-base", "art-basicas"]),
    (r"da capo sax tenor", "Da Capo (sax tenor) · Joel Barbosa", ["ritmo-base"]),
    (r"guy lacour 50 estudos", "Guy Lacour · 50 Estudos Fáceis e Progressivos Vol. 2", ["melodia-metodo", "art-basicas"]),
    (r"james rae 12 estudos modernos", "James Rae · 12 Estudos Modernos", ["ritmo-swing", "art-acentos"]),
    (r"scales chords and solos woody herman", "Woody Herman · Scales, Chords and Solos", ["melodia-escalas"]),
    (r"teoria musical estrutura tonal", "Maria Lúcia Pascoal · Estrutura Tonal (harmonia)", ["melodia-arpejos"]),
    (r"teoria musical guia de acordes", "Guia de acordes (harmonia)", ["melodia-arpejos"]),
    (r"saxophone technique", "Saxophone Technique", ["din-niveis"]),
    (r"sax improvising", "Sax Improvising", ["ritmo-swing"]),
]

# ---------- Músicas avulsas por ramificação ----------
MUSICAS = {
    "ritmo-samba-choro": ["carinhoso", "lamentos", "um a zero", "1 x 0", "naquele tempo", "brasileirinho", "tico tico",
        "noites cariocas", "doce de coco", "odeon", "apanhei te cavaquinho", "ingenuo", "segura ele", "chorando baixinho",
        "andre de sapato novo", "flor amorosa", "atraente", "corta jaca", "tenebroso", "espinha de bacalhau", "assanhado",
        "vou vivendo", "pedacinhos do ceu", "delicado", "bole bole", "sonoroso", "cochichando", "eponina", "escovado",
        "matuto", "favorito", "expansiva", "batuque", "aquarela do brasil", "trem das onze", "tristeza", "mas que nada",
        "o bebado e a equilibrista", "as rosas nao falam", "o mundo e um moinho", "conversa de botequim", "feitio de oracao",
        "com que roupa", "agoniza mas nao morre", "o que e o que e", "deixa a vida me levar", "aquarela"],
    "ritmo-baiao": ["asa branca", "baiao", "xote das meninas", "juazeiro", "assum preto", "qui nem jilo", "que nem jilo",
        "paraiba", "feira de mangaio", "sabia", "riacho do navio", "eu so quero um xodo", "respeita januario",
        "a vida do viajante", "olha pro ceu", "o xote das meninas", "forro", "xote", "vem morena", "numa sala de reboco"],
    "ritmo-frevo": ["vassourinhas", "frevo", "gostosao", "ultimo dia", "freio a oleo", "voltei recife"],
    "ritmo-bossa": ["garota de ipanema", "girl from ipanema", "desafinado", "chega de saudade", "corcovado", "wave",
        "samba de uma nota so", "one note samba", "insensatez", "how insensitive", "agua de beber", "meditacao", "meditation",
        "dindi", "triste", "so danco samba", "o barquinho", "manha de carnaval", "samba de verao", "summer samba",
        "aguas de marco", "tarde em itapoa", "berimbau", "felicidade", "eu sei que vou te amar", "estate", "fotografia",
        "samba de orfeu", "ligia", "inutil paisagem", "vivo sonhando", "blue bossa", "recado bossa nova", "samba do aviao",
        "o pato", "rio", "a felicidade", "sabia", "samba em preludio", "se todos fossem iguais a voce", "brigas nunca mais",
        "a ra", "batida diferente", "oye como va", "besame mucho", "sway", "quizas", "guantanamera", "la bamba"],
    "ritmo-swing": ["autumn leaves", "all the things you are", "take the a train", "satin doll", "blue monk",
        "straight no chaser", "now s the time", "billie s bounce", "au privave", "confirmation", "donna lee",
        "anthropology", "oleo", "doxy", "st thomas", "tenor madness", "sonnymoon", "bag s groove", "mr pc", "impressions",
        "so what", "footprints", "cantaloupe island", "watermelon man", "song for my father", "moanin", "work song",
        "mercy mercy mercy", "sidewinder", "recorda me", "stella by starlight", "there will never be another you",
        "just friends", "days of wine and roses", "fly me to the moon", "summertime", "take five", "giant steps",
        "equinox", "cherokee", "a night in tunisia", "night in tunisia", "groovin high", "scrapple", "yardbird suite",
        "ornithology", "blues for alice", "cool blues", "tune up", "solar", "all blues", "freddie freeloader",
        "milestones", "alone together", "softly as in a morning sunrise", "green dolphin street", "beautiful love",
        "bye bye blackbird", "in a mellow tone", "perdido", "c jam blues", "sweet georgia brown", "honeysuckle rose",
        "ain t misbehavin", "aint misbehavin", "lady bird", "joy spring", "airegin", "jordu", "killer joe",
        "whisper not", "along came betty", "moment s notice", "afro blue", "caravan", "spain", "if i were a bell",
        "but not for me", "it s all right with me", "its all right with me", "somebody loves me",
        "you and the night and the music", "opus one", "rhythm changes", "mr bojangles", "new york new york",
        "my way", "c est si bon", "cheek to cheek", "on the sunny side", "all of me", "i got rhythm"],
    "din-emocao": ["body and soul", "my funny valentine", "round midnight", "naima", "in a sentimental mood", "lover man",
        "embraceable you", "i remember clifford", "darn that dream", "skylark", "stardust", "autumn in new york",
        "autumn in ny", "chelsea bridge", "lush life", "my one and only love", "everything happens to me",
        "what a wonderful world", "over the rainbow", "over the raimbow", "moonlight serenade", "smoke gets in your eyes",
        "the nearness of you", "i can t get started", "old folks", "you don t know what love is",
        "you dont know what love is", "when i fall in love", "unforgettable", "misty", "laura", "georgia on my mind",
        "left alone", "god bless the child", "what s new", "whats new", "it never entered my mind", "harlem nocturne",
        "my heart will go on", "hallelujah", "halellujah", "ave maria", "fascinacao", "caruso", "emocoes", "my way",
        "the lady in red", "careless whisper", "yesterday", "let it be", "smooth operator"],
    "orn-popular": ["blues", "the thrill is gone", "sunny", "pick up the pieces", "chameleon", "careless whisper",
        "yakety sax", "harlem nocturne", "the pink panther", "pantera cor de rosa"],
}
# títulos que não devem cair numa palavra curta demais
EXCLUI_PALAVRA = {"baiao": ["songbook"], "frevo": [], "forro": [], "xote": [], "rio": [], "blues": ["real book"]}
INSTR_FORA = re.compile(r"\b(trumpet|trompete|violin|violino|trombone|guitar|guitarra|piano|flute|flauta|clarinet|cello|vocal)\b")


def afinacao(f, raiz):
    t = norm(f["title"])
    if (f.get("fileExtension") or "").lower() == "mp3":
        return "Playback"
    if re.search(r"\b(alto|eb|mib|baritono|baritone)\b", t):
        return "Mib"
    if re.search(r"\b(tenor|soprano|bb|sib)\b", t):
        return "Sib"
    if raiz.startswith("02 SAX Eb") or raiz.startswith("BÔNUS 7"):
        return "Mib"
    if raiz.startswith("01 SAX Bb"):
        return "Sib"
    return "Partitura"


def chave_musica(titulo):
    t = norm(re.sub(r"\.(pdf|mp3)$", "", titulo, flags=re.I))
    t = re.sub(r"^\d+\s*", "", t)
    t = re.sub(r"\b(sax(ofone|ophone)?|alto|tenor|soprano|baritono|baritone|bb|eb|mib|sib|partitura|solo|playalong|"
               r"original|c|d|g|db|f|em|in|tom jobim|antonio carlos jobim|pixinguinha|luiz gonzaga|roupa nova)\b", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def montar():
    ramos = {}
    def ramo(r):
        return ramos.setdefault(r, {"pastas": [], "livros": [], "musicas": {}})

    for pid, nome, rs in PASTAS_RAMO:
        for r in rs:
            ramo(r)["pastas"].append({"t": nome, "id": pid})

    usados = set()
    for f in ARQ.values():
        raiz = raiz_de(f["parentId"])
        t = norm(re.sub(r"\.(pdf|PDF)$", "", f["title"]))
        if raiz.startswith(("BÔNUS 6", "BÔNUS 9", "BÔNUS 12")):
            for rx, nome, rs in LIVROS:
                if re.search(rx, t.replace(" ", "") if "omelhor" in rx else t):
                    for r in rs:
                        lst = ramo(r)["livros"]
                        if not any(x["t"] == nome for x in lst):
                            lst.append({"t": nome, "id": f["id"]})
                    usados.add(f["id"])
                    break

    for f in ARQ.values():
        raiz = raiz_de(f["parentId"])
        if not raiz.startswith(("01 SAX", "02 SAX", "BÔNUS 7", "BÔNUS 13")):
            continue
        ext = (f.get("fileExtension") or "").lower()
        if ext not in ("pdf", "mp3") or INSTR_FORA.search(norm(f["title"])):
            continue
        k = chave_musica(f["title"])
        if not k or len(k) < 3:
            continue
        for r, lista in MUSICAS.items():
            hit = None
            for nomeM in lista:
                if re.search(r"(^| )" + re.escape(nomeM) + r"( |$)", k):
                    if any(x in k for x in EXCLUI_PALAVRA.get(nomeM, [])):
                        continue
                    hit = nomeM
                    break
            if not hit:
                continue
            exib = re.sub(r"\.(pdf|mp3)$", "", f["title"], flags=re.I)
            exib = re.sub(r"^\d+\s*[-.]?\s*", "", exib)
            exib = re.sub(r"\s*[-–(]\s*(sax|saxofone|saxophone|tenor|alto|soprano|bb|eb|c|g|d|db|playalong|partitura).*$", "", exib, flags=re.I).strip(" -_")
            exib = re.sub(r"\s*\(\d+\)\s*$", "", exib.replace("_", " ")).strip()
            exib = re.sub(r"\s*-\s*Partes$", "", exib)
            if exib.islower() or exib.isupper():
                exib = " ".join(w if w in ("de", "da", "do", "e", "a", "o", "em", "no", "na") else w.capitalize() for w in exib.lower().split())
                exib = exib[:1].upper() + exib[1:]
            m = ramo(r)["musicas"].setdefault(hit, {"t": exib or hit.title(), "itens": []})
            rot = afinacao(f, raiz)
            if not any(i["id"] == f["id"] for i in m["itens"]):
                m["itens"].append({"r": rot, "id": f["id"]})

    # ordenar e limitar repetições por rótulo
    saida = {}
    ordem = {"Sib": 0, "Mib": 1, "Partitura": 2, "Playback": 3}
    for r, d in ramos.items():
        mus = []
        for m in sorted(d["musicas"].values(), key=lambda x: norm(x["t"])):
            vistos, itens = {}, []
            for i in sorted(m["itens"], key=lambda i: ordem.get(i["r"], 9)):
                vistos[i["r"]] = vistos.get(i["r"], 0) + 1
                if vistos[i["r"]] <= 2:
                    itens.append(i)
            mus.append({"t": m["t"][:60], "itens": itens})
        saida[r] = {"pastas": d["pastas"], "livros": sorted(d["livros"], key=lambda x: x["t"]), "musicas": mus}
    return saida


if __name__ == "__main__":
    dados = montar()
    destino = os.path.join(AQUI, "..", "..", "acervo.js")
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write("/* Gerado por ferramentas/acervo/acervo.py a partir do inventário do Drive. Não edite à mão. */\n")
        fh.write("window.CMA_ACERVO = ")
        json.dump({"ramos": dados}, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")
    for r, d in sorted(dados.items()):
        print(f"{r:22} pastas {len(d['pastas']):2}  livros {len(d['livros']):2}  músicas {len(d['musicas']):3}")
