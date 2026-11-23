import type { Configuracoes, DataISO, Exercicio, ExercicioSessao, FichaId, ItemFicha, SessaoTreino } from '@/db/tipos';
import { diaSemana, semanaDoPlano } from '@/lib/datas';
import { seriesDaSemana } from './fase';

export interface TreinoDoDia {
  ficha: FichaId;
  opcional: boolean;
}

/**
 * Qual ficha cabe ao dia.
 * - Dias fixos de treino: o 1º dia da semana é A, o 2º é B (terça A, quinta B).
 * - Dia opcional (sábado): semana ímpar do plano = A, semana par = B.
 */
export function treinoDoDia(
  data: DataISO,
  config: Pick<Configuracoes, 'diasTreino' | 'diaTreinoOpcional'>,
  dataInicio: DataISO,
): TreinoDoDia | null {
  const dow = diaSemana(data);
  const fixos = [...config.diasTreino].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const idx = fixos.indexOf(dow);
  if (idx >= 0) return { ficha: idx % 2 === 0 ? 'A' : 'B', opcional: false };
  if (config.diaTreinoOpcional === dow) {
    const semana = semanaDoPlano(data, dataInicio);
    return { ficha: semana % 2 === 1 ? 'A' : 'B', opcional: true };
  }
  return null;
}

/** Séries a fazer de um item da ficha na semana do plano (cardio sempre 1). */
export function seriesDoItem(item: ItemFicha, semana: number): number {
  if (item.cardio) return 1;
  return Math.min(item.series, seriesDaSemana(semana));
}

export interface Sugestao {
  subir: boolean;
  cargaSugerida: number;
  ultimaCarga: number;
  motivo: string;
}

/**
 * Progressão: se na última vez fez o topo da faixa em todas as séries feitas,
 * sugere subir a carga (+incremento do exercício).
 */
export function sugestaoProgressao(item: ItemFicha, ultima: ExercicioSessao | undefined, exercicio: Exercicio): Sugestao | null {
  if (!ultima || item.cardio || exercicio.tipo === 'cardio') return null;
  const feitas = ultima.series.filter((s) => s.feita);
  if (feitas.length === 0) return null;
  const ultimaCarga = Math.max(...feitas.map((s) => s.carga));
  const bateuTopo = feitas.length >= Math.min(item.series, ultima.series.length) && feitas.every((s) => s.reps >= item.repMax);
  if (bateuTopo && exercicio.incremento > 0) {
    const texto =
      exercicio.equipamento === 'halter' ? `+${exercicio.incremento} kg nos halteres` : `+1 placa (~${exercicio.incremento} kg)`;
    return { subir: true, cargaSugerida: ultimaCarga + exercicio.incremento, ultimaCarga, motivo: `Você fez ${item.repMax} reps em todas as séries. Suba: ${texto}.` };
  }
  return { subir: false, cargaSugerida: ultimaCarga, ultimaCarga, motivo: `Mantenha ${ultimaCarga} kg e busque ${item.repMax} reps.` };
}

/** Último registro de um exercício (pelo id do exercício efetivamente feito). */
export function ultimoRegistro(sessoes: SessaoTreino[], exercicioId: string, antesDe?: DataISO): ExercicioSessao | undefined {
  const ordenadas = [...sessoes]
    .filter((s) => (antesDe ? s.data < antesDe || (s.data === antesDe && s.concluida) : true))
    .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : (b.id ?? 0) - (a.id ?? 0)));
  for (const s of ordenadas) {
    const e = s.exercicios.find((x) => x.exercicioId === exercicioId && x.series.some((r) => r.feita));
    if (e) return e;
  }
  return undefined;
}

export function volumeSessao(sessao: SessaoTreino): number {
  return sessao.exercicios.reduce(
    (t, e) => t + e.series.filter((s) => s.feita).reduce((a, s) => a + s.carga * s.reps, 0),
    0,
  );
}

/** Exercícios em que a carga máxima de hoje superou todas as sessões anteriores. */
export function recordesDaSessao(sessao: SessaoTreino, anteriores: SessaoTreino[]): { exercicioId: string; carga: number }[] {
  const out: { exercicioId: string; carga: number }[] = [];
  for (const e of sessao.exercicios) {
    const feitas = e.series.filter((s) => s.feita && s.carga > 0);
    if (!feitas.length) continue;
    const max = Math.max(...feitas.map((s) => s.carga));
    const antes = anteriores
      .filter((s) => s.id !== sessao.id)
      .flatMap((s) => s.exercicios.filter((x) => x.exercicioId === e.exercicioId))
      .flatMap((x) => x.series.filter((s) => s.feita).map((s) => s.carga));
    if (antes.length > 0 && max > Math.max(...antes)) out.push({ exercicioId: e.exercicioId, carga: max });
  }
  return out;
}

/** Histórico de carga máxima por data de um exercício (para gráfico). */
export function historicoCarga(sessoes: SessaoTreino[], exercicioId: string): { data: DataISO; carga: number; reps: number }[] {
  return sessoes
    .filter((s) => s.concluida)
    .map((s) => {
      const e = s.exercicios.find((x) => x.exercicioId === exercicioId);
      const feitas = e?.series.filter((r) => r.feita) ?? [];
      if (!feitas.length) return null;
      const melhor = feitas.reduce((a, b) => (b.carga > a.carga || (b.carga === a.carga && b.reps > a.reps) ? b : a));
      return { data: s.data, carga: melhor.carga, reps: melhor.reps };
    })
    .filter((x): x is { data: DataISO; carga: number; reps: number } => x !== null)
    .sort((a, b) => (a.data < b.data ? -1 : 1));
}
