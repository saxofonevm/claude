import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Award, Clock, Dumbbell, Flame, Trophy } from 'lucide-react';
import { db } from '@/db/db';
import { Botao, Card, Numero, Secao } from '@/components/ui';
import { recordesDaSessao, volumeSessao } from '@/domain/treino';
import { br } from '@/lib/utils';

export default function ResumoPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const sessao = useLiveQuery(() => db.sessoesTreino.get(Number(id)), [id]);
  const anteriores = useLiveQuery(() => db.sessoesTreino.filter((s) => s.concluida && s.id !== Number(id)).toArray(), [id]);
  const exercicios = useLiveQuery(() => db.exercicios.toArray(), []);
  if (!sessao || !anteriores || !exercicios) return null;
  const porId = Object.fromEntries(exercicios.map((e) => [e.id, e]));
  const volume = volumeSessao(sessao);
  const recordes = recordesDaSessao(sessao, anteriores.filter((s) => s.data <= sessao.data));
  const series = sessao.exercicios.reduce((t, e) => t + e.series.filter((s) => s.feita).length, 0);
  const minutos = sessao.fim ? Math.round((new Date(sessao.fim).getTime() - new Date(sessao.inicio).getTime()) / 60000) : 0;

  return (
    <div className="safe-top pt-6">
      <div className="mb-6 flex flex-col items-center text-center animate-entrar">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-ouro/15 text-ouro animate-pop">
          <Trophy size={40} />
        </div>
        <h1 className="text-2xl font-extrabold">Treino {sessao.ficha} concluído!</h1>
        <p className="mt-1 text-suave">Mais um tijolo no eixo. Água e proteína agora.</p>
      </div>
      <Card className="mb-4 grid grid-cols-2 gap-4">
        <Numero valor={br(volume)} sufixo="kg" rotulo="Volume total" />
        <Numero valor={series} rotulo="Séries feitas" />
        <Numero valor={minutos} sufixo="min" rotulo="Duração" />
        <Numero valor={sessao.cardioMin} sufixo="min" rotulo="Cardio" />
      </Card>
      {recordes.length > 0 && (
        <Secao titulo="Recordes do dia">
          <Card className="space-y-2">
            {recordes.map((r) => (
              <div key={r.exercicioId} className="flex items-center gap-2">
                <Award className="text-ouro" size={20} />
                <span className="flex-1">{porId[r.exercicioId]?.nome}</span>
                <span className="numero font-bold text-ouro">{r.carga} kg</span>
              </div>
            ))}
          </Card>
        </Secao>
      )}
      <Secao titulo="Exercícios">
        <Card className="space-y-2">
          {sessao.exercicios.map((e, k) => {
            const ex = porId[e.exercicioId];
            const feitas = e.series.filter((s) => s.feita);
            return (
              <div key={k} className="flex items-center gap-2 text-sm">
                {ex?.tipo === 'cardio' ? <Flame size={16} className="text-perigo" /> : <Dumbbell size={16} className="text-suave" />}
                <span className="flex-1 truncate">{ex?.nome}</span>
                <span className="numero text-suave">
                  {ex?.tipo === 'cardio'
                    ? feitas.length ? `${feitas[0].reps} min` : '—'
                    : feitas.length ? feitas.map((s) => (ex?.tipo === 'tempo' ? `${s.reps}s` : `${s.carga}×${s.reps}`)).join(' · ') : 'pulado'}
                </span>
              </div>
            );
          })}
        </Card>
      </Secao>
      <div className="grid gap-2">
        <Botao tamanho="lg" onClick={() => nav('/')}>
          <Clock size={18} /> Voltar para Hoje
        </Botao>
        <Botao
          variante="fantasma"
          onClick={async () => {
            await db.sessoesTreino.update(sessao.id!, { concluida: false, fim: undefined });
            nav(`/treino/ao-vivo/${sessao.id}`);
          }}
        >
          Reabrir para corrigir
        </Botao>
      </div>
    </div>
  );
}
