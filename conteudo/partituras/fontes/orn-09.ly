\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g2^\markup\bold "Bend para baixo" \bendAfter #-3 r2 | g2^\markup\bold "Para cima" \bendAfter #+2 r2 \bar "||" \break
  \grace { fis16 } g2^\markup\bold "Meio tom abaixo e acima" \grace { aes16 } g2 | \grace { e16 f fis } g2^\markup\bold "De uma terça, passando pelas notas" \grace { ees16 e f fis } g2 \bar "|." }
