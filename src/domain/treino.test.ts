import { describe, expect, it } from 'vitest';
import { recordesDaSessao, seriesDoItem, sugestaoProgressao, treinoDoDia, ultimoRegistro, volumeSessao } from './treino';
import { seriesDaSemana, faseDaSemana, metaProteinaDaSemana } from './fase';
import { FICHAS } from '@/data/treinos';
import { EXERCICIOS_POR_ID } from '@/data/exercicios';
import type { SessaoTreino } from '@/db/tipos';

const config = { diasTreino: [2, 4], diaTreinoOpcional: 6 };
const inicio = '2026-01-05'; // segunda-feira, semana 1

describe('Alternância A/B', () => {
  it('terça é A e quinta é B', () => {
    expect(treinoDoDia('2026-01-06', config, inicio)).toEqual({ ficha: 'A', opcional: false });
    expect(treinoDoDia('2026-01-08', config, inicio)).toEqual({ ficha: 'B', opcional: false });
  });

  it('sábado opcional: semana ímpar A, semana par B', () => {
    expect(treinoDoDia('2026-01-10', config, inicio)).toEqual({ ficha: 'A', opcional: true }); // semana 1
    expect(treinoDoDia('2026-01-17', config, inicio)).toEqual({ ficha: 'B', opcional: true }); // semana 2
    expect(treinoDoDia('2026-01-24', config, inicio)).toEqual({ ficha: 'A', opcional: true }); // semana 3
  });

  it('dias sem treino retornam null', () => {
    expect(treinoDoDia('2026-01-05', config, inicio)).toBeNull();
    expect(treinoDoDia('2026-01-11', config, inicio)).toBeNull();
    expect(treinoDoDia('2026-01-10', { ...config, diaTreinoOpcional: null }, inicio)).toBeNull();
  });

  it('respeita dias de treino configurados (seg e qua)', () => {
    expect(treinoDoDia('2026-01-05', { diasTreino: [3, 1], diaTreinoOpcional: null }, inicio)?.ficha).toBe('A');
    expect(treinoDoDia('2026-01-07', { diasTreino: [3, 1], diaTreinoOpcional: null }, inicio)?.ficha).toBe('B');
  });
});

describe('Séries por fase', () => {
  it('2 séries nas semanas 1–2, 3 depois', () => {
    expect(seriesDaSemana(1)).toBe(2);
    expect(seriesDaSemana(2)).toBe(2);
    expect(seriesDaSemana(3)).toBe(3);
    expect(seriesDaSemana(12)).toBe(3);
    expect(seriesDaSemana(20)).toBe(3);
  });

  it('item da ficha aplica a fase e cardio é sempre 1', () => {
    const leg = FICHAS[0].itens[0];
    const cardio = FICHAS[0].itens[7];
    expect(seriesDoItem(leg, 1)).toBe(2);
    expect(seriesDoItem(leg, 5)).toBe(3);
    expect(seriesDoItem(cardio, 5)).toBe(1);
  });

  it('meta de proteína por fase', () => {
    expect(metaProteinaDaSemana(1)).toBe(100);
    expect(metaProteinaDaSemana(4)).toBe(120);
    expect(metaProteinaDaSemana(9)).toBe(130);
    expect(faseDaSemana(7).nome).toBe('Consolidação');
  });
});

describe('Progressão de carga', () => {
  const item = FICHAS[0].itens[0]; // leg press 10–12
  const leg = EXERCICIOS_POR_ID['leg-press'];
  const halter = EXERCICIOS_POR_ID['supino-halteres'];

  it('sugere subir quando fez o topo da faixa em todas as séries', () => {
    const s = sugestaoProgressao(item, { planejadoId: 'leg-press', exercicioId: 'leg-press', series: [
      { carga: 80, reps: 12, feita: true }, { carga: 80, reps: 12, feita: true }, { carga: 80, reps: 12, feita: true },
    ] }, leg);
    expect(s?.subir).toBe(true);
    expect(s?.cargaSugerida).toBe(90);
  });

  it('mantém quando alguma série ficou abaixo do topo', () => {
    const s = sugestaoProgressao(item, { planejadoId: 'leg-press', exercicioId: 'leg-press', series: [
      { carga: 80, reps: 12, feita: true }, { carga: 80, reps: 10, feita: true },
    ] }, leg);
    expect(s?.subir).toBe(false);
    expect(s?.cargaSugerida).toBe(80);
  });

  it('halteres sobem +2 kg', () => {
    const s = sugestaoProgressao(FICHAS[0].itens[1], { planejadoId: 'supino-maquina', exercicioId: 'supino-halteres', series: [
      { carga: 14, reps: 12, feita: true }, { carga: 14, reps: 12, feita: true },
    ] }, halter);
    expect(s?.cargaSugerida).toBe(16);
    expect(s?.motivo).toContain('+2 kg');
  });

  it('sem histórico não sugere', () => {
    expect(sugestaoProgressao(item, undefined, leg)).toBeNull();
  });
});

describe('Histórico e resumo de sessão', () => {
  const sessao = (id: number, data: string, carga: number): SessaoTreino => ({
    id, data, ficha: 'A', opcional: false, inicio: data, concluida: true, cardioMin: 15,
    exercicios: [{ planejadoId: 'leg-press', exercicioId: 'leg-press', series: [{ carga, reps: 10, feita: true }, { carga, reps: 10, feita: true }] }],
  });

  it('volume total = carga × reps das séries feitas', () => {
    expect(volumeSessao(sessao(1, '2026-01-06', 50))).toBe(1000);
  });

  it('último registro e recordes', () => {
    const s1 = sessao(1, '2026-01-06', 50);
    const s2 = sessao(2, '2026-01-13', 60);
    expect(ultimoRegistro([s1, s2], 'leg-press')?.series[0].carga).toBe(60);
    expect(ultimoRegistro([s1, s2], 'leg-press', '2026-01-13')?.series[0].carga).toBe(60);
    expect(ultimoRegistro([s1, { ...s2, concluida: false }], 'leg-press', '2026-01-13')?.series[0].carga).toBe(50);
    expect(recordesDaSessao(s2, [s1])).toEqual([{ exercicioId: 'leg-press', carga: 60 }]);
    expect(recordesDaSessao(s1, [])).toEqual([]);
  });
});
