import { describe, expect, it } from 'vitest';
import { itensDoDia, tiposDoDia } from './rotina';
import { ROTINA_PADRAO } from '@/data/rotina';
import { configPadrao } from '@/data/padroes';
import { EXERCICIOS } from '@/data/exercicios';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const c = configPadrao();

describe('Rotina por tipo de dia', () => {
  it('segunda: trabalho + véspera; terça: treino; quinta: treino + preparo; sábado: opcional + show; domingo', () => {
    expect(tiposDoDia('2026-01-05', c)).toEqual(['trabalho', 'vespera']);
    expect(tiposDoDia('2026-01-06', c)).toEqual(['trabalho', 'treino']);
    expect(tiposDoDia('2026-01-08', c)).toEqual(['treino', 'preparo']);
    expect(tiposDoDia('2026-01-10', c)).toEqual(['treinoOpcional', 'show']);
    expect(tiposDoDia('2026-01-11', c)).toEqual(['domingo']);
  });

  it('linha do tempo ordenada por horário', () => {
    const itens = itensDoDia('2026-01-08', ROTINA_PADRAO, c);
    expect(itens.map((i) => i.hora)).toEqual(['05:00', '05:30', '06:30', '08:00', '09:00']);
  });
});

describe('Conteúdo pré-carregado', () => {
  it('todo exercício tem imagens existentes em public/', () => {
    for (const e of EXERCICIOS) {
      expect(e.imagens.length).toBeGreaterThan(0);
      for (const img of e.imagens) expect(existsSync(resolve(__dirname, '../../public', img.slice(1))), img).toBe(true);
      for (const s of e.substitutos) expect(EXERCICIOS.some((x) => x.id === s), s).toBe(true);
    }
  });
});
