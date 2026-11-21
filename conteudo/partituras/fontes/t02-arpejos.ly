\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  c4^\markup\bold "Dó" e g c | g e c2 \bar "||"
  g'4^\markup\bold "Sol" b d g | d b g2 \bar "||" \break
  f4^\markup\bold "Fá" a c f | c a f2 \bar "|." }
