/**
 * Integração com o app Saúde (Apple) via app Atalhos.
 * - App → Saúde: abre shortcuts://run-shortcut com um texto de entrada.
 * - Saúde → App: o atalho copia "NOEIXO;peso=..;cintura=..;passos=.." e o app lê da área de transferência.
 */

export interface NomesAtalhos {
  peso: string;
  agua: string;
  importar: string;
}

export const ATALHOS_PADRAO: NomesAtalhos = {
  peso: 'No Eixo Peso',
  agua: 'No Eixo Água',
  importar: 'No Eixo Importar',
};

export const MARCADOR = 'NOEIXO';

export function linkAtalho(nome: string, texto?: string): string {
  const base = `shortcuts://run-shortcut?name=${encodeURIComponent(nome)}`;
  return texto === undefined ? base : `${base}&input=text&text=${encodeURIComponent(texto)}`;
}

export type Decimal = 'virgula' | 'ponto';

/** Formata o número como o Atalhos espera no idioma do iPhone (pt-BR usa vírgula). */
export function numeroParaAtalho(n: number, decimal: Decimal = 'virgula'): string {
  const s = String(Math.round(n * 10) / 10);
  return decimal === 'virgula' ? s.replace('.', ',') : s;
}

/** Texto enviado ao atalho de peso: "74,2;90,5" (cintura opcional). */
export function textoPeso(peso: number, cintura?: number, decimal: Decimal = 'virgula'): string {
  const p = numeroParaAtalho(peso, decimal);
  return cintura ? `${p};${numeroParaAtalho(cintura, decimal)}` : p;
}

export interface DadosSaude {
  peso?: number;
  cintura?: number;
  passos?: number;
}

/** Número decimal vindo do Atalhos em pt-BR ("74,2 kg", "1.074,5") ou en ("74.2"). */
export function numeroDecimal(v: string): number | undefined {
  const limpo = v.replace(/[^\d.,-]/g, '');
  if (!limpo) return undefined;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const n = Number.parseFloat(normal);
  return Number.isFinite(n) ? n : undefined;
}

/** Inteiro (passos): "8.234" ou "8,234" ou "8234 passos" → 8234. Decimais da soma são arredondados. */
export function numeroInteiro(v: string): number | undefined {
  const m = v.match(/[\d.,]+/);
  if (!m) return undefined;
  let s = m[0];
  // "8234,6" ou "8234.6" (decimal de soma) → corta a parte decimal curta
  const dec = s.match(/^(\d+)[.,](\d{1,2})$/);
  if (dec) s = dec[1];
  const n = Number.parseInt(s.replace(/[.,]/g, ''), 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Lê o texto copiado pelo atalho "No Eixo Importar". Retorna null se não for do No Eixo. */
export function lerDadosSaude(texto: string): DadosSaude | null {
  const i = texto.toUpperCase().indexOf(MARCADOR);
  if (i < 0) return null;
  const dados: DadosSaude = {};
  for (const parte of texto.slice(i + MARCADOR.length).split(/[;\n]/)) {
    const [chave, ...resto] = parte.split('=');
    const k = chave?.trim().toLowerCase();
    const v = resto.join('=').trim();
    if (!k || !v) continue;
    if (k === 'peso') {
      let n = numeroDecimal(v);
      if (n !== undefined && n > 400) n = n / 1000; // veio em gramas
      if (n !== undefined && n >= 20 && n <= 400) dados.peso = Math.round(n * 10) / 10;
    } else if (k === 'cintura') {
      let n = numeroDecimal(v);
      if (n !== undefined && n < 3) n = n * 100; // veio em metros
      if (n !== undefined && n >= 40 && n <= 200) dados.cintura = Math.round(n * 10) / 10;
    } else if (k === 'passos') {
      const n = numeroInteiro(v);
      if (n !== undefined && n >= 0 && n < 200000) dados.passos = n;
    }
  }
  return dados;
}

/** Quanto de água ainda não foi enviado ao Saúde hoje. */
export function aguaPendente(ml: number, enviado = 0): number {
  return Math.max(0, ml - enviado);
}
