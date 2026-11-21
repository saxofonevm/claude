\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  c8^\markup\bold "Subindo (sustenidos)" cis d dis e f fis g | gis a ais b c2 \bar "||" \break
  c8^\markup\bold "Descendo (bemóis)" b bes a aes g ges f | e ees d des c2 \bar "|." }
