import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, ChevronRight, History, Play, Timer } from 'lucide-react';
import { db } from '@/db/db';
import { useAgora, useConfig, usePerfil } from '@/hooks/dados';
import { Barra, Botao, Cabecalho, Card, Secao, Selo } from '@/components/ui';
import { BotaoMais } from '@/components/BotaoMais';
import { ImagemExercicio } from '@/components/Midia';
import { addDias, diasDaSemana, formatar, inicioSemana, NOMES_DIAS, semanaDoPlano } from '@/lib/datas';
import { treinoDoDia, seriesDoItem } from '@/domain/treino';
import { faseDaSemana } from '@/domain/fase';
import type { FichaId } from '@/db/tipos';
import { iniciarSessao } from './servico';

export default function TreinoPage() {
  const { hoje } = useAgora();
  const perfil = usePerfil();
  const config = useConfig();
  const nav = useNavigate();
  const fichas = useLiveQuery(() => db.fichasTreino.toArray(), []);
  const exercicios = useLiveQuery(() => db.exercicios.toArray(), []);
  const segunda = inicioSemana(hoje);
  const sessoesSemana = useLiveQuery(() => db.sessoesTreino.where('data').between(segunda, addDias(segunda, 6), true, true).toArray(), [segunda]);
  const aberta = useLiveQuery(() => db.sessoesTreino.filter((s) => !s.concluida).last(), []);

  if (!perfil || !config || !fichas || !exercicios) return null;
  const semana = semanaDoPlano(hoje, perfil.dataInicio);
  const fase = faseDaSemana(semana);
  const td = treinoDoDia(hoje, config, perfil.dataInicio);
  const feitos = sessoesSemana?.filter((s) => s.concluida).length ?? 0;
  const planejados = fase.treinosSemana;
  const porId = Object.fromEntries(exercicios.map((e) => [e.id, e]));

  // próximo treino
  let proximo: { data: string; ficha: FichaId; opcional: boolean } | null = null;
  for (let i = 1; i <= 7 && !proximo; i++) {
    const d = addDias(hoje, i);
    const t = treinoDoDia(d, config, perfil.dataInicio);
    if (t) proximo = { data: d, ...t };
  }
  const jaFezHoje = sessoesSemana?.some((s) => s.data === hoje && s.concluida);

  async function comecar(ficha: FichaId, opcional: boolean) {
    const id = await iniciarSessao(ficha, hoje, opcional);
    nav(`/treino/ao-vivo/${id}`);
  }

  return (
    <>
      <Cabecalho titulo="Treino" subtitulo={`Semana ${Math.max(1, semana)} · ${fase.nome} · ${fase.series} séries`} acao={<BotaoMais />} />

      {aberta && (
        <Card className="mb-4 border-ouro/50 brilho-ouro">
          <div className="flex items-center gap-3">
            <Timer className="text-ouro" />
            <div className="flex-1">
              <div className="font-semibold">Treino {aberta.ficha} em andamento</div>
              <div className="text-sm text-suave">Iniciado {formatar(aberta.data, "EEEE',' dd/MM")}</div>
            </div>
            <Botao tamanho="sm" onClick={() => nav(`/treino/ao-vivo/${aberta.id}`)}>
              Continuar
            </Botao>
          </div>
        </Card>
      )}

      <Card className="mb-4 overflow-hidden p-0">
        <div className="brilho-ouro p-4">
          <div className="rotulo mb-1">Hoje · {NOMES_DIAS[new Date(hoje + 'T12:00').getDay()]}</div>
          {td ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-ouro">{td.ficha}</span>
                <span className="text-lg font-bold">{td.opcional ? 'Treino opcional' : `Treino ${td.ficha}`}</span>
              </div>
              <p className="mt-1 text-sm text-suave">{fichas.find((f) => f.id === td.ficha)?.foco}</p>
              <div className="mt-4 flex gap-2">
                <Botao tamanho="lg" bloco onClick={() => comecar(td.ficha, td.opcional)} disabled={!!aberta && aberta.data === hoje}>
                  <Play size={20} fill="currentColor" /> {jaFezHoje ? 'Treinar de novo' : 'Começar treino'}
                </Botao>
              </div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold">Hoje é descanso</div>
              <p className="mt-1 text-sm text-suave">
                Recuperar também faz parte.{' '}
                {proximo && `Próximo: ${proximo.opcional ? 'opcional ' : ''}Treino ${proximo.ficha} — ${formatar(proximo.data, 'EEEE')}.`}
              </p>
              <div className="mt-3 flex gap-2">
                <Botao variante="secundario" tamanho="sm" onClick={() => comecar('A', true)}>
                  Fazer A extra
                </Botao>
                <Botao variante="secundario" tamanho="sm" onClick={() => comecar('B', true)}>
                  Fazer B extra
                </Botao>
              </div>
            </>
          )}
        </div>
        <div className="border-t border-borda/60 px-4 py-3">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-suave">Treinos na semana</span>
            <span className="numero font-semibold">
              {feitos} / {planejados}
            </span>
          </div>
          <Barra valor={feitos} max={planejados} cor={feitos >= planejados ? 'bg-verde' : 'bg-ouro'} />
          <div className="mt-3 flex justify-between">
            {diasDaSemana(segunda).map((d) => {
              const t = treinoDoDia(d, config, perfil.dataInicio);
              const fez = sessoesSemana?.some((s) => s.data === d && s.concluida);
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-suave">{formatar(d, 'EEEEEE')}</span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      fez ? 'bg-verde text-fundo' : t ? (t.opcional ? 'border border-dashed border-ouro/60 text-ouro' : 'border border-ouro text-ouro') : 'text-suave/50'
                    } ${d === hoje ? 'ring-2 ring-texto/30' : ''}`}
                  >
                    {fez ? '✓' : t ? t.ficha : '·'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <Link to="/treino/como-funciona" className="card flex min-h-[64px] items-center gap-2 font-semibold">
          <BookOpen size={20} className="text-ouro" /> Como funciona
        </Link>
        <Link to="/treino/historico" className="card flex min-h-[64px] items-center gap-2 font-semibold">
          <History size={20} className="text-ouro" /> Histórico
        </Link>
      </div>

      {fichas.map((f) => (
        <Secao key={f.id} titulo={`${f.nome} · ${f.foco}`}>
          <Card className="p-2">
            {f.itens.map((item, i) => {
              const ex = porId[item.exercicioId];
              if (!ex) return null;
              return (
                <Link key={item.exercicioId} to={`/treino/exercicio/${ex.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-elevado">
                  <ImagemExercicio exercicio={ex} alternar={false} className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {i + 1}. {ex.nome}
                    </div>
                    <div className="text-sm text-suave">
                      {item.cardio
                        ? `${item.cardio.minutos} min${item.cardio.intervalo ? ' · 1 forte / 1 leve' : ''}`
                        : `${seriesDoItem(item, semana)} × ${item.repMin === item.repMax ? item.repMax : `${item.repMin}–${item.repMax}`}${item.unidade === 'seg' ? ' s' : ''} · ${item.descansoSeg}s`}
                    </div>
                  </div>
                  {ex.fotoPropriaId && <Selo cor="verde">foto</Selo>}
                  <ChevronRight size={18} className="text-suave" />
                </Link>
              );
            })}
          </Card>
        </Secao>
      ))}
    </>
  );
}
