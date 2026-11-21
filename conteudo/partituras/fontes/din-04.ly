\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\fixed c' { \time 4/4
  g1\p^\markup\bold "Uma nota, três dinâmicas" | g1\mf | g1\f \bar "||" \break
  g1^\markup\bold "Repita em Sol, Ré grave, Dó médio e Ré agudo" | d1 | c'1 | d''1 \bar "|." }
