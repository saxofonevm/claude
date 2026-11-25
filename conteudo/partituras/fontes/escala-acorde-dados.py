# Escalas para cada acorde (tudo a partir de Dó). Notas em LilyPond (holandês) para a partitura.
G = [
 ("basicas", "As cinco famílias de acorde", [
  ("C ou C7M", "Maior (jônio)", "T T S T T T S", "c d e f g a b", "C E G B D"),
  ("C7", "Dominante (mixolídio)", "T T S T T S T", "c d e f g a bes", "C E G B♭ D"),
  ("Cm", "Menor (dórico)", "T S T T T S T", "c d ees f g a bes", "C E♭ G B♭ D"),
  ("Cø (Cm7♭5)", "Meio-diminuta (lócrio)", "S T T S T T T", "c des ees f ges aes bes", "C E♭ G♭ B♭"),
  ("C°", "Diminuta (8 notas)", "T S T S T S T S", "c d ees f ges aes a b", "C E♭ G♭ A (B♭♭)"),
 ]),
 ("maior", "Escolhas para o acorde maior", [
  ("C7M (ou C)", "Maior (sem dar peso à 4ª)", "T T S T T T S", "c d e f g a b", "C E G B D"),
  ("C7M(♯11)", "Lídio (maior com 4ª aumentada)", "T T T S T T S", "c d e fis g a b", "C E G B D"),
  ("C7M(♭6)", "Maior harmônica", "T T S T S 1½ S", "c d e f g aes b", "C E G B D"),
  ("C7M(♯5 ♯11)", "Lídio aumentado", "T T T T S T S", "c d e fis gis a b", "C E G♯ B D"),
  ("C", "Aumentada (simétrica)", "1½ S 1½ S 1½ S", "c dis e g aes b", "C E G B D"),
  ("C", "Escala blues", "1½ T S S 1½ T", "c ees f fis g bes", "C E G B D"),
  ("C", "Pentatônica maior", "T T 1½ T 1½", "c d e g a", "C E G B D"),
 ]),
 ("dominante", "Escolhas para o acorde dominante (7)", [
  ("C7", "Mixolídio", "T T S T T S T", "c d e f g a bes", "C E G B♭ D"),
  ("C7(♯11)", "Lídio dominante", "T T T S T S T", "c d e fis g a bes", "C E G B♭ D"),
  ("C7(♭13)", "Mixolídio ♭6 (“hindu”)", "T T S T S T T", "c d e f g aes bes", "C E G B♭ D"),
  ("C7(♯5)", "Tons inteiros (6 notas)", "T T T T T T", "c d e fis gis bes", "C E G♯ B♭ D"),
  ("C7(♭9)", "Diminuta, começando com semitom", "S T S T S T S T", "c des ees e fis g a bes", "C E G B♭ D♭"),
  ("C7(♯9)", "Diminuta tons inteiros (alterada)", "S T S T T T T", "c des ees e fis gis bes", "C E G♯ B♭ D♯"),
  ("C7", "Escala blues", "1½ T S S 1½ T", "c ees f fis g bes", "C E G B♭ D"),
 ]),
 ("menor", "Escolhas para o acorde menor", [
  ("Cm7", "Dórico", "T S T T T S T", "c d ees f g a bes", "C E♭ G B♭ D F"),
  ("Cm(7M)", "Menor melódica (subindo)", "T S T T T T S", "c d ees f g a b", "C E♭ G B D F"),
  ("Cm", "Escala blues", "1½ T S S 1½ T", "c ees f fis g bes", "C E♭ G B♭ D (F)"),
  ("Cm", "Pentatônica menor", "1½ T T 1½ T", "c ees f g bes", "C E♭ G B♭ D (F)"),
  ("Cm(♭6 7M)", "Menor harmônica", "T S T T S 1½ S", "c d ees f g aes b", "C E♭ G B D (F)"),
  ("Cm", "Frígio", "S T T T S T T", "c des ees f g aes bes", "C E♭ G B♭"),
  ("Cm", "Frígio espanhol (8 notas)", "S T S S T S T T", "c des ees e f g aes bes", "C D♭ F G B♭"),
  ("Cm", "Diminuta, começando com tom", "T S T S T S T S", "c d ees f ges aes a b", "C E♭ G B (D F)"),
  ("Cm(♭6)", "Menor natural (eólio)", "T S T T S T T", "c d ees f g aes bes", "C E♭ G B♭ D F"),
 ]),
 ("meiodim", "Escolhas para o meio-diminuto e o diminuto", [
  ("Cø", "Lócrio", "S T T S T T T", "c des ees f ges aes bes", "C E♭ G♭ B♭"),
  ("Cø (com 9ª)", "Lócrio ♯2", "T S T S T T T", "c d ees f ges aes bes", "C E♭ G♭ B♭ D"),
  ("C°", "Diminuta, começando com tom", "T S T S T S T S", "c d ees f ges aes a b", "C E♭ G♭ A (B♭♭)"),
 ]),
 ("sus", "Dominante com 4ª suspensa", [
  ("C7sus4 (ou Gm/C)", "Mixolídio sem dar peso à 3ª", "T 1½ T T S T", "c d f g a bes", "C F G B♭ D"),
 ]),
]
NOMES = {"c":"C","d":"D","e":"E","f":"F","g":"G","a":"A","b":"B"}
def cifra(n):
    base=NOMES[n[0]]; r=n[1:]
    return base+{"":"","es":"♭","is":"♯","s":"♭"}.get(r,r)
