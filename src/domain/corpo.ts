import type { DataISO, MedidaCorpo } from '@/db/tipos';

/** Média móvel simples dos últimos `janela` registros (registro semanal → 4 semanas). */
export function mediaMovel(valores: (number | undefined)[], janela = 4): (number | null)[] {
  return valores.map((_, i) => {
    const fatia = valores.slice(Math.max(0, i - janela + 1), i + 1).filter((v): v is number => typeof v === 'number');
    if (!fatia.length) return null;
    return Math.round((fatia.reduce((a, b) => a + b, 0) / fatia.length) * 10) / 10;
  });
}

export interface PontoCorpo {
  data: DataISO;
  peso?: number;
  cintura?: number;
  pesoMedia: number | null;
  cinturaMedia: number | null;
}

export function serieCorpo(medidas: MedidaCorpo[]): PontoCorpo[] {
  const ord = [...medidas].sort((a, b) => (a.data < b.data ? -1 : 1));
  const mp = mediaMovel(ord.map((m) => m.peso));
  const mc = mediaMovel(ord.map((m) => m.cintura));
  return ord.map((m, i) => ({ data: m.data, peso: m.peso, cintura: m.cintura, pesoMedia: mp[i], cinturaMedia: mc[i] }));
}

export function variacao(medidas: MedidaCorpo[], campo: 'peso' | 'cintura'): number | null {
  const v = [...medidas].sort((a, b) => (a.data < b.data ? -1 : 1)).map((m) => m[campo]).filter((x): x is number => typeof x === 'number');
  if (v.length < 2) return null;
  return Math.round((v[v.length - 1] - v[0]) * 10) / 10;
}
