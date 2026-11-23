import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Archive, Check, Plus, X } from 'lucide-react';
import { db } from '@/db/db';
import type { Agua, DataISO, Habito, RegistroHabito } from '@/db/tipos';
import { Botao, Cabecalho, Card, Chip, Folha, Secao, Selo } from '@/components/ui';
import { useAgora, usePerfil } from '@/hooks/dados';
import { addDias, diffDias, formatar, inicioSemana } from '@/lib/datas';
import { habitoCumprido } from '@/domain/dia';
import { cn, vibrar } from '@/lib/utils';

const ICONES = ['✅', '🌙', '🎒', '💧', '🧘', '📵', '🍬', '🚬', '📚', '🎷', '🚶', '🥗', '☕', '🛌'];

export default function HabitosPage() {
  const { hoje } = useAgora();
  const perfil = usePerfil();
  const habitos = useLiveQuery(() => db.habitos.toArray(), []);
  const inicioHeat = addDias(inicioSemana(hoje), -7 * 11);
  const registros = useLiveQuery(() => db.registrosHabitos.where('data').aboveOrEqual(addDias(hoje, -400)).toArray(), [hoje]);
  const agua = useLiveQuery(() => db.agua.where('data').aboveOrEqual(inicioHeat).toArray(), [inicioHeat]);
  const [novo, setNovo] = useState(false);
  if (!habitos || !registros || !agua || !perfil) return null;
  const ativos = habitos.filter((h) => h.ativo);
  const arquivados = habitos.filter((h) => !h.ativo);
  const cumpridosHoje = ativos.filter((h) => habitoCumprido(h, hoje, registros, agua, perfil.metaAguaMl)).length;

  return (
    <>
      <Cabecalho
        titulo="Hábitos"
        subtitulo={`${cumpridosHoje} de ${ativos.length} em dia hoje`}
        voltar
        acao={
          <button aria-label="Novo hábito" onClick={() => setNovo(true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-ouro text-fundo">
            <Plus size={22} />
          </button>
        }
      />
      <div className="space-y-3">
        {ativos.map((h) => (
          <CardHabito key={h.id} h={h} hoje={hoje} registros={registros} agua={agua} metaAgua={perfil.metaAguaMl} inicioHeat={inicioHeat} />
        ))}
      </div>
      {arquivados.length > 0 && (
        <Secao titulo="Arquivados" className="mt-6">
          <Card className="space-y-1 p-2">
            {arquivados.map((h) => (
              <div key={h.id} className="flex items-center gap-2 px-2">
                <span>{h.icone}</span>
                <span className="flex-1 text-suave">{h.nome}</span>
                <button className="min-h-[44px] px-2 text-sm font-semibold text-ouro" onClick={() => db.habitos.update(h.id, { ativo: true })}>
                  Reativar
                </button>
              </div>
            ))}
          </Card>
        </Secao>
      )}
      <FolhaNovo aberta={novo} aoFechar={() => setNovo(false)} hoje={hoje} />
    </>
  );
}

async function marcar(h: Habito, data: DataISO, status: RegistroHabito['status'] | null) {
  const id = `${h.id}|${data}`;
  if (status === null) await db.registrosHabitos.delete(id);
  else await db.registrosHabitos.put({ id, habitoId: h.id, data, status });
  vibrar(25);
}

function CardHabito({
  h,
  hoje,
  registros,
  agua,
  metaAgua,
  inicioHeat,
}: {
  h: Habito;
  hoje: DataISO;
  registros: RegistroHabito[];
  agua: Agua[];
  metaAgua: number;
  inicioHeat: DataISO;
}) {
  const meus = registros.filter((r) => r.habitoId === h.id);
  const ok = habitoCumprido(h, hoje, registros, agua, metaAgua);
  const regHoje = meus.find((r) => r.data === hoje);
  const ultimaFalha = meus.filter((r) => r.status === 'falhou').map((r) => r.data).sort().pop();
  const diasSem = ultimaFalha === hoje ? 0 : diffDias(hoje, ultimaFalha ?? addDias(h.criadoEm, -1));
  const semanas = Array.from({ length: 12 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDias(inicioHeat, w * 7 + d)));
  const ultimos30 = Array.from({ length: 30 }, (_, i) => addDias(hoje, -i)).filter((d) => d >= h.criadoEm);
  const pct = ultimos30.length ? Math.round((ultimos30.filter((d) => habitoCumprido(h, d, registros, agua, metaAgua)).length / ultimos30.length) * 100) : 0;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{h.icone}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{h.nome}</div>
          <div className="flex items-center gap-2 text-xs text-suave">
            {h.tipo === 'evitar' ? <Selo cor="perigo">evitar</Selo> : <Selo cor="verde">fazer</Selo>}
            {h.tipo === 'evitar' ? `${Math.max(0, diasSem)} dias sem` : `${pct}% nos últimos 30 dias`}
            {h.auto === 'agua' && ' · automático pela água'}
          </div>
        </div>
        {h.tipo === 'fazer' ? (
          <button
            aria-label={ok ? `Desmarcar ${h.nome}` : `Marcar ${h.nome}`}
            onClick={() => marcar(h, hoje, ok && regHoje ? null : 'ok')}
            className={cn('flex h-12 w-12 items-center justify-center rounded-2xl transition active:scale-90', ok ? 'bg-verde text-fundo' : 'bg-elevado text-suave')}
          >
            <Check size={24} strokeWidth={3} />
          </button>
        ) : (
          <button
            onClick={() => marcar(h, hoje, regHoje?.status === 'falhou' ? null : 'falhou')}
            className={cn('min-h-[48px] rounded-2xl px-3 text-xs font-semibold', regHoje?.status === 'falhou' ? 'bg-perigo/20 text-perigo' : 'bg-elevado text-suave')}
          >
            {regHoje?.status === 'falhou' ? 'Deslizei hoje' : 'Deslizei?'}
          </button>
        )}
      </div>
      {/* heatmap: 12 semanas × 7 dias */}
      <div className="mt-3 flex max-w-[300px] gap-[3px]" aria-label={`Histórico de ${h.nome}`}>
        {semanas.map((sem, w) => (
          <div key={w} className="flex flex-1 flex-col gap-[3px]">
            {sem.map((d) => {
              const futuro = d > hoje;
              const antes = d < h.criadoEm;
              const cumpriu = !futuro && !antes && habitoCumprido(h, d, registros, agua, metaAgua);
              const falhou = h.tipo === 'evitar' && meus.some((r) => r.data === d && r.status === 'falhou');
              return (
                <div
                  key={d}
                  title={formatar(d, 'dd/MM')}
                  className={cn(
                    'aspect-square w-full rounded-[3px]',
                    futuro || antes ? 'bg-borda/20' : falhou ? 'bg-perigo/70' : cumpriu ? 'bg-verde' : 'bg-borda/50',
                    d === hoje && 'ring-1 ring-ouro',
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end">
        <button className="inline-flex min-h-[36px] items-center gap-1 text-xs text-suave" onClick={() => confirm(`Arquivar "${h.nome}"?`) && db.habitos.update(h.id, { ativo: false })}>
          <Archive size={13} /> Arquivar
        </button>
      </div>
    </Card>
  );
}

function FolhaNovo({ aberta, aoFechar, hoje }: { aberta: boolean; aoFechar: () => void; hoje: DataISO }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Habito['tipo']>('fazer');
  const [icone, setIcone] = useState('✅');
  return (
    <Folha aberta={aberta} aoFechar={aoFechar} titulo="Novo hábito">
      <div className="space-y-4">
        <input className="campo" placeholder="Ex.: Ler 10 páginas, Sem doce" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div className="flex gap-2">
          <Chip ativo={tipo === 'fazer'} onClick={() => setTipo('fazer')}>
            <Check size={14} className="mr-1 inline" /> Fazer
          </Chip>
          <Chip ativo={tipo === 'evitar'} onClick={() => setTipo('evitar')}>
            <X size={14} className="mr-1 inline" /> Evitar / reduzir
          </Chip>
        </div>
        <p className="text-xs text-suave">
          {tipo === 'evitar' ? 'Conta os dias sem, igual ao álcool. Marque só quando deslizar.' : 'Marque quando fizer.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {ICONES.map((i) => (
            <button key={i} onClick={() => setIcone(i)} className={cn('h-11 w-11 rounded-xl text-xl', icone === i ? 'bg-ouro/25 ring-2 ring-ouro' : 'bg-elevado')}>
              {i}
            </button>
          ))}
        </div>
        <Botao
          bloco
          tamanho="lg"
          disabled={!nome.trim()}
          onClick={async () => {
            await db.habitos.put({ id: `h-${Date.now()}`, nome: nome.trim(), tipo, icone, ativo: true, criadoEm: hoje });
            setNome('');
            aoFechar();
          }}
        >
          Criar hábito
        </Botao>
      </div>
    </Folha>
  );
}
