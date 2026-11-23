import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, ArrowRight, Beer, ClipboardCheck, Dumbbell, Flame, HeartHandshake, Mic2, Package, Plus, ShieldCheck, Trophy, Wind } from 'lucide-react';
import { db } from '@/db/db';
import type { DataISO } from '@/db/tipos';
import { useAgora, useConfig, usePerfil, usePeriodo } from '@/hooks/dados';
import { Anel, Barra, Card, Secao, Selo } from '@/components/ui';
import { BotaoMais } from '@/components/BotaoMais';
import { ContadorAgua } from '@/components/Agua';
import { addDias, diaSemana, formatar, intervalo, minutosDoDia, saudacao, semanaDoPlano } from '@/lib/datas';
import { pontuacaoDoDia } from '@/domain/dia';
import { diasNoEixo, semanasComTreinos } from '@/domain/sequencias';
import { diasSemBeber } from '@/domain/alcool';
import { faseDaSemana } from '@/domain/fase';
import { itensDoDia, rotuloDoDia } from '@/domain/rotina';
import { treinoDoDia } from '@/domain/treino';
import { totalEstoque, LIMITE_ALERTA } from '@/domain/estoque';
import { CHECKLIST_SEMANA0 } from '@/data/semana0';
import { PESOS } from '@/domain/pontuacao';
import { cn } from '@/lib/utils';
import { CardapioDia, FolhaRefeicao } from '@/features/alimentacao/CardapioDia';
import { LinhaDoTempo } from '@/features/rotina/LinhaDoTempo';
import { RegistroAlcoolRapido } from '@/features/alcool/RegistroAlcool';
import { iniciarSessao } from '@/features/treino/servico';
import { PassosHoje } from '@/features/saude/Componentes';
import type { Refeicao } from '@/db/tipos';

function refeicaoDaHora(hora: string): Refeicao {
  const m = minutosDoDia(hora);
  if (m < 10 * 60 + 30) return 'cafe';
  if (m < 15 * 60) return 'almoco';
  if (m < 18 * 60) return 'lanche';
  return 'jantar';
}

