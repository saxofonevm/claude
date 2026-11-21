\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  a8^\markup\bold "Lá menor natural" b c d e f g a | g f e d c b a4 \bar "||" \break
  a8^\markup\bold "Harmônica (7º grau elevado)" b c d e f gis a | gis f e d c b a4 \bar "||" \break
  a8^\markup\bold "Melódica (sobe com 6º e 7º elevados, desce natural)" b c d e fis gis a | g! f! e d c b a4 \bar "|." }
