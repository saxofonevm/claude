\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 2/4
  g16^\markup\bold "Célula da síncope" a8 g16 a8 g | a16 g8 a16 g4 \bar "||" \break
  a16^\markup\bold "Invente variações" g8 a16 r8 g | g16 a8 g16 a4 \bar "|." }
