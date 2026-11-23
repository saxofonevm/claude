import type { Configuracoes, DataISO, Prato, Refeicao, ValorPlano } from '@/db/tipos';
import { addDias, diaSemana, diffDias } from '@/lib/datas';

export const TRABALHO = 'trabalho';
const REFEICOES: Refeicao[] = ['cafe', 'almoco', 'lanche', 'jantar'];

type Dias = Record<DataISO, Partial<Record<Refeicao, ValorPlano>>>;

/**
 * Gera o plano da semana:
 * - dias de trabalho (seg–qua): café, almoço e lanche "no trabalho"; jantar alterna
 *   marmita do estoque e um jantar rápido;
 * - demais dias: sugere pratos do catálogo, sem repetir o mesmo prato em dias seguidos.
 */
export function gerarPlanoSemana(
  segunda: DataISO,
  pratos: Prato[],
  config: Pick<Configuracoes, 'diasTrabalho'>,
): Dias {
  const porRefeicao: Record<Refeicao, Prato[]> = { cafe: [], almoco: [], lanche: [], jantar: [] };
  for (const p of pratos) porRefeicao[p.refeicao].push(p);
  const estoque = porRefeicao.jantar.find((p) => p.usaEstoque);
  const rapidos = porRefeicao.jantar.filter((p) => !p.usaEstoque);

  const semente = Math.abs(Math.floor(diffDias(segunda, '2024-01-01') / 7));
  const ponteiro: Record<Refeicao, number> = { cafe: semente, almoco: semente * 2, lanche: semente * 3, jantar: semente };
  let ponteiroRapido = semente;

  const dias: Dias = {};
  let ontem = new Set<string>();
  let diaTrabalho = 0;

  for (let i = 0; i < 7; i++) {
    const data = addDias(segunda, i);
    const dow = diaSemana(data);
    const hoje: Partial<Record<Refeicao, ValorPlano>> = {};
    const usadosHoje = new Set<string>();

    if (config.diasTrabalho.includes(dow)) {
      hoje.cafe = TRABALHO;
      hoje.almoco = TRABALHO;
      hoje.lanche = TRABALHO;
      if (diaTrabalho % 2 === 0 && estoque && !ontem.has(estoque.id)) {
        hoje.jantar = estoque.id;
      } else {
        const escolhido = escolher(rapidos, ponteiroRapido, ontem, usadosHoje);
        if (escolhido) {
          hoje.jantar = escolhido.prato.id;
          ponteiroRapido = escolhido.proximo;
        }
      }
      diaTrabalho++;
    } else {
      for (const r of REFEICOES) {
        const escolhido = escolher(porRefeicao[r], ponteiro[r], ontem, usadosHoje);
        if (escolhido) {
          hoje[r] = escolhido.prato.id;
          usadosHoje.add(escolhido.prato.id);
          ponteiro[r] = escolhido.proximo;
        }
      }
    }
    dias[data] = hoje;
    ontem = new Set(Object.values(hoje).filter((v): v is string => !!v && v !== TRABALHO));
  }
  return dias;
}

function escolher(
  lista: Prato[],
  inicio: number,
  evitar: Set<string>,
  usadosHoje: Set<string>,
): { prato: Prato; proximo: number } | null {
  if (!lista.length) return null;
  for (let k = 0; k < lista.length; k++) {
    const idx = (inicio + k) % lista.length;
    const p = lista[idx];
    if (!evitar.has(p.id) && !usadosHoje.has(p.id)) return { prato: p, proximo: idx + 1 };
  }
  const idx = inicio % lista.length;
  return { prato: lista[idx], proximo: idx + 1 };
}

/** Sugere outro prato da mesma refeição, diferente do atual e dos dias vizinhos. */
export function trocarPrato(
  atual: string | undefined,
  refeicao: Refeicao,
  pratos: Prato[],
  vizinhos: string[],
): string | undefined {
  const lista = pratos.filter((p) => p.refeicao === refeicao);
  if (!lista.length) return undefined;
  const idx = Math.max(0, lista.findIndex((p) => p.id === atual));
  for (let k = 1; k <= lista.length; k++) {
    const p = lista[(idx + k) % lista.length];
    if (p.id !== atual && !vizinhos.includes(p.id)) return p.id;
  }
  return lista[(idx + 1) % lista.length].id;
}
