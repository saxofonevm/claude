\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4 \key f \major
  f8^\markup\bold "Jazz: liga o contratempo ao tempo" g( a) c( d) c( a) g | f2 r \bar "||" \break
  f8-.^\markup\bold "Choro: curto e leve" g( a) c-. d-. c( a) g-. | f4-. r r2 \bar "||" \break
  f8(^\markup\bold "Bossa nova: tudo ligado, som macio" g a c d c a g | f2) r \bar "|." }
