import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { db } from '@/db/db';
import type { Configuracoes, DataISO, RotinaItem } from '@/db/tipos';
import { itensDoDia } from '@/domain/rotina';
import { minutosDoDia } from '@/lib/datas';
import { cn, vibrar } from '@/lib/utils';

const LINKS: Record<NonNullable<RotinaItem['acao']>, { to: string; rotulo: string }> = {
  treino: { to: '/treino', rotulo: 'Abrir treino' },
  mercado: { to: '/marmitas/compras', rotulo: 'Lista de compras' },
  marmitas: { to: '/marmitas', rotulo: 'Planejador' },
  show: { to: '/alcool/show', rotulo: 'Plano do show' },
  revisao: { to: '/semana', rotulo: 'Revisão da semana' },
  corpo: { to: '/corpo', rotulo: 'Registrar medidas' },
  refeicao: { to: '/comida', rotulo: 'Cardápio' },
};

export async function alternarCheck(data: DataISO, itemId: string, feito: boolean) {
  await db.checksRotina.put({ id: `${data}|${itemId}`, data, itemId, feito });
  if (feito) vibrar(25);
}

export function LinhaDoTempo({ data, config, hora, editavel = true }: { data: DataISO; config: Configuracoes; hora?: string; editavel?: boolean }) {
  const rotina = useLiveQuery(() => db.rotina.toArray(), []);
  const checks = useLiveQuery(() => db.checksRotina.where('data').equals(data).toArray(), [data]);
  if (!rotina || !checks) return <div className="h-24" />;
  const itens = itensDoDia(data, rotina, config);
  if (!itens.length) return <p className="px-1 py-3 text-sm text-suave">Nada fixo hoje. Dia livre para descansar e cuidar de você.</p>;
  const agoraMin = hora ? minutosDoDia(hora) : -1;
  const proximoIdx = hora ? itens.findIndex((i) => minutosDoDia(i.horaFim ?? i.hora) >= agoraMin && !checks.some((c) => c.itemId === i.id && c.feito)) : -1;

  return (
    <ol className="relative">
      {itens.map((item, k) => {
        const feito = checks.some((c) => c.itemId === item.id && c.feito);
        const atual = k === proximoIdx;
        const link = item.acao ? LINKS[item.acao] : undefined;
        return (
          <li key={item.id} className="relative flex gap-3 pb-3 last:pb-0">
            {k < itens.length - 1 && <span className="absolute left-[21px] top-12 h-[calc(100%-40px)] w-0.5 bg-borda/70" />}
            <button
              disabled={!editavel}
              aria-label={feito ? `Desmarcar ${item.titulo}` : `Marcar ${item.titulo} como feito`}
              onClick={() => alternarCheck(data, item.id, !feito)}
              className={cn(
                'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90',
                feito ? 'border-verde bg-verde text-fundo' : atual ? 'border-ouro bg-ouro/15 text-ouro' : 'border-borda bg-superficie text-suave',
              )}
            >
              {feito ? <Check size={20} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </button>
            <div className={cn('min-w-0 flex-1 rounded-2xl px-3 py-2', atual && 'bg-ouro/10')}>
              <div className="flex items-center gap-2">
                <span className="numero text-sm font-bold text-ouro">
                  {item.hora}
                  {item.horaFim && `–${item.horaFim}`}
                </span>
                {item.lembrete && <Bell size={12} className="text-suave" />}
                {atual && <span className="rounded-full bg-ouro px-2 py-0.5 text-[10px] font-bold uppercase text-fundo">agora</span>}
              </div>
              <div className={cn('font-semibold leading-snug', feito && 'text-suave line-through')}>{item.titulo}</div>
              {item.detalhe && <div className="text-sm text-suave">{item.detalhe}</div>}
              {link && !feito && (
                <Link to={link.to} className="mt-1 inline-flex min-h-[32px] items-center gap-0.5 text-sm font-semibold text-ouro">
                  {link.rotulo} <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
