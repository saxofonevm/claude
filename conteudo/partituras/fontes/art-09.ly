\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4 \key f \major
  f8->^\markup\bold "Acentos (>) e fantasmas ( )" g \parenthesize a bes-> c \parenthesize d e-> f | e8 \parenthesize d c-> bes \parenthesize a g-> f4 \bar "||" \break
  f8^\markup\bold "Mude os lugares a cada vez" g-> a \parenthesize bes c d-> \parenthesize e f-> | \parenthesize e8 d-> c \parenthesize bes a-> g f4-> \bar "|." }
