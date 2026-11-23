import { describe, expect, it } from 'vitest';
import { resumoSemana } from './semana';
import { configPadrao, perfilPadrao } from '@/data/padroes';
import { ROTINA_PADRAO } from '@/data/rotina';
import type { DadosPeriodo } from './dia';

describe('Resumo da semana', () => {
  const perfil = { ...perfilPadrao(), dataInicio: '2026-01-05', onboardingFeito: true };
  const config = configPadrao();
  const base: DadosPeriodo = {
    perfil, config, rotina: ROTINA_PADRAO, habitos: [], sessoes: [], refeicoes: [], alcool: [], checks: [], regHabitos: [], agua: [],
  };

  it('conta treinos, álcool, marmitas e só dias até hoje', () => {
    const r = resumoSemana(
      {
        ...base,
        sessoes: [
          { data: '2026-01-06', ficha: 'A', opcional: false, inicio: '', exercicios: [], cardioMin: 15, concluida: true },
          { data: '2026-01-08', ficha: 'B', opcional: false, inicio: '', exercicios: [], cardioMin: 15, concluida: false },
        ],
        alcool: [
          { data: '2026-01-05', bebeu: false, doses: 0 },
          { data: '2026-01-06', bebeu: true, doses: 3, gatilho: 'estresse' },
        ],
      },
      '2026-01-05',
      '2026-01-07',
      [{ data: '2026-01-08', itens: [{ pratoId: 'x', porcoes: 5 }], receitas: [], concluido: true }],
      [{ data: '2026-01-06', refeicao: 'jantar', descricao: '', proteina: 40, livre: false, origem: 'estoque', estoquePratoId: 'x', criadoEm: '' }],
    );
    expect(r.dias.length).toBe(3);
    expect(r.treinosFeitos).toBe(1);
    expect(r.treinosPlanejados).toBe(2);
    expect(r.diasSemAlcool).toBe(1);
    expect(r.doses).toBe(3);
    expect(r.gatilhos).toEqual(['estresse']);
    expect(r.marmitasPreparadas).toBe(5);
    expect(r.marmitasConsumidas).toBe(1);
    // seg–qua: refeições do trabalho pré-marcadas = 15 + 35 + 10 = 60 g/dia
    expect(r.proteinaMedia).toBe(60);
  });
});
