\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  e2(^\markup\bold "Ligaduras longas" d4 c | d1) \breathe | c4( d e g | a2 g) \breathe | f4( e d c | d1) \bar "|." }
