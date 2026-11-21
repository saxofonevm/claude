\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g1\fp^\markup\bold "fp" | g1 \bar "||"
  g8\mf^\markup\bold "sfz" a b c d\sfz c b a | g1 \bar "||" \break
  c,1\f^\markup\bold "subito p: sem diminuendo" | c1 | c1_\markup { \dynamic p \italic "subito" } | c1 \bar "|." }
