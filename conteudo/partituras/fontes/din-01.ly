\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g1\p~^\markup\bold "8 tempos em cada dinâmica" | g1 | g1\mf~ | g1 | g1\f~ | g1 \bar "|." }