export default function HojePage() {
  const { hoje, hora } = useAgora();
  const perfil = usePerfil();
  const config = useConfig();
  const nav = useNavigate();
  const inicioJanela: DataISO = perfil ? (perfil.dataInicio > addDias(hoje, -365) ? addDias(perfil.dataInicio, -1) : addDias(hoje, -365)) : hoje;
  const dados = usePeriodo(inicioJanela, hoje);
  const alcoolTodos = useLiveQuery(() => db.registrosAlcool.toArray(), []);
  const sessoesTodas = useLiveQuery(() => db.sessoesTreino.toArray(), []);
  const estoque = useLiveQuery(() => db.estoqueMarmitas.toArray(), []);
  const pratos = useLiveQuery(() => db.pratos.toArray(), []);
  const [folhaRefeicao, setFolhaRefeicao] = useState<Refeicao | null>(null);

  const pontos = useMemo(() => {
    if (!dados) return null;
    const mapa: Record<DataISO, number> = {};
    for (const d of intervalo(dados.perfil.dataInicio < inicioJanela ? inicioJanela : dados.perfil.dataInicio, hoje)) mapa[d] = pontuacaoDoDia(d, dados).total;
    return { mapa, hoje: pontuacaoDoDia(hoje, dados) };
  }, [dados, hoje, inicioJanela]);

  if (!perfil || !config || !dados || !pontos || !alcoolTodos || !sessoesTodas) return null;

  const p = pontos.hoje;
  const semana = semanaDoPlano(hoje, perfil.dataInicio);
  const fase = faseDaSemana(semana);
  const td = treinoDoDia(hoje, config, perfil.dataInicio);
  const treinouHoje = sessoesTodas.some((s) => s.data === hoje && s.concluida);
  const emAndamento = sessoesTodas.find((s) => !s.concluida);
  const seqEixo = diasNoEixo(pontos.mapa, hoje);
  const seqAlcool = diasSemBeber(alcoolTodos, hoje, perfil.dataInicio);
  const seqTreino = semanasComTreinos(sessoesTodas, hoje);
  const s0 = CHECKLIST_SEMANA0.filter((c) => config.semana0[c.id]).length;
  const dow = diaSemana(hoje);
  const diaShow = config.diasShow.includes(dow) && minutosDoDia(hora) >= 17 * 60;
  const estoqueTotal = estoque ? totalEstoque(estoque) : 0;
  const temEstoque = (estoque?.length ?? 0) > 0;

  // próxima ação
  const itens = itensDoDia(hoje, dados.rotina, config);
  const proximo = itens.find(
    (i) => minutosDoDia(i.horaFim ?? i.hora) >= minutosDoDia(hora) && !dados.checks.some((c) => c.data === hoje && c.itemId === i.id && c.feito),
  );
  const registroAlcool = dados.alcool.find((r) => r.data === hoje);
  let proximaAcao: { titulo: string; detalhe: string; to?: string; onClick?: () => void } | null = null;
  if (emAndamento) proximaAcao = { titulo: `Continuar o Treino ${emAndamento.ficha}`, detalhe: 'Você tem um treino em andamento.', to: `/treino/ao-vivo/${emAndamento.id}` };
  else if (td && !td.opcional && !treinouHoje && minutosDoDia(hora) < 12 * 60)
    proximaAcao = { titulo: `Treino ${td.ficha} às 5h30`, detalhe: 'Começa pelo aquecimento: 5 min leves.', onClick: async () => nav(`/treino/ao-vivo/${await iniciarSessao(td.ficha, hoje, false)}`) };
  else if (proximo) proximaAcao = { titulo: `${proximo.hora} · ${proximo.titulo}`, detalhe: proximo.detalhe ?? 'Próximo item da sua rotina.' };
  else if (!registroAlcool && minutosDoDia(hora) >= 20 * 60) proximaAcao = { titulo: 'Registrar o álcool de hoje', detalhe: 'Vale 30 pontos. Leva 1 toque.' };
  else if (p.proteina < p.meta) proximaAcao = { titulo: `Faltam ${p.meta - p.proteina} g de proteína`, detalhe: 'Um shake ou iogurte com whey resolve 30 g.', to: '/comida' };

  const corAnel = p.total >= 70 ? 'rgb(var(--verde))' : p.total >= 40 ? 'rgb(var(--ouro))' : 'rgb(var(--perigo))';

  return (
    <>
      <header className="safe-top flex items-center gap-3 pb-3 pt-4">
        <div className="flex-1">
          <p className="text-sm text-suave first-letter:uppercase">{formatar(hoje, "EEEE',' d 'de' MMMM")}</p>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
            {saudacao(hora)}, {perfil.nome.split(' ')[0]}
          </h1>
          <p className="text-sm text-suave">{rotuloDoDia(hoje, config)}</p>
        </div>
        <BotaoMais />
      </header>

      {/* Pontuação do Eixo */}
      <Card className="mb-4 brilho-ouro">
        <div className="flex items-center gap-4">
          <Anel valor={p.total} tamanho={128} espessura={12} cor={corAnel}>
            <span className="numero text-4xl font-extrabold leading-none">{p.total}</span>
            <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-suave">no eixo</span>
          </Anel>
          <div className="flex-1 space-y-2">
            {(
              [
                ['Treino', p.treino, PESOS.treino],
                ['Alimentação', p.alimentacao, PESOS.alimentacao],
                ['Álcool', p.alcool, PESOS.alcool],
                ['Rotina', p.rotina, PESOS.rotina],
              ] as const
            ).map(([n, v, m]) => (
              <div key={n}>
                <div className="flex justify-between text-xs">
                  <span className="text-suave">{n}</span>
                  <span className="numero font-semibold">
                    {v}/{m}
                  </span>
                </div>
                <Barra valor={v} max={m} className="h-1.5" cor={v >= m ? 'bg-verde' : 'bg-ouro'} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-borda/60 pt-3 text-center">
          <Sequencia icone={<Flame size={16} />} valor={seqEixo} rotulo="dias no eixo" />
          <Sequencia icone={<ShieldCheck size={16} />} valor={seqAlcool} rotulo="dias sem álcool" />
          <Sequencia icone={<Trophy size={16} />} valor={seqTreino} rotulo="semanas 2+ treinos" />
        </div>
      </Card>

      {/* Próxima ação */}
      {proximaAcao && (
        <button
          onClick={() => (proximaAcao!.to ? nav(proximaAcao!.to) : proximaAcao!.onClick?.())}
          className="card mb-4 flex w-full items-center gap-3 border-ouro/50 text-left animate-entrar"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ouro text-fundo">
            <ArrowRight size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="rotulo text-ouro">Próxima ação</div>
            <div className="font-bold leading-snug">{proximaAcao.titulo}</div>
            <div className="text-sm text-suave">{proximaAcao.detalhe}</div>
          </div>
        </button>
      )}

      {/* Botões rápidos */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <Rapido
          icone={<Dumbbell size={22} />}
          rotulo={emAndamento ? 'Continuar' : 'Começar treino'}
          onClick={async () => {
            if (emAndamento) return nav(`/treino/ao-vivo/${emAndamento.id}`);
            if (td) return nav(`/treino/ao-vivo/${await iniciarSessao(td.ficha, hoje, td.opcional)}`);
            nav('/treino');
          }}
        />
        <Rapido icone={<Plus size={22} />} rotulo="+ Refeição" onClick={() => setFolhaRefeicao(refeicaoDaHora(hora))} />
        <Rapido icone={<Beer size={22} />} rotulo="Álcool hoje" onClick={() => nav('/alcool')} />
        <Rapido icone={<Wind size={22} />} rotulo="Estou com vontade" destaque onClick={() => nav('/alcool/vontade')} />
      </div>

      {diaShow && (
        <Link to="/alcool/show" className="card mb-4 flex items-center gap-3 border-ouro/60 bg-ouro/10 animate-entrar">
          <Mic2 className="text-ouro" />
          <div className="flex-1">
            <div className="font-bold">Plano do show</div>
            <div className="text-sm text-suave">Comer antes, bebida sem álcool, frase pronta e hora de voltar.</div>
          </div>
          <ArrowRight size={18} className="text-ouro" />
        </Link>
      )}

      {s0 < CHECKLIST_SEMANA0.length && semana <= 2 && (
        <Link to="/rotina/semana0" className="card mb-4 flex items-center gap-3 animate-entrar">
          <ClipboardCheck className="text-ouro" />
          <div className="flex-1">
            <div className="font-semibold">Checklist da Semana 0</div>
            <Barra className="mt-1.5" valor={s0} max={CHECKLIST_SEMANA0.length} />
          </div>
          <span className="numero text-sm text-suave">
            {s0}/{CHECKLIST_SEMANA0.length}
          </span>
        </Link>
      )}

      {temEstoque && estoqueTotal <= LIMITE_ALERTA && (
        <Link to="/marmitas" className="card mb-4 flex items-center gap-3 border-perigo/40">
          <Package className="text-perigo" />
          <div className="flex-1 text-sm">
            <b>Estoque baixo:</b> {estoqueTotal} {estoqueTotal === 1 ? 'marmita' : 'marmitas'} na geladeira.
          </div>
          <AlertTriangle size={18} className="text-perigo" />
        </Link>
      )}

      <Secao titulo="Álcool hoje">
        <Card>
          <RegistroAlcoolRapido data={hoje} />
        </Card>
      </Secao>

      <Secao titulo={`Cardápio do dia · ${p.proteina}/${p.meta} g de proteína`}>
        <Barra className="mb-3" valor={p.proteina} max={perfil.metaProteinaMax} faixa={[p.meta, perfil.metaProteinaMax]} cor={p.proteina >= p.meta ? 'bg-verde' : 'bg-ouro'} />
        <CardapioDia data={hoje} config={config} compacto />
      </Secao>

      <Secao titulo="Água">
        <Card>
          <ContadorAgua data={hoje} meta={perfil.metaAguaMl} />
          <div className="mt-2">
            <PassosHoje data={hoje} />
          </div>
        </Card>
      </Secao>

      <Secao titulo="Linha do tempo de hoje" acao={<Selo>{fase.nome} · sem. {Math.max(1, semana)}</Selo>}>
        <Card>
          <LinhaDoTempo data={hoje} config={config} hora={hora} />
        </Card>
      </Secao>

      <Link to="/habitos" className="card mb-4 flex items-center gap-3">
        <HeartHandshake className="text-ouro" />
        <span className="flex-1 font-semibold">Hábitos de hoje</span>
        <ArrowRight size={18} className="text-suave" />
      </Link>

      {pratos && <FolhaRefeicao data={hoje} refeicao={folhaRefeicao} aoFechar={() => setFolhaRefeicao(null)} pratos={pratos} />}
    </>
  );
}

function Sequencia({ icone, valor, rotulo }: { icone: React.ReactNode; valor: number; rotulo: string }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1 text-ouro">
        {icone}
        <span className="numero text-xl font-extrabold text-texto">{valor}</span>
      </div>
      <div className="text-[11px] leading-tight text-suave">{rotulo}</div>
    </div>
  );
}

function Rapido({ icone, rotulo, onClick, destaque }: { icone: React.ReactNode; rotulo: string; onClick: () => void; destaque?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 text-center text-[11px] font-semibold leading-tight transition active:scale-95',
        destaque ? 'border-perigo/40 bg-perigo/10 text-perigo' : 'border-borda/60 bg-superficie text-texto',
      )}
    >
      <span className={destaque ? '' : 'text-ouro'}>{icone}</span>
      {rotulo}
    </button>
  );
}
