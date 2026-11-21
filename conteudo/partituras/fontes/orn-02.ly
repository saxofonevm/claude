\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g16^\markup\bold "Trinado medido (4 por tempo)" a g a g a g a g a g a g a g a | g1\startTrillSpan^\markup\bold "Trinado Sol–Lá, solto" | g1\stopTrillSpan \bar "|." }
