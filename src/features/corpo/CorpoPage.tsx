import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Lock, Save, Trash2 } from 'lucide-react';
import { db } from '@/db/db';
import type { MedidaCorpo } from '@/db/tipos';
import { Aviso, Botao, Cabecalho, Card, Chip, Contador, Numero, Secao } from '@/components/ui';
import { BotaoFoto } from '@/components/Midia';
import { useAgora, useFotoUrl, usePerfil } from '@/hooks/dados';
import { diaSemana, formatar } from '@/lib/datas';
import { serieCorpo, variacao } from '@/domain/corpo';
import { br } from '@/lib/utils';
import { avisar } from '@/store/app';

export default function CorpoPage() {
  const { hoje } = useAgora();
  const perfil = usePerfil();
  const medidas = useLiveQuery(() => db.medidasCorpo.orderBy('data').toArray(), []);
  if (!perfil || !medidas) return null;
  const ultima = medidas[medidas.length - 1];

  return (
    <>
      <Cabecalho titulo="Corpo" subtitulo="Registro semanal (domingo)" voltar />
      <Formulario key={ultima?.data ?? 'novo'} hoje={hoje} ultima={ultima} pesoInicial={perfil.pesoInicial} registroHoje={medidas.find((m) => m.data === hoje)} />

      {medidas.length > 0 && (
        <Card className="mb-4 grid grid-cols-3 gap-3">
          <Numero valor={ultima?.peso ? br(ultima.peso, 1) : '—'} sufixo="kg" rotulo="Peso atual" />
          <Numero valor={ultima?.cintura ? br(ultima.cintura, 1) : '—'} sufixo="cm" rotulo="Cintura" />
          <Numero
            valor={(() => {
              const v = variacao(medidas, 'cintura');
              return v === null ? '—' : `${v > 0 ? '+' : ''}${br(v, 1)}`;
            })()}
            sufixo="cm"
            rotulo="Cintura desde o início"
          />
        </Card>
      )}

      <Secao titulo="Peso (kg) · média móvel de 4 semanas">
        <Card>
          <Grafico medidas={medidas} campo="peso" />
        </Card>
      </Secao>
      <Secao titulo="Cintura (cm) · média móvel de 4 semanas">
        <Card>
          <Grafico medidas={medidas} campo="cintura" />
        </Card>
      </Secao>

      <Comparador medidas={medidas.filter((m) => m.fotoId)} />

      <Secao titulo="Histórico">
        <Card className="divide-y divide-borda/50 p-0">
          {[...medidas].reverse().map((m) => (
            <div key={m.data} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex-1 capitalize">{formatar(m.data, "EEE',' dd/MM/yy")}</span>
              <span className="numero text-sm">{m.peso ? `${br(m.peso, 1)} kg` : '—'}</span>
              <span className="numero w-16 text-right text-sm">{m.cintura ? `${br(m.cintura, 1)} cm` : '—'}</span>
              <button
                aria-label="Apagar medida"
                className="flex h-10 w-10 items-center justify-center text-suave"
                onClick={async () => {
                  if (!confirm('Apagar este registro?')) return;
                  if (m.fotoId) await db.fotos.delete(m.fotoId);
                  await db.medidasCorpo.delete(m.data);
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {medidas.length === 0 && <p className="p-4 text-sm text-suave">Nenhum registro ainda.</p>}
        </Card>
      </Secao>
      <Aviso className="flex items-center gap-2">
        <Lock size={14} /> As fotos de progresso ficam só neste aparelho.
      </Aviso>
    </>
  );
}

function Formulario({ hoje, ultima, pesoInicial, registroHoje }: { hoje: string; ultima?: MedidaCorpo; pesoInicial: number; registroHoje?: MedidaCorpo }) {
  const [peso, setPeso] = useState(registroHoje?.peso ?? ultima?.peso ?? pesoInicial);
  const [cintura, setCintura] = useState(registroHoje?.cintura ?? ultima?.cintura ?? 90);
  const [fotoId, setFotoId] = useState<number | undefined>(registroHoje?.fotoId);
  const domingo = diaSemana(hoje) === 0;
  return (
    <Card className="mb-4">
      <div className="mb-1 font-bold">{registroHoje ? 'Registro de hoje' : domingo ? 'Domingo: hora de medir' : 'Novo registro'}</div>
      <p className="mb-4 text-xs text-suave">Pese em jejum, depois do banheiro. Cintura na altura do umbigo, sem apertar a fita.</p>
      <div className="mb-4 flex justify-around">
        <Contador rotulo="peso (kg)" valor={peso} passo={0.1} onChange={setPeso} />
        <Contador rotulo="cintura (cm)" valor={cintura} passo={0.5} onChange={setCintura} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <BotaoFoto tipo="progresso" refFoto={`progresso:${hoje}`} fotoAtual={fotoId} texto={fotoId ? 'Foto ✓' : 'Foto (opcional)'} aoSalvar={(id) => setFotoId(id)} />
        <Botao
          onClick={async () => {
            await db.medidasCorpo.put({ data: hoje, peso, cintura, fotoId });
            const cfg = await db.configuracoes.get('app');
            if (cfg) await db.configuracoes.update('app', { semana0: { ...cfg.semana0, medidas: true, ...(fotoId ? { foto: true } : {}) } });
            avisar('Medidas salvas');
          }}
        >
          <Save size={18} /> Salvar
        </Botao>
      </div>
    </Card>
  );
}

function Grafico({ medidas, campo }: { medidas: MedidaCorpo[]; campo: 'peso' | 'cintura' }) {
  const dados = serieCorpo(medidas)
    .filter((p) => p[campo] !== undefined)
    .map((p) => ({ rotulo: formatar(p.data, 'dd/MM'), valor: p[campo], media: campo === 'peso' ? p.pesoMedia : p.cinturaMedia }));
  if (dados.length < 2) return <p className="py-6 text-center text-sm text-suave">Registre pelo menos 2 semanas para ver o gráfico.</p>;
  return (
    <div className="h-48">
      <ResponsiveContainer>
        <LineChart data={dados} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--borda))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="rotulo" tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip contentStyle={{ background: 'rgb(var(--superficie))', border: '1px solid rgb(var(--borda))', borderRadius: 12, color: 'rgb(var(--texto))' }} />
          <Line type="monotone" dataKey="valor" name="Medida" stroke="rgb(var(--suave))" strokeWidth={1.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="media" name="Média 4 sem." stroke="rgb(var(--ouro))" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Comparador({ medidas }: { medidas: MedidaCorpo[] }) {
  const [antesIdx, setAntesIdx] = useState(0);
  const [agoraIdx, setAgoraIdx] = useState(Math.max(0, medidas.length - 1));
  const antes = medidas[Math.min(antesIdx, medidas.length - 1)];
  const agora = medidas[Math.min(agoraIdx, medidas.length - 1)];
  const urlA = useFotoUrl(antes?.fotoId);
  const urlB = useFotoUrl(agora?.fotoId);
  if (medidas.length < 1) return null;
  return (
    <Secao titulo="Antes x agora">
      <Card>
        <div className="grid grid-cols-2 gap-2">
          {[
            { url: urlA, m: antes, rot: 'Antes' },
            { url: urlB, m: agora, rot: 'Agora' },
          ].map(({ url, m, rot }) => (
            <div key={rot} className="overflow-hidden rounded-xl bg-elevado">
              {url ? <img src={url} alt={`Foto ${rot}`} className="aspect-[3/4] w-full object-cover" /> : <div className="aspect-[3/4]" />}
              <div className="p-2 text-center text-xs">
                <b>{rot}</b> · {m ? formatar(m.data, 'dd/MM/yy') : ''}
                {m?.cintura ? ` · ${br(m.cintura, 1)} cm` : ''}
              </div>
            </div>
          ))}
        </div>
        {medidas.length > 2 && (
          <div className="mt-3 space-y-2">
            {[
              ['Antes', antesIdx, setAntesIdx],
              ['Agora', agoraIdx, setAgoraIdx],
            ].map(([rot, idx, set]) => (
              <div key={rot as string} className="-mx-4 flex gap-1.5 overflow-x-auto px-4">
                <span className="rotulo self-center pr-1">{rot as string}</span>
                {medidas.map((m, i) => (
                  <Chip key={m.data} ativo={i === idx} onClick={() => (set as (n: number) => void)(i)}>
                    {formatar(m.data, 'dd/MM')}
                  </Chip>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>
    </Secao>
  );
}
