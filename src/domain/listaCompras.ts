import type { ItemCompra, ItemListaCompras, Prato, ReceitaBase, Secao } from '@/db/tipos';
import { ITENS_POR_ID, NOMES_SECAO } from '@/data/pratos';

export interface Selecao {
  pratoId: string;
  porcoes: number;
}

export const ORDEM_SECOES: Secao[] = ['acougue', 'hortifruti', 'mercearia', 'laticinios', 'padaria'];

/** Soma os ingredientes das seleções (pratos × porções), agrupando por item de compra. */
export function somarIngredientes(
  selecoes: Selecao[],
  pratos: Prato[],
  itens: Record<string, ItemCompra> = ITENS_POR_ID,
): ItemListaCompras[] {
  const porId = new Map<string, number>();
  const mapaPratos = new Map(pratos.map((p) => [p.id, p]));
  for (const s of selecoes) {
    const prato = mapaPratos.get(s.pratoId);
    if (!prato || s.porcoes <= 0) continue;
    for (const ing of prato.ingredientes) {
      if (!ing.itemId || !ing.qtd) continue;
      porId.set(ing.itemId, (porId.get(ing.itemId) ?? 0) + ing.qtd * s.porcoes);
    }
  }
  return paraLista(porId, itens);
}

/** Soma ingredientes de receitas base (cada receita conta uma vez). */
export function somarReceitas(receitas: ReceitaBase[], itens: Record<string, ItemCompra> = ITENS_POR_ID): ItemListaCompras[] {
  const porId = new Map<string, number>();
  for (const r of receitas)
    for (const ing of r.ingredientes)
      if (ing.itemId && ing.qtd) porId.set(ing.itemId, (porId.get(ing.itemId) ?? 0) + ing.qtd);
  return paraLista(porId, itens);
}

/** Junta duas listas somando quantidades do mesmo item. */
export function juntarListas(...listas: ItemListaCompras[][]): ItemListaCompras[] {
  const mapa = new Map<string, ItemListaCompras>();
  for (const l of listas)
    for (const i of l) {
      const atual = mapa.get(i.id);
      mapa.set(i.id, atual ? { ...atual, qtd: arredondar(atual.qtd + i.qtd, i.un) } : { ...i });
    }
  return ordenar([...mapa.values()]);
}

function paraLista(porId: Map<string, number>, itens: Record<string, ItemCompra>): ItemListaCompras[] {
  const lista: ItemListaCompras[] = [];
  for (const [id, qtd] of porId) {
    const item = itens[id];
    if (!item) continue;
    lista.push({ id, nome: item.nome, secao: item.secao, qtd: arredondar(qtd, item.un), un: item.un, marcado: false });
  }
  return ordenar(lista);
}

function ordenar(l: ItemListaCompras[]): ItemListaCompras[] {
  return l.sort((a, b) => ORDEM_SECOES.indexOf(a.secao) - ORDEM_SECOES.indexOf(b.secao) || a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Arredonda para quantidades de compra: gramas de 50 em 50, ml de 100 em 100, unidades para cima. */
export function arredondar(qtd: number, un: string): number {
  if (un === 'g') return Math.ceil(qtd / 50) * 50;
  if (un === 'ml') return Math.ceil(qtd / 100) * 100;
  return Math.ceil(qtd - 1e-9);
}

export function formatarQtd(qtd: number, un: string): string {
  const br = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  if (un === 'g') return qtd >= 1000 ? `${br(qtd / 1000)} kg` : `${qtd} g`;
  if (un === 'ml') return qtd >= 1000 ? `${br(qtd / 1000)} L` : `${qtd} ml`;
  if (un === 'lata') return `${qtd} ${qtd === 1 ? 'lata' : 'latas'}`;
  if (un === 'pct') return `${qtd} ${qtd === 1 ? 'pacote' : 'pacotes'}`;
  return `${qtd} un`;
}

export function agruparPorSecao(itens: ItemListaCompras[]): { secao: Secao; nome: string; itens: ItemListaCompras[] }[] {
  return ORDEM_SECOES.map((s) => ({ secao: s, nome: NOMES_SECAO[s], itens: itens.filter((i) => i.secao === s) })).filter(
    (g) => g.itens.length > 0,
  );
}

/** Texto pronto para colar no WhatsApp. */
export function textoWhatsApp(itens: ItemListaCompras[]): string {
  const linhas = ['🛒 *Lista de compras — No Eixo*', ''];
  for (const g of agruparPorSecao(itens)) {
    linhas.push(`*${g.nome}*`);
    for (const i of g.itens) linhas.push(`${i.marcado ? '✅' : '▫️'} ${i.nome} — ${formatarQtd(i.qtd, i.un)}`);
    linhas.push('');
  }
  return linhas.join('\n').trim();
}
