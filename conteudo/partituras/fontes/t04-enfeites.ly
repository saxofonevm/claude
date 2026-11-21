\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  \grace { b8\glissando } c2^\markup\bold "scoop" r2 |
  e2^\markup { \bold "bend" \small "(desce e volta)" } \bendAfter #-2 r2 |
  g2^\markup\bold "fall" \bendAfter #-5 r2 \bar "|." }
