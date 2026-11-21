\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 4/4
  g8->^\markup\bold "Acento no tempo" g g-> g g-> g g-> g | g8^\markup\bold "Acento no contratempo" g-> g g-> g g-> g g-> \bar "||" \break
  g4--^\markup\bold "Tenuto (nota cheia)" g-- g-- g-- | g4-^^\markup\bold "Marcato (forte e curta)" r g-^ r \bar "|." }
