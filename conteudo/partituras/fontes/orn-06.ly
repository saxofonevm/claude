\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 2/4
  e4^\markup\bold "Frase original" d | c2 \bar "||" \break
  \acciaccatura f8 e4^\markup\bold "Apojatura rápida (de cima e de baixo)" \acciaccatura cis8 d4 | c2 \bar "||" \break
  e16(^\markup\bold "Bordadura: principal, vizinha, principal" f e8) d16( e d8) | c2 \bar "|." }
