\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4 \key f \major
  f4^\markup\bold "Pentatônica de Fá maior" g a c | d f d c | a g f2 \bar "||" \break
  f8^\markup\bold "Exemplo de frase" g a c d4 c8 a | g4 f2. \bar "|." }
