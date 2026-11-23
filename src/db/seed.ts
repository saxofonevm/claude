import { db } from './db';
import { EXERCICIOS } from '@/data/exercicios';
import { FICHAS } from '@/data/treinos';
import { PRATOS } from '@/data/pratos';
import { RECEITAS_BASE } from '@/data/receitas';
import { ROTINA_PADRAO } from '@/data/rotina';
import { FASES } from '@/data/plano12';
import { ALIMENTOS } from '@/data/alimentos';
import { HABITOS_PADRAO } from '@/data/habitos';
import { configPadrao, perfilPadrao } from '@/data/padroes';
import { hojeISO } from '@/lib/datas';

/**
 * Carrega o conteúdo padrão na primeira execução.
 * Conteúdo editável (pratos, exercícios, rotina) só é inserido se ainda não existir,
 * para nunca sobrescrever o que você personalizou.
 */
export async function garantirDadosIniciais(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    if (!(await db.perfil.get('eu'))) await db.perfil.put(perfilPadrao());
    if (!(await db.configuracoes.get('app'))) await db.configuracoes.put(configPadrao());

    await adicionarFaltantes(db.exercicios, EXERCICIOS, (e) => e.id);
    await adicionarFaltantes(db.fichasTreino, FICHAS, (f) => f.id);
    await adicionarFaltantes(db.pratos, PRATOS, (p) => p.id);
    await adicionarFaltantes(db.receitasBase, RECEITAS_BASE, (r) => r.id);
    await adicionarFaltantes(db.fasesPlano, FASES, (f) => f.id);
    await adicionarFaltantes(db.alimentos, ALIMENTOS, (a) => a.id);

    if ((await db.rotina.count()) === 0) await db.rotina.bulkPut(ROTINA_PADRAO);
    if ((await db.habitos.count()) === 0) {
      const hoje = hojeISO();
      await db.habitos.bulkPut(HABITOS_PADRAO.map((h) => ({ ...h, criadoEm: hoje })));
    }
  });
}

async function adicionarFaltantes<T, K extends string | number>(
  tabela: { bulkGet(keys: K[]): Promise<(T | undefined)[]>; bulkPut(items: T[]): Promise<unknown> },
  itens: T[],
  chave: (t: T) => K,
): Promise<void> {
  const existentes = await tabela.bulkGet(itens.map(chave));
  const faltantes = itens.filter((_, i) => !existentes[i]);
  if (faltantes.length) await tabela.bulkPut(faltantes);
}

/** Restaura um item ao conteúdo original do app. */
export async function restaurarPadrao(tipo: 'pratos' | 'exercicios' | 'rotina'): Promise<void> {
  if (tipo === 'pratos') await db.pratos.bulkPut(PRATOS);
  if (tipo === 'exercicios') {
    const atuais = await db.exercicios.toArray();
    const fotos = Object.fromEntries(atuais.map((e) => [e.id, e.fotoPropriaId]));
    await db.exercicios.bulkPut(EXERCICIOS.map((e) => ({ ...e, fotoPropriaId: fotos[e.id] })));
  }
  if (tipo === 'rotina') {
    await db.rotina.clear();
    await db.rotina.bulkPut(ROTINA_PADRAO);
  }
}
