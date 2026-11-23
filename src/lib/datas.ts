import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DataISO } from '@/db/tipos';

export const FUSO = 'America/Sao_Paulo';

const fmtData = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const fmtHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Data de hoje no fuso de São Paulo, em 'yyyy-MM-dd'. */
export function hojeISO(agora: Date = new Date()): DataISO {
  return fmtData.format(agora);
}

/** Hora atual 'HH:mm' no fuso de São Paulo. */
export function horaAgora(agora: Date = new Date()): string {
  return fmtHora.format(agora);
}

export function paraData(d: DataISO): Date {
  return parseISO(d);
}

export function paraISO(d: Date): DataISO {
  return format(d, 'yyyy-MM-dd');
}

export function addDias(d: DataISO, n: number): DataISO {
  return paraISO(addDays(paraData(d), n));
}

/** 0 = domingo ... 6 = sábado */
export function diaSemana(d: DataISO): number {
  return paraData(d).getDay();
}

/** Segunda-feira da semana da data. */
export function inicioSemana(d: DataISO): DataISO {
  return paraISO(startOfWeek(paraData(d), { weekStartsOn: 1 }));
}

export function diffDias(a: DataISO, b: DataISO): number {
  return differenceInCalendarDays(paraData(a), paraData(b));
}

export function diasDaSemana(segunda: DataISO): DataISO[] {
  return Array.from({ length: 7 }, (_, i) => addDias(segunda, i));
}

export function intervalo(inicio: DataISO, fim: DataISO): DataISO[] {
  const out: DataISO[] = [];
  for (let d = inicio; d <= fim; d = addDias(d, 1)) out.push(d);
  return out;
}

export function formatar(d: DataISO, padrao: string): string {
  return format(paraData(d), padrao, { locale: ptBR });
}

export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const NOMES_DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Semana do plano (1, 2, 3...). Semana 1 começa na segunda-feira da data de início. */
export function semanaDoPlano(data: DataISO, dataInicio: DataISO): number {
  const dias = diffDias(inicioSemana(data), inicioSemana(dataInicio));
  return Math.floor(dias / 7) + 1;
}

export function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function saudacao(hora: string): string {
  const m = minutosDoDia(hora);
  if (m < 12 * 60) return 'Bom dia';
  if (m < 18 * 60) return 'Boa tarde';
  return 'Boa noite';
}
