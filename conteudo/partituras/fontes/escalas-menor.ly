\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 297 mm))) system-system-spacing.basic-distance = #13 }
\layout { \context { \Score \remove "Bar_number_engraver" } \context { \Staff \remove "Time_signature_engraver" } \context { \Voice \omit Stem } \context { \Staff \accidentalStyle forget } }
#(set-global-staff-size 22)
{ \cadenzaOn
  c'4^\markup { \bold "Cm7" \normal-text "· Dórico" } d' ees' f' g' a' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cm(7M)" \normal-text "· Menor melódica (subindo)" } d' ees' f' g' a' b' c'' \bar "|" \break
  c'4^\markup { \bold "Cm" \normal-text "· Escala blues" } ees' f' fis' g' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cm" \normal-text "· Pentatônica menor" } ees' f' g' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cm(♭6 7M)" \normal-text "· Menor harmônica" } d' ees' f' g' aes' b' c'' \bar "|" \break
  c'4^\markup { \bold "Cm" \normal-text "· Frígio" } des' ees' f' g' aes' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cm" \normal-text "· Frígio espanhol (8 notas)" } des' ees' e'! f' g' aes' bes' c'' \bar "|" \break
  c'4^\markup { \bold "Cm" \normal-text "· Diminuta, começando com tom" } d' ees' f' ges' aes' a'! b' c'' \bar "|" \break
  c'4^\markup { \bold "Cm(♭6)" \normal-text "· Menor natural (eólio)" } d' ees' f' g' aes' bes' c'' \bar "|" \break
}
