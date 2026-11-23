import { db } from '@/db/db';
import type { DataISO, FichaId, SessaoTreino } from '@/db/tipos';
import { semanaDoPlano } from '@/lib/datas';
import { seriesDoItem, sugestaoProgressao, ultimoRegistro } from '@/domain/treino';

/** Cria (ou retoma) a sessão do dia, já com séries da fase e cargas sugeridas. */
export async function iniciarSessao(ficha: FichaId, data: DataISO, opcional: boolean): Promise<number> {
  const aberta = await db.sessoesTreino.where('data').equals(data).filter((s) => !s.concluida && s.ficha === ficha).first();
  if (aberta?.id) return aberta.id;
  const [perfil, fichaDb, exercicios, sessoes] = await Promise.all([
    db.perfil.get('eu'),
    db.fichasTreino.get(ficha),
    db.exercicios.toArray(),
    db.sessoesTreino.toArray(),
  ]);
  if (!perfil || !fichaDb) throw new Error('Ficha não encontrada');
  const semana = semanaDoPlano(data, perfil.dataInicio);
  const porId = Object.fromEntries(exercicios.map((e) => [e.id, e]));
  const sessao: SessaoTreino = {
    data,
    ficha,
    opcional,
    inicio: new Date().toISOString(),
    cardioMin: 0,
    concluida: false,
    exercicios: fichaDb.itens.map((item) => {
      const ex = porId[item.exercicioId];
      const ultimo = ultimoRegistro(sessoes, item.exercicioId);
      const sug = ex ? sugestaoProgressao(item, ultimo, ex) : null;
      const n = seriesDoItem(item, semana);
      return {
        planejadoId: item.exercicioId,
        exercicioId: item.exercicioId,
        series: Array.from({ length: n }, () => ({
          carga: item.cardio ? 0 : (sug?.cargaSugerida ?? 0),
          reps: item.cardio ? item.repMax : item.repMax,
          feita: false,
        })),
      };
    }),
  };
  return db.sessoesTreino.add(sessao);
}

export async function sessaoAberta(): Promise<SessaoTreino | undefined> {
  return db.sessoesTreino.filter((s) => !s.concluida).last();
}
