import { Link } from 'react-router-dom';
import { Check, ChevronRight, PartyPopper } from 'lucide-react';
import { useConfig, salvarConfig } from '@/hooks/dados';
import { Barra, Cabecalho, Card } from '@/components/ui';
import { CHECKLIST_SEMANA0 } from '@/data/semana0';
import { cn, vibrar } from '@/lib/utils';

export default function Semana0Page() {
  const config = useConfig();
  if (!config) return null;
  const feitos = CHECKLIST_SEMANA0.filter((c) => config.semana0[c.id]).length;
  const tudo = feitos === CHECKLIST_SEMANA0.length;
  return (
    <>
      <Cabecalho titulo="Semana 0" subtitulo="Preparar o terreno antes de começar" voltar />
      <Card className="mb-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-suave">Progresso</span>
          <span className="numero font-semibold">
            {feitos}/{CHECKLIST_SEMANA0.length}
          </span>
        </div>
        <Barra valor={feitos} max={CHECKLIST_SEMANA0.length} cor={tudo ? 'bg-verde' : 'bg-ouro'} />
        {tudo && (
          <p className="mt-3 flex items-center gap-2 font-semibold text-verde">
            <PartyPopper size={18} /> Tudo pronto. Agora é só seguir o plano.
          </p>
        )}
      </Card>
      <Card className="divide-y divide-borda/50 p-0">
        {CHECKLIST_SEMANA0.map((c) => {
          const ok = !!config.semana0[c.id];
          return (
            <div key={c.id} className="flex items-center">
              <button
                onClick={() => {
                  vibrar(25);
                  void salvarConfig({ semana0: { ...config.semana0, [c.id]: !ok } });
                }}
                className="flex min-h-[60px] flex-1 items-center gap-3 px-4 py-2 text-left"
              >
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2', ok ? 'border-verde bg-verde text-fundo' : 'border-borda')}>
                  {ok && <Check size={18} strokeWidth={3} />}
                </span>
                <span className={cn('flex-1', ok && 'text-suave line-through')}>{c.texto}</span>
              </button>
              {c.link && (
                <Link to={c.link} aria-label={`Abrir: ${c.texto}`} className="flex h-14 w-12 items-center justify-center text-ouro">
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
}
