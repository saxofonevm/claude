\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4 \key f \major
  f8^\markup { \bold "Colcheias com swing" \small "(doo-dah)" } g( a) bes( c) d( e) f | e8 d( c) bes( a) g( f4) \bar "|." }
