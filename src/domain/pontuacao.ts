import type { FaseAlcool, RegistroAlcool } from '@/db/tipos';

export interface EntradaPontuacao {
  treino: { planejado: boolean; feito: boolean; emAndamento?: boolean };
  proteina: number;
  metaProteina: number;
  alcool: { registro?: RegistroAlcool; permitidoHoje: boolean; limiteDoses: number; fase: FaseAlcool };
  rotina: { feitos: number; total: number };
}

export interface Pontuacao {
  total: number;
  treino: number;
  alimentacao: number;
  alcool: number;
  rotina: number;
}

export const PESOS = { treino: 25, alimentacao: 25, alcool: 30, rotina: 20 } as const;
export const LIMIAR_NO_EIXO = 70;

export function pontosTreino(t: EntradaPontuacao['treino']): number {
  if (!t.planejado) return PESOS.treino; // descanso planejado também é cumprir o plano
  if (t.feito) return PESOS.treino;
  if (t.emAndamento) return 10;
  return 0;
}

export function pontosAlimentacao(proteina: number, meta: number): number {
  if (meta <= 0) return PESOS.alimentacao;
  return Math.round(Math.min(1, Math.max(0, proteina) / meta) * PESOS.alimentacao);
}

export function pontosAlcool(a: EntradaPontuacao['alcool']): number {
  const r = a.registro;
  if (!r) return 0; // sem registro, sem pontos: registre o dia
  if (!r.bebeu) return PESOS.alcool;
  if (a.fase === 'zero' || !a.permitidoHoje) return 0;
  return r.doses <= a.limiteDoses ? PESOS.alcool : 10;
}

export function pontosRotina(r: EntradaPontuacao['rotina']): number {
  if (r.total <= 0) return PESOS.rotina;
  return Math.round(Math.min(1, r.feitos / r.total) * PESOS.rotina);
}

export function calcularPontuacao(e: EntradaPontuacao): Pontuacao {
  const treino = pontosTreino(e.treino);
  const alimentacao = pontosAlimentacao(e.proteina, e.metaProteina);
  const alcool = pontosAlcool(e.alcool);
  const rotina = pontosRotina(e.rotina);
  return { total: treino + alimentacao + alcool + rotina, treino, alimentacao, alcool, rotina };
}
