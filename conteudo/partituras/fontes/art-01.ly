\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  c8(^\markup\bold "Legato" d e f g a b c) | b( a g f e d c4) \bar "||" \break
  c8-.^\markup\bold "Staccato" d-. e-. f-. g-. a-. b-. c-. | b-. a-. g-. f-. e-. d-. c4-. \bar "||" \break
  c8(^\markup\bold "2 ligadas + 2 destacadas" d) e-. f-. g( a) b-. c-. | b( a) g-. f-. e( d) c4-. \bar "|." }
