import { describe, expect, it } from 'vitest';
import { gerarPlanoSemana, trocarPrato, TRABALHO } from './planoAlimentar';
import { PRATOS } from '@/data/pratos';
import { addDias } from '@/lib/datas';

const config = { diasTrabalho: [1, 2, 3] };

describe('Plano alimentar semanal', () => {
  it('segunda a quarta: café, almoço e lanche no trabalho; jantar definido', () => {
    const p = gerarPlanoSemana('2026-01-05', PRATOS, config);
    for (const d of ['2026-01-05', '2026-01-06', '2026-01-07']) {
      expect(p[d].cafe).toBe(TRABALHO);
      expect(p[d].almoco).toBe(TRABALHO);
      expect(p[d].lanche).toBe(TRABALHO);
      expect(PRATOS.find((x) => x.id === p[d].jantar)?.refeicao).toBe('jantar');
    }
    expect(p['2026-01-05'].jantar).toBe('jan-estoque');
  });

  it('quinta a domingo: as 4 refeições com pratos da refeição certa', () => {
    const p = gerarPlanoSemana('2026-01-05', PRATOS, config);
    for (const d of ['2026-01-08', '2026-01-09', '2026-01-10', '2026-01-11']) {
      for (const r of ['cafe', 'almoco', 'lanche', 'jantar'] as const) {
        expect(PRATOS.find((x) => x.id === p[d][r])?.refeicao).toBe(r);
      }
    }
  });

  it('nunca repete o mesmo prato em 2 dias seguidos (várias semanas)', () => {
    for (let w = 0; w < 30; w++) {
      const segunda = addDias('2026-01-05', w * 7);
      const p = gerarPlanoSemana(segunda, PRATOS, config);
      for (let i = 1; i < 7; i++) {
        const ontem = Object.values(p[addDias(segunda, i - 1)]).filter((v) => v !== TRABALHO);
        const hoje = Object.values(p[addDias(segunda, i)]).filter((v) => v !== TRABALHO);
        for (const id of hoje) expect(ontem).not.toContain(id);
      }
    }
  });

  it('trocar prato escolhe outro da mesma refeição, evitando vizinhos', () => {
    const novo = trocarPrato('cafe-ovos-pao', 'cafe', PRATOS, ['cafe-cuscuz']);
    expect(novo).not.toBe('cafe-ovos-pao');
    expect(novo).not.toBe('cafe-cuscuz');
    expect(PRATOS.find((x) => x.id === novo)?.refeicao).toBe('cafe');
  });
});
