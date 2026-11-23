import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarCheck2, Dumbbell, Home, ListChecks, Pause, Plus, UtensilsCrossed, X } from 'lucide-react';
import { useApp } from '@/store/app';
import { cn, formatarTempo, vibrar } from '@/lib/utils';

const ABAS = [
  { to: '/', rotulo: 'Hoje', icone: Home, fim: true },
  { to: '/treino', rotulo: 'Treino', icone: Dumbbell },
  { to: '/comida', rotulo: 'Comida', icone: UtensilsCrossed },
  { to: '/rotina', rotulo: 'Rotina', icone: ListChecks },
  { to: '/semana', rotulo: 'Semana', icone: CalendarCheck2 },
];

export function Layout() {
  const { pathname } = useLocation();
  const semNav = pathname.startsWith('/treino/ao-vivo') || pathname.startsWith('/boas-vindas') || pathname.startsWith('/alcool/vontade');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="mx-auto min-h-screen max-w-lg">
      <main className={cn('px-4', semNav ? 'pb-8' : 'pb-28')}>
        <Outlet />
      </main>
      {!semNav && <BarraInferior />}
      {!pathname.startsWith('/treino/ao-vivo') && <CronometroDescanso />}
      <Toasts />
    </div>
  );
}

function BarraInferior() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-borda/70 bg-superficie/90 backdrop-blur-xl" aria-label="Navegação principal">
      <div className="mx-auto flex max-w-lg">
        {ABAS.map(({ to, rotulo, icone: Icone, fim }) => (
          <NavLink
            key={to}
            to={to}
            end={fim}
            className={({ isActive }) =>
              cn('flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition', isActive ? 'text-ouro' : 'text-suave')
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('flex h-8 w-12 items-center justify-center rounded-full transition', isActive && 'bg-ouro/15')}>
                  <Icone size={21} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {rotulo}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function Toasts() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'animate-entrar rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg',
            t.tipo === 'erro' ? 'bg-perigo text-white' : t.tipo === 'info' ? 'bg-elevado text-texto' : 'bg-ouro text-fundo',
          )}
        >
          {t.texto}
        </div>
      ))}
    </div>
  );
}

/** Cronômetro de descanso global: continua contando mesmo trocando de tela. */
export function CronometroDescanso({ embutido }: { embutido?: boolean }) {
  const { descanso, pararDescanso, ajustarDescanso } = useApp();
  const [agora, setAgora] = useState(Date.now());
  const avisou = useRef(false);
  useEffect(() => {
    if (!descanso) return;
    avisou.current = false;
    const t = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(t);
  }, [descanso]);
  const restante = descanso ? Math.ceil((descanso.fimEm - agora) / 1000) : 0;
  useEffect(() => {
    if (descanso && restante <= 0 && !avisou.current) {
      avisou.current = true;
      vibrar([200, 100, 200, 100, 300]);
      bipe();
      setTimeout(pararDescanso, 1500);
    }
  }, [restante, descanso, pararDescanso]);
  if (!descanso) return null;
  const pct = Math.max(0, Math.min(1, restante / descanso.total));
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        embutido ? 'mt-3' : 'fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-40 mx-auto max-w-lg px-4',
      )}
    >
      <div className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-ouro/40 bg-superficie p-3 shadow-2xl animate-entrar">
        <div className="absolute inset-y-0 left-0 bg-ouro/10 transition-all" style={{ width: `${pct * 100}%` }} />
        <Pause size={20} className="relative text-ouro" />
        <div className="relative flex-1">
          <div className="text-xs text-suave">Descanso · {descanso.rotulo}</div>
          <div className="numero text-2xl font-bold">{restante > 0 ? formatarTempo(restante) : 'Bora!'}</div>
        </div>
        <button aria-label="Mais 15 segundos" onClick={() => ajustarDescanso(15)} className="relative flex h-11 min-w-[52px] items-center justify-center gap-0.5 rounded-xl bg-elevado px-2 text-sm font-semibold">
          <Plus size={14} />15s
        </button>
        <button aria-label="Pular descanso" onClick={pararDescanso} className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-elevado">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

let ctx: AudioContext | null = null;
export function bipe(freq = 880, dur = 0.25) {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new Ctor();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* sem áudio */
  }
}
