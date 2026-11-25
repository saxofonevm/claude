\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 297 mm))) system-system-spacing.basic-distance = #13 }
\layout { \context { \Score \remove "Bar_number_engraver" } \context { \Staff \remove "Time_signature_engraver" } \context { \Voice \omit Stem } \context { \Staff \accidentalStyle forget } }
#(set-global-staff-size 22)
{ \cadenzaOn
  c'4^\markup { \bold "Cø" \normal-text "· Lócrio" } des' ees' f' ges' aes' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cø (com 9ª)" \normal-text "· Lócrio ♯2" } d' ees' f' ges' aes' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C°" \normal-text "· Diminuta, começando com tom" } d' ees' f' ges' aes' a'! b' c'' \bar "|" \break
}
