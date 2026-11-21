\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g8(^\markup\bold "2 por tempo" g g g g g g g) | \tuplet 3/2 { g8(^\markup\bold "3 por tempo" g g } \tuplet 3/2 { g g g } \tuplet 3/2 { g g g } \tuplet 3/2 { g g g) } | g16(^\markup\bold "4 por tempo" g g g g g g g g g g g g g g g) \bar "|." }
