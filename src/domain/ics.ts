import type { Configuracoes, DataISO, RotinaItem } from '@/db/tipos';
import { addDias, diaSemana, minutosDoDia } from '@/lib/datas';
import { NOMES_TIPO_DIA } from '@/data/rotina';
import { diasDoTipo } from './rotina';

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

type ConfigDias = Pick<Configuracoes, 'diasTreino' | 'diaTreinoOpcional' | 'diasShow' | 'diasTrabalho' | 'diasPreparo'>;

export interface OpcoesICS {
  rotina: RotinaItem[];
  config: ConfigDias;
  inicio: DataISO;
  agora?: Date;
}

function escapar(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Dobra linhas com mais de 75 octetos (RFC 5545). */
function dobrar(linha: string): string {
  const bytes = new TextEncoder().encode(linha);
  if (bytes.length <= 75) return linha;
  const partes: string[] = [];
  let atual = '';
  let tam = 0;
  for (const ch of linha) {
    const n = new TextEncoder().encode(ch).length;
    const limite = partes.length === 0 ? 75 : 74;
    if (tam + n > limite) {
      partes.push(atual);
      atual = '';
      tam = 0;
    }
    atual += ch;
    tam += n;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

function dataHoraLocal(data: DataISO, hora: string): string {
  return `${data.replace(/-/g, '')}T${hora.replace(':', '')}00`;
}

function carimboUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function duracao(item: RotinaItem): string {
  const min = item.horaFim ? Math.max(5, minutosDoDia(item.horaFim) - minutosDoDia(item.hora)) : 15;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`;
}

/** Eventos recorrentes semanais (um por item de rotina com lembrete), no fuso de São Paulo. */
export function gerarICS({ rotina, config, inicio, agora = new Date() }: OpcoesICS): string {
  const linhas: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//No Eixo//Lembretes//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:No Eixo',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'BEGIN:VTIMEZONE',
    'TZID:America/Sao_Paulo',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:-0300',
    'TZOFFSETTO:-0300',
    'TZNAME:-03',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  const itens = rotina.filter((r) => r.lembrete).sort((a, b) => minutosDoDia(a.hora) - minutosDoDia(b.hora));
  for (const item of itens) {
    const dias = diasDoTipo(item.tipoDia, config);
    if (!dias.length) continue;
    let primeiro = inicio;
    while (!dias.includes(diaSemana(primeiro))) primeiro = addDias(primeiro, 1);
    const descricao = [item.detalhe, `${NOMES_TIPO_DIA[item.tipoDia]} · No Eixo`].filter(Boolean).join('\n');
    linhas.push(
      'BEGIN:VEVENT',
      `UID:${item.id}@no-eixo.app`,
      `DTSTAMP:${carimboUTC(agora)}`,
      `DTSTART;TZID=America/Sao_Paulo:${dataHoraLocal(primeiro, item.hora)}`,
      `DURATION:${duracao(item)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${dias.map((d) => BYDAY[d]).join(',')}`,
      `SUMMARY:${escapar(item.titulo)}`,
      `DESCRIPTION:${escapar(descricao)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapar(item.titulo)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  linhas.push('END:VCALENDAR');
  return linhas.map(dobrar).join('\r\n') + '\r\n';
}
