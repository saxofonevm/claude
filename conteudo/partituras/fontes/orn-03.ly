\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  d16^\markup\bold "Grupeto escrito: cima, principal, baixo, principal" c b c e d c d f e d e g f e f | a g f g b a g a c b a b d c b c \bar "||" \break
  c,4\turn^\markup\bold "O mesmo com o sinal" d\turn e\turn f\turn | g1 \bar "|." }
