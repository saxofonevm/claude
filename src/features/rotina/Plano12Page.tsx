import { useLiveQuery } from 'dexie-react-hooks';
import { Award, Lock, TrendingDown, TrendingUp } from 'lucide-react';
import { db } from '@/db/db';
import { useAgora, usePerfil } from '@/hooks/dados';
import { Barra, Cabecalho, Card, Numero, Secao, Selo } from '@/components/ui';
import { FASES, TOTAL_SEMANAS } from '@/data/plano12';
import { addDias, inicioSemana, semanaDoPlano } from '@/lib/datas';
import { treinosPorSemana } from '@/domain/sequencias';
import { historicoCarga } from '@/domain/treino';
import { br, cn } from '@/lib/utils';

export default function Plano12Page() {
  const { hoje } = useAgora();
  const perfil = usePerfil();
  const sessoes = useLiveQuery(() => db.sessoesTreino.toArray(), []);
  const medidas = useLiveQuery(() => db.medidasCorpo.orderBy('data').toArray(), []);
  if (!perfil || !sessoes || !medidas) return null;
  const semana = semanaDoPlano(hoje, perfil.dataInicio);
  const inicio = inicioSemana(perfil.dataInicio);
  const porSemana = treinosPorSemana(sessoes);

  return (
    <>
      <Cabecalho titulo="Plano de 12 semanas" voltar />
      <Card className="mb-4 brilho-ouro">
        <div className="flex items-baseline gap-1">
          <span className="numero text-4xl font-extrabold">{Math.min(Math.max(semana, 1), TOTAL_SEMANAS)}</span>
          <span className="text-suave">/ {TOTAL_SEMANAS}</span>
        </div>
        <Barra className="mt-2" valor={Math.min(semana, TOTAL_SEMANAS)} max={TOTAL_SEMANAS} />
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {Array.from({ length: TOTAL_SEMANAS }, (_, i) => {
            const n = i + 1;
            const seg = addDias(inicio, i * 7);
            const treinos = porSemana[seg] ?? 0;
            const fase = FASES.find((f) => n >= f.semanaInicio && n <= f.semanaFim)!;
            return (
              <div
                key={n}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-xl text-xs',
                  n === semana ? 'bg-ouro text-fundo' : n < semana ? (treinos >= fase.treinosSemana ? 'bg-verde/25 text-verde' : 'bg-elevado') : 'bg-elevado/50 text-suave',
                )}
              >
                <span className="font-bold">{n}</span>
                {n <= semana && <span className="text-[10px]">{treinos}🏋️</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {FASES.map((f) => {
        const atual = semana >= f.semanaInicio && semana <= f.semanaFim;
        const concluida = semana > f.semanaFim;
        const ini = addDias(inicio, (f.semanaInicio - 1) * 7);
        const fim = addDias(inicio, f.semanaFim * 7 - 1);
        return (
          <Secao key={f.id} titulo={`Semanas ${f.semanaInicio}–${f.semanaFim}`}>
            <Card className={cn(atual && 'border-ouro/60')}>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{f.nome}</h3>
                {atual && <Selo>fase atual</Selo>}
                {concluida && <Selo cor="verde">concluída</Selo>}
                {!atual && !concluida && <Lock size={14} className="text-suave" />}
              </div>
              <p className="mt-1 text-sm text-suave">{f.descricao}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {f.metas.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="text-ouro">•</span>
                    {m}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2 text-xs text-suave">
                <span>{f.series} séries</span>·<span>{f.metaProteina} g proteína</span>·<span>{f.treinosSemana} treinos/sem</span>
              </div>
              {concluida && <Conquista ini={ini} fim={fim} medidas={medidas} sessoes={sessoes} />}
            </Card>
          </Secao>
        );
      })}
    </>
  );
}

function Conquista({
  ini,
  fim,
  medidas,
  sessoes,
}: {
  ini: string;
  fim: string;
  medidas: { data: string; peso?: number; cintura?: number }[];
  sessoes: Parameters<typeof historicoCarga>[0];
}) {
  const daFase = medidas.filter((m) => m.data >= addDias(ini, -7) && m.data <= fim);
  const primeiro = daFase[0];
  const ultimo = daFase[daFase.length - 1];
  const dPeso = primeiro?.peso && ultimo?.peso ? ultimo.peso - primeiro.peso : null;
  const dCint = primeiro?.cintura && ultimo?.cintura ? ultimo.cintura - primeiro.cintura : null;
  const cargas = ['leg-press', 'supino-maquina', 'puxada-frontal', 'agachamento-smith']
    .map((id) => {
      const h = historicoCarga(sessoes, id).filter((x) => x.data >= ini && x.data <= fim);
      return h.length >= 2 ? { id, de: h[0].carga, para: h[h.length - 1].carga } : null;
    })
    .filter(Boolean) as { id: string; de: number; para: number }[];
  return (
    <div className="mt-4 rounded-2xl border border-ouro/40 bg-ouro/10 p-3 animate-entrar">
      <div className="mb-2 flex items-center gap-2 font-bold text-ouro">
        <Award size={18} /> Conquista da fase
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Numero
          valor={dPeso === null ? '—' : `${dPeso > 0 ? '+' : ''}${br(dPeso, 1)}`}
          sufixo={dPeso === null ? '' : 'kg'}
          rotulo="Peso na fase"
        />
        <Numero
          valor={dCint === null ? '—' : `${dCint > 0 ? '+' : ''}${br(dCint, 1)}`}
          sufixo={dCint === null ? '' : 'cm'}
          rotulo="Cintura na fase"
        />
      </div>
      {cargas.length > 0 && (
        <div className="mt-3 space-y-1 text-sm">
          {cargas.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              {c.para >= c.de ? <TrendingUp size={14} className="text-verde" /> : <TrendingDown size={14} className="text-perigo" />}
              <span className="flex-1 capitalize">{c.id.replace(/-/g, ' ')}</span>
              <span className="numero">
                {c.de} → <b>{c.para} kg</b>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
