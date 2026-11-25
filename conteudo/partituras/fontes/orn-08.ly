\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4 \override TrillSpanner.bound-details.left.text = \markup \italic "vib." 
  g1~^\markup\bold "Reto" | g1 \bar "||"
  g1~^\markup\bold "Terminal: vibrato só no final" | g2 g2\startTrillSpan | g1\stopTrillSpan \bar "||" \break
  g1~^\markup\bold "Progressivo: reto, depois ondas lentas, depois largas" | g1~ | g1\startTrillSpan | g1\stopTrillSpan \bar "|." }
