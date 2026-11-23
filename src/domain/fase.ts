import type { FasePlano } from '@/db/tipos';
import { FASES, TOTAL_SEMANAS } from '@/data/plano12';

export function faseDaSemana(semana: number, fases: FasePlano[] = FASES): FasePlano {
  const ordenadas = [...fases].sort((a, b) => a.semanaInicio - b.semanaInicio);
  if (semana < ordenadas[0].semanaInicio) return ordenadas[0];
  for (const f of ordenadas) if (semana >= f.semanaInicio && semana <= f.semanaFim) return f;
  return ordenadas[ordenadas.length - 1];
}

/** Séries por exercício: 2 nas semanas 1–2 (adaptação), 3 depois. */
export function seriesDaSemana(semana: number, fases: FasePlano[] = FASES): number {
  return faseDaSemana(semana, fases).series;
}

export function metaProteinaDaSemana(semana: number, fases: FasePlano[] = FASES): number {
  return faseDaSemana(semana, fases).metaProteina;
}

export function progressoPlano(semana: number): { semana: number; pct: number; concluido: boolean } {
  const s = Math.max(1, Math.min(semana, TOTAL_SEMANAS));
  return { semana: s, pct: Math.round((Math.min(semana, TOTAL_SEMANAS) / TOTAL_SEMANAS) * 100), concluido: semana > TOTAL_SEMANAS };
}

/** Se a semana informada é a última de uma fase (para mostrar a tela de conquista). */
export function fimDeFase(semana: number, fases: FasePlano[] = FASES): FasePlano | null {
  return fases.find((f) => f.semanaFim === semana) ?? null;
}
