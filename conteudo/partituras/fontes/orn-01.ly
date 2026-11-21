\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c' { \time 4/4
  \appoggiatura d8^\markup\bold "Apojatura (nota de cima)" c4 \appoggiatura e8 d4 \appoggiatura f8 e4 \appoggiatura g8 f4 | \appoggiatura a8 g4 \appoggiatura b8 a4 \appoggiatura c8 b4 \appoggiatura d8 c4 \bar "||" \break
  c,4\prall^\markup\bold "Mordente" d\prall e\prall f\prall | c16^\markup\bold "Como soa" d c8 d16 e d8 e16 f e8 f16 g f8 \bar "|." }
