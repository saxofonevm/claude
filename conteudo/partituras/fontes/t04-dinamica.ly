\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g1\pp\<^\markup\bold "Uma respiração para cada nota" | g1 | g1\ff\> | g1\pp \bar "||" \break
  d1\pp\< | d1 | d1\ff\> | d1\pp \bar "|." }
