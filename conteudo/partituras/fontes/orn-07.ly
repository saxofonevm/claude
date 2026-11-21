\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  d1\pp^\markup { \bold "Subtone" \small "(grave, piano, com ar)" } | c1 \bar "||" \break
  f1^\markup { \bold "Growl" \small "(rosne com a garganta enquanto toca)" } | ees1 \bar "|." }
