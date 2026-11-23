import { useLiveQuery } from 'dexie-react-hooks';
import { Droplets, Minus } from 'lucide-react';
import { db } from '@/db/db';
import type { DataISO } from '@/db/tipos';
import { Barra } from '@/components/ui';
import { br, vibrar } from '@/lib/utils';
import { EnviarAguaSaude } from '@/features/saude/Componentes';

export async function somarAgua(data: DataISO, ml: number) {
  const atual = await db.agua.get(data);
  // preserva o que já foi enviado ao Saúde (para não duplicar lá)
  await db.agua.put({ ...atual, data, ml: Math.max(0, (atual?.ml ?? 0) + ml) });
  vibrar(20);
}

export function ContadorAgua({ data, meta }: { data: DataISO; meta: number }) {
  const ml = useLiveQuery(async () => (await db.agua.get(data))?.ml ?? 0, [data]) ?? 0;
  const copos = Math.round(ml / 250);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Droplets size={20} className="text-sky-400" />
        <span className="numero text-xl font-bold">{br(ml / 1000, 2)} L</span>
        <span className="text-sm text-suave">/ {br(meta / 1000, 1)} L</span>
        <span className="ml-auto text-xs text-suave">{copos} copos</span>
      </div>
      <Barra valor={ml} max={meta} cor={ml >= meta ? 'bg-verde' : 'bg-sky-400'} />
      <div className="mt-3 grid grid-cols-[44px_1fr_1fr] gap-2">
        <button aria-label="Tirar 250 ml" onClick={() => somarAgua(data, -250)} className="flex h-11 items-center justify-center rounded-xl bg-elevado">
          <Minus size={16} />
        </button>
        <button onClick={() => somarAgua(data, 250)} className="h-11 rounded-xl bg-sky-500/15 font-semibold text-sky-400 active:scale-95">
          + copo 250 ml
        </button>
        <button onClick={() => somarAgua(data, 500)} className="h-11 rounded-xl bg-sky-500/15 font-semibold text-sky-400 active:scale-95">
          + garrafa 500 ml
        </button>
      </div>
      <EnviarAguaSaude data={data} />
    </div>
  );
}
