import { forwardRef, useEffect, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------------- Card ---------------- */
export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card animate-entrar', className)} {...p} />;
}

/* ---------------- Botão ---------------- */
type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'contorno';
type Tamanho = 'sm' | 'md' | 'lg';

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-ouro text-fundo hover:bg-ouro-forte shadow-[0_6px_20px_-8px_rgb(var(--ouro)/0.7)]',
  secundario: 'bg-elevado text-texto hover:bg-borda/70',
  fantasma: 'bg-transparent text-texto hover:bg-elevado',
  perigo: 'bg-perigo/15 text-perigo hover:bg-perigo/25',
  contorno: 'border border-borda bg-transparent text-texto hover:bg-elevado',
};
const TAMANHOS: Record<Tamanho, string> = {
  sm: 'min-h-[44px] px-3 text-sm',
  md: 'min-h-[48px] px-4 text-[15px]',
  lg: 'min-h-[56px] px-5 text-base',
};

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  bloco?: boolean;
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante = 'primario', tamanho = 'md', bloco, className, type = 'button', ...p },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        bloco && 'w-full',
        className,
      )}
      {...p}
    />
  );
});

/* ---------------- Anel de progresso ---------------- */
export function Anel({
  valor,
  max = 100,
  tamanho = 120,
  espessura = 10,
  cor = 'rgb(var(--ouro))',
  children,
  className,
}: {
  valor: number;
  max?: number;
  tamanho?: number;
  espessura?: number;
  cor?: string;
  children?: ReactNode;
  className?: string;
}) {
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max > 0 ? valor / max : 0));
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden>
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="rgb(var(--borda) / 0.6)" strokeWidth={espessura} />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/* ---------------- Barra de progresso ---------------- */
export function Barra({ valor, max = 100, className, cor = 'bg-ouro', faixa }: { valor: number; max?: number; className?: string; cor?: string; faixa?: [number, number] }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (valor / max) * 100 : 0));
  return (
    <div className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-borda/50', className)}>
      {faixa && (
        <div
          className="absolute inset-y-0 bg-verde/25"
          style={{ left: `${(faixa[0] / max) * 100}%`, width: `${((faixa[1] - faixa[0]) / max) * 100}%` }}
        />
      )}
      <div className={cn('relative h-full rounded-full transition-all duration-700', cor)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------- Cabeçalho de página ---------------- */
export function Cabecalho({ titulo, subtitulo, voltar, acao }: { titulo: string; subtitulo?: string; voltar?: boolean | string; acao?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-20 -mx-4 mb-3 bg-fundo/85 px-4 pb-2 backdrop-blur-xl">
      <div className="flex min-h-[52px] items-center gap-2 pt-2">
        {voltar && (
          <button
            aria-label="Voltar"
            onClick={() => (typeof voltar === 'string' ? nav(voltar) : nav(-1))}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-texto hover:bg-elevado"
          >
            <ChevronLeft size={26} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] font-bold leading-tight tracking-tight">{titulo}</h1>
          {subtitulo && <p className="truncate text-sm text-suave">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </header>
  );
}

/* ---------------- Título de seção ---------------- */
export function Secao({ titulo, acao, children, className }: { titulo: string; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('mb-5', className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="rotulo">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Linha de lista com link ---------------- */
export function LinhaLink({ to, icone, titulo, detalhe, extra }: { to: string; icone?: ReactNode; titulo: string; detalhe?: string; extra?: ReactNode }) {
  return (
    <Link to={to} className="flex min-h-[56px] items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-elevado active:scale-[0.99]">
      {icone && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elevado text-ouro">{icone}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{titulo}</div>
        {detalhe && <div className="truncate text-sm text-suave">{detalhe}</div>}
      </div>
      {extra}
      <ChevronRight size={18} className="shrink-0 text-suave" />
    </Link>
  );
}

/* ---------------- Contador +/− ---------------- */
export function Contador({
  valor,
  onChange,
  passo = 1,
  min = 0,
  max = 9999,
  sufixo,
  rotulo,
  grande,
  inline,
}: {
  valor: number;
  onChange: (v: number) => void;
  passo?: number;
  min?: number;
  max?: number;
  sufixo?: string;
  rotulo?: string;
  grande?: boolean;
  inline?: boolean;
}) {
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }));
  return (
    <div className={cn('flex items-center gap-1', inline ? 'flex-row' : 'flex-col')}>
      {rotulo && <span className={cn('rotulo', inline && 'w-9 text-left')}>{rotulo}</span>}
      <div className="flex items-center gap-1">
        <button
          aria-label={`Diminuir ${rotulo ?? ''}`}
          onClick={() => onChange(Math.max(min, +(valor - passo).toFixed(2)))}
          className={cn('flex items-center justify-center rounded-full bg-elevado active:scale-90', grande ? 'h-12 w-12' : 'h-11 w-11')}
        >
          <Minus size={18} />
        </button>
        <div className={cn('numero min-w-[64px] text-center font-bold', grande ? 'text-3xl' : 'text-xl')}>
          {fmt(valor)}
          {sufixo && <span className="ml-0.5 text-sm font-medium text-suave">{sufixo}</span>}
        </div>
        <button
          aria-label={`Aumentar ${rotulo ?? ''}`}
          onClick={() => onChange(Math.min(max, +(valor + passo).toFixed(2)))}
          className={cn('flex items-center justify-center rounded-full bg-elevado active:scale-90', grande ? 'h-12 w-12' : 'h-11 w-11')}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Folha (bottom sheet) ---------------- */
export function Folha({ aberta, aoFechar, titulo, children }: { aberta: boolean; aoFechar: () => void; titulo?: string; children: ReactNode }) {
  useEffect(() => {
    if (!aberta) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = overflow;
    };
  }, [aberta, aoFechar]);
  if (!aberta) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-entrar" onClick={aoFechar} />
      <div className="safe-bottom relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-borda bg-superficie px-4 pb-6 pt-3 animate-entrar">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-borda" />
        {titulo && (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">{titulo}</h3>
            <button aria-label="Fechar" onClick={aoFechar} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-elevado">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- Chip / pílula ---------------- */
export function Chip({ ativo, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { ativo?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-[40px] shrink-0 rounded-full border px-3.5 text-sm font-medium transition active:scale-95',
        ativo ? 'border-ouro bg-ouro/15 text-ouro' : 'border-borda bg-transparent text-suave',
        className,
      )}
      {...p}
    >
      {children}
    </button>
  );
}

export function Selo({ children, cor = 'ouro', className }: { children: ReactNode; cor?: 'ouro' | 'verde' | 'perigo' | 'suave'; className?: string }) {
  const cores = {
    ouro: 'bg-ouro/15 text-ouro',
    verde: 'bg-verde/15 text-verde',
    perigo: 'bg-perigo/15 text-perigo',
    suave: 'bg-elevado text-suave',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', cores[cor], className)}>{children}</span>;
}

/* ---------------- Interruptor ---------------- */
export function Interruptor({ ligado, onChange, rotulo }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: string }) {
  return (
    <button
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => onChange(!ligado)}
      className={cn('relative h-8 w-14 shrink-0 rounded-full transition', ligado ? 'bg-ouro' : 'bg-borda')}
    >
      <span className={cn('absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all', ligado ? 'left-7' : 'left-1')} />
    </button>
  );
}

/* ---------------- Estado vazio ---------------- */
export function Vazio({ icone, titulo, texto, acao }: { icone?: ReactNode; titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-borda px-6 py-8 text-center">
      {icone && <div className="text-ouro">{icone}</div>}
      <div className="font-semibold">{titulo}</div>
      {texto && <p className="text-sm text-suave">{texto}</p>}
      {acao}
    </div>
  );
}

/* ---------------- Número grande ---------------- */
export function Numero({ valor, rotulo, sufixo, className }: { valor: ReactNode; rotulo: string; sufixo?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="numero text-2xl font-bold leading-none">
        {valor}
        {sufixo && <span className="ml-0.5 text-sm font-medium text-suave">{sufixo}</span>}
      </span>
      <span className="mt-1 text-xs text-suave">{rotulo}</span>
    </div>
  );
}

/* ---------------- Aviso ---------------- */
export function Aviso({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('rounded-xl bg-elevado/70 px-3 py-2 text-xs leading-relaxed text-suave', className)}>{children}</p>;
}

/* ---------------- Seletor de dia da semana (7 colunas, cabe no iPhone) ---------------- */
export function SeletorSemana({ dias, valor, onChange, hoje, rotulo }: { dias: string[]; valor: string; onChange: (d: string) => void; hoje: string; rotulo: (d: string) => [string, string] }) {
  return (
    <div className="mb-3 grid grid-cols-7 gap-1">
      {dias.map((d) => {
        const [a, b] = rotulo(d);
        const ativo = d === valor;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            aria-pressed={ativo}
            className={cn(
              'flex min-h-[52px] flex-col items-center justify-center rounded-xl border text-xs transition active:scale-95',
              ativo ? 'border-ouro bg-ouro/15 text-ouro' : 'border-borda/70 text-suave',
              d === hoje && !ativo && 'border-texto/40 text-texto',
            )}
          >
            <span className="capitalize">{a}</span>
            <span className="text-sm font-bold">{b}</span>
          </button>
        );
      })}
    </div>
  );
}
