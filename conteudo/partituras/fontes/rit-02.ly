\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  r8^\markup\bold "Só no contratempo" g r g r g r g | g4^\markup\bold "No tempo" g g g | r8^\markup\bold "No contratempo" g r g r g r g \bar "||" \break
  r16^\markup\bold "Pausa de semicolcheia" g g g r g g g r g g g r g g g \bar "|." }
