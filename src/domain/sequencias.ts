import type { DataISO, SessaoTreino } from '@/db/tipos';
import { addDias, inicioSemana } from '@/lib/datas';
import { LIMIAR_NO_EIXO } from './pontuacao';

/** Dias seguidos no eixo (≥ 70 pts). Hoje só conta se já bateu; senão começa de ontem. */
export function diasNoEixo(pontos: Record<DataISO, number>, hoje: DataISO, limiar = LIMIAR_NO_EIXO): number {
  let d = (pontos[hoje] ?? 0) >= limiar ? hoje : addDias(hoje, -1);
  let n = 0;
  while ((pontos[d] ?? -1) >= limiar) {
    n++;
    d = addDias(d, -1);
  }
  return n;
}

export function melhorSequencia(pontos: Record<DataISO, number>, limiar = LIMIAR_NO_EIXO): number {
  const datas = Object.keys(pontos).sort();
  let melhor = 0;
  let atual = 0;
  let anterior: DataISO | null = null;
  for (const d of datas) {
    const ok = pontos[d] >= limiar;
    const consecutivo = anterior !== null && addDias(anterior, 1) === d;
    atual = ok ? (consecutivo ? atual + 1 : 1) : 0;
    melhor = Math.max(melhor, atual);
    anterior = d;
  }
  return melhor;
}

export function treinosPorSemana(sessoes: SessaoTreino[]): Record<DataISO, number> {
  const out: Record<DataISO, number> = {};
  for (const s of sessoes) {
    if (!s.concluida) continue;
    const k = inicioSemana(s.data);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Semanas seguidas com 2+ treinos. A semana atual só conta se já bateu a meta. */
export function semanasComTreinos(sessoes: SessaoTreino[], hoje: DataISO, minimo = 2): number {
  const porSemana = treinosPorSemana(sessoes);
  let semana = inicioSemana(hoje);
  if ((porSemana[semana] ?? 0) < minimo) semana = addDias(semana, -7);
  let n = 0;
  while ((porSemana[semana] ?? 0) >= minimo) {
    n++;
    semana = addDias(semana, -7);
  }
  return n;
}
