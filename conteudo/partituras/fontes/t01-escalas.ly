\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4 \key c \major
  c8(^\markup\bold "Ligado" d e f g a b c b a g f e d c4) \bar "||" \break
  c8-.^\markup\bold "Destacado" d-. e-. f-. g-. a-. b-. c-. b-. a-. g-. f-. e-. d-. c4-. \bar "|." }
