import type { Configuracoes, DataISO, RotinaItem, TipoDia } from '@/db/tipos';
import { diaSemana, minutosDoDia } from '@/lib/datas';

type ConfigDias = Pick<Configuracoes, 'diasTreino' | 'diaTreinoOpcional' | 'diasShow' | 'diasTrabalho' | 'diasPreparo'>;

/** Tipos de dia que se aplicam a um dia da semana (0 = domingo). */
export function tiposDoDiaSemana(dow: number, c: ConfigDias): TipoDia[] {
  const tipos: TipoDia[] = [];
  if (c.diasTrabalho.includes(dow)) tipos.push('trabalho');
  if (c.diasTreino.includes(dow)) tipos.push('treino');
  if (c.diasTreino.includes((dow + 1) % 7)) tipos.push('vespera');
  if (c.diaTreinoOpcional === dow && !c.diasTreino.includes(dow)) tipos.push('treinoOpcional');
  if (c.diasPreparo.includes(dow) && dow !== 0) tipos.push('preparo');
  if (c.diasShow.includes(dow)) tipos.push('show');
  if (dow === 0) tipos.push('domingo');
  return tipos;
}

export function tiposDoDia(data: DataISO, c: ConfigDias): TipoDia[] {
  return tiposDoDiaSemana(diaSemana(data), c);
}

/** Dias da semana em que um tipo de dia acontece. */
export function diasDoTipo(tipo: TipoDia, c: ConfigDias): number[] {
  return [0, 1, 2, 3, 4, 5, 6].filter((d) => tiposDoDiaSemana(d, c).includes(tipo));
}

export function itensDoDia(data: DataISO, rotina: RotinaItem[], c: ConfigDias): RotinaItem[] {
  const tipos = tiposDoDia(data, c);
  return rotina
    .filter((r) => tipos.includes(r.tipoDia))
    .sort((a, b) => minutosDoDia(a.hora) - minutosDoDia(b.hora) || a.ordem - b.ordem);
}

export function rotuloDoDia(data: DataISO, c: ConfigDias): string {
  const t = tiposDoDia(data, c);
  const partes: string[] = [];
  if (t.includes('treino')) partes.push('Treino');
  if (t.includes('treinoOpcional')) partes.push('Treino opcional');
  if (t.includes('preparo')) partes.push('Preparo de marmitas');
  if (t.includes('show')) partes.push('Show à noite');
  if (t.includes('trabalho') && !t.includes('treino')) partes.push('Projeto');
  if (t.includes('domingo')) partes.push('Descanso e revisão');
  return partes.join(' · ') || 'Dia livre';
}
