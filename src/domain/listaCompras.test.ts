import { describe, expect, it } from 'vitest';
import { arredondar, formatarQtd, juntarListas, somarIngredientes, somarReceitas, textoWhatsApp } from './listaCompras';
import { PRATOS } from '@/data/pratos';
import { RECEITAS_BASE } from '@/data/receitas';

describe('Lista de compras', () => {
  it('soma ingredientes de pratos × porções e agrupa o mesmo item', () => {
    const l = somarIngredientes(
      [
        { pratoId: 'alm-frango-classico', porcoes: 3 }, // 3 × 200 g frango
        { pratoId: 'alm-escondidinho', porcoes: 2 }, // 2 × 200 g frango
      ],
      PRATOS,
    );
    const frango = l.find((i) => i.id === 'frango');
    expect(frango?.qtd).toBe(1000);
    expect(frango?.secao).toBe('acougue');
    expect(l.find((i) => i.id === 'batata-doce')?.qtd).toBe(400); // 360 → 400 (múltiplos de 50)
  });

  it('ignora porções zeradas e pratos desconhecidos', () => {
    expect(somarIngredientes([{ pratoId: 'alm-peixe', porcoes: 0 }, { pratoId: 'xxx', porcoes: 2 }], PRATOS)).toEqual([]);
  });

  it('ordena por seção (açougue antes de hortifrúti)', () => {
    const l = somarIngredientes([{ pratoId: 'alm-peixe', porcoes: 1 }], PRATOS);
    expect(l[0].secao).toBe('acougue');
  });

  it('soma receitas e junta listas', () => {
    const r = somarReceitas(RECEITAS_BASE.filter((x) => x.id === 'ovos-cozidos'));
    const p = somarIngredientes([{ pratoId: 'cafe-ovos-pao', porcoes: 2 }], PRATOS);
    const j = juntarListas(r, p);
    expect(j.find((i) => i.id === 'ovos')?.qtd).toBe(18);
  });

  it('arredonda e formata quantidades', () => {
    expect(arredondar(120, 'g')).toBe(150);
    expect(arredondar(250, 'ml')).toBe(300);
    expect(arredondar(1.5, 'lata')).toBe(2);
    expect(arredondar(3, 'un')).toBe(3);
    expect(formatarQtd(1500, 'g')).toBe('1,5 kg');
    expect(formatarQtd(600, 'ml')).toBe('600 ml');
    expect(formatarQtd(2, 'lata')).toBe('2 latas');
  });

  it('gera texto para WhatsApp com seções', () => {
    const t = textoWhatsApp(somarIngredientes([{ pratoId: 'alm-peixe', porcoes: 2 }], PRATOS));
    expect(t).toContain('*Açougue e peixaria*');
    expect(t).toContain('Filé de tilápia ou pescada — 350 g');
  });
});
