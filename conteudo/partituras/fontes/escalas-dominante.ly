\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 297 mm))) system-system-spacing.basic-distance = #13 }
\layout { \context { \Score \remove "Bar_number_engraver" } \context { \Staff \remove "Time_signature_engraver" } \context { \Voice \omit Stem } \context { \Staff \accidentalStyle forget } }
#(set-global-staff-size 22)
{ \cadenzaOn
  c'4^\markup { \bold "C7" \normal-text "· Mixolídio" } d' e' f' g' a' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C7(♯11)" \normal-text "· Lídio dominante" } d' e' fis' g' a' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C7(♭13)" \normal-text "· Mixolídio ♭6 (hindu)" } d' e' f' g' aes' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C7(♯5)" \normal-text "· Tons inteiros (6 notas)" } d' e' fis' gis' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C7(♭9)" \normal-text "· Diminuta, começando com semitom" } des' ees' e'! fis' g' a' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C7(♯9)" \normal-text "· Diminuta tons inteiros (alterada)" } des' ees' e'! fis' gis' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C7" \normal-text "· Escala blues" } ees' f' fis' g' bes' c'' \bar "|" \break
}
