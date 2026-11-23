import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Copy, Wind } from 'lucide-react';
import { db } from '@/db/db';
import { Cabecalho, Card, Secao } from '@/components/ui';
import { useAgora, useConfig, salvarConfig } from '@/hooks/dados';
import { alternarCheck } from '@/features/rotina/LinhaDoTempo';
import { cn, copiarTexto } from '@/lib/utils';
import { avisar } from '@/store/app';

const ITENS = [
  { id: 'show-comer', texto: 'Jantar completo antes de sair (proteína + carboidrato)' },
  { id: 'show-bebida', texto: 'Levar bebida sem álcool (água com gás, refrigerante zero, energético)' },
  { id: 'show-agua', texto: 'Garrafa de água cheia' },
  { id: 'show-copo', texto: 'Ficar sempre com um copo na mão (ninguém oferece)' },
  { id: 'show-volta', texto: 'Combinar a carona / horário de volta' },
];

export default function PlanoShowPage() {
  const { hoje } = useAgora();
  const config = useConfig();
  const checks = useLiveQuery(() => db.checksRotina.where('data').equals(hoje).toArray(), [hoje]);
  if (!config || !checks) return null;
  return (
    <>
      <Cabecalho titulo="Plano do show" subtitulo="Tocar bem e voltar inteiro" voltar />
      <Card className="mb-4 divide-y divide-borda/50 p-0">
        {ITENS.map((i) => {
          const ok = checks.some((c) => c.itemId === i.id && c.feito);
          return (
            <button key={i.id} onClick={() => alternarCheck(hoje, i.id, !ok)} className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2 text-left">
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2', ok ? 'border-verde bg-verde text-fundo' : 'border-borda')}>
                {ok && <Check size={18} strokeWidth={3} />}
              </span>
              <span className={cn(ok && 'text-suave line-through')}>{i.texto}</span>
            </button>
          );
        })}
      </Card>

      <Secao titulo="Frase de recusa pronta">
        <Card>
          <textarea className="campo min-h-[80px] text-lg font-semibold" value={config.fraseRecusa} onChange={(e) => salvarConfig({ fraseRecusa: e.target.value })} />
          <button
            className="mt-2 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ouro"
            onClick={async () => {
              await copiarTexto(config.fraseRecusa);
              avisar('Frase copiada');
            }}
          >
            <Copy size={16} /> Copiar
          </button>
        </Card>
      </Secao>

      <Secao titulo="Horário de volta">
        <Card className="flex items-center gap-3">
          <input type="time" className="campo w-[140px] text-2xl font-bold" value={config.horaVoltaShow} onChange={(e) => salvarConfig({ horaVoltaShow: e.target.value })} />
          <p className="text-sm text-suave">Terminou o último set, guarda o sax e vai. Amanhã tem plano.</p>
        </Card>
      </Secao>

      <Link to="/alcool/vontade" className="flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-perigo/15 font-bold text-perigo">
        <Wind size={20} /> Bateu a vontade? Toque aqui
      </Link>
    </>
  );
}
