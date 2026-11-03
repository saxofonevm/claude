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
    # Músicas Brasileiras (play-alongs)
    ("1hsgqk7lFuIxmVXRdGhJSlJM0YpUQJd8E", "Altamiro Carrilho · 25 choros (com playback)", ["ritmo-samba-choro", "orn-choro"]),
    ("14NsbNmc-AI7RvMISGxB9z9c0rvl6p8A0", "Altamiro Carrilho · Chorinhos didáticos (playback)", ["ritmo-samba-choro", "art-choro"]),
    ("1jNxnKFouA3QOfSgt4k3Vtr8szr0QLCBQ", "Tocando com Jacob · 15 choros (playback, Dó e Sib)", ["ritmo-samba-choro", "art-choro", "escuta-brasil"]),
    ("115oVuMFIbE97mnBjSb7Ge2hpvCnx_lep", "Severino Araújo · 12 playbacks (Sib)", ["escuta-brasil", "ritmo-samba-choro"]),
    ("1LpLz0YaIyOqgndd1VXWc6_jG3PL4cVSE", "Mário Sève · 15 playbacks (Sib)", ["art-choro", "orn-choro"]),
    ("1LfI9M3eoLKYWlnwtPSo8S-8vAegz0W9b", "Zequinha de Abreu · 14 músicas (Dó)", ["ritmo-samba-choro"]),
    ("1L04C3VNmvwXgI2CHJfAqap-itiCfBKku", "Ernesto Nazareth · Classics of the Brazilian Choro (play-along)", ["orn-choro"]),
    ("1cq4aJ_xmF2QOITOWdf1Z-Vx-OoQCb5XD", "10 bossas nova (Dó, Mib e Sib, com playback)", ["ritmo-bossa", "art-bossa"]),
    ("11I19hlpDAKxxnfnHuEg3mUyxwnRW4OUN", "Aebersold Vol. 31 · Bossa Novas", ["ritmo-bossa"]),
    ("1QdsVmmcWWqNBRvTs1pe4h1BtFubwLNY-", "Aebersold Vol. 98 · Antonio Carlos Jobim", ["ritmo-bossa", "art-bossa"]),
    ("1-0G2yYyYANJL4GU5jlr7W3HDVu0A-jVA", "Brazilian Play-Along · MPB Vol. 1", ["melodia-musicas"]),
    ("1ouFes6NS78mWMDVoLMkBFrmxJy2_Vtuf", "10 Latin Jazz (Mib e Sib, com playback)", ["ritmo-bossa"]),
    ("1SwX58Wm82mgQAxv5OXWC9k6BQR0ILIVh", "Aebersold Vol. 74 · Latin Jazz", ["ritmo-bossa"]),
    ("1MA0YOAeSsUs3hJSxX2WRMKkoVo8g94Qy", "Aebersold Vol. 64 · Salsa e Latin Jazz", ["ritmo-bossa"]),
    ("1kpbm8U0NDovaajFC6IP_-0o9fSiFo-u3", "Aebersold Vol. 96 · Latin Quarter", ["ritmo-bossa"]),
    ("1zmiNKfF1SewWzZ6ezxWGHige4KJ_5mfj", "Creative Saxophone Duets", ["melodia-intervalos"]),
]

