import { describe, expect, it } from 'vitest';
import { gerarICS } from './ics';
import { ROTINA_PADRAO } from '@/data/rotina';
import { configPadrao } from '@/data/padroes';

const config = configPadrao();
const agora = new Date('2026-01-05T10:00:00Z');

function eventos(ics: string) {
  const sem = ics.replace(/\r\n /g, '');
  return sem.split('BEGIN:VEVENT').slice(1).map((b) => Object.fromEntries(
    b.split('\r\n').filter((l) => l.includes(':')).map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1)]),
  ));
}

describe('Geração do .ics', () => {
  const ics = gerarICS({ rotina: ROTINA_PADRAO, config, inicio: '2026-01-05', agora });
  const ev = eventos(ics);
  const porUid = (id: string) => ev.find((e) => e.UID === `${id}@no-eixo.app`)!;

  it('é um calendário válido com CRLF e fuso', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('TZID:America/Sao_Paulo');
    for (const l of ics.split('\r\n')) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
  });

  it('contém os 7 lembretes padrão', () => {
    expect(ev.length).toBe(7);
  });

  it('véspera do treino 21h30 em segunda e quarta', () => {
    const e = porUid('vesp-roupa');
    expect(e.RRULE).toBe('FREQ=WEEKLY;BYDAY=MO,WE');
    expect(e['DTSTART;TZID=America/Sao_Paulo']).toBe('20260105T213000');
  });

  it('treino 5h00 terça e quinta; mercado quinta 8h; marmitas domingo 10h', () => {
    expect(porUid('treino-acordar').RRULE).toBe('FREQ=WEEKLY;BYDAY=TU,TH');
    expect(porUid('treino-acordar')['DTSTART;TZID=America/Sao_Paulo']).toBe('20260106T050000');
    expect(porUid('prep-mercado').RRULE).toBe('FREQ=WEEKLY;BYDAY=TH');
    expect(porUid('prep-marmitas')['DTSTART;TZID=America/Sao_Paulo']).toBe('20260108T090000');
    expect(porUid('prep-marmitas').DURATION).toBe('PT2H');
    expect(porUid('dom-marmitas')['DTSTART;TZID=America/Sao_Paulo']).toBe('20260111T100000');
  });

  it('plano do show sexta e sábado 17h; revisão domingo 19h', () => {
    expect(porUid('show-plano').RRULE).toBe('FREQ=WEEKLY;BYDAY=FR,SA');
    expect(porUid('show-plano')['DTSTART;TZID=America/Sao_Paulo']).toBe('20260109T170000');
    expect(porUid('dom-revisao').RRULE).toBe('FREQ=WEEKLY;BYDAY=SU');
  });

  it('acompanha a rotina configurada (treino em seg/qua muda a véspera para dom/ter)', () => {
    const outro = gerarICS({ rotina: ROTINA_PADRAO, config: { ...config, diasTreino: [1, 3] }, inicio: '2026-01-05', agora });
    const e = eventos(outro).find((x) => x.UID === 'vesp-roupa@no-eixo.app')!;
    expect(e.RRULE).toBe('FREQ=WEEKLY;BYDAY=SU,TU');
  });

  it('escapa vírgulas e ponto e vírgula', () => {
    const t = gerarICS({ rotina: [{ id: 'x', tipoDia: 'domingo', hora: '08:00', titulo: 'A, B; C', lembrete: true, ordem: 1 }], config, inicio: '2026-01-05', agora });
    expect(t).toContain(String.raw`SUMMARY:A\, B\; C`);
  });
});
