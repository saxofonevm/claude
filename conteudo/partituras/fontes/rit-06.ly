\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 2/4
  c16^\markup\bold "Frevo numa nota" c-> c c-> c c-> c c-> | c c-> c c-> c8 r \bar "||" \break
  c,16^\markup\bold "Na escala de Dó, mesmo acento" d-> e f-> g a-> b c-> | b a-> g f-> e8 r \bar "|." }