# ---------- Itens avulsos da conta velosomusic (pasta "MÉTODOS - VELOSO MUSIC") ----------
# (id, nome, ramificações, "pasta" | "livro")
EXTRAS = [
    ("1xVgUaEKr8p_iuAnVGVE1MZrQ8pMdN32N", "Nelson Faria · A Arte da Improvisação", ["ritmo-swing", "melodia-arpejos"], "livro"),
    ("1bbaWMnmR0RxcOQyqBusppqOk5kEahJmR", "Ramon Ricker · Advanced Chord Etudes", ["melodia-arpejos"], "livro"),
    ("1tJDQ834RZ-ri9HQ9nJM7AwAgTYqA_tA", "Improvisação para sax (apostila)", ["ritmo-swing"], "livro"),
    ("1zSUllCOuX9bmjR3r3b6qjzACM0GFLqU", "Gilles Senon · 16 Técnicas e Estudos Rítmicos", ["ritmo-base", "art-acentos"], "livro"),
    ("1spk888wGI3rfCLLhO91gLgX3W7j9Pbg", "Klosé · 25 Estudos de Mecanismo (rev. Marcel Mule)", ["melodia-escalas"], "livro"),
    ("1w4XsbhAno4QIwhqavC042bXAvPnGd5s", "Klosé · 15 Études Chantantes", ["art-basicas", "din-emocao"], "livro"),
    ("1-hAHLvqCUSGxxCGAs_DQPZRSp7iVAxTt", "Exercício técnico de jazz", ["art-jazz"], "livro"),
    ("1qr5sOflAs9vnQn7M62-bpDBkMVmRfqo", "Marcelo Coelho · Toque de Mestre", ["melodia-escalas"], "livro"),
    ("1RSS8S5k04k70APQIfAQUOjdqGx8b8-UR", "25 Exercícios para Saxofone", ["melodia-escalas"], "pasta"),
    ("1aa0fIsiSf9jCYxkoEGqJ2GfGDgTw1C4", "Digitação completa do saxofone", ["escuta-setup"], "livro"),
    ("1IKSOB0BVoeu-Fn1KO51oeJAcEO6_VY4", "Saxofone · Técnica básica", ["escuta-setup", "din-niveis"], "livro"),
    ("10YVxYtByz3Ow63ulkf1kyV0080RY54w", "Apostila de saxofone", ["ritmo-base"], "livro"),
    ("1HpAyprQ7YFDI9UMbJ8oxuExfCPLrTrM", "Ivan Meyer · Ebook 01", ["escuta-setup"], "livro"),
    ("1l9MzMAo0AcHgiC4gq-z8aU9RdSBBKXo", "Método Yamaha (sax tenor)", ["ritmo-base"], "livro"),
    ("1q1Tir26gTf0yJUz3nl6ybnoCCKHz76U", "Nabor Pires · Método de saxofone", ["ritmo-base"], "livro"),
    ("1mgwkokA04h7emodKjQmr-8i4aNfW7qg", "Essential Elements 2000 (sax barítono)", ["ritmo-base"], "livro"),
    ("1w38-wPvvS5JZlSCw5v_yRMp4csJXBw4", "Da Capo (sax tenor) · Joel Barbosa", ["ritmo-base"], "livro"),
    ("1_jtHq_cjRqik3CLmfgBwJlJDrp12Yso", "Curso de saxofone da Escola de Música de Brasília", ["ritmo-base", "melodia-escalas"], "livro"),
    ("1zYHY3cDp9oiL4RX9VG-CH0qjMHnahWRQ", "Universal Method for the Saxophone", ["melodia-escalas"], "livro"),
    ("1HHpW-p4EA98UPy50iX-wXo_J7Ux5ZA4", "A história e a evolução do saxofone", ["escuta-saxofonistas", "escuta-setup"], "livro"),
    ("1jEs7l8EGseX3AAxg7ChnrbzVjV8JRoGD", "Pesquisa sobre o saxofone", ["escuta-saxofonistas"], "livro"),
    ("1Ftiin_DvqICXQwefhZzqvQZBesCk3-4", "Transcrições de solos", ["escuta-saxofonistas"], "pasta"),
    ("1M4LSdPz3r5COdX9PsLKIjgsjBaChQgwn", "John Coltrane · A Love Supreme", ["escuta-saxofonistas"], "livro"),
    ("132-9OX5bMpvEC_6ADd2dZgNVHHemIWI", "Donna Lee (Sib)", ["art-jazz", "ritmo-swing"], "livro"),
    ("1FnVUjcStmeIrDIqSfguvSKpL6OVICzI", "Giant Steps (Sib)", ["melodia-arpejos"], "livro"),
    ("1HI58nKoHZTQh5URf6Bi0Xx8qCZAeA-0", "Bob Mintzer · 12 Etudes", ["art-jazz"], "livro"),
    ("1xkdkFsgSzteDZImwoJZFoJsbWWab7Ww", "Blues em todos os tons", ["orn-popular", "melodia-escalas"], "livro"),
    ("12m3HH8HDD0YsjCB8dzVtrqW32gwIUnz3", "Acordes", ["melodia-arpejos"], "pasta"),
    ("1rKoEmrpyK9Mn5_AWEt0UtcfNt8pAM9A", "Rolf Becker · Latin Sax (play-along, Sib e Mib)", ["ritmo-bossa"], "pasta"),
    ("15ysDraIMMrK6SBSXl0Yh78zkQfbflN-s", "Clube do Choro", ["ritmo-samba-choro"], "pasta"),
    ("10Dkvo160cvTbRh7Up70qQUA9IezJNnda", "Chorinhos 2", ["ritmo-samba-choro", "art-choro"], "pasta"),
    ("16mPpQBrQKHHIzEnWI3XLk1-9bvHsFJo", "Partituras de choros 1", ["ritmo-samba-choro"], "livro"),
    ("1LLUujRf-zqGhRG6FI8UVF7JVm0CU0-3t", "Sonoroso (Sib) · K-Ximbinho", ["escuta-brasil", "orn-choro"], "pasta"),
    ("1Q2d62vyUDMzLKBZwXOmdMJUvakQ3fbk", "Songbook Pixinguinha", ["orn-choro", "escuta-brasil"], "livro"),
    ("1-x513Kqbb5NE9H1Evv6XE8zVIbKeyE_4", "Livrão MPB (Sib)", ["melodia-musicas"], "pasta"),
    ("163y5OIg1aOjzgpfMRF5oWsYl9AiF1HM2", "Brazilian Play-Along MPB (livro)", ["melodia-musicas"], "livro"),
    ("1oxlCcdtyNnMYrSNUYtVnRfoBqafcdfK3", "Creative Saxophone Duets (livro)", ["melodia-intervalos"], "livro"),
    ("1zODFsIv0M888Ejgv1trghB8A00kQoanD", "Dueto de sax", ["melodia-intervalos"], "livro"),
    ("1xrA4oTzDS5_u84p78VdQGo5nygWFCpEF", "Disney Movie Hits (Dó, Mib, Sib, com playback)", ["melodia-musicas"], "pasta"),
    ("1j5yJjWUJyWMkeMmk-NYzuOx1NXN-RaET", "Disney Solos (Dó, Sib, Mib, com playback)", ["melodia-musicas"], "pasta"),
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

    for fid, nome, rs, tipo in EXTRAS:
        for r in rs:
            chave = "pastas" if tipo == "pasta" else "livros"
            if not any(x["id"] == fid for x in ramo(r)[chave]):
                ramo(r)[chave].append({"t": nome, "id": fid})

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


# ---------- Aba "Tocar junto": play-alongs por gênero ----------
# (id da pasta, nome, gênero, afinações das partituras, indicado pelo professor)
GENEROS = ["Choro", "Samba, baião e MPB", "Bossa nova e latin", "Jazz standards", "Estudos com play-along", "Blues e funk", "Baladas e pop"]
TOCAR = [
    ("1IqgNxpR0cmCGUrTqAusurEuIWzZvVaXc", "Chorinhos didáticos (com contagem)", "Choro", [], True),
    ("14NsbNmc-AI7RvMISGxB9z9c0rvl6p8A0", "Altamiro Carrilho · Chorinhos didáticos", "Choro", ["Dó"], True),
    ("1jNxnKFouA3QOfSgt4k3Vtr8szr0QLCBQ", "Tocando com Jacob · 15 choros", "Choro", ["Dó", "Sib"], True),
    ("1hsgqk7lFuIxmVXRdGhJSlJM0YpUQJd8E", "Altamiro Carrilho · 25 choros", "Choro", ["Dó"], False),
    ("1LpLz0YaIyOqgndd1VXWc6_jG3PL4cVSE", "Mário Sève · 15 playbacks", "Choro", ["Sib"], False),
    ("115oVuMFIbE97mnBjSb7Ge2hpvCnx_lep", "Severino Araújo · 12 playbacks", "Choro", ["Sib"], False),
    ("16kM8nbJUPcDHi6LtcXsoA0FlUpISuqru", "Ernesto Nazareth · Classics of the Brazilian Choro", "Choro", [], False),
    ("1ARPIZupVelSCx3BbBZip_RQs_jL2CIP7", "Maurício Carrilho · choros", "Choro", [], False),
    ("1HadeEkSVDV6Y9rRKZyoe8Ll6V_YjFa3K", "Maurício Carrilho e Paula Borghi", "Choro", [], False),
    ("1LfI9M3eoLKYWlnwtPSo8S-8vAegz0W9b", "Zequinha de Abreu · 14 músicas", "Choro", ["Dó"], False),
    ("1DuqD0i_7DTSJhv4IaL4yJsQopMzXtOwl", "Choros em dueto · Pixinguinha", "Choro", [], False),
    ("1zy1CUhYOy29WUhTW5pK4L_6PddaBcd4D", "600 partituras com playback", "Samba, baião e MPB", ["Mib"], True),
    ("1-0G2yYyYANJL4GU5jlr7W3HDVu0A-jVA", "Brazilian Play-Along · MPB Vol. 1", "Samba, baião e MPB", [], True),
    ("1cq4aJ_xmF2QOITOWdf1Z-Vx-OoQCb5XD", "10 bossas nova com playback", "Bossa nova e latin", ["Dó", "Mib", "Sib"], True),
    ("1QdsVmmcWWqNBRvTs1pe4h1BtFubwLNY-", "Aebersold Vol. 98 · Antonio Carlos Jobim", "Bossa nova e latin", [], True),
    ("11I19hlpDAKxxnfnHuEg3mUyxwnRW4OUN", "Aebersold Vol. 31 · Bossa Novas", "Bossa nova e latin", [], False),
    ("18Uj2De4RrIwFno2pSM7T19Smqa0jv_f0", "Jack Long · Latin Playalong", "Bossa nova e latin", ["Mib"], False),
    ("1rKoEmrpyK9Mn5_AWEt0UtcfNt8pAM9A", "Rolf Becker · Latin Sax", "Bossa nova e latin", ["Mib", "Sib"], False),
    ("1ouFes6NS78mWMDVoLMkBFrmxJy2_Vtuf", "10 Latin Jazz com playback", "Bossa nova e latin", ["Mib", "Sib"], False),
    ("1SwX58Wm82mgQAxv5OXWC9k6BQR0ILIVh", "Aebersold Vol. 74 · Latin Jazz", "Bossa nova e latin", [], False),
    ("1MA0YOAeSsUs3hJSxX2WRMKkoVo8g94Qy", "Aebersold Vol. 64 · Salsa e Latin Jazz", "Bossa nova e latin", [], False),
    ("1kpbm8U0NDovaajFC6IP_-0o9fSiFo-u3", "Aebersold Vol. 96 · Latin Quarter", "Bossa nova e latin", [], False),
    ("1nFydjJ_4_DeLmoWcsaMdjvKuD6pBWEwT", "Alto Sax Playalongs · Jazz Standards", "Jazz standards", ["Mib"], True),
    ("1CzKDnpzbDyUX748yL46iLeQLejQegdsQ", "In Session with Charlie Parker", "Jazz standards", ["Mib", "Sib"], True),
    ("1_cS6_-zGiavmCxkQAMaOBTKnqdpb0xra", "Carl Strommen · Jazz Standards", "Jazz standards", ["Mib"], False),
    ("1AY_w4quMQo101b0MOjjpFwuYeU70Hm8P", "Electric Jazz Jam Along Vol. 1", "Jazz standards", ["Sib"], False),
    ("1gg5NOUKeVmH4vNY8wy-7t2yJtkTTEJ-4", "Niehaus · Jazz Conception Vol. 1 (exercícios 1–12)", "Estudos com play-along", ["Mib"], True),
    ("13tC9wTqQSH-7KohxgfhdKXKnKcJAytNO", "Bob Mintzer · 15 Easy Jazz, Blues & Funk Etudes", "Estudos com play-along", ["Sib"], True),
    ("1lIciaLULwCmSAxoWh04lwEo5qlKLGqlg", "Niehaus · Jazz Conception Vol. 2", "Estudos com play-along", [], False),
    ("1cmnL4d3Xx5wH6VSXufC5Flxmw7PKgPUf", "Niehaus · Jazz Conception Vol. 3", "Estudos com play-along", [], False),
    ("1jgVQjFMNDU3Yx1mF6HX7QrddmBwSemsL", "Bob Mintzer · 14 Jazz & Funk Etudes", "Estudos com play-along", ["Mib", "Sib"], False),
    ("1330bZHIfrPWjcy4gDnyF2cr43qCYPEq6", "Bob Mintzer · 12 Contemporary Jazz Etudes", "Estudos com play-along", ["Sib"], False),
    ("1MX_xwty8V_0woPU29k5lMvKGDwGWhjE5", "Greg Fishman · Hip Licks Vol. 1", "Estudos com play-along", [], False),
    ("1LC0_Qp1hg7kjq2j0iIcm_mH-ALjQg_c9", "David Liebman · Standards cromaticamente", "Estudos com play-along", [], False),
    ("1Z3LJXpi2PY1kEqAI-_rS2N7fzvmEMnMJ", "Arturo Himmer · Sax Plus! (vol. 1 a 7)", "Estudos com play-along", [], False),
    ("1e6KJfV1wSL-evEdFZjuWPYWxFjLcWWf1", "Bob Mintzer · 14 Blues & Funk Etudes", "Blues e funk", ["Mib", "Sib"], True),
    ("10IONfIVeq5xRVQ7zVeFJyWYYw1bw6nrg", "Jack Long · Jazz & Blues Playalong Solos", "Blues e funk", ["Mib"], False),
    ("1Gj7cFGK4wnCMtS-zPl8wH1IPYcHX7O38", "100 Blues Riffs", "Blues e funk", ["Sib"], False),
    ("18GSvQHgQHoH17lvTPRjuO40UH7OKfbbS", "Bob Stoloff · Blues Scatitudes", "Blues e funk", [], False),
    ("1novDFOR4hmE-o-Y5Rea1gNCE5hUnkdw0", "Alto Sax Playalongs · Performance Vol. 3", "Baladas e pop", ["Mib"], True),
    ("1j5yJjWUJyWMkeMmk-NYzuOx1NXN-RaET", "Disney Solos", "Baladas e pop", ["Dó", "Mib", "Sib"], False),
    ("1xrA4oTzDS5_u84p78VdQGo5nygWFCpEF", "Disney Movie Hits", "Baladas e pop", ["Dó", "Mib", "Sib"], False),
]

# ---------- Curadoria: o que aparece em cada ramificação, em ordem ----------
# Nomes como aparecem no acervo (início do nome basta).
INDICADOS = {
    "escuta-saxofonistas": ["Transcrições de solos", "John Coltrane · Solos transcritos", "Sonny Rollins · Solos transcritos", "In Session with Charlie Parker"],
    "escuta-brasil": ["Tocando com Jacob", "Severino Araújo", "Songbook Pixinguinha"],
    "escuta-setup": ["Refaceamento de boquilhas", "Digitação completa", "A história e a evolução do saxofone"],
    "ritmo-base": ["Bona · Método de solfejo", "Gilles Senon", "15 Études de Rythme", "Priolli"],
    "ritmo-samba-choro": ["Chorinhos didáticos, com contagem", "Altamiro Carrilho · Chorinhos didáticos", "O Melhor do Choro Brasileiro Vol. I (sax alto)", "O Melhor do Choro Brasileiro Vol. 1 (sax tenor)", "Songbook Choro Vol. 2"],
    "ritmo-baiao": ["O Melhor de Luiz Gonzaga", "Asa Branca", "Qui Nem Jiló"],
    "ritmo-bossa": ["10 bossas nova", "Bossa Nova Songbook 1", "Aebersold Vol. 98", "Garota de Ipanema"],
    "ritmo-swing": ["The Real Easy Book Vol. 1", "The Real Book Vol. 1 (Mib)", "Real Book Vol. 1 (Sib)", "Bob Mintzer · 15 Easy"],
    "melodia-metodo": ["Guy Lacour"],
    "melodia-escalas": ["Marcel Mule · 25 Estudos Diários", "Haimovich · Escala cromática", "Klosé · 25 Estudos de Mecanismo", "Woody Herman"],
    "melodia-intervalos": ["Creative Saxophone Duets (livro)", "26 duetos"],
    "melodia-arpejos": ["John Coltrane · Patterns", "Dan Higgins · Giant Steps", "Nelson Faria"],
    "melodia-musicas": ["Brazilian Play-Along · MPB Vol. 1", "The Brazil Real Book", "MPB Jazz Songbook", "Disney Solos"],
    "art-basicas": ["Rochut · Melodious Etudes", "Klosé · 15 Études Chantantes", "Guy Lacour"],
    "art-acentos": ["Gilles Senon", "James Rae", "Bob Mintzer · 14 Jazz & Funk"],
    "art-jazz": ["Niehaus · Jazz Conception Vol. 1", "Lennie Niehaus · Jazz Conception Vol. 2", "Greg Fishman · Hip Licks Vol. 1 (play-along)", "Donna Lee"],
    "art-choro": ["Tocando com Jacob", "Mário Sève", "O Melhor do Choro Brasileiro Vol. 1 (sax tenor)"],
    "art-bossa": ["10 bossas nova", "Bossa Nova Songbook 2"],
    "din-niveis": ["Saxophone Technique", "Saxofone · Técnica básica"],
    "din-emocao": ["Klosé · 15 Études Chantantes", "My Funny Valentine", "Kenny G · Breathless", "The Standards Real Book"],
    "orn-choro": ["Songbook Pixinguinha", "Ernesto Nazareth · Classics", "Altamiro Carrilho · 25 choros"],
    "orn-popular": ["100 Blues Riffs", "Jack Long · Jazz & Blues", "The Real Book of Blues"],
}
GENERO_DO_RAMO = {"ritmo-samba-choro": "Choro", "art-choro": "Choro", "orn-choro": "Choro", "escuta-brasil": "Choro",
                  "ritmo-baiao": "Samba, baião e MPB", "melodia-musicas": "Samba, baião e MPB",
                  "ritmo-bossa": "Bossa nova e latin", "art-bossa": "Bossa nova e latin",
                  "ritmo-swing": "Jazz standards", "art-jazz": "Estudos com play-along", "art-acentos": "Estudos com play-along",
                  "orn-popular": "Blues e funk", "din-emocao": "Baladas e pop"}


def curar(dados):
    ramos = {}
    for r, nomes in INDICADOS.items():
        d = dados.get(r, {"pastas": [], "livros": [], "musicas": []})
        itens = []
        for nome in nomes:
            achado = None
            for tipo in ("pastas", "livros", "musicas"):
                for x in d.get(tipo, []):
                    if norm(x["t"]).startswith(norm(nome)):
                        achado = {"tipo": tipo[:-1] if tipo != "musicas" else "musica", **x}
                        break
                if achado:
                    break
            if achado:
                itens.append(achado)
            else:
                print("  ! não achei em", r, "->", nome)
        ramos[r] = {"indicados": itens, "genero": GENERO_DO_RAMO.get(r, "")}
    for r, g in GENERO_DO_RAMO.items():
        ramos.setdefault(r, {"indicados": [], "genero": g})
    tocar = [{"id": i, "t": t, "g": g, "afin": a, "ind": ind} for i, t, g, a, ind in TOCAR]
    return {"ramos": ramos, "generos": GENEROS, "tocar": tocar}


if __name__ == "__main__":
    dados = montar()
    destino = os.path.join(AQUI, "..", "..", "acervo.js")
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write("/* Gerado por ferramentas/acervo/acervo.py a partir do inventário do Drive. Não edite à mão. */\n")
        fh.write("window.CMA_ACERVO = ")
        json.dump(curar(dados), fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")
    for r, d in sorted(dados.items()):
        print(f"{r:22} pastas {len(d['pastas']):2}  livros {len(d['livros']):2}  músicas {len(d['musicas']):3}")
