import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { DataISO, Preparo } from '@/db/tipos';
import { addDias, diaSemana } from '@/lib/datas';
import { somarIngredientes, juntarListas, type Selecao } from '@/domain/listaCompras';
import { adicionarAoEstoque } from '@/domain/estoque';
import { TRABALHO } from '@/domain/planoAlimentar';
import { obterPlano } from '@/features/alimentacao/servico';

/** Preparo em aberto (planejamento atual). Cria se não existir. */
export function usePreparoAtual(hoje: DataISO): Preparo | undefined {
  const p = useLiveQuery(() => db.preparos.filter((x) => !x.concluido).last(), [], null);
  useEffect(() => {
    if (p === undefined) void preparoAtual(hoje);
  }, [p, hoje]);
  return p ?? undefined;
}

let criando: Promise<Preparo> | null = null;

export function preparoAtual(hoje: DataISO): Promise<Preparo> {
  criando ??= criarPreparo(hoje).finally(() => (criando = null));
  return criando;
}

async function criarPreparo(hoje: DataISO): Promise<Preparo> {
  const aberto = await db.preparos.filter((p) => !p.concluido).last();
  if (aberto) return aberto;
  const p: Preparo = {
    data: hoje,
    itens: [
      { pratoId: 'alm-frango-classico', porcoes: 2 },
      { pratoId: 'alm-carne-abobrinha', porcoes: 2 },
      { pratoId: 'alm-escondidinho', porcoes: 1 },
      { pratoId: 'alm-peixe', porcoes: 1 },
      { pratoId: 'alm-frango-cubos', porcoes: 1 },
    ],
    receitas: [],
    concluido: false,
  };
  p.id = await db.preparos.add(p);
  return p;
}

/**
 * Gera a lista de compras: marmitas planejadas × porções
 * + (opcional) café, lanche e jantar do plano nos dias em que você cozinha (qui–dom).
 */
export async function gerarListaCompras(selecoes: Selecao[], incluirPlano: boolean, hoje: DataISO): Promise<void> {
  const pratos = await db.pratos.toArray();
  const listas = [somarIngredientes(selecoes, pratos)];
  if (incluirPlano) {
    const config = await db.configuracoes.get('app');
    const extras: Selecao[] = [];
    // dias a partir de hoje até o fim da próxima "janela" (7 dias)
    for (let i = 0; i < 7; i++) {
      const d = addDias(hoje, i);
      if (config?.diasTrabalho.includes(diaSemana(d))) continue;
      const plano = await obterPlano(d);
      const dia = plano.dias[d] ?? {};
      for (const ref of ['cafe', 'lanche', 'jantar'] as const) {
        const v = dia[ref];
        if (v && v !== TRABALHO) extras.push({ pratoId: v, porcoes: 1 });
      }
    }
    listas.push(somarIngredientes(extras, pratos));
  }
  const manuais = (await db.listaCompras.toArray()).filter((i) => i.manual);
  const nova = juntarListas(...listas);
  await db.transaction('rw', db.listaCompras, async () => {
    await db.listaCompras.clear();
    await db.listaCompras.bulkPut([...nova, ...manuais.filter((m) => !nova.some((n) => n.id === m.id))]);
  });
}

/** Marca o preparo como feito: soma as marmitas ao estoque. */
export async function concluirPreparo(preparo: Preparo, hoje: DataISO): Promise<number> {
  const pratos = await db.pratos.toArray();
  let estoque = await db.estoqueMarmitas.toArray();
  let total = 0;
  for (const it of preparo.itens) {
    if (it.porcoes <= 0) continue;
    const p = pratos.find((x) => x.id === it.pratoId);
    estoque = adicionarAoEstoque(estoque, it.pratoId, p?.nome ?? it.pratoId, it.porcoes);
    total += it.porcoes;
  }
  await db.transaction('rw', db.estoqueMarmitas, db.preparos, async () => {
    await db.estoqueMarmitas.bulkPut(estoque);
    await db.preparos.update(preparo.id!, { concluido: true, data: hoje });
  });
  return total;
}
