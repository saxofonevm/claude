import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, CheckCircle2, ExternalLink, Repeat, Wrench } from 'lucide-react';
import { db } from '@/db/db';
import { Cabecalho, Card, Secao, Selo, Vazio } from '@/components/ui';
import { BotaoFoto, ImagemExercicio } from '@/components/Midia';
import { historicoCarga } from '@/domain/treino';
import { GraficoCarga } from './GraficoCarga';

export function linkVideo(nome: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${nome} execução correta`)}`;
}

export default function ExercicioPage() {
  const { id = '' } = useParams();
  const ex = useLiveQuery(() => db.exercicios.get(id), [id]);
  const subs = useLiveQuery(async () => (ex ? (await db.exercicios.bulkGet(ex.substitutos)).filter(Boolean) : []), [ex]);
  const sessoes = useLiveQuery(() => db.sessoesTreino.toArray(), []);
  if (ex === undefined) return null;
  if (!ex) return <Vazio titulo="Exercício não encontrado" />;
  const hist = sessoes ? historicoCarga(sessoes, ex.id) : [];

  return (
    <>
      <Cabecalho titulo={ex.nome} subtitulo={ex.grupo} voltar />
      <Card className="mb-4 overflow-hidden p-0">
        <ImagemExercicio exercicio={ex} className="aspect-[4/3] w-full" />
        <div className="flex flex-wrap gap-2 p-3">
          {ex.musculos.map((m) => (
            <Selo key={m}>{m}</Selo>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-borda/60 p-3">
          <a
            href={linkVideo(ex.nome)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-elevado px-3 text-sm font-semibold"
          >
            <ExternalLink size={18} /> Ver vídeo
          </a>
          <BotaoFoto
            tipo="exercicio"
            refFoto={`exercicio:${ex.id}`}
            fotoAtual={ex.fotoPropriaId}
            texto={ex.fotoPropriaId ? 'Trocar foto' : 'Tirar foto do aparelho'}
            aoSalvar={(fid) => db.exercicios.update(ex.id, { fotoPropriaId: fid })}
          />
        </div>
        {ex.fotoPropriaId && (
          <button
            className="mb-3 ml-3 text-xs text-suave underline"
            onClick={async () => {
              if (ex.fotoPropriaId) await db.fotos.delete(ex.fotoPropriaId);
              await db.exercicios.update(ex.id, { fotoPropriaId: undefined });
            }}
          >
            Voltar para a imagem padrão
          </button>
        )}
      </Card>

      <Secao titulo="Como executar">
        <Card>
          <ol className="space-y-3">
            {ex.execucao.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ouro/15 text-sm font-bold text-ouro">{i + 1}</span>
                <span className="pt-0.5">{p}</span>
              </li>
            ))}
          </ol>
        </Card>
      </Secao>

      <Secao titulo="Erros comuns">
        <Card className="space-y-2">
          {ex.erros.map((e, i) => (
            <div key={i} className="flex gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-perigo" />
              <span>{e}</span>
            </div>
          ))}
        </Card>
      </Secao>

      <Secao titulo="Ajuste do aparelho">
        <Card className="flex gap-2">
          <Wrench size={18} className="mt-0.5 shrink-0 text-ouro" />
          <span>{ex.ajuste}</span>
        </Card>
      </Secao>

      {ex.tipo !== 'cardio' && (
        <Secao titulo="Evolução da carga">
          <Card>
            <GraficoCarga dados={hist} />
          </Card>
        </Secao>
      )}

      {subs && subs.length > 0 && (
        <Secao titulo="Aparelho ocupado? Substitutos">
          <Card className="p-2">
            {subs.map((s) =>
              s ? (
                <Link key={s.id} to={`/treino/exercicio/${s.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-elevado">
                  <ImagemExercicio exercicio={s} alternar={false} className="h-12 w-12 shrink-0 rounded-lg" />
                  <span className="flex-1 font-medium">{s.nome}</span>
                  <Repeat size={16} className="text-suave" />
                </Link>
              ) : null,
            )}
          </Card>
        </Secao>
      )}
      <p className="flex items-center gap-1.5 px-1 text-xs text-suave">
        <CheckCircle2 size={14} /> Imagens: free-exercise-db (domínio público).
      </p>
    </>
  );
}
