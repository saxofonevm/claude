import { describe, expect, it } from 'vitest';
import { mediaMovel, serieCorpo, variacao } from './corpo';

describe('Corpo', () => {
  it('média móvel de 4 semanas ignora semanas sem registro', () => {
    expect(mediaMovel([80, 79, 78, 77, 76])).toEqual([80, 79.5, 79, 78.5, 77.5]);
    expect(mediaMovel([80, undefined, 78])).toEqual([80, 80, 79]);
    expect(mediaMovel([undefined])).toEqual([null]);
  });

  it('série ordenada por data e variação total', () => {
    const m = [
      { data: '2026-01-18', peso: 74, cintura: 90 },
      { data: '2026-01-04', peso: 75, cintura: 92 },
    ];
    expect(serieCorpo(m).map((p) => p.data)).toEqual(['2026-01-04', '2026-01-18']);
    expect(variacao(m, 'peso')).toBe(-1);
    expect(variacao(m, 'cintura')).toBe(-2);
    expect(variacao([m[0]], 'peso')).toBeNull();
  });
});
