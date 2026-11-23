import type { ConfigAlcool, DataISO, FaseAlcool, Gatilho, RegistroAlcool, Vontade } from '@/db/tipos';
import { addDias, diaSemana, diffDias, inicioSemana } from '@/lib/datas';

export const NOMES_GATILHO: Record<Gatilho, string> = {
  show: 'Show',
  social: 'Social',
  estresse: 'Estresse',
  tedio: 'Tédio',
  solidao: 'Solidão',
  comemoracao: 'Comemoração',
};

export const NOMES_FASE: Record<FaseAlcool, string> = {
  semanal: '1 dia por semana',
  quinzenal: '1 dia a cada 15 dias',
  zero: 'Zero álcool',
};

export const PROXIMA_FASE: Record<FaseAlcool, FaseAlcool | null> = { semanal: 'quinzenal', quinzenal: 'zero', zero: null };

function diasQueBebeu(registros: RegistroAlcool[], ate?: DataISO): DataISO[] {
  return registros
    .filter((r) => r.bebeu && (!ate || r.data <= ate))
    .map((r) => r.data)
    .sort();
}

/**
 * Dias sem beber até hoje. Conta os dias depois da última vez que bebeu;
 * hoje só entra depois de registrar "Não bebi".
 */
export function diasSemBeber(registros: RegistroAlcool[], hoje: DataISO, dataInicio: DataISO): number {
  const bebeu = diasQueBebeu(registros, hoje);
  const ultima = bebeu.length ? bebeu[bebeu.length - 1] : addDias(dataInicio, -1);
  if (ultima === hoje) return 0;
  const hojeOk = registros.some((r) => r.data === hoje && !r.bebeu);
  return Math.max(0, diffDias(hoje, ultima) - (hojeOk ? 0 : 1));
}

export function recordeSemBeber(registros: RegistroAlcool[], hoje: DataISO, dataInicio: DataISO): number {
  const bebeu = diasQueBebeu(registros, hoje);
  let recorde = 0;
  let anterior = addDias(dataInicio, -1);
  for (const d of bebeu) {
    recorde = Math.max(recorde, diffDias(d, anterior) - 1);
    anterior = d;
  }
  return Math.max(recorde, diasSemBeber(registros, hoje, dataInicio));
}

export function dosesNoPeriodo(registros: RegistroAlcool[], inicio: DataISO, fim: DataISO): number {
  return registros.filter((r) => r.bebeu && r.data >= inicio && r.data <= fim).reduce((t, r) => t + r.doses, 0);
}

/** Dinheiro economizado comparando com quanto bebia antes. */
export function economizado(registros: RegistroAlcool[], dataInicio: DataISO, hoje: DataISO, c: Pick<ConfigAlcool, 'dosesPorSemanaAntes' | 'precoDose'>): number {
  const dias = diffDias(hoje, dataInicio) + 1;
  if (dias <= 0) return 0;
  const esperado = (c.dosesPorSemanaAntes * dias) / 7;
  const consumido = dosesNoPeriodo(registros, dataInicio, hoje);
  return Math.max(0, Math.round((esperado - consumido) * c.precoDose));
}

/** Se beber neste dia está dentro da regra da fase. */
export function permitidoNoDia(data: DataISO, c: Pick<ConfigAlcool, 'fase' | 'diaPermitido'>, registros: RegistroAlcool[]): boolean {
  if (c.fase === 'zero') return false;
  if (diaSemana(data) !== c.diaPermitido) return false;
  if (c.fase === 'quinzenal') {
    const inicio = addDias(data, -13);
    return !registros.some((r) => r.bebeu && r.data >= inicio && r.data < data);
  }
  return true;
}

/** A semana (segunda a domingo) cumpriu a regra? */
export function semanaCumprida(segunda: DataISO, c: Pick<ConfigAlcool, 'fase' | 'diaPermitido' | 'limiteDoses'>, registros: RegistroAlcool[]): boolean {
  const fim = addDias(segunda, 6);
  const daSemana = registros.filter((r) => r.bebeu && r.data >= segunda && r.data <= fim);
  return daSemana.every((r) => r.doses <= c.limiteDoses && permitidoNoDia(r.data, c, registros));
}

/** Sugere avançar de fase depois de 4 semanas completas cumprindo a fase atual. */
export function sugerirAvanco(registros: RegistroAlcool[], hoje: DataISO, c: ConfigAlcool): FaseAlcool | null {
  const proxima = PROXIMA_FASE[c.fase];
  if (!proxima) return null;
  const semanaAtual = inicioSemana(hoje);
  const segundaDaFase = inicioSemana(c.faseDesde);
  const primeiraCompleta = segundaDaFase === c.faseDesde ? c.faseDesde : addDias(segundaDaFase, 7);
  const semanas: DataISO[] = [];
  for (let s = primeiraCompleta; s < semanaAtual; s = addDias(s, 7)) semanas.push(s);
  if (semanas.length < 4) return null;
  const ultimas4 = semanas.slice(-4);
  return ultimas4.every((s) => semanaCumprida(s, c, registros)) ? proxima : null;
}

export function mapaGatilhos(registros: RegistroAlcool[], vontades: Vontade[]): { gatilho: Gatilho; total: number }[] {
  const cont: Partial<Record<Gatilho, number>> = {};
  for (const r of registros) if (r.bebeu && r.gatilho) cont[r.gatilho] = (cont[r.gatilho] ?? 0) + 1;
  for (const v of vontades) if (v.gatilho) cont[v.gatilho] = (cont[v.gatilho] ?? 0) + 1;
  return (Object.keys(cont) as Gatilho[]).map((g) => ({ gatilho: g, total: cont[g] ?? 0 })).sort((a, b) => b.total - a.total);
}

/** Dias da semana de maior risco (bebeu ou teve vontade). Índice 0 = domingo. */
export function diasDeRisco(registros: RegistroAlcool[], vontades: Vontade[]): number[] {
  const cont = [0, 0, 0, 0, 0, 0, 0];
  for (const r of registros) if (r.bebeu) cont[diaSemana(r.data)] += 1;
  for (const v of vontades) cont[diaSemana(v.data)] += 1;
  return cont;
}
