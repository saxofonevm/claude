\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\fixed c' { \time 3/4
  c4^\markup\bold "Tríades em cada grau" e g | d f a | e g b | f a c' | \break g b d' | a c' e' | b d' f' | c'2. \bar "||" \break
  \time 4/4 c8^\markup\bold "Tétrades: Dó7M, Ré m7, Mi m7, Fá7M" e g b d f a c' | e g b d' f a c' e' \bar "|." }
