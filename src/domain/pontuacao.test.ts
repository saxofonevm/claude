import { describe, expect, it } from 'vitest';
import { calcularPontuacao, pontosAlcool, pontosAlimentacao, pontosRotina, pontosTreino, type EntradaPontuacao } from './pontuacao';

const base: EntradaPontuacao = {
  treino: { planejado: true, feito: true },
  proteina: 120,
  metaProteina: 120,
  alcool: { registro: { data: '2026-01-06', bebeu: false, doses: 0 }, permitidoHoje: false, limiteDoses: 2, fase: 'semanal' },
  rotina: { feitos: 4, total: 4 },
};

describe('Pontuação do Eixo', () => {
  it('dia perfeito vale 100', () => {
    expect(calcularPontuacao(base)).toEqual({ total: 100, treino: 25, alimentacao: 25, alcool: 30, rotina: 20 });
  });

  it('treino: descanso planejado conta, treino perdido zera, em andamento vale 10', () => {
    expect(pontosTreino({ planejado: false, feito: false })).toBe(25);
    expect(pontosTreino({ planejado: true, feito: false })).toBe(0);
    expect(pontosTreino({ planejado: true, feito: false, emAndamento: true })).toBe(10);
  });

  it('alimentação é proporcional à meta de proteína e limitada a 25', () => {
    expect(pontosAlimentacao(60, 120)).toBe(13);
    expect(pontosAlimentacao(0, 120)).toBe(0);
    expect(pontosAlimentacao(200, 120)).toBe(25);
  });

  it('álcool: sem registro 0, não bebeu 30, dia permitido no limite 30, acima 10, fora do dia 0', () => {
    const a = base.alcool;
    expect(pontosAlcool({ ...a, registro: undefined })).toBe(0);
    expect(pontosAlcool(a)).toBe(30);
    const bebeu = { data: '2026-01-04', bebeu: true, doses: 2 };
    expect(pontosAlcool({ ...a, registro: bebeu, permitidoHoje: true })).toBe(30);
    expect(pontosAlcool({ ...a, registro: { ...bebeu, doses: 4 }, permitidoHoje: true })).toBe(10);
    expect(pontosAlcool({ ...a, registro: bebeu, permitidoHoje: false })).toBe(0);
    expect(pontosAlcool({ ...a, registro: bebeu, permitidoHoje: true, fase: 'zero' })).toBe(0);
  });

  it('rotina proporcional; sem itens vale 20', () => {
    expect(pontosRotina({ feitos: 1, total: 4 })).toBe(5);
    expect(pontosRotina({ feitos: 0, total: 0 })).toBe(20);
  });

  it('dia sem registro algum pontua baixo', () => {
    const r = calcularPontuacao({
      ...base,
      treino: { planejado: true, feito: false },
      proteina: 0,
      alcool: { ...base.alcool, registro: undefined },
      rotina: { feitos: 0, total: 5 },
    });
    expect(r.total).toBe(0);
  });
});
