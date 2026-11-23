import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { DataISO, PlanoAlimentarSemana, Prato, Refeicao, RegistroRefeicao } from '@/db/tipos';
import { addDias, inicioSemana } from '@/lib/datas';
import { gerarPlanoSemana, trocarPrato } from '@/domain/planoAlimentar';
import { consumirDoEstoque, adicionarAoEstoque, estoqueBaixo } from '@/domain/estoque';
import { avisar } from '@/store/app';

/** Plano da semana (gera e salva na primeira vez). */
export async function obterPlano(data: DataISO): Promise<PlanoAlimentarSemana> {
  const id = inicioSemana(data);
  const existente = await db.planoAlimentar.get(id);
  if (existente) return existente;
  const [pratos, config] = await Promise.all([db.pratos.toArray(), db.configuracoes.get('app')]);
  const plano = { id, dias: gerarPlanoSemana(id, pratos, { diasTrabalho: config?.diasTrabalho ?? [1, 2, 3] }) };
  await db.planoAlimentar.put(plano);
  return plano;
}

export async function regenerarPlano(data: DataISO): Promise<void> {
  await db.planoAlimentar.delete(inicioSemana(data));
  await obterPlano(data);
}

export async function definirPratoNoPlano(data: DataISO, refeicao: Refeicao, valor: string): Promise<void> {
  const plano = await obterPlano(data);
  plano.dias[data] = { ...plano.dias[data], [refeicao]: valor };
  await db.planoAlimentar.put(plano);
}

/** Troca o prato planejado por outro da mesma refeição (1 toque). */
export async function trocarNoPlano(data: DataISO, refeicao: Refeicao): Promise<void> {
  const plano = await obterPlano(data);
  const pratos = await db.pratos.toArray();
  const vizinhos = [addDias(data, -1), addDias(data, 1)].flatMap((d) => Object.values(plano.dias[d] ?? {}));
  const novo = trocarPrato(plano.dias[data]?.[refeicao], refeicao, pratos, vizinhos as string[]);
  if (novo) await definirPratoNoPlano(data, refeicao, novo);
}

async function tirarDoEstoque(pratoId?: string): Promise<string | undefined> {
  const estoque = await db.estoqueMarmitas.toArray();
  const r = consumirDoEstoque(estoque, pratoId);
  if (!r.consumido) return undefined;
  await db.estoqueMarmitas.bulkPut(r.estoque);
  if (estoqueBaixo(r.estoque)) avisar('Estoque de marmitas baixo: 2 ou menos', 'info');
  return r.consumido;
}

/** Registra que comeu um prato. Marmitas saem do estoque automaticamente. */
export async function registrarPrato(data: DataISO, refeicao: Refeicao, prato: Prato, origem: RegistroRefeicao['origem'] = 'plano'): Promise<void> {
  let estoquePratoId: string | undefined;
  let descricao = prato.nome;
  if (prato.usaEstoque) {
    estoquePratoId = await tirarDoEstoque();
    if (estoquePratoId) {
      const p = await db.pratos.get(estoquePratoId);
      descricao = `Marmita: ${p?.nome ?? 'estoque'}`;
    }
  } else if (prato.marmita) {
    const item = await db.estoqueMarmitas.get(prato.id);
    if (item && item.quantidade > 0) estoquePratoId = await tirarDoEstoque(prato.id);
  }
  let proteina = prato.proteina;
  if (estoquePratoId && prato.usaEstoque) proteina = (await db.pratos.get(estoquePratoId))?.proteina ?? prato.proteina;
  await db.refeicoes.add({
    data,
    refeicao,
    pratoId: prato.id,
    descricao,
    proteina,
    livre: false,
    origem: estoquePratoId ? 'estoque' : origem,
    estoquePratoId,
    criadoEm: new Date().toISOString(),
  });
  avisar(`+${proteina} g de proteína`);
}

export async function registrarLivre(r: Omit<RegistroRefeicao, 'criadoEm' | 'id'>): Promise<void> {
  await db.refeicoes.add({ ...r, criadoEm: new Date().toISOString() });
  avisar(r.livre ? 'Refeição livre registrada. Sem culpa!' : `+${r.proteina} g de proteína`);
}

/** Desfaz um registro. Se tinha tirado marmita do estoque, devolve. */
export async function apagarRegistro(reg: RegistroRefeicao): Promise<void> {
  if (reg.id) await db.refeicoes.delete(reg.id);
  if (reg.estoquePratoId) {
    const [estoque, prato] = await Promise.all([db.estoqueMarmitas.toArray(), db.pratos.get(reg.estoquePratoId)]);
    await db.estoqueMarmitas.bulkPut(adicionarAoEstoque(estoque, reg.estoquePratoId, prato?.nome ?? '', 1));
  }
}

/** Plano da semana reativo; gera automaticamente se ainda não existir. */
export function usePlano(data: DataISO): PlanoAlimentarSemana | undefined {
  const id = inicioSemana(data);
  const plano = useLiveQuery(() => db.planoAlimentar.get(id), [id], null);
  useEffect(() => {
    if (plano === undefined) void obterPlano(data);
  }, [plano, data]);
  return plano ?? undefined;
}
