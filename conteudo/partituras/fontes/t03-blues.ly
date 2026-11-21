\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  f8^\markup\bold "Escala blues de Fá" aes bes b c ees f4 | f8 ees c b bes aes f4 \bar "||" \break
  f8^\markup\bold "Exemplo de frase" aes bes b c4 r | ees8 c bes aes f2 \bar "|." }
