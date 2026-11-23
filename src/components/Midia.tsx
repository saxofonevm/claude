import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useFotoUrl } from '@/hooks/dados';
import { salvarFoto } from '@/lib/imagem';
import { cn } from '@/lib/utils';
import type { Exercicio, Foto, Prato } from '@/db/tipos';
import { avisar } from '@/store/app';

/* ---------- Ilustração do grupo muscular (fallback, nunca deixa o card sem imagem) ---------- */
export function IlustracaoGrupo({ grupo, className }: { grupo: string; className?: string }) {
  const g = grupo.toLowerCase();
  const on = (partes: string[]) => (partes.some((p) => g.includes(p)) ? 'rgb(var(--ouro))' : 'rgb(var(--borda))');
  return (
    <svg viewBox="0 0 120 120" className={cn('h-full w-full bg-elevado', className)} role="img" aria-label={`Grupo muscular: ${grupo}`}>
      <circle cx="60" cy="20" r="10" fill="rgb(var(--borda))" />
      {/* ombros */}
      <rect x="34" y="33" width="52" height="10" rx="5" fill={on(['ombro'])} />
      {/* peito / costas */}
      <rect x="40" y="40" width="40" height="20" rx="6" fill={on(['peito', 'costas'])} />
      {/* abdômen */}
      <rect x="44" y="60" width="32" height="16" rx="5" fill={on(['core', 'abd'])} />
      {/* glúteos / quadril */}
      <rect x="42" y="76" width="36" height="10" rx="5" fill={on(['glúteo', 'gluteo'])} />
      {/* braços */}
      <rect x="24" y="42" width="10" height="34" rx="5" fill={on(['tríceps', 'bíceps', 'braço'])} />
      <rect x="86" y="42" width="10" height="34" rx="5" fill={on(['tríceps', 'bíceps', 'braço'])} />
      {/* pernas */}
      <rect x="44" y="86" width="13" height="30" rx="6" fill={on(['perna'])} />
      <rect x="63" y="86" width="13" height="30" rx="6" fill={on(['perna'])} />
      {g.includes('cardio') && <path d="M60 70 l-9-9 a6 6 0 0 1 9-8 a6 6 0 0 1 9 8z" fill="rgb(var(--perigo))" />}
    </svg>
  );
}

/* ---------- Imagem do exercício: foto própria > banco de imagens > ilustração ---------- */
export function ImagemExercicio({ exercicio, className, alternar = true }: { exercicio: Exercicio; className?: string; alternar?: boolean }) {
  const propria = useFotoUrl(exercicio.fotoPropriaId);
  const [idx, setIdx] = useState(0);
  const [falhou, setFalhou] = useState(false);
  const src = exercicio.imagens[idx];

  if (propria)
    return (
      <div className={cn('relative overflow-hidden bg-elevado', className)}>
        <img src={propria} alt={`Foto do aparelho: ${exercicio.nome}`} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">Minha Smart Fit</span>
      </div>
    );
  if (!src || falhou) return <IlustracaoGrupo grupo={exercicio.grupo} className={className} />;
  return (
    <div className={cn('relative overflow-hidden bg-elevado', className)}>
      <img
        src={src}
        alt={`${exercicio.nome} — ${idx === 0 ? 'início' : 'fim'} do movimento`}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFalhou(true)}
      />
      {alternar && exercicio.imagens.length > 1 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIdx((i) => (i + 1) % exercicio.imagens.length);
          }}
          className="absolute bottom-2 right-2 min-h-[32px] rounded-full bg-black/60 px-3 text-[11px] font-semibold text-white backdrop-blur"
        >
          {idx === 0 ? 'Início ▸ Fim' : 'Fim ▸ Início'}
        </button>
      )}
    </div>
  );
}

