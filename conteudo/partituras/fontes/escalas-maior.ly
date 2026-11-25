\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 297 mm))) system-system-spacing.basic-distance = #13 }
\layout { \context { \Score \remove "Bar_number_engraver" } \context { \Staff \remove "Time_signature_engraver" } \context { \Voice \omit Stem } \context { \Staff \accidentalStyle forget } }
#(set-global-staff-size 22)
{ \cadenzaOn
  c'4^\markup { \bold "C7M (ou C)" \normal-text "· Maior (sem dar peso à 4ª)" } d' e' f' g' a' b' c'' \bar "|" \break
  c'4^\markup { \bold "C7M(♯11)" \normal-text "· Lídio (maior com 4ª aumentada)" } d' e' fis' g' a' b' c'' \bar "|" \break
  c'4^\markup { \bold "C7M(♭6)" \normal-text "· Maior harmônica" } d' e' f' g' aes' b' c'' \bar "|" \break
  c'4^\markup { \bold "C7M(♯5 ♯11)" \normal-text "· Lídio aumentado" } d' e' fis' gis' a' b' c'' \bar "|" \break
  c'4^\markup { \bold "C" \normal-text "· Aumentada (simétrica)" } dis' e' g' aes' b' c'' \bar "|" \break
  c'4^\markup { \bold "C" \normal-text "· Escala blues" } ees' f' fis' g' bes' c'' \bar "|" \break
  c'4^\markup { \bold "C" \normal-text "· Pentatônica maior" } d' e' g' a' c'' \bar "|" \break
}
