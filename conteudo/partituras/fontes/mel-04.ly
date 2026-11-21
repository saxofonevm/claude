\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  c8^\markup\bold "Em terças" e d f e g f a | g b a c b d c4 \bar "||" \break
  c,8^\markup\bold "Em quartas" f d g e a f b | g c a d b e c4 \bar "|." }