/* ---------- Ilustração dos pratos (SVG próprio) ---------- */
const PALETAS: Record<string, { emoji: string; proteina: string; carbo: string }> = {
  ovos: { emoji: '🍳', proteina: '#f4c542', carbo: '#d9a066' },
  cuscuz: { emoji: '🌽', proteina: '#f4c542', carbo: '#f1d36b' },
  tapioca: { emoji: '🫓', proteina: '#e8b98a', carbo: '#f3ead8' },
  iogurte: { emoji: '🥣', proteina: '#f5f0e6', carbo: '#e7c27d' },
  crepioca: { emoji: '🥞', proteina: '#f0c674', carbo: '#f3ead8' },
  frango: { emoji: '🍗', proteina: '#e2a35d', carbo: '#f2efe6' },
  carne: { emoji: '🥩', proteina: '#9c4a32', carbo: '#f2efe6' },
  escondidinho: { emoji: '🍠', proteina: '#e2a35d', carbo: '#e98a3c' },
  peixe: { emoji: '🐟', proteina: '#f3e2c7', carbo: '#f2efe6' },
  cubos: { emoji: '🍢', proteina: '#d99455', carbo: '#f0e1b4' },
  sanduiche: { emoji: '🥪', proteina: '#e2a35d', carbo: '#c98c4b' },
  fruta: { emoji: '🍎', proteina: '#f5f0e6', carbo: '#e85d4a' },
  atum: { emoji: '🐠', proteina: '#d9a184', carbo: '#c98c4b' },
  shake: { emoji: '🥤', proteina: '#f5f0e6', carbo: '#f4d35e' },
  omelete: { emoji: '🍳', proteina: '#f4c542', carbo: '#7cb860' },
  marmita: { emoji: '🍱', proteina: '#e2a35d', carbo: '#f2efe6' },
  salada: { emoji: '🥗', proteina: '#d9a184', carbo: '#f5f0e6' },
};

export function IlustracaoPrato({ chave, className }: { chave: string; className?: string }) {
  const p = PALETAS[chave] ?? PALETAS.marmita;
  return (
    <svg viewBox="0 0 120 90" className={cn('h-full w-full', className)} role="img" aria-label="Ilustração do prato">
      <defs>
        <radialGradient id={`f-${chave}`} cx="70%" cy="0%" r="100%">
          <stop offset="0" stopColor="rgb(var(--ouro))" stopOpacity="0.28" />
          <stop offset="1" stopColor="rgb(var(--elevado))" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="120" height="90" fill={`url(#f-${chave})`} />
      <ellipse cx="60" cy="50" rx="38" ry="30" fill="rgb(255 255 255 / 0.9)" />
      <ellipse cx="60" cy="50" rx="31" ry="24" fill="#fbf8f1" />
      {/* metade verduras */}
      <path d="M60 26 A31 24 0 0 0 60 74 Z" fill="#6fbf73" opacity="0.9" />
      <circle cx="44" cy="44" r="4" fill="#3f8f47" />
      <circle cx="50" cy="58" r="3.5" fill="#e9823a" />
      <circle cx="41" cy="55" r="3" fill="#3f8f47" />
      {/* 1/4 proteína */}
      <path d="M60 26 A31 24 0 0 1 91 50 L60 50 Z" fill={p.proteina} />
      {/* 1/4 carboidrato */}
      <path d="M60 50 L91 50 A31 24 0 0 1 60 74 Z" fill={p.carbo} />
      <text x="88" y="24" fontSize="20" textAnchor="middle">
        {p.emoji}
      </text>
    </svg>
  );
}

export function ImagemPrato({ prato, className }: { prato: Prato; className?: string }) {
  const url = useFotoUrl(prato.fotoId);
  if (url) return <img src={url} alt={prato.nome} className={cn('h-full w-full object-cover', className)} />;
  return <IlustracaoPrato chave={prato.ilustracao} className={className} />;
}

/* ---------- Botão de câmera: tira a foto, comprime e salva no aparelho ---------- */
export function BotaoFoto({
  tipo,
  refFoto,
  fotoAtual,
  aoSalvar,
  texto,
  className,
}: {
  tipo: Foto['tipo'];
  refFoto: string;
  fotoAtual?: number;
  aoSalvar: (id: number) => unknown;
  texto: string;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [salvando, setSalvando] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setSalvando(true);
          try {
            const id = await salvarFoto(f, tipo, refFoto, fotoAtual);
            await aoSalvar(id);
            avisar('Foto salva no aparelho');
          } catch {
            avisar('Não foi possível salvar a foto', 'erro');
          } finally {
            setSalvando(false);
          }
        }}
      />
      <button
        onClick={() => input.current?.click()}
        disabled={salvando}
        className={cn(
          'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-borda px-4 text-sm font-semibold transition active:scale-[0.97] hover:bg-elevado',
          className,
        )}
      >
        {salvando ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
        {texto}
      </button>
    </>
  );
}
