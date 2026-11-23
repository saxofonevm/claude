import { describe, expect, it } from 'vitest';
import { adicionarAoEstoque, consumirDoEstoque, estoqueBaixo, totalEstoque } from './estoque';

const agora = '2026-01-08T12:00:00.000Z';

describe('Estoque de marmitas', () => {
  it('soma ao preparar', () => {
    let e = adicionarAoEstoque([], 'alm-peixe', 'Peixe assado', 3, agora);
    e = adicionarAoEstoque(e, 'alm-peixe', 'Peixe assado', 2, agora);
    e = adicionarAoEstoque(e, 'alm-frango-classico', 'Frango', 4, agora);
    expect(totalEstoque(e)).toBe(9);
    expect(e.find((x) => x.pratoId === 'alm-peixe')?.quantidade).toBe(5);
    expect(adicionarAoEstoque(e, 'x', 'x', 0, agora)).toBe(e);
  });

  it('subtrai ao comer (prato específico ou o de maior quantidade)', () => {
    const e = adicionarAoEstoque(adicionarAoEstoque([], 'a', 'A', 1, agora), 'b', 'B', 3, agora);
    const r1 = consumirDoEstoque(e, 'a', 1, agora);
    expect(r1.consumido).toBe('a');
    expect(totalEstoque(r1.estoque)).toBe(3);
    const r2 = consumirDoEstoque(e, undefined, 1, agora);
    expect(r2.consumido).toBe('b');
  });

  it('não fica negativo e avisa quando não há o que consumir', () => {
    const e = adicionarAoEstoque([], 'a', 'A', 1, agora);
    const r = consumirDoEstoque(consumirDoEstoque(e, 'a').estoque, 'a');
    expect(r.consumido).toBeNull();
    expect(totalEstoque(r.estoque)).toBe(0);
  });

  it('alerta com 2 ou menos', () => {
    expect(estoqueBaixo(adicionarAoEstoque([], 'a', 'A', 2, agora))).toBe(true);
    expect(estoqueBaixo(adicionarAoEstoque([], 'a', 'A', 3, agora))).toBe(false);
    expect(estoqueBaixo([])).toBe(true);
  });
});
