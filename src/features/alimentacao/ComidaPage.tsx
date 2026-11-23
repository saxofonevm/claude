import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChefHat, LayoutList, RefreshCw } from 'lucide-react';
import { useAgora, useConfig, usePerfil, usePeriodo } from '@/hooks/dados';
import { Aviso, Barra, Cabecalho, Card, Secao, SeletorSemana } from '@/components/ui';
import { BotaoMais } from '@/components/BotaoMais';
import { ContadorAgua } from '@/components/Agua';
import { addDias, diasDaSemana, formatar, inicioSemana, semanaDoPlano } from '@/lib/datas';
import { metaProteinaDaSemana } from '@/domain/fase';
import { proteinaDoDia } from '@/domain/dia';
import { AVISO_NUTRI } from '@/data/pratos';
import { CardapioDia } from './CardapioDia';
import { GraficoProteina } from './GraficoProteina';
import { regenerarPlano } from './servico';

export default function ComidaPage() {
  const { hoje } = useAgora();
  const perfil = usePerfil();
  const config = useConfig();
  const [dia, setDia] = useState(hoje);
  const segunda = inicioSemana(dia);
  const dados = usePeriodo(segunda, addDias(segunda, 6));
  if (!perfil || !config || !dados) return null;
  const meta = metaProteinaDaSemana(semanaDoPlano(dia, perfil.dataInicio));
  const prot = proteinaDoDia(dia, dados.refeicoes, config);
  const semana = diasDaSemana(segunda).map((d) => ({ data: d, rotulo: formatar(d, 'EEEEEE'), proteina: d <= hoje ? proteinaDoDia(d, dados.refeicoes, config) : 0 }));

  return (
    <>
      <Cabecalho titulo="Comida" subtitulo={`Meta da fase: ${meta} g de proteína por dia`} acao={<BotaoMais />} />

      <Card className="mb-4 brilho-ouro">
        <div className="flex items-end justify-between">
          <div>
            <div className="rotulo">Proteína {dia === hoje ? 'hoje' : formatar(dia, 'EEEE')}</div>
            <div className="numero text-4xl font-extrabold">
              {prot}
              <span className="text-lg font-semibold text-suave"> / {meta} g</span>
            </div>
          </div>
          <div className="text-right text-sm text-suave">{prot >= meta ? 'Meta batida 💪' : `Faltam ${meta - prot} g`}</div>
        </div>
        <Barra className="mt-3" valor={prot} max={perfil.metaProteinaMax} faixa={[meta, perfil.metaProteinaMax]} cor={prot >= meta ? 'bg-verde' : 'bg-ouro'} />
      </Card>

      <Secao
        titulo="Plano da semana"
        acao={
          <button
            onClick={() => confirm('Gerar um novo plano para esta semana? As trocas manuais serão perdidas.') && regenerarPlano(dia)}
            className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-ouro"
          >
            <RefreshCw size={13} /> Novo plano
          </button>
        }
      >
        <SeletorSemana dias={diasDaSemana(inicioSemana(hoje))} valor={dia} onChange={setDia} hoje={hoje} rotulo={(d) => [formatar(d, 'EEEEEE'), formatar(d, 'dd')]} />
        <CardapioDia data={dia} config={config} />
      </Secao>

      <Secao titulo="Água">
        <Card>
          <ContadorAgua data={dia} meta={perfil.metaAguaMl} />
        </Card>
      </Secao>

      <Secao titulo="Proteína na semana">
        <Card>
          <GraficoProteina dados={semana} meta={meta} max={perfil.metaProteinaMax} />
          <p className="mt-1 text-center text-xs text-suave">Faixa verde: meta da fase até {perfil.metaProteinaMax} g</p>
        </Card>
      </Secao>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Link to="/comida/catalogo" className="card flex min-h-[80px] flex-col items-center justify-center gap-1 text-center text-sm font-semibold">
          <LayoutList className="text-ouro" /> Catálogo
        </Link>
        <Link to="/comida/como-montar" className="card flex min-h-[80px] flex-col items-center justify-center gap-1 text-center text-sm font-semibold">
          <BookOpen className="text-ouro" /> Montar o prato
        </Link>
        <Link to="/marmitas" className="card flex min-h-[80px] flex-col items-center justify-center gap-1 text-center text-sm font-semibold">
          <ChefHat className="text-ouro" /> Marmitas
        </Link>
      </div>
      <Aviso>{AVISO_NUTRI} Valores de proteína aproximados (tabela TACO).</Aviso>
    </>
  );
}
