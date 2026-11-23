import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Configuracoes, DataISO, Perfil } from '@/db/tipos';
import { addDias, hojeISO, horaAgora } from '@/lib/datas';
import type { DadosPeriodo } from '@/domain/dia';

export function usePerfil(): Perfil | undefined {
  return useLiveQuery(() => db.perfil.get('eu'), []);
}

export function useConfig(): Configuracoes | undefined {
  return useLiveQuery(() => db.configuracoes.get('app'), []);
}

export async function salvarConfig(parcial: Partial<Configuracoes>): Promise<void> {
  await db.configuracoes.update('app', parcial);
}

export async function salvarPerfil(parcial: Partial<Perfil>): Promise<void> {
  await db.perfil.update('eu', parcial);
}

/** Data e hora atuais (São Paulo), atualizadas a cada 30 s. */
export function useAgora(): { hoje: DataISO; hora: string } {
  const [agora, setAgora] = useState(() => ({ hoje: hojeISO(), hora: horaAgora() }));
  useEffect(() => {
    const t = setInterval(() => setAgora({ hoje: hojeISO(), hora: horaAgora() }), 30_000);
    const vis = () => document.visibilityState === 'visible' && setAgora({ hoje: hojeISO(), hora: horaAgora() });
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);
  return agora;
}

/** URL temporária para uma foto salva no aparelho. */
export function useFotoUrl(id?: number): string | undefined {
  const foto = useLiveQuery(() => (id ? db.fotos.get(id) : undefined), [id]);
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!foto?.blob) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(foto.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [foto]);
  return url;
}

export async function carregarPeriodo(inicio: DataISO, fim: DataISO): Promise<DadosPeriodo | undefined> {
  const [perfil, config] = await Promise.all([db.perfil.get('eu'), db.configuracoes.get('app')]);
  if (!perfil || !config) return undefined;
  const [rotina, habitos, sessoes, refeicoes, checks, regHabitos, agua, alcool] = await Promise.all([
    db.rotina.toArray(),
    db.habitos.toArray(),
    db.sessoesTreino.where('data').between(inicio, fim, true, true).toArray(),
    db.refeicoes.where('data').between(inicio, fim, true, true).toArray(),
    db.checksRotina.where('data').between(inicio, fim, true, true).toArray(),
    db.registrosHabitos.where('data').between(inicio, fim, true, true).toArray(),
    db.agua.where('data').between(inicio, fim, true, true).toArray(),
    // álcool precisa de 14 dias antes para a regra quinzenal
    db.registrosAlcool.where('data').between(addDias(inicio, -14), fim, true, true).toArray(),
  ]);
  return {
    perfil,
    config,
    rotina,
    habitos,
    sessoes,
    refeicoes,
    checks,
    regHabitos,
    agua,
    alcool,
  };
}

/** Dados de um período, reativos às mudanças no banco. */
export function usePeriodo(inicio: DataISO, fim: DataISO): DadosPeriodo | undefined {
  return useLiveQuery(() => carregarPeriodo(inicio, fim), [inicio, fim]);
}
