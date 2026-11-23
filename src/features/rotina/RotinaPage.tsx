import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Pencil, Target } from 'lucide-react';
import { useAgora, useConfig, usePerfil } from '@/hooks/dados';
import { Barra, Cabecalho, Card, Secao, SeletorSemana, Selo } from '@/components/ui';
import { BotaoMais } from '@/components/BotaoMais';
import { diasDaSemana, formatar, inicioSemana, semanaDoPlano } from '@/lib/datas';
import { faseDaSemana, progressoPlano } from '@/domain/fase';
import { rotuloDoDia } from '@/domain/rotina';
import { CHECKLIST_SEMANA0 } from '@/data/semana0';
import { TOTAL_SEMANAS } from '@/data/plano12';
import { LinhaDoTempo } from './LinhaDoTempo';

export default function RotinaPage() {
  const { hoje, hora } = useAgora();
  const perfil = usePerfil();
  const config = useConfig();
  const [dia, setDia] = useState(hoje);
  if (!perfil || !config) return null;
  const semana = semanaDoPlano(hoje, perfil.dataInicio);
  const fase = faseDaSemana(semana);
  const prog = progressoPlano(semana);
  const s0 = CHECKLIST_SEMANA0.filter((c) => config.semana0[c.id]).length;

  return (
    <>
      <Cabecalho titulo="Rotina" subtitulo="O que fazer em cada dia e horário" acao={<BotaoMais />} />

      <Link to="/rotina/plano" className="card mb-3 block brilho-ouro animate-entrar">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-ouro" />
          <span className="rotulo">Plano de 12 semanas</span>
          <Selo className="ml-auto">{fase.nome}</Selo>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="numero text-3xl font-extrabold">{Math.min(Math.max(semana, 1), TOTAL_SEMANAS)}</span>
          <span className="text-suave">/ {TOTAL_SEMANAS} semanas</span>
        </div>
        <Barra className="mt-2" valor={prog.pct} />
        <ul className="mt-3 space-y-1 text-sm">
          {fase.metas.map((m) => (
            <li key={m} className="flex gap-2">
              <span className="text-ouro">•</span>
              {m}
            </li>
          ))}
        </ul>
      </Link>

      {s0 < CHECKLIST_SEMANA0.length && (
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

      <Secao
        titulo="Linha do tempo"
        acao={
          <Link to="/rotina/editor" className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-ouro">
            <Pencil size={13} /> Editar rotina
          </Link>
        }
      >
        <SeletorSemana dias={diasDaSemana(inicioSemana(hoje))} valor={dia} onChange={setDia} hoje={hoje} rotulo={(d) => [formatar(d, 'EEEEEE'), formatar(d, 'dd')]} />
        <Card>
          <div className="mb-3 text-sm text-suave">
            <span className="font-semibold capitalize text-texto">{formatar(dia, 'EEEE')}</span> · {rotuloDoDia(dia, config)}
          </div>
          <LinhaDoTempo data={dia} config={config} hora={dia === hoje ? hora : undefined} editavel={dia <= hoje} />
        </Card>
      </Secao>
    </>
  );
}
