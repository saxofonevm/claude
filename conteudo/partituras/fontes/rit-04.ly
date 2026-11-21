\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 2/4
  c8.^\markup\bold "Célula do baião" c16~ c8 c | c8. c16~ c8 c \bar "||" \break
  c,8.^\markup\bold "Em arpejo" e16~ e8 g | c8. g16~ g8 e | c2 \bar "|." }
