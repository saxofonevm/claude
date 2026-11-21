\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  e4^\markup\bold "A frase inteira" g8 f e4 d | c8 d e g a2 \bar "||" \break
  e4^\markup\bold "1" g8 f \bar "!" e4^\markup\bold "2" d \bar "!" c8^\markup\bold "3" d e g \bar "!" a2^\markup\bold "4" \bar "|." }
