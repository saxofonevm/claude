import type {
  Agua, CheckRotina, Configuracoes, DataISO, Habito, Perfil, Refeicao, RegistroAlcool, RegistroHabito, RegistroRefeicao, RotinaItem, SessaoTreino,
} from '@/db/tipos';
import { diaSemana, semanaDoPlano } from '@/lib/datas';
import { metaProteinaDaSemana } from './fase';
import { calcularPontuacao, type Pontuacao } from './pontuacao';
import { itensDoDia } from './rotina';
import { treinoDoDia } from './treino';
import { permitidoNoDia } from './alcool';

export interface DadosPeriodo {
  perfil: Perfil;
  config: Configuracoes;
  rotina: RotinaItem[];
  habitos: Habito[];
  sessoes: SessaoTreino[];
  refeicoes: RegistroRefeicao[];
  alcool: RegistroAlcool[];
  checks: CheckRotina[];
  regHabitos: RegistroHabito[];
  agua: Agua[];
}

export const REFEICOES_TRABALHO: Refeicao[] = ['cafe', 'almoco', 'lanche'];

/** Refeições do dia, incluindo as "no trabalho" pré-marcadas (seg–qua) que ainda não foram editadas. */
export function refeicoesDoDia(data: DataISO, refeicoes: RegistroRefeicao[], config: Configuracoes): RegistroRefeicao[] {
  const reais = refeicoes.filter((r) => r.data === data);
  if (!config.diasTrabalho.includes(diaSemana(data))) return reais;
  const virtuais: RegistroRefeicao[] = REFEICOES_TRABALHO.filter((ref) => !reais.some((r) => r.refeicao === ref)).map((ref) => ({
    data,
    refeicao: ref,
    descricao: 'No trabalho',
    proteina: config.proteinaTrabalho[ref as 'cafe' | 'almoco' | 'lanche'],
    livre: false,
    origem: 'trabalho',
    criadoEm: '',
  }));
  return [...virtuais, ...reais];
}

export function proteinaDoDia(data: DataISO, refeicoes: RegistroRefeicao[], config: Configuracoes): number {
  return refeicoesDoDia(data, refeicoes, config).reduce((t, r) => t + r.proteina, 0);
}

export function habitoCumprido(h: Habito, data: DataISO, reg: RegistroHabito[], agua: Agua[], metaAgua: number): boolean {
  const r = reg.find((x) => x.habitoId === h.id && x.data === data);
  if (h.tipo === 'evitar') return r?.status !== 'falhou';
  if (h.auto === 'agua' && (agua.find((a) => a.data === data)?.ml ?? 0) >= metaAgua) return true;
  return r?.status === 'ok';
}

export function pontuacaoDoDia(data: DataISO, d: DadosPeriodo): Pontuacao & { proteina: number; meta: number } {
  const semana = semanaDoPlano(data, d.perfil.dataInicio);
  const meta = metaProteinaDaSemana(semana);
  const td = treinoDoDia(data, d.config, d.perfil.dataInicio);
  const sessoesDia = d.sessoes.filter((s) => s.data === data);
  const proteina = proteinaDoDia(data, d.refeicoes, d.config);
  const itens = itensDoDia(data, d.rotina, d.config);
  const feitosRotina = itens.filter((i) => d.checks.some((c) => c.data === data && c.itemId === i.id && c.feito)).length;
  const habitos = d.habitos.filter((h) => h.ativo && h.criadoEm <= data);
  const feitosHab = habitos.filter((h) => habitoCumprido(h, data, d.regHabitos, d.agua, d.perfil.metaAguaMl)).length;
  const p = calcularPontuacao({
    treino: {
      planejado: !!td && !td.opcional,
      feito: sessoesDia.some((s) => s.concluida),
      emAndamento: sessoesDia.some((s) => !s.concluida),
    },
    proteina,
    metaProteina: meta,
    alcool: {
      registro: d.alcool.find((r) => r.data === data),
      permitidoHoje: permitidoNoDia(data, d.config.alcool, d.alcool),
      limiteDoses: d.config.alcool.limiteDoses,
      fase: d.config.alcool.fase,
    },
    rotina: { feitos: feitosRotina + feitosHab, total: itens.length + habitos.length },
  });
  return { ...p, proteina, meta };
}
