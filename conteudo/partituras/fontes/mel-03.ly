\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  \key f \major f8^\markup\bold "Fá maior" g a bes c d e f | e d c bes a g f4 \bar "||" \break
  \key bes \major bes8^\markup\bold "Si♭ maior" c d ees f g a bes | a g f ees d c bes4 \bar "||" \break
  \key ees \major ees8^\markup\bold "Mi♭ maior" f g aes bes c d ees | d c bes aes g f ees4 \bar "|." }
