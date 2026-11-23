import type { EstoqueMarmita } from '@/db/tipos';

export const LIMITE_ALERTA = 2;

export function adicionarAoEstoque(
  estoque: EstoqueMarmita[],
  pratoId: string,
  nome: string,
  quantidade: number,
  agora = new Date().toISOString(),
): EstoqueMarmita[] {
  if (quantidade <= 0) return estoque;
  const existe = estoque.find((e) => e.pratoId === pratoId);
  if (existe) return estoque.map((e) => (e.pratoId === pratoId ? { ...e, quantidade: e.quantidade + quantidade, atualizado: agora } : e));
  return [...estoque, { pratoId, nome, quantidade, atualizado: agora }];
}

/** Tira marmitas do estoque. Se pratoId não for informado, tira da que tiver mais unidades. */
export function consumirDoEstoque(
  estoque: EstoqueMarmita[],
  pratoId?: string,
  quantidade = 1,
  agora = new Date().toISOString(),
): { estoque: EstoqueMarmita[]; consumido: string | null } {
  const alvo = pratoId
    ? estoque.find((e) => e.pratoId === pratoId && e.quantidade > 0)
    : [...estoque].filter((e) => e.quantidade > 0).sort((a, b) => b.quantidade - a.quantidade)[0];
  if (!alvo) return { estoque, consumido: null };
  return {
    estoque: estoque.map((e) =>
      e.pratoId === alvo.pratoId ? { ...e, quantidade: Math.max(0, e.quantidade - quantidade), atualizado: agora } : e,
    ),
    consumido: alvo.pratoId,
  };
}

export function totalEstoque(estoque: EstoqueMarmita[]): number {
  return estoque.reduce((t, e) => t + Math.max(0, e.quantidade), 0);
}

export function estoqueBaixo(estoque: EstoqueMarmita[]): boolean {
  return totalEstoque(estoque) <= LIMITE_ALERTA;
}
