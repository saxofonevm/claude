import { describe, expect, it } from 'vitest';
import { diasSemBeber, dosesNoPeriodo, economizado, permitidoNoDia, recordeSemBeber, semanaCumprida, sugerirAvanco, mapaGatilhos } from './alcool';
import type { ConfigAlcool, RegistroAlcool } from '@/db/tipos';

const bebeu = (data: string, doses = 2, gatilho?: RegistroAlcool['gatilho']): RegistroAlcool => ({ data, bebeu: true, doses, gatilho });
const nao = (data: string): RegistroAlcool => ({ data, bebeu: false, doses: 0 });
const cfg: ConfigAlcool = {
  diaPermitido: 0, limiteDoses: 2, fase: 'semanal', faseDesde: '2026-01-05', precoDose: 10, dosesPorSemanaAntes: 14, definido: true,
};

describe('Contadores do álcool', () => {
  it('dias sem beber desde o início (hoje só conta após registrar)', () => {
    expect(diasSemBeber([], '2026-01-05', '2026-01-05')).toBe(0);
    expect(diasSemBeber([nao('2026-01-05')], '2026-01-05', '2026-01-05')).toBe(1);
    expect(diasSemBeber([], '2026-01-10', '2026-01-05')).toBe(5);
  });

  it('dias sem beber desde a última dose', () => {
    expect(diasSemBeber([bebeu('2026-01-04')], '2026-01-04', '2026-01-01')).toBe(0);
    expect(diasSemBeber([bebeu('2026-01-04')], '2026-01-08', '2026-01-01')).toBe(3);
    expect(diasSemBeber([bebeu('2026-01-04'), nao('2026-01-08')], '2026-01-08', '2026-01-01')).toBe(4);
  });

  it('recorde considera o maior intervalo', () => {
    const r = [bebeu('2026-01-11'), bebeu('2026-01-12'), bebeu('2026-01-25')];
    // 01–10 = 10 dias; 13–24 = 12 dias; 26–27 = 1 (sem registro hoje)
    expect(recordeSemBeber(r, '2026-01-27', '2026-01-01')).toBe(12);
  });

  it('doses no período', () => {
    expect(dosesNoPeriodo([bebeu('2026-01-04', 3), bebeu('2026-01-11', 1), nao('2026-01-12')], '2026-01-05', '2026-01-31')).toBe(1);
  });

  it('dinheiro economizado em relação ao consumo anterior', () => {
    // 14 dias: esperado 28 doses, bebeu 2 → 26 × R$10
    expect(economizado([bebeu('2026-01-11', 2)], '2026-01-05', '2026-01-18', cfg)).toBe(260);
    expect(economizado([bebeu('2026-01-05', 50)], '2026-01-05', '2026-01-05', cfg)).toBe(0);
  });

  it('regras por fase', () => {
    expect(permitidoNoDia('2026-01-11', cfg, [])).toBe(true); // domingo
    expect(permitidoNoDia('2026-01-10', cfg, [])).toBe(false); // sábado
    expect(permitidoNoDia('2026-01-11', { ...cfg, fase: 'zero' }, [])).toBe(false);
    const q = { ...cfg, fase: 'quinzenal' as const };
    expect(permitidoNoDia('2026-01-18', q, [bebeu('2026-01-11')])).toBe(false);
    expect(permitidoNoDia('2026-01-25', q, [bebeu('2026-01-11')])).toBe(true);
  });

  it('semana cumprida respeita dia e limite', () => {
    expect(semanaCumprida('2026-01-05', cfg, [bebeu('2026-01-11', 2)])).toBe(true);
    expect(semanaCumprida('2026-01-05', cfg, [bebeu('2026-01-11', 3)])).toBe(false);
    expect(semanaCumprida('2026-01-05', cfg, [bebeu('2026-01-09', 1)])).toBe(false);
  });

  it('sugere avançar de fase após 4 semanas completas cumpridas', () => {
    const ok = [bebeu('2026-01-11'), bebeu('2026-01-18'), bebeu('2026-01-25'), bebeu('2026-02-01')];
    expect(sugerirAvanco(ok, '2026-02-01', cfg)).toBe(null); // 4ª semana ainda não terminou
    expect(sugerirAvanco(ok, '2026-02-02', cfg)).toBe('quinzenal');
    expect(sugerirAvanco([...ok, bebeu('2026-01-23')], '2026-02-02', cfg)).toBe(null);
    expect(sugerirAvanco([], '2026-03-02', { ...cfg, fase: 'zero' })).toBe(null);
  });

  it('mapa de gatilhos ordenado', () => {
    const m = mapaGatilhos([bebeu('2026-01-11', 1, 'show'), bebeu('2026-01-18', 1, 'show')], [
      { data: '2026-01-14', dataHora: '', passou: true, gatilho: 'estresse' },
    ]);
    expect(m[0]).toEqual({ gatilho: 'show', total: 2 });
    expect(m[1]).toEqual({ gatilho: 'estresse', total: 1 });
  });
});
