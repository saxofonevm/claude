\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4 \key f \major
  f8^\markup\bold "Escrito assim" g a bes c d e f | e d c bes a g f4 \bar "||" \break
  \tuplet 3/2 { f4^\markup\bold "Soa assim (colcheia longa + curta)" g8 } \tuplet 3/2 { a4 bes8 } \tuplet 3/2 { c4 d8 } \tuplet 3/2 { e4 f8 } | f1 \bar "|." }
