\version "2.24.0"
\header {
  title = "Qual escala para cada acorde"
  subtitle = "As escalas de cada família de acorde, a partir de Dó"
  subsubtitle = \markup \italic \small "Para todos os saxofones (notas escritas)"
  composer = "Tiago Veloso"
  arranger = \markup \italic "Naipe · método de saxofone"
  tagline = ##f
}
\paper {
  #(set-paper-size "a4")
  top-margin = 12\mm bottom-margin = 12\mm left-margin = 16\mm right-margin = 16\mm
  oddFooterMarkup = \markup \fill-line { \small "Tiago Veloso · Naipe · naipesax.com.br" }
  evenFooterMarkup = \oddFooterMarkup
  markup-system-spacing.basic-distance = #4
  score-markup-spacing.basic-distance = #3
  print-first-page-number = ##t
}
#(set-global-staff-size 18)
\layout { indent = 0 ragged-right = ##t
  \context { \Score \remove "Bar_number_engraver" }
  \context { \Staff \remove "Time_signature_engraver" \accidentalStyle forget }
  \context { \Voice \omit Stem } }

\markup \wordwrap-string "Cada acorde pertence a uma família: maior, dominante (7), menor, meio-diminuto (ø) ou diminuto (°). Comece pela escala básica de cada família (primeira seção). As outras são cores para quando a cifra pede uma tensão: ♯11, ♭9, 7M…"
\markup \wordwrap-string "Tudo está escrito a partir de Dó. Para outro acorde, mantenha o desenho de tons e semitons e comece na tônica dele. A cifra que o saxofonista lê já é a do seu instrumento."
\markup \wordwrap-string "T = tom · S = semitom · 1½ = tom e meio."
\markup \vspace #0.5
\markup \vspace #0.8
\markup \fontsize #3 \bold "1 · As cinco famílias de acorde"
\score { { \cadenzaOn c'4 d' e' f' g' a' b' c'' b' a' g' f' e' d' c' \bar "|." } \header { piece = \markup { \bold "C ou C7M" "· Maior (jônio)" } } }
\markup \small \line { \bold "Construção:" "T T S T T T S" \hspace #2 \bold "Notas:" "C D E F G A B" \hspace #2 \bold "Acorde:" "C E G B D" }
\score { { \cadenzaOn c'4 d' e' f' g' a' bes' c'' bes' a' g' f' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7" "· Dominante (mixolídio)" } } }
\markup \small \line { \bold "Construção:" "T T S T T S T" \hspace #2 \bold "Notas:" "C D E F G A B♭" \hspace #2 \bold "Acorde:" "C E G B♭ D" }
\score { { \cadenzaOn c'4 d' ees' f' g' a' bes' c'' bes' a' g' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cm" "· Menor (dórico)" } } }
\markup \small \line { \bold "Construção:" "T S T T T S T" \hspace #2 \bold "Notas:" "C D E♭ F G A B♭" \hspace #2 \bold "Acorde:" "C E♭ G B♭ D" }
\score { { \cadenzaOn c'4 des' ees' f' ges' aes' bes' c'' bes' aes' ges' f' ees' des' c' \bar "|." } \header { piece = \markup { \bold "Cø (Cm7♭5)" "· Meio-diminuta (lócrio)" } } }
\markup \small \line { \bold "Construção:" "S T T S T T T" \hspace #2 \bold "Notas:" "C D♭ E♭ F G♭ A♭ B♭" \hspace #2 \bold "Acorde:" "C E♭ G♭ B♭" }
\score { { \cadenzaOn c'4 d' ees' f' ges' aes' a'! b' c'' b' a' aes' ges' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "C°" "· Diminuta (8 notas)" } } }
\markup \small \line { \bold "Construção:" "T S T S T S T S" \hspace #2 \bold "Notas:" "C D E♭ F G♭ A♭ A B" \hspace #2 \bold "Acorde:" "C E♭ G♭ A (B♭♭)" }
\markup \vspace #0.8
\markup \fontsize #3 \bold "2 · Escolhas para o acorde maior"
\score { { \cadenzaOn c'4 d' e' f' g' a' b' c'' b' a' g' f' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7M (ou C)" "· Maior (sem dar peso à 4ª)" } } }
\markup \small \line { \bold "Construção:" "T T S T T T S" \hspace #2 \bold "Notas:" "C D E F G A B" \hspace #2 \bold "Acorde:" "C E G B D" }
\score { { \cadenzaOn c'4 d' e' fis' g' a' b' c'' b' a' g' fis' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7M(♯11)" "· Lídio (maior com 4ª aumentada)" } } }
\markup \small \line { \bold "Construção:" "T T T S T T S" \hspace #2 \bold "Notas:" "C D E F♯ G A B" \hspace #2 \bold "Acorde:" "C E G B D" }
\score { { \cadenzaOn c'4 d' e' f' g' aes' b' c'' b' aes' g' f' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7M(♭6)" "· Maior harmônica" } } }
\markup \small \line { \bold "Construção:" "T T S T S 1½ S" \hspace #2 \bold "Notas:" "C D E F G A♭ B" \hspace #2 \bold "Acorde:" "C E G B D" }
\score { { \cadenzaOn c'4 d' e' fis' gis' a' b' c'' b' a' gis' fis' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7M(♯5 ♯11)" "· Lídio aumentado" } } }
\markup \small \line { \bold "Construção:" "T T T T S T S" \hspace #2 \bold "Notas:" "C D E F♯ G♯ A B" \hspace #2 \bold "Acorde:" "C E G♯ B D" }
\score { { \cadenzaOn c'4 dis' e' g' aes' b' c'' b' aes' g' e' dis' c' \bar "|." } \header { piece = \markup { \bold "C" "· Aumentada (simétrica)" } } }
\markup \small \line { \bold "Construção:" "1½ S 1½ S 1½ S" \hspace #2 \bold "Notas:" "C D♯ E G A♭ B" \hspace #2 \bold "Acorde:" "C E G B D" }
\score { { \cadenzaOn c'4 ees' f' fis' g' bes' c'' bes' g' fis' f'! ees' c' \bar "|." } \header { piece = \markup { \bold "C" "· Escala blues" } } }
\markup \small \line { \bold "Construção:" "1½ T S S 1½ T" \hspace #2 \bold "Notas:" "C E♭ F F♯ G B♭" \hspace #2 \bold "Acorde:" "C E G B D" }
\score { { \cadenzaOn c'4 d' e' g' a' c'' a' g' e' d' c' \bar "|." } \header { piece = \markup { \bold "C" "· Pentatônica maior" } } }
\markup \small \line { \bold "Construção:" "T T 1½ T 1½" \hspace #2 \bold "Notas:" "C D E G A" \hspace #2 \bold "Acorde:" "C E G B D" }
\markup \vspace #0.8
\markup \fontsize #3 \bold "3 · Escolhas para o acorde dominante (7)"
\score { { \cadenzaOn c'4 d' e' f' g' a' bes' c'' bes' a' g' f' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7" "· Mixolídio" } } }
\markup \small \line { \bold "Construção:" "T T S T T S T" \hspace #2 \bold "Notas:" "C D E F G A B♭" \hspace #2 \bold "Acorde:" "C E G B♭ D" }
\score { { \cadenzaOn c'4 d' e' fis' g' a' bes' c'' bes' a' g' fis' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7(♯11)" "· Lídio dominante" } } }
\markup \small \line { \bold "Construção:" "T T T S T S T" \hspace #2 \bold "Notas:" "C D E F♯ G A B♭" \hspace #2 \bold "Acorde:" "C E G B♭ D" }
\score { { \cadenzaOn c'4 d' e' f' g' aes' bes' c'' bes' aes' g' f' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7(♭13)" "· Mixolídio ♭6 (hindu)" } } }
\markup \small \line { \bold "Construção:" "T T S T S T T" \hspace #2 \bold "Notas:" "C D E F G A♭ B♭" \hspace #2 \bold "Acorde:" "C E G B♭ D" }
\score { { \cadenzaOn c'4 d' e' fis' gis' bes' c'' bes' gis' fis' e' d' c' \bar "|." } \header { piece = \markup { \bold "C7(♯5)" "· Tons inteiros (6 notas)" } } }
\markup \small \line { \bold "Construção:" "T T T T T T" \hspace #2 \bold "Notas:" "C D E F♯ G♯ B♭" \hspace #2 \bold "Acorde:" "C E G♯ B♭ D" }
\score { { \cadenzaOn c'4 des' ees' e'! fis' g' a' bes' c'' bes' a' g' fis' e' ees' des' c' \bar "|." } \header { piece = \markup { \bold "C7(♭9)" "· Diminuta, começando com semitom" } } }
\markup \small \line { \bold "Construção:" "S T S T S T S T" \hspace #2 \bold "Notas:" "C D♭ E♭ E F♯ G A B♭" \hspace #2 \bold "Acorde:" "C E G B♭ D♭" }
\score { { \cadenzaOn c'4 des' ees' e'! fis' gis' bes' c'' bes' gis' fis' e' ees' des' c' \bar "|." } \header { piece = \markup { \bold "C7(♯9)" "· Diminuta tons inteiros (alterada)" } } }
\markup \small \line { \bold "Construção:" "S T S T T T T" \hspace #2 \bold "Notas:" "C D♭ E♭ E F♯ G♯ B♭" \hspace #2 \bold "Acorde:" "C E G♯ B♭ D♯" }
\score { { \cadenzaOn c'4 ees' f' fis' g' bes' c'' bes' g' fis' f'! ees' c' \bar "|." } \header { piece = \markup { \bold "C7" "· Escala blues" } } }
\markup \small \line { \bold "Construção:" "1½ T S S 1½ T" \hspace #2 \bold "Notas:" "C E♭ F F♯ G B♭" \hspace #2 \bold "Acorde:" "C E G B♭ D" }
\markup \vspace #0.8
\markup \fontsize #3 \bold "4 · Escolhas para o acorde menor"
\score { { \cadenzaOn c'4 d' ees' f' g' a' bes' c'' bes' a' g' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cm7" "· Dórico" } } }
\markup \small \line { \bold "Construção:" "T S T T T S T" \hspace #2 \bold "Notas:" "C D E♭ F G A B♭" \hspace #2 \bold "Acorde:" "C E♭ G B♭ D F" }
\score { { \cadenzaOn c'4 d' ees' f' g' a' b' c'' b' a' g' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cm(7M)" "· Menor melódica (subindo)" } } }
\markup \small \line { \bold "Construção:" "T S T T T T S" \hspace #2 \bold "Notas:" "C D E♭ F G A B" \hspace #2 \bold "Acorde:" "C E♭ G B D F" }
\score { { \cadenzaOn c'4 ees' f' fis' g' bes' c'' bes' g' fis' f'! ees' c' \bar "|." } \header { piece = \markup { \bold "Cm" "· Escala blues" } } }
\markup \small \line { \bold "Construção:" "1½ T S S 1½ T" \hspace #2 \bold "Notas:" "C E♭ F F♯ G B♭" \hspace #2 \bold "Acorde:" "C E♭ G B♭ D (F)" }
\score { { \cadenzaOn c'4 ees' f' g' bes' c'' bes' g' f' ees' c' \bar "|." } \header { piece = \markup { \bold "Cm" "· Pentatônica menor" } } }
\markup \small \line { \bold "Construção:" "1½ T T 1½ T" \hspace #2 \bold "Notas:" "C E♭ F G B♭" \hspace #2 \bold "Acorde:" "C E♭ G B♭ D (F)" }
\score { { \cadenzaOn c'4 d' ees' f' g' aes' b' c'' b' aes' g' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cm(♭6 7M)" "· Menor harmônica" } } }
\markup \small \line { \bold "Construção:" "T S T T S 1½ S" \hspace #2 \bold "Notas:" "C D E♭ F G A♭ B" \hspace #2 \bold "Acorde:" "C E♭ G B D (F)" }
\score { { \cadenzaOn c'4 des' ees' f' g' aes' bes' c'' bes' aes' g' f' ees' des' c' \bar "|." } \header { piece = \markup { \bold "Cm" "· Frígio" } } }
\markup \small \line { \bold "Construção:" "S T T T S T T" \hspace #2 \bold "Notas:" "C D♭ E♭ F G A♭ B♭" \hspace #2 \bold "Acorde:" "C E♭ G B♭" }
\score { { \cadenzaOn c'4 des' ees' e'! f' g' aes' bes' c'' bes' aes' g' f' e' ees' des' c' \bar "|." } \header { piece = \markup { \bold "Cm" "· Frígio espanhol (8 notas)" } } }
\markup \small \line { \bold "Construção:" "S T S S T S T T" \hspace #2 \bold "Notas:" "C D♭ E♭ E F G A♭ B♭" \hspace #2 \bold "Acorde:" "C D♭ F G B♭" }
\score { { \cadenzaOn c'4 d' ees' f' ges' aes' a'! b' c'' b' a' aes' ges' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cm" "· Diminuta, começando com tom" } } }
\markup \small \line { \bold "Construção:" "T S T S T S T S" \hspace #2 \bold "Notas:" "C D E♭ F G♭ A♭ A B" \hspace #2 \bold "Acorde:" "C E♭ G B (D F)" }
\score { { \cadenzaOn c'4 d' ees' f' g' aes' bes' c'' bes' aes' g' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cm(♭6)" "· Menor natural (eólio)" } } }
\markup \small \line { \bold "Construção:" "T S T T S T T" \hspace #2 \bold "Notas:" "C D E♭ F G A♭ B♭" \hspace #2 \bold "Acorde:" "C E♭ G B♭ D F" }
\markup \vspace #0.8
\markup \fontsize #3 \bold "5 · Escolhas para o meio-diminuto e o diminuto"
\score { { \cadenzaOn c'4 des' ees' f' ges' aes' bes' c'' bes' aes' ges' f' ees' des' c' \bar "|." } \header { piece = \markup { \bold "Cø" "· Lócrio" } } }
\markup \small \line { \bold "Construção:" "S T T S T T T" \hspace #2 \bold "Notas:" "C D♭ E♭ F G♭ A♭ B♭" \hspace #2 \bold "Acorde:" "C E♭ G♭ B♭" }
\score { { \cadenzaOn c'4 d' ees' f' ges' aes' bes' c'' bes' aes' ges' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "Cø (com 9ª)" "· Lócrio ♯2" } } }
\markup \small \line { \bold "Construção:" "T S T S T T T" \hspace #2 \bold "Notas:" "C D E♭ F G♭ A♭ B♭" \hspace #2 \bold "Acorde:" "C E♭ G♭ B♭ D" }
\score { { \cadenzaOn c'4 d' ees' f' ges' aes' a'! b' c'' b' a' aes' ges' f' ees' d' c' \bar "|." } \header { piece = \markup { \bold "C°" "· Diminuta, começando com tom" } } }
\markup \small \line { \bold "Construção:" "T S T S T S T S" \hspace #2 \bold "Notas:" "C D E♭ F G♭ A♭ A B" \hspace #2 \bold "Acorde:" "C E♭ G♭ A (B♭♭)" }
\markup \vspace #0.8
\markup \fontsize #3 \bold "6 · Dominante com 4ª suspensa"
\score { { \cadenzaOn c'4 d' f' g' a' bes' c'' bes' a' g' f' d' c' \bar "|." } \header { piece = \markup { \bold "C7sus4 (ou Gm/C)" "· Mixolídio sem dar peso à 3ª" } } }
\markup \small \line { \bold "Construção:" "T 1½ T T S T" \hspace #2 \bold "Notas:" "C D F G A B♭" \hspace #2 \bold "Acorde:" "C F G B♭ D" }
\markup \vspace #1.5
\markup \italic \small \wordwrap-string "Baseado no Scale Syllabus de Jamey Aebersold, reescrito em português pelo Naipe."
