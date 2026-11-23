/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fundo: 'rgb(var(--fundo) / <alpha-value>)',
        superficie: 'rgb(var(--superficie) / <alpha-value>)',
        elevado: 'rgb(var(--elevado) / <alpha-value>)',
        borda: 'rgb(var(--borda) / <alpha-value>)',
        texto: 'rgb(var(--texto) / <alpha-value>)',
        suave: 'rgb(var(--suave) / <alpha-value>)',
        ouro: 'rgb(var(--ouro) / <alpha-value>)',
        'ouro-forte': 'rgb(var(--ouro-forte) / <alpha-value>)',
        verde: 'rgb(var(--verde) / <alpha-value>)',
        perigo: 'rgb(var(--perigo) / <alpha-value>)',
        creme: '#f5efe2',
        marrom: '#6b4f3a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
      keyframes: {
        entrar: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        pop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: { entrar: 'entrar .35s ease-out both', pop: 'pop .3s ease-out' },
    },
  },
  plugins: [],
};
