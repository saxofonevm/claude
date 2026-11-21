\version "2.24.0"
\paper { indent = 0 ragged-right = ##t tagline = ##f print-page-number = ##f
  #(set-paper-size '(cons (* 150 mm) (* 90 mm))) }
\layout { \context { \Score \remove "Bar_number_engraver" } }
#(set-global-staff-size 22)
\relative c'' { \time 2/4 \key g \major
  g16-.^\markup { \bold "Língua leve" \small "(ta-ta-ta, sem cortar o ar)" } a-. b-. c-. d-. c-. b-. a-. | g-. fis-. g-. a-. b8-. r | \break
  d16-. c-. b-. a-. g-. a-. b-. c-. | d-. b-. g-. a-. g8-. r \bar "|." }
