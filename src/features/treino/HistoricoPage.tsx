import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2 } from 'lucide-react';
import { db } from '@/db/db';
import { Cabecalho, Card, Chip, Secao, Vazio } from '@/components/ui';
import { historicoCarga, volumeSessao } from '@/domain/treino';
import { formatar } from '@/lib/datas';
import { br } from '@/lib/utils';
import { GraficoCarga } from './GraficoCarga';

export default function HistoricoPage() {
  const sessoes = useLiveQuery(() => db.sessoesTreino.orderBy('data').reverse().toArray(), []);
  const exercicios = useLiveQuery(() => db.exercicios.filter((e) => e.tipo === 'forca').toArray(), []);
  const [sel, setSel] = useState('leg-press');
  if (!sessoes || !exercicios) return null;
  const feitos = new Set(sessoes.flatMap((s) => s.exercicios.filter((e) => e.series.some((x) => x.feita)).map((e) => e.exercicioId)));
  const opcoes = exercicios.filter((e) => feitos.has(e.id));
  const atual = opcoes.find((o) => o.id === sel) ?? opcoes[0];

  return (
    <>
      <Cabecalho titulo="Histórico de treinos" voltar />
      {sessoes.length === 0 ? (
        <Vazio titulo="Nenhum treino ainda" texto="Seu primeiro treino vai aparecer aqui, com a evolução de cada carga." />
      ) : (
        <>
          <Secao titulo="Evolução por exercício">
            <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
              {opcoes.map((o) => (
                <Chip key={o.id} ativo={atual?.id === o.id} onClick={() => setSel(o.id)}>
                  {o.nome.split(' (')[0]}
                </Chip>
              ))}
            </div>
            <Card>{atual && <GraficoCarga dados={historicoCarga(sessoes, atual.id)} />}</Card>
          </Secao>
          <Secao titulo="Sessões">
            <Card className="divide-y divide-borda/60 p-0">
              {sessoes.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <Link to={s.concluida ? `/treino/resumo/${s.id}` : `/treino/ao-vivo/${s.id}`} className="flex flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ouro/15 font-extrabold text-ouro">{s.ficha}</span>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{formatar(s.data, "EEEE',' dd/MM")}</div>
                      <div className="text-sm text-suave">
                        {s.concluida ? `${br(volumeSessao(s))} kg · cardio ${s.cardioMin} min` : 'Em andamento'}
                        {s.opcional && ' · opcional'}
                      </div>
                    </div>
                  </Link>
                  <button
                    aria-label="Apagar sessão"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-suave hover:bg-elevado"
                    onClick={() => confirm('Apagar este treino do histórico?') && db.sessoesTreino.delete(s.id!)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </Card>
          </Secao>
        </>
      )}
    </>
  );
}
