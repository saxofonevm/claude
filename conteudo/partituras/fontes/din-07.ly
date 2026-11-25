\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  \once \override Hairpin.circled-tip = ##t
  g1\<^\markup { \bold "Do ar à nota, da nota ao ar" \small "(o = só ar)" } | g1 | \once \override Hairpin.circled-tip = ##t g1\f\> | g1 | g1\! \bar "|." }
