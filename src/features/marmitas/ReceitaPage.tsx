import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Pause, Play, RotateCcw, Snowflake, Timer, Utensils } from 'lucide-react';
import { db } from '@/db/db';
import { Cabecalho, Card, Secao, Vazio } from '@/components/ui';
import { bipe } from '@/app/Layout';
import { cn, formatarTempo, vibrar } from '@/lib/utils';

export default function ReceitaPage() {
  const { id = '' } = useParams();
  const r = useLiveQuery(() => db.receitasBase.get(id), [id]);
  const [feitos, setFeitos] = useState<number[]>([]);
  if (r === undefined) return null;
  if (!r) return <Vazio titulo="Receita não encontrada" />;
  return (
    <>
      <Cabecalho titulo={r.nome} subtitulo={`${r.rende} · rende ${r.porcoes} porções`} voltar />
      <Secao titulo="Ingredientes">
        <Card>
          <ul className="space-y-2">
            {r.ingredientes.map((i, k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ouro" />
                {i.texto}
              </li>
            ))}
          </ul>
        </Card>
      </Secao>
      <Secao titulo="Passo a passo">
        <div className="space-y-2">
          {r.passos.map((p, k) => {
            const ok = feitos.includes(k);
            return (
              <Card key={k} className={cn('transition', ok && 'border-verde/50 bg-verde/5')}>
                <div className="flex gap-3">
                  <button
                    aria-label={ok ? `Desmarcar passo ${k + 1}` : `Marcar passo ${k + 1}`}
                    onClick={() => setFeitos(ok ? feitos.filter((x) => x !== k) : [...feitos, k])}
                    className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold', ok ? 'bg-verde text-fundo' : 'bg-ouro/15 text-ouro')}
                  >
                    {ok ? <Check size={20} /> : k + 1}
                  </button>
                  <div className="flex-1 pt-2">
                    <p className={cn(ok && 'text-suave line-through')}>{p.texto}</p>
                    {p.timerMin && <TimerPasso minutos={p.timerMin} rotulo={`${r.nome}: passo ${k + 1}`} />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Secao>
      <Card className="space-y-2">
        <div className="flex gap-2">
          <Snowflake size={18} className="mt-0.5 shrink-0 text-sky-400" />
          <span>{r.conserva}</span>
        </div>
        <div className="flex gap-2">
          <Utensils size={18} className="mt-0.5 shrink-0 text-ouro" />
          <span>{r.usos}</span>
        </div>
      </Card>
    </>
  );
}

function TimerPasso({ minutos, rotulo }: { minutos: number; rotulo: string }) {
  const total = minutos * 60;
  const [acumulado, setAcumulado] = useState(0);
  const [desde, setDesde] = useState<number | null>(null);
  const [, tique] = useState(0);
  useEffect(() => {
    if (desde === null) return;
    const t = setInterval(() => tique((x) => x + 1), 500);
    return () => clearInterval(t);
  }, [desde]);
  const decorrido = acumulado + (desde ? (Date.now() - desde) / 1000 : 0);
  const restante = Math.max(0, total - decorrido);
  useEffect(() => {
    if (desde && restante <= 0) {
      setDesde(null);
      setAcumulado(total);
      vibrar([300, 120, 300, 120, 300]);
      bipe(1000, 0.6);
      if ('Notification' in window && Notification.permission === 'granted') new Notification('No Eixo', { body: `${rotulo} — tempo!` });
    }
  }, [restante, desde, total, rotulo]);
  const acabou = restante <= 0;
  return (
    <div className={cn('mt-3 flex items-center gap-2 rounded-xl px-3 py-2', acabou ? 'bg-verde/15' : 'bg-elevado')}>
      <Timer size={18} className={acabou ? 'text-verde' : 'text-ouro'} />
      <span className="numero flex-1 text-xl font-bold">{acabou ? 'Pronto!' : formatarTempo(restante)}</span>
      {desde ? (
        <button
          aria-label="Pausar"
          onClick={() => {
            setAcumulado(decorrido);
            setDesde(null);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-superficie"
        >
          <Pause size={18} />
        </button>
      ) : (
        !acabou && (
          <button aria-label="Iniciar timer" onClick={() => setDesde(Date.now())} className="flex h-11 w-11 items-center justify-center rounded-full bg-ouro text-fundo">
            <Play size={18} fill="currentColor" />
          </button>
        )
      )}
      <button
        aria-label="Zerar"
        onClick={() => {
          setDesde(null);
          setAcumulado(0);
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-superficie"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
