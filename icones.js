/*
 * Ícones do CMA (SVG). As ilustrações das raízes usam "currentColor"
 * e um segundo tom translúcido, para ficarem bonitas sobre o degradê.
 */
window.ICONES = {
  // Ilustrações das raízes (viewBox 48x48)
  raiz: {
    escuta: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 29v-5a15 15 0 0 1 30 0v5"/>
      <rect x="6" y="27" width="10" height="15" rx="4.5" fill="currentColor" fill-opacity=".95"/>
      <rect x="32" y="27" width="10" height="15" rx="4.5" fill="currentColor" fill-opacity=".95"/>
      <path d="M20 33q4-4 8 0" stroke-opacity=".55"/><path d="M17 37q7-7 14 0" stroke-opacity=".35"/>
    </svg>`,
    ritmo: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 5l9 13M35 5l-9 13"/>
      <path d="M9 22v13c0 3.3 6.7 6 15 6s15-2.7 15-6V22" fill="currentColor" fill-opacity=".3"/>
      <ellipse cx="24" cy="22" rx="15" ry="6" fill="currentColor" fill-opacity=".95"/>
      <path d="M9 27l7.5 12 7.5-12 7.5 12L39 27" stroke-opacity=".8"/>
    </svg>`,
    melodia: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 40h40M4 33h40M4 26h40" stroke-opacity=".28" stroke-width="1.6"/>
      <path d="M18 35V12l21-6v23"/>
      <path d="M18 12l21-6v6l-21 6z" fill="currentColor"/>
      <ellipse cx="13" cy="35" rx="6" ry="4.6" transform="rotate(-18 13 35)" fill="currentColor"/>
      <ellipse cx="34" cy="29" rx="6" ry="4.6" transform="rotate(-18 34 29)" fill="currentColor"/>
    </svg>`,
    articulacao: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 18c6-9 18-11 26-6" stroke-opacity=".5"/>
      <path d="M28 6l10 5-10 5"/>
      <path d="M26 39V20"/>
      <ellipse cx="20" cy="39" rx="7" ry="5" transform="rotate(-18 20 39)" fill="currentColor"/>
      <circle cx="38" cy="30" r="3.2" fill="currentColor" stroke="none"/>
      <circle cx="38" cy="40" r="3.2" fill="currentColor" stroke="none" fill-opacity=".55"/>
    </svg>`,
    dinamica: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 14L4 24l18 10"/>
      <rect x="27" y="30" width="5" height="10" rx="2" fill="currentColor" fill-opacity=".45" stroke="none"/>
      <rect x="34" y="21" width="5" height="19" rx="2" fill="currentColor" fill-opacity=".7" stroke="none"/>
      <rect x="41" y="10" width="5" height="30" rx="2" fill="currentColor" stroke="none"/>
    </svg>`,
    ornamentos: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M25 8c-3 9-9 15-12 21M25 8c1 9 5 15 9 19"/>
      <path d="M25 8c5-4 12-4 16 0-5 3-11 3-16 0z" fill="currentColor" fill-opacity=".6"/>
      <circle cx="13" cy="34" r="8" fill="currentColor" stroke="none"/>
      <circle cx="34" cy="32" r="8" fill="currentColor" stroke="none" fill-opacity=".85"/>
      <path d="M9.5 31.5a4 4 0 0 1 3-3M30.5 29.5a4 4 0 0 1 3-3" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
    </svg>`
  },

  // Ícones de interface (viewBox 24x24)
  ui: {
    inicio: `<path d="M3.5 10.5L12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"/>`,
    raizes: `<circle cx="12" cy="7" r="4.2"/><path d="M12 11.2V15M12 15c-2.5 0-4.5 2.2-5.5 5.5M12 15c2.5 0 4.5 2.2 5.5 5.5M12 15v5.5"/>`,
    diario: `<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 19a2 2 0 0 1 2-2h12M9 7.5h6M9 11h4"/>`,
    ajustes: `<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.3"/><circle cx="9" cy="17" r="2.3"/>`,
    play: `<path d="M7.5 4.8v14.4a1 1 0 0 0 1.5.86l11.6-7.2a1 1 0 0 0 0-1.72L9 3.94a1 1 0 0 0-1.5.86z" fill="currentColor" stroke="none"/>`,
    pause: `<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>`,
    stop: `<rect x="5.5" y="5.5" width="13" height="13" rx="2.5" fill="currentColor" stroke="none"/>`,
    metronomo: `<path d="M6 21L9.6 3.5h4.8L18 21z"/><path d="M8 16.5h8M12 16.5l5.5-9"/>`,
    fogo: `<path d="M12 2.8c.6 3.6 5.8 5.6 5.8 11a5.8 5.8 0 0 1-11.6 0c0-2.8 1.6-4.2 2-6 1.7 1 2.6 2.8 2.6 2.8S12 6.5 12 2.8z"/>`,
    relogio: `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
    alvo: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>`,
    calendario: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`,
    check: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
    seta: `<path d="M9 5.5l6.5 6.5L9 18.5"/>`,
    voltar: `<path d="M15 5.5L8.5 12l6.5 6.5"/>`,
    mais: `<path d="M12 5v14M5 12h14"/>`,
    lampada: `<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4.2 10.3c.8.8 1.2 1.7 1.2 2.7h6c0-1 .4-1.9 1.2-2.7A6 6 0 0 0 12 3z"/>`,
    aspas: `<path d="M5 17.5c0-4 1.3-7.3 4.5-9.5M13.5 17.5c0-4 1.3-7.3 4.5-9.5" /><circle cx="7" cy="15.5" r="2.5" fill="currentColor"/><circle cx="15.5" cy="15.5" r="2.5" fill="currentColor"/>`,
    youtube: `<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="#ff0033" stroke="none"/><path d="M10 9.2v5.6l4.8-2.8z" fill="#fff" stroke="none"/>`,
    pdf: `<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M14 2.8v5h5"/><path d="M9 13h6M9 16.5h4"/>`,
    pasta: `<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.2h8.5A1.5 1.5 0 0 1 21 8.7V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>`,
    externo: `<path d="M14 4.5h5.5V10M19.5 4.5L11 13M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10"/>`,
    nota: `<path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="16.5" cy="16" r="2.5" fill="currentColor"/>`,
    trofeu: `<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z"/>`
  }
};

// Ícone de interface pronto para usar no HTML
window.icone = (nome, classe = "") =>
  `<svg class="ic ${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.ICONES.ui[nome] || ""}</svg>`;

// Ilustração de uma raiz
window.ilustracao = (nome, classe = "") =>
  (window.ICONES.raiz[nome] || window.ICONES.raiz.melodia).replace("<svg ", `<svg class="ilus ${classe}" aria-hidden="true" `);
