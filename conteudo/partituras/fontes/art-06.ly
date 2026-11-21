\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 2/4 \key d \minor
  d16-.^\markup\bold "Destacado" e-. f-. g-. a-. bes-. cis-. d-. | cis-. bes-. a-. g-. f-. e-. d8-. \bar "||" \break
  d16-.^\markup\bold "Ligado de 2 em 2, na síncope" e( f) g-. a-. bes( cis) d-. | cis-. bes( a) g-. f-. e( d8) \bar "|." }
