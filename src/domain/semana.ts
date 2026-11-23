import type { DataISO, Gatilho, Preparo, RegistroRefeicao } from '@/db/tipos';
import { addDias } from '@/lib/datas';
import { habitoCumprido, pontuacaoDoDia, proteinaDoDia, type DadosPeriodo } from './dia';
import { faseDaSemana } from './fase';
import { semanaDoPlano } from '@/lib/datas';

export interface ResumoSemana {
  dias: { data: DataISO; pontos: number }[];
  pontuacaoMedia: number;
  treinosFeitos: number;
  treinosPlanejados: number;
  proteinaMedia: number;
  diasSemAlcool: number;
  diasRegistrados: number;
  doses: number;
  gatilhos: Gatilho[];
  marmitasPreparadas: number;
  marmitasConsumidas: number;
  habitosPct: number;
}

/** Resumo de uma semana (segunda a domingo), considerando só os dias até hoje. */
export function resumoSemana(d: DadosPeriodo, segunda: DataISO, hoje: DataISO, preparos: Preparo[], refeicoesSemana: RegistroRefeicao[]): ResumoSemana {
  const datas = Array.from({ length: 7 }, (_, i) => addDias(segunda, i)).filter((x) => x <= hoje && x >= d.perfil.dataInicio);
  const dias = datas.map((data) => ({ data, pontos: pontuacaoDoDia(data, d).total }));
  const media = (v: number[]) => (v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0);
  const fim = addDias(segunda, 6);
  const alc = d.alcool.filter((r) => r.data >= segunda && r.data <= fim);
  const habitos = d.habitos.filter((h) => h.ativo);
  let hTotal = 0;
  let hOk = 0;
  for (const data of datas)
    for (const h of habitos) {
      if (h.criadoEm > data) continue;
      hTotal++;
      if (habitoCumprido(h, data, d.regHabitos, d.agua, d.perfil.metaAguaMl)) hOk++;
    }
  return {
    dias,
    pontuacaoMedia: media(dias.map((x) => x.pontos)),
    treinosFeitos: d.sessoes.filter((s) => s.concluida && s.data >= segunda && s.data <= fim).length,
    treinosPlanejados: faseDaSemana(semanaDoPlano(segunda, d.perfil.dataInicio)).treinosSemana,
    proteinaMedia: media(datas.map((x) => proteinaDoDia(x, d.refeicoes, d.config))),
    diasSemAlcool: alc.filter((r) => !r.bebeu).length,
    diasRegistrados: alc.length,
    doses: alc.reduce((t, r) => t + (r.bebeu ? r.doses : 0), 0),
    gatilhos: alc.filter((r) => r.bebeu && r.gatilho).map((r) => r.gatilho as Gatilho),
    marmitasPreparadas: preparos
      .filter((p) => p.concluido && p.data >= segunda && p.data <= fim)
      .reduce((t, p) => t + p.itens.reduce((a, i) => a + i.porcoes, 0), 0),
    marmitasConsumidas: refeicoesSemana.filter((r) => r.estoquePratoId && r.data >= segunda && r.data <= fim).length,
    habitosPct: hTotal ? Math.round((hOk / hTotal) * 100) : 0,
  };
}
