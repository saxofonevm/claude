import { describe, expect, it } from 'vitest';
import { diasNoEixo, melhorSequencia, semanasComTreinos } from './sequencias';
import type { SessaoTreino } from '@/db/tipos';

describe('Sequência de dias no eixo', () => {
  const pontos = { '2026-01-01': 80, '2026-01-02': 75, '2026-01-03': 90, '2026-01-04': 50 };

  it('conta dias consecutivos ≥ 70 terminando ontem quando hoje ainda não bateu', () => {
    expect(diasNoEixo({ ...pontos, '2026-01-04': 0, '2026-01-05': 0 }, '2026-01-04')).toBe(3);
  });

  it('inclui hoje quando já bateu 70', () => {
    expect(diasNoEixo({ ...pontos, '2026-01-04': 70 }, '2026-01-04')).toBe(4);
  });

  it('quebra em dia abaixo de 70 ou sem registro', () => {
    expect(diasNoEixo(pontos, '2026-01-05')).toBe(0);
    expect(diasNoEixo({ '2026-01-01': 90, '2026-01-03': 90 }, '2026-01-03')).toBe(1);
  });

  it('melhor sequência histórica', () => {
    expect(melhorSequencia({ ...pontos, '2026-01-05': 90 })).toBe(3);
  });
});

describe('Semanas com 2+ treinos', () => {
  const s = (data: string, concluida = true): SessaoTreino => ({
    data, ficha: 'A', opcional: false, inicio: data, exercicios: [], cardioMin: 15, concluida,
  });

  it('conta semanas seguidas (segunda a domingo)', () => {
    const sessoes = [s('2026-01-06'), s('2026-01-08'), s('2026-01-13'), s('2026-01-15'), s('2026-01-20')];
    // hoje = qua 21/01: semana atual só tem 1, conta as 2 anteriores
    expect(semanasComTreinos(sessoes, '2026-01-21')).toBe(2);
    expect(semanasComTreinos([...sessoes, s('2026-01-22')], '2026-01-22')).toBe(3);
  });

  it('ignora sessões não concluídas', () => {
    expect(semanasComTreinos([s('2026-01-06'), s('2026-01-08', false)], '2026-01-12')).toBe(0);
  });
});
