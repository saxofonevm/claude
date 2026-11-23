import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChevronLeft, ChevronRight, Ruler, Save } from 'lucide-react';
import { db } from '@/db/db';
import { Botao, Cabecalho, Card, Numero, Secao, Selo } from '@/components/ui';
import { BotaoMais } from '@/components/BotaoMais';
import { useAgora, usePeriodo } from '@/hooks/dados';
import { addDias, formatar, inicioSemana, semanaDoPlano } from '@/lib/datas';
import { resumoSemana } from '@/domain/semana';
import { NOMES_GATILHO } from '@/domain/alcool';
import { br } from '@/lib/utils';
import { avisar } from '@/store/app';

export default function SemanaPage() {
  const { hoje } = useAgora();
  const [segunda, setSegunda] = useState(inicioSemana(hoje));
  const domingo = addDias(segunda, 6);
  const dados = usePeriodo(segunda, domingo);
  const preparos = useLiveQuery(() => db.preparos.where('data').between(segunda, domingo, true, true).toArray(), [segunda]);
  const refeicoes = useLiveQuery(() => db.refeicoes.where('data').between(segunda, domingo, true, true).toArray(), [segunda]);
  const medidas = useLiveQuery(() => db.medidasCorpo.where('data').belowOrEqual(domingo).reverse().limit(2).toArray(), [domingo]);
  const revisao = useLiveQuery(() => db.revisoesSemanais.get(segunda), [segunda], null);
  const historico = useLiveQuery(() => db.revisoesSemanais.orderBy('id').reverse().toArray(), []);
  if (!dados || !preparos || !refeicoes || !medidas || revisao === null || !historico) return null;
  const r = resumoSemana(dados, segunda, hoje, preparos, refeicoes);
  const atual = segunda === inicioSemana(hoje);
  const nSemana = semanaDoPlano(segunda, dados.perfil.dataInicio);
  const [m1, m0] = medidas;
  const dPeso = m1?.peso && m0?.peso ? m1.peso - m0.peso : null;
  const dCint = m1?.cintura && m0?.cintura ? m1.cintura - m0.cintura : null;
  const corPontos = (p: number) => (p >= 70 ? 'rgb(var(--verde))' : p >= 40 ? 'rgb(var(--ouro))' : 'rgb(var(--perigo))');

  return (
    <>
      <Cabecalho titulo="Semana" subtitulo="Revisão de domingo" acao={<BotaoMais />} />
      <div className="mb-3 flex items-center gap-2">
        <button aria-label="Semana anterior" onClick={() => setSegunda(addDias(segunda, -7))} className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <div className="font-bold">{nSemana >= 1 ? `Semana ${nSemana} do plano` : 'Antes do plano'}</div>
          <div className="text-sm text-suave">
            {formatar(segunda, 'dd/MM')} a {formatar(domingo, 'dd/MM')}
          </div>
        </div>
        <button
          aria-label="Próxima semana"
          disabled={atual}
          onClick={() => setSegunda(addDias(segunda, 7))}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <Card className="mb-4 brilho-ouro">
        <div className="flex items-end justify-between">
          <Numero valor={r.pontuacaoMedia} rotulo="pontuação média" className="[&>span:first-child]:text-4xl" />
          {r.pontuacaoMedia >= 70 ? <Selo cor="verde">semana no eixo</Selo> : <Selo>bora ajustar</Selo>}
        </div>
        <div className="mt-3 h-28">
          <ResponsiveContainer>
            <BarChart data={r.dias.map((d) => ({ ...d, rotulo: formatar(d.data, 'EEEEEE') }))} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
              <ReferenceLine y={70} stroke="rgb(var(--verde))" strokeDasharray="4 4" />
              <XAxis dataKey="rotulo" tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Bar dataKey="pontos" radius={[6, 6, 2, 2]}>
                {r.dias.map((d) => (
                  <Cell key={d.data} fill={corPontos(d.pontos)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Card className="p-3">
          <Numero valor={`${r.treinosFeitos}/${r.treinosPlanejados}`} rotulo="treinos feitos" />
        </Card>
        <Card className="p-3">
          <Numero valor={r.proteinaMedia} sufixo="g" rotulo="proteína média/dia" />
        </Card>
        <Card className="p-3">
          <Numero valor={`${r.diasSemAlcool}/${r.dias.length}`} rotulo={`dias sem álcool · ${r.doses} doses`} />
        </Card>
        <Card className="p-3">
          <Numero valor={`${r.habitosPct}%`} rotulo="hábitos cumpridos" />
        </Card>
        <Card className="p-3">
          <Numero valor={`${r.marmitasPreparadas}/${r.marmitasConsumidas}`} rotulo="marmitas feitas/comidas" />
        </Card>
        <Link to="/corpo" className="card p-3">
          <div className="flex items-center gap-1">
            <Ruler size={14} className="text-ouro" />
            <span className="numero text-lg font-bold">{m1?.peso ? `${br(m1.peso, 1)} kg` : '—'}</span>
          </div>
          <div className="mt-1 text-xs text-suave">
            {m1?.cintura ? `${br(m1.cintura, 1)} cm` : 'medir cintura'}
            {dPeso !== null && ` · ${dPeso > 0 ? '+' : ''}${br(dPeso, 1)} kg`}
            {dCint !== null && ` · ${dCint > 0 ? '+' : ''}${br(dCint, 1)} cm`}
          </div>
        </Link>
      </div>

      {r.gatilhos.length > 0 && (
        <Secao titulo="Gatilhos da semana">
          <div className="flex flex-wrap gap-2">
            {r.gatilhos.map((g, i) => (
              <Selo key={i}>{NOMES_GATILHO[g]}</Selo>
            ))}
          </div>
        </Secao>
      )}

      <Revisao key={segunda} segunda={segunda} inicial={revisao} resumo={{ pontos: r.pontuacaoMedia, treinos: r.treinosFeitos, proteina: r.proteinaMedia, semAlcool: r.diasSemAlcool }} />

      {historico.length > 0 && (
        <Secao titulo="Histórico de semanas">
          <Card className="divide-y divide-borda/50 p-0">
            {historico.map((h) => (
              <button key={h.id} onClick={() => setSegunda(h.id)} className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2 text-left">
                <div className="flex-1">
                  <div className="font-semibold">Semana de {formatar(h.id, 'dd/MM')}</div>
                  <div className="truncate text-sm text-suave">{h.ajuste || h.funcionou || 'Sem anotações'}</div>
                </div>
                {h.resumo?.pontos !== undefined && <Selo>{h.resumo.pontos} pts</Selo>}
              </button>
            ))}
          </Card>
        </Secao>
      )}
    </>
  );
}

function Revisao({
  segunda,
  inicial,
  resumo,
}: {
  segunda: string;
  inicial?: { funcionou: string; tirou: string; ajuste: string };
  resumo: Record<string, number>;
}) {
  const [funcionou, setFuncionou] = useState(inicial?.funcionou ?? '');
  const [tirou, setTirou] = useState(inicial?.tirou ?? '');
  const [ajuste, setAjuste] = useState(inicial?.ajuste ?? '');
  useEffect(() => {
    setFuncionou(inicial?.funcionou ?? '');
    setTirou(inicial?.tirou ?? '');
    setAjuste(inicial?.ajuste ?? '');
  }, [inicial]);
  return (
    <Secao titulo="Revisão guiada">
      <Card className="space-y-4">
        <label className="block">
          <span className="font-semibold">O que funcionou?</span>
          <textarea className="campo mt-1 min-h-[70px]" value={funcionou} onChange={(e) => setFuncionou(e.target.value)} />
        </label>
        <label className="block">
          <span className="font-semibold">O que me tirou do eixo?</span>
          <textarea className="campo mt-1 min-h-[70px]" value={tirou} onChange={(e) => setTirou(e.target.value)} />
        </label>
        <label className="block">
          <span className="font-semibold">Qual é o 1 ajuste para a próxima semana?</span>
          <textarea className="campo mt-1 min-h-[70px]" value={ajuste} onChange={(e) => setAjuste(e.target.value)} />
        </label>
        <Botao
          bloco
          tamanho="lg"
          onClick={async () => {
            await db.revisoesSemanais.put({ id: segunda, funcionou, tirou, ajuste, resumo, criadoEm: new Date().toISOString() });
            avisar('Revisão salva. Semana nova, foco novo.');
          }}
        >
          <Save size={18} /> Salvar revisão
        </Botao>
      </Card>
    </Secao>
  );
}
