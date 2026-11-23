import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, ChevronLeft, ChevronRight, Info, Minus, Pause, Play, Plus, Repeat, TrendingUp, X } from 'lucide-react';
import { db } from '@/db/db';
import type { Exercicio, ExercicioSessao, ItemFicha, SessaoTreino } from '@/db/tipos';
import { Botao, Contador, Folha, Selo } from '@/components/ui';
import { ImagemExercicio } from '@/components/Midia';
import { sugestaoProgressao, ultimoRegistro } from '@/domain/treino';
import { useApp } from '@/store/app';
import { cn, formatarTempo, vibrar } from '@/lib/utils';
import { bipe, CronometroDescanso } from '@/app/Layout';

function lerIdx(id: string): number {
  try {
    return Number(sessionStorage.getItem(`aovivo:${id}`) ?? 0);
  } catch {
    return 0;
  }
}

export default function AoVivoPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const sessao = useLiveQuery(() => db.sessoesTreino.get(Number(id)), [id]);
  const ficha = useLiveQuery(() => (sessao ? db.fichasTreino.get(sessao.ficha) : undefined), [sessao?.ficha]);
  const exercicios = useLiveQuery(() => db.exercicios.toArray(), []);
  const anteriores = useLiveQuery(() => db.sessoesTreino.filter((s) => s.concluida).toArray(), []);
  const [idx, setIdxState] = useState(() => lerIdx(id));
  const [trocar, setTrocar] = useState(false);
  const { iniciarDescanso, pararDescanso } = useApp();
  const [, tique] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tique((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const setIdx = (n: number) => {
    setIdxState(n);
    try {
      sessionStorage.setItem(`aovivo:${id}`, String(n));
    } catch {
      /* ok */
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const porId = useMemo(() => Object.fromEntries((exercicios ?? []).map((e) => [e.id, e])), [exercicios]);
  const historico = useMemo(() => (anteriores ?? []).filter((s) => s.id !== Number(id)), [anteriores, id]);

  if (!sessao || !ficha || !exercicios) return null;
  if (sessao.concluida) {
    nav(`/treino/resumo/${sessao.id}`, { replace: true });
    return null;
  }

  const total = sessao.exercicios.length;
  const i = Math.min(idx, total - 1);
  const atual = sessao.exercicios[i];
  const item = ficha.itens.find((it) => it.exercicioId === atual.planejadoId) ?? ficha.itens[i];
  const ex = porId[atual.exercicioId];
  const decorrido = Math.floor((Date.now() - new Date(sessao.inicio).getTime()) / 1000);

  async function salvarExercicio(novo: ExercicioSessao) {
    const exs = sessao!.exercicios.map((e, k) => (k === i ? novo : e));
    await db.sessoesTreino.update(sessao!.id!, { exercicios: exs });
  }

  async function concluir() {
    pararDescanso();
    const cardio = sessao!.exercicios.find((e) => porId[e.exercicioId]?.tipo === 'cardio');
    const cardioMin = cardio?.series[0]?.feita ? cardio.series[0].reps : 0;
    await db.sessoesTreino.update(sessao!.id!, { concluida: true, fim: new Date().toISOString(), cardioMin });
    try {
      sessionStorage.removeItem(`aovivo:${id}`);
    } catch {
      /* ok */
    }
    vibrar([60, 40, 120]);
    nav(`/treino/resumo/${sessao!.id}`, { replace: true });
  }

  return (
    <div className="safe-top pt-2">
      {/* topo */}
      <div className="sticky top-0 z-20 -mx-4 bg-fundo/90 px-4 pb-3 pt-2 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button aria-label="Sair do modo treino" onClick={() => nav('/treino')} className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado">
            <X size={20} />
          </button>
          <div className="flex-1 text-center">
            <div className="text-sm font-bold">
              Treino {sessao.ficha}
              {sessao.opcional && ' · opcional'}
            </div>
            <div className="numero text-xs text-suave">{formatarTempo(decorrido)} · exercício {i + 1} de {total}</div>
          </div>
          <Botao tamanho="sm" variante="secundario" onClick={concluir}>
            Concluir
          </Botao>
        </div>
        <div className="mt-3 flex gap-1">
          {sessao.exercicios.map((e, k) => {
            const feito = e.series.every((s) => s.feita);
            const parcial = e.series.some((s) => s.feita);
            return (
              <button
                key={k}
                aria-label={`Ir para exercício ${k + 1}`}
                onClick={() => setIdx(k)}
                className={cn('h-2 flex-1 rounded-full transition', k === i ? 'bg-ouro' : feito ? 'bg-verde' : parcial ? 'bg-ouro/40' : 'bg-borda')}
              />
            );
          })}
        </div>
        <CronometroDescanso embutido />
      </div>

      {ex ? (
        ex.tipo === 'cardio' || item?.cardio ? (
          <Cardio key={`${i}-${ex.id}`} ex={ex} item={item} registro={atual} salvar={salvarExercicio} onTrocar={() => setTrocar(true)} />
        ) : (
          <Forca
            key={`${i}-${ex.id}`}
            ex={ex}
            item={item}
            registro={atual}
            historico={historico}
            salvar={salvarExercicio}
            onTrocar={() => setTrocar(true)}
            aoFazerSerie={(ultima) => {
              if (!ultima) iniciarDescanso(item.descansoSeg, ex.nome);
              else if (i < total - 1) iniciarDescanso(item.descansoSeg, `próximo: ${porId[sessao.exercicios[i + 1].exercicioId]?.nome ?? ''}`);
            }}
          />
        )
      ) : null}

      {/* navegação */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Botao variante="secundario" tamanho="lg" disabled={i === 0} onClick={() => setIdx(i - 1)}>
          <ChevronLeft size={20} /> Anterior
        </Botao>
        {i < total - 1 ? (
          <Botao tamanho="lg" variante={atual.series.every((s) => s.feita) ? 'primario' : 'secundario'} onClick={() => setIdx(i + 1)}>
            Próximo <ChevronRight size={20} />
          </Botao>
        ) : (
          <Botao tamanho="lg" onClick={concluir}>
            <Check size={20} /> Finalizar
          </Botao>
        )}
      </div>

      <Folha aberta={trocar} aoFechar={() => setTrocar(false)} titulo="Aparelho ocupado? Trocar">
        <TrocarAparelho
          planejado={porId[atual.planejadoId]}
          atualId={atual.exercicioId}
          porId={porId}
          aoEscolher={async (novoId) => {
            const ult = ultimoRegistro(historico, novoId);
            const sug = item && porId[novoId] ? sugestaoProgressao(item, ult, porId[novoId]) : null;
            await salvarExercicio({
              ...atual,
              exercicioId: novoId,
              series: atual.series.map((s) => (s.feita ? s : { ...s, carga: sug?.cargaSugerida ?? 0 })),
            });
            setTrocar(false);
          }}
        />
      </Folha>
    </div>
  );
}

function TrocarAparelho({
  planejado,
  atualId,
  porId,
  aoEscolher,
}: {
  planejado?: Exercicio;
  atualId: string;
  porId: Record<string, Exercicio>;
  aoEscolher: (id: string) => void;
}) {
  if (!planejado) return null;
  const opcoes = [planejado.id, ...planejado.substitutos].map((x) => porId[x]).filter(Boolean);
  return (
    <div className="space-y-2">
      {opcoes.map((o) => (
        <button
          key={o.id}
          onClick={() => aoEscolher(o.id)}
          className={cn('flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition', o.id === atualId ? 'border-ouro bg-ouro/10' : 'border-borda')}
        >
          <ImagemExercicio exercicio={o} alternar={false} className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="flex-1">
            <div className="font-semibold">{o.nome}</div>
            <div className="text-xs text-suave">{o.id === planejado.id ? 'Original do plano' : 'Substituto'}</div>
          </div>
          {o.id === atualId && <Check className="text-ouro" />}
        </button>
      ))}
    </div>
  );
}

function Forca({
  ex,
  item,
  registro,
  historico,
  salvar,
  onTrocar,
  aoFazerSerie,
}: {
  ex: Exercicio;
  item: ItemFicha;
  registro: ExercicioSessao;
  historico: SessaoTreino[];
  salvar: (e: ExercicioSessao) => Promise<void>;
  onTrocar: () => void;
  aoFazerSerie: (ultima: boolean) => void;
}) {
  const ultimo = ultimoRegistro(historico, ex.id);
  const sug = sugestaoProgressao(item, ultimo, ex);
  const tempo = ex.tipo === 'tempo';
  const passoCarga = ex.equipamento === 'halter' ? 1 : ex.incremento >= 5 ? 2.5 : 1;
  const faixa = item.repMin === item.repMax ? `${item.repMax}` : `${item.repMin}–${item.repMax}`;

  function atualizarSerie(k: number, parcial: Partial<ExercicioSessao['series'][number]>) {
    const series = registro.series.map((s, j) => (j === k ? { ...s, ...parcial } : s));
    // ao mudar a carga da 1ª série ainda não feita, replica nas seguintes não feitas
    if (parcial.carga !== undefined) for (let j = k + 1; j < series.length; j++) if (!series[j].feita) series[j] = { ...series[j], carga: parcial.carga };
    return salvar({ ...registro, series });
  }

  return (
    <div className="animate-entrar">
      <div className="overflow-hidden rounded-3xl border border-borda/60 bg-superficie">
        <ImagemExercicio exercicio={ex} className="aspect-[4/3] w-full" />
        <div className="p-4">
          <div className="flex items-start gap-2">
            <h2 className="flex-1 text-xl font-bold leading-tight">{ex.nome}</h2>
            <Link to={`/treino/exercicio/${ex.id}`} aria-label="Ver ficha do exercício" className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado">
              <Info size={20} />
            </Link>
          </div>
          <div className="mt-1 text-sm text-suave">
            {registro.series.length} séries × {faixa}
            {tempo ? ' s' : ' reps'} · descanso {item.descansoSeg}s
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {ultimo && !tempo && (
              <Selo cor="suave">
                Última vez: {Math.max(...ultimo.series.filter((s) => s.feita).map((s) => s.carga))} kg × {ultimo.series.filter((s) => s.feita).map((s) => s.reps).join('/')}
              </Selo>
            )}
            {sug?.subir && (
              <Selo cor="verde">
                <TrendingUp size={12} /> Subir para {sug.cargaSugerida} kg
              </Selo>
            )}
            <button onClick={onTrocar} className="ml-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-borda px-3 text-sm font-semibold">
              <Repeat size={15} /> Trocar aparelho
            </button>
          </div>
          {sug && <p className="mt-2 text-xs text-suave">{sug.motivo}</p>}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {registro.series.map((s, k) => (
          <div
            key={k}
            className={cn('flex items-center gap-2 rounded-2xl border p-3 transition', s.feita ? 'border-verde/50 bg-verde/10' : 'border-borda/60 bg-superficie')}
          >
            <div className="w-7 text-center text-sm font-bold text-suave">{k + 1}ª</div>
            <div className="flex flex-1 flex-col items-center gap-1.5">
              {!tempo && <Contador inline rotulo="kg" valor={s.carga} passo={passoCarga} onChange={(v) => atualizarSerie(k, { carga: v })} />}
              <Contador inline rotulo={tempo ? 'seg' : 'reps'} valor={s.reps} passo={tempo ? 5 : 1} onChange={(v) => atualizarSerie(k, { reps: v })} />
            </div>
            <button
              aria-label={s.feita ? `Desmarcar série ${k + 1}` : `Marcar série ${k + 1} como feita`}
              onClick={async () => {
                const feita = !s.feita;
                await atualizarSerie(k, { feita });
                if (feita) {
                  vibrar(40);
                  const ultima = registro.series.every((x, j) => (j === k ? true : x.feita));
                  aoFazerSerie(ultima);
                }
              }}
              className={cn(
                'flex w-14 shrink-0 items-center justify-center rounded-2xl transition active:scale-90',
                tempo ? 'h-14' : 'h-[96px]',
                s.feita ? 'bg-verde text-fundo' : 'bg-elevado text-suave',
              )}
            >
              <Check size={26} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-2">
        <button
          onClick={() => salvar({ ...registro, series: [...registro.series, { ...registro.series[registro.series.length - 1], feita: false }] })}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm text-suave"
        >
          <Plus size={16} /> série
        </button>
        {registro.series.length > 1 && (
          <button onClick={() => salvar({ ...registro, series: registro.series.slice(0, -1) })} className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm text-suave">
            <Minus size={16} /> série
          </button>
        )}
      </div>
    </div>
  );
}

function Cardio({
  ex,
  item,
  registro,
  salvar,
  onTrocar,
}: {
  ex: Exercicio;
  item: ItemFicha;
  registro: ExercicioSessao;
  salvar: (e: ExercicioSessao) => Promise<void>;
  onTrocar: () => void;
}) {
  const minutos = item.cardio?.minutos ?? 15;
  const intervalo = ex.id === 'bike-intervalada' ? item.cardio?.intervalo ?? { forteSeg: 60, leveSeg: 60 } : undefined;
  const [acumulado, setAcumulado] = useState(0); // segundos antes da última pausa
  const [rodandoDesde, setRodandoDesde] = useState<number | null>(null);
  const [, tique] = useState(0);
  const feito = registro.series[0]?.feita;

  useEffect(() => {
    if (rodandoDesde === null) return;
    const t = setInterval(() => tique((x) => x + 1), 250);
    return () => clearInterval(t);
  }, [rodandoDesde]);

  const decorrido = acumulado + (rodandoDesde ? (Date.now() - rodandoDesde) / 1000 : 0);
  const totalSeg = minutos * 60;
  const restante = Math.max(0, totalSeg - decorrido);

  let fase: 'forte' | 'leve' | null = null;
  let restanteFase = 0;
  if (intervalo) {
    const ciclo = intervalo.forteSeg + intervalo.leveSeg;
    const pos = decorrido % ciclo;
    fase = pos < intervalo.forteSeg ? 'forte' : 'leve';
    restanteFase = fase === 'forte' ? intervalo.forteSeg - pos : ciclo - pos;
  }

  // avisos de troca de intervalo e fim
  const [ultimaFase, setUltimaFase] = useState<string | null>(null);
  useEffect(() => {
    if (!rodandoDesde) return;
    if (fase && fase !== ultimaFase) {
      if (ultimaFase !== null) {
        vibrar(fase === 'forte' ? [200, 80, 200] : 150);
        bipe(fase === 'forte' ? 990 : 660);
      }
      setUltimaFase(fase);
    }
    if (restante <= 0) {
      setAcumulado(totalSeg);
      setRodandoDesde(null);
      vibrar([300, 100, 300]);
      bipe(1200, 0.5);
      void salvar({ ...registro, series: [{ carga: 0, reps: minutos, feita: true }] });
    }
  }, [fase, ultimaFase, restante, rodandoDesde, totalSeg, minutos, registro, salvar]);

  return (
    <div className="animate-entrar">
      <div className="overflow-hidden rounded-3xl border border-borda/60 bg-superficie">
        <ImagemExercicio exercicio={ex} className="aspect-[16/9] w-full" />
        <div className="p-4">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-xl font-bold">{ex.nome}</h2>
            <button onClick={onTrocar} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-borda px-3 text-sm font-semibold">
              <Repeat size={15} /> Trocar
            </button>
          </div>
          <p className="mt-1 text-sm text-suave">{ex.execucao.join(' ')}</p>
        </div>
      </div>

      <div
        className={cn(
          'mt-4 flex flex-col items-center rounded-3xl border p-6 text-center transition-colors',
          fase === 'forte' && rodandoDesde ? 'border-perigo/60 bg-perigo/10' : fase === 'leve' && rodandoDesde ? 'border-verde/60 bg-verde/10' : 'border-borda/60 bg-superficie',
        )}
      >
        {intervalo && (
          <div className={cn('mb-1 text-lg font-extrabold uppercase tracking-widest', fase === 'forte' ? 'text-perigo' : 'text-verde')}>
            {fase === 'forte' ? '🔥 Forte' : '🌿 Leve'} · {formatarTempo(restanteFase)}
          </div>
        )}
        <div className="numero text-6xl font-extrabold">{formatarTempo(restante)}</div>
        <div className="mt-1 text-sm text-suave">de {minutos} min</div>
        <div className="mt-5 flex gap-2">
          {rodandoDesde ? (
            <Botao
              tamanho="lg"
              variante="secundario"
              onClick={() => {
                setAcumulado(decorrido);
                setRodandoDesde(null);
              }}
            >
              <Pause size={20} /> Pausar
            </Botao>
          ) : (
            <Botao tamanho="lg" onClick={() => setRodandoDesde(Date.now())} disabled={restante <= 0}>
              <Play size={20} fill="currentColor" /> {decorrido > 0 ? 'Continuar' : 'Iniciar cardio'}
            </Botao>
          )}
        </div>
      </div>

      <button
        onClick={() => salvar({ ...registro, series: [{ carga: 0, reps: feito ? 0 : minutos, feita: !feito }] })}
        className={cn('mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border font-semibold', feito ? 'border-verde bg-verde/15 text-verde' : 'border-borda')}
      >
        <Check size={20} /> {feito ? `Cardio feito (${registro.series[0].reps} min)` : 'Marcar cardio como feito'}
      </button>
    </div>
  );
}
