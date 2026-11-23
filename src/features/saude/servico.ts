import { db } from '@/db/db';
import type { Configuracoes, DataISO } from '@/db/tipos';
import { ATALHOS_PADRAO, aguaPendente, lerDadosSaude, linkAtalho, textoPeso, type DadosSaude, type NomesAtalhos } from '@/domain/saude';

export function nomesAtalhos(config?: Configuracoes): NomesAtalhos {
  return { ...ATALHOS_PADRAO, ...(config?.atalhos ?? {}) };
}

/** Abre o app Atalhos rodando o atalho indicado. */
export function rodarAtalho(nome: string, texto?: string): void {
  window.location.href = linkAtalho(nome, texto);
}

export async function enviarPesoAoSaude(data: DataISO, config?: Configuracoes): Promise<boolean> {
  const m = await db.medidasCorpo.get(data);
  if (!m?.peso) return false;
  await db.medidasCorpo.update(data, { enviadoSaude: true });
  rodarAtalho(nomesAtalhos(config).peso, textoPeso(m.peso, m.cintura, config?.atalhosDecimal ?? 'virgula'));
  return true;
}

export async function enviarAguaAoSaude(data: DataISO, config?: Configuracoes): Promise<number> {
  const a = await db.agua.get(data);
  const pendente = aguaPendente(a?.ml ?? 0, a?.enviadoSaudeMl);
  if (pendente <= 0) return 0;
  await db.agua.update(data, { enviadoSaudeMl: a!.ml });
  rodarAtalho(nomesAtalhos(config).agua, String(pendente));
  return pendente;
}

/** Salva o que veio do Saúde: peso e cintura em Corpo (sem apagar o que já existe) e passos do dia. */
export async function salvarDadosSaude(data: DataISO, d: DadosSaude): Promise<void> {
  await db.transaction('rw', db.medidasCorpo, db.saude, db.configuracoes, async () => {
    if (d.peso !== undefined || d.cintura !== undefined) {
      const atual = await db.medidasCorpo.get(data);
      await db.medidasCorpo.put({
        ...atual,
        data,
        peso: d.peso ?? atual?.peso,
        cintura: d.cintura ?? atual?.cintura,
        enviadoSaude: true, // veio de lá, não precisa voltar
      });
      const cfg = await db.configuracoes.get('app');
      if (cfg) await db.configuracoes.update('app', { semana0: { ...cfg.semana0, medidas: true } });
    }
    if (d.passos !== undefined) await db.saude.put({ data, passos: d.passos, importadoEm: new Date().toISOString() });
  });
}

/** Lê a área de transferência. Retorna null se o iPhone não deixar ou se não houver dados do No Eixo. */
export async function lerAreaTransferencia(): Promise<{ dados: DadosSaude | null; erro?: 'permissao' | 'vazio' }> {
  try {
    const texto = await navigator.clipboard.readText();
    const dados = lerDadosSaude(texto);
    return dados ? { dados } : { dados: null, erro: 'vazio' };
  } catch {
    return { dados: null, erro: 'permissao' };
  }
}

export function resumoDados(d: DadosSaude): string {
  const partes: string[] = [];
  if (d.peso !== undefined) partes.push(`${d.peso.toLocaleString('pt-BR')} kg`);
  if (d.cintura !== undefined) partes.push(`cintura ${d.cintura.toLocaleString('pt-BR')} cm`);
  if (d.passos !== undefined) partes.push(`${d.passos.toLocaleString('pt-BR')} passos`);
  return partes.join(' · ') || 'nenhum dado';
}
