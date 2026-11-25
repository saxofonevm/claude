\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\fixed c' { \time 4/4
  g2:32^\markup { \bold "Frulato" \small "(rolar o r)" } g2:32 | e1:32 \bar "||" \break
  << { g1^\markup { \bold "Voz" \small "(x = nota cantada)" } | a1 } \\ { \override NoteHead.style = #'cross c1 | d1 } >> \bar "|." }
