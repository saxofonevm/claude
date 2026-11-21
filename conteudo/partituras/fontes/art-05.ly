\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  \tuplet 3/2 { \parenthesize c8^\markup\bold "Nota entre parênteses: quase sem som (ghost)" e g-> } \tuplet 3/2 { \parenthesize d8 f a-> } \tuplet 3/2 { \parenthesize e8 g b-> } \tuplet 3/2 { \parenthesize f8 a c-> } | c1 \bar "|." }
