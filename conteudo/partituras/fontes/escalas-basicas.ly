\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 297 mm))) system-system-spacing.basic-distance = #13 }
\layout { \context { \Score \remove "Bar_number_engraver" } \context { \Staff \remove "Time_signature_engraver" } \context { \Voice \omit Stem } \context { \Staff \accidentalStyle forget } }
#(set-global-staff-size 22)
{ \cadenzaOn
  c'4^\markup { \bold "C ou C7M" \normal-text "· Maior (jônio)" } d' e' f' g' a' b' c'' \bar "|" \break
  c'4^\markup { \bold "C7" \normal-text "· Dominante (mixolídio)" } d' e' f' g' a' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cm" \normal-text "· Menor (dórico)" } d' ees' f' g' a' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cø (Cm7♭5)" \normal-text "· Meio-diminuta (lócrio)" } des' ees' f' ges' aes' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C°" \normal-text "· Diminuta (8 notas)" } d' ees' f' ges' aes' a'! b' c'' \bar "|" \break
}
