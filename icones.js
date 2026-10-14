/*
 * Ícones do CMA (SVG em traço fino). Todos usam "currentColor",
 * então herdam a cor da raiz ou do texto onde aparecem.
 */
window.ICONES = {
  // Ilustrações das raízes (viewBox 48x48)
  raiz: {
    escuta: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 30v-6a15 15 0 0 1 30 0v6"/>
      <rect x="6" y="28" width="9" height="13" rx="3"/>
      <rect x="33" y="28" width="9" height="13" rx="3"/>
      <path d="M21 34.5q3-3 6 0M18.5 38q5.5-5.5 11 0" stroke-opacity=".5"/>
    </svg>`,
    ritmo: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 6l8 12M34 6l-8 12"/>
      <ellipse cx="24" cy="22" rx="15" ry="5.5"/>
      <path d="M9 22v13c0 3 6.7 5.5 15 5.5S39 38 39 35V22"/>
      <path d="M9 27.5l7.5 11 7.5-11 7.5 11 7.5-11" stroke-opacity=".5"/>
    </svg>`,
    melodia: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 41h40M4 34h40M4 27h40" stroke-opacity=".3" stroke-width="1.2"/>
      <path d="M18.5 35V12.5l20.5-5.5v22"/>
      <path d="M18.5 17.5l20.5-5.5" stroke-width="3.2"/>
      <ellipse cx="13.5" cy="35" rx="5.5" ry="4.2" transform="rotate(-18 13.5 35)"/>
      <ellipse cx="34" cy="29" rx="5.5" ry="4.2" transform="rotate(-18 34 29)"/>
    </svg>`,
    articulacao: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 17c6-8 17-10 25-6" stroke-opacity=".5"/>
      <path d="M29 6l9 4.5-9 4.5"/>
      <path d="M26.5 39V20"/>
      <ellipse cx="21" cy="39" rx="6" ry="4.4" transform="rotate(-18 21 39)"/>
      <circle cx="38" cy="30" r="2" fill="currentColor"/>
      <circle cx="38" cy="39" r="2" fill="currentColor" fill-opacity=".5" stroke="none"/>
    </svg>`,
    dinamica: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 15L4 24l18 9"/>
      <path d="M29.5 40v-8M36 40V24M42.5 40V12"/>
    </svg>`,
    ornamentos: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M25 8c-3 9-8.5 15-11.5 20M25 8c1 9 5 14.5 9 18.5"/>
      <path d="M25 8c5-4 12-4 16 0-5 3-11 3-16 0z"/>
      <circle cx="13" cy="34" r="7.5"/>
      <circle cx="34.5" cy="32" r="7.5"/>
      <path d="M9.5 32a4 4 0 0 1 3-3" stroke-opacity=".5"/>
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
    youtube: `<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.2 9.4v5.2l4.4-2.6z" fill="currentColor"/>`,
    pdf: `<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M14 2.8v5h5"/><path d="M9 13h6M9 16.5h4"/>`,
    livro: `<path d="M12 6.5C10 5 7.2 4.5 3.5 4.8v13.4c3.7-.3 6.5.2 8.5 1.8 2-1.6 4.8-2.1 8.5-1.8V4.8C16.8 4.5 14 5 12 6.5z"/><path d="M12 6.5V20"/>`,
    busca: `<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>`,
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
