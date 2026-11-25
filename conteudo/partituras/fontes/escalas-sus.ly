\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 297 mm))) system-system-spacing.basic-distance = #13 }
\layout { \context { \Score \remove "Bar_number_engraver" } \context { \Staff \remove "Time_signature_engraver" } \context { \Voice \omit Stem } \context { \Staff \accidentalStyle forget } }
#(set-global-staff-size 22)
{ \cadenzaOn
  c'4^\markup { \bold "C7sus4 (ou Gm/C)" \normal-text "· Mixolídio sem dar peso à 3ª" } d' f' g' a' bes' c'' \bar "|" \break
}
