\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g1\ppp\<^\markup { \bold "Boquilha entra ao crescer" } | g1 | g1 | g1\fff\> | g1 | g1 | g1\ppp \bar "|." }
