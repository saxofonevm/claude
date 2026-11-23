import { db, TABELAS, type NomeTabela } from '@/db/db';
import type { Foto } from '@/db/tipos';
import { base64ParaBlob, blobParaBase64 } from './imagem';

export const VERSAO_BACKUP = 1;

interface Backup {
  app: 'no-eixo';
  versao: number;
  exportadoEm: string;
  tabelas: Partial<Record<NomeTabela, unknown[]>>;
}

/** Exporta tudo em JSON, com as fotos em base64. */
export async function exportarJSON(): Promise<string> {
  const tabelas: Backup['tabelas'] = {};
  for (const nome of TABELAS) {
    const linhas = await db.table(nome).toArray();
    if (nome === 'fotos') {
      tabelas.fotos = await Promise.all(
        (linhas as Foto[]).map(async (f) => ({ ...f, blob: await blobParaBase64(f.blob) })),
      );
    } else tabelas[nome] = linhas;
  }
  const backup: Backup = { app: 'no-eixo', versao: VERSAO_BACKUP, exportadoEm: new Date().toISOString(), tabelas };
  return JSON.stringify(backup);
}

/** Importa um backup, substituindo todos os dados atuais. */
export async function importarJSON(texto: string): Promise<void> {
  const b = JSON.parse(texto) as Backup;
  if (b.app !== 'no-eixo' || !b.tabelas) throw new Error('Arquivo não é um backup do No Eixo');
  const fotos = await Promise.all(
    ((b.tabelas.fotos ?? []) as (Omit<Foto, 'blob'> & { blob: string })[]).map(async (f) => ({ ...f, blob: await base64ParaBlob(f.blob) })),
  );
  await db.transaction('rw', db.tables, async () => {
    for (const nome of TABELAS) {
      const t = db.table(nome);
      await t.clear();
      const linhas = nome === 'fotos' ? fotos : b.tabelas[nome];
      if (linhas?.length) await t.bulkPut(linhas as never[]);
    }
  });
}

function csv(linhas: (string | number | boolean | undefined | null)[][]): string {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // ponto e vírgula: abre direto no Excel/Numbers em português
  return '﻿' + linhas.map((l) => l.map(esc).join(';')).join('\n');
}

/** CSV com um registro por dia (para planilhas). */
export async function exportarCSV(): Promise<string> {
  const [refeicoes, alcool, sessoes, medidas, agua] = await Promise.all([
    db.refeicoes.toArray(),
    db.registrosAlcool.toArray(),
    db.sessoesTreino.toArray(),
    db.medidasCorpo.toArray(),
    db.agua.toArray(),
  ]);
  const datas = new Set<string>([...refeicoes, ...alcool, ...sessoes, ...medidas, ...agua].map((x) => x.data));
  const linhas: (string | number | undefined)[][] = [['data', 'proteina_g', 'agua_ml', 'treino', 'volume_kg', 'cardio_min', 'alcool', 'doses', 'gatilho', 'peso_kg', 'cintura_cm']];
  for (const d of [...datas].sort()) {
    const s = sessoes.filter((x) => x.data === d && x.concluida);
    const a = alcool.find((x) => x.data === d);
    const m = medidas.find((x) => x.data === d);
    linhas.push([
      d,
      refeicoes.filter((r) => r.data === d).reduce((t, r) => t + r.proteina, 0),
      agua.find((x) => x.data === d)?.ml,
      s.map((x) => x.ficha).join('+'),
      s.reduce((t, x) => t + x.exercicios.reduce((u, e) => u + e.series.filter((r) => r.feita).reduce((v, r) => v + r.carga * r.reps, 0), 0), 0) || undefined,
      s.reduce((t, x) => t + x.cardioMin, 0) || undefined,
      a ? (a.bebeu ? 'bebeu' : 'nao') : undefined,
      a?.doses,
      a?.gatilho,
      m?.peso,
      m?.cintura,
    ]);
  }
  return csv(linhas);
}

export async function apagarTudo(): Promise<void> {
  await db.delete();
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    /* ok */
  }
}
