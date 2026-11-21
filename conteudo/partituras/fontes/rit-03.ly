\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 2/4
  c16^\markup\bold "Síncope numa nota" c8 c16 c8 c | c16 c8 c16 c4 \bar "||" \break
  c,16^\markup\bold "Na escala de Dó" d8 e16 f8 g | a16 b8 c16 c4 \bar "|." }
