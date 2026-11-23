import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Beer, CalendarDays, Dumbbell, Target } from 'lucide-react';
import { Botao, Card, Chip, Contador } from '@/components/ui';
import { salvarConfig, salvarPerfil, useAgora, useConfig, usePerfil } from '@/hooks/dados';
import { addDias, diaSemana, formatar, NOMES_DIAS, NOMES_DIAS_CURTOS } from '@/lib/datas';
import { cn } from '@/lib/utils';
import { SeletorDias } from './ConfigPage';

const PASSOS = [
  { titulo: 'Quem é você', icone: Dumbbell },
  { titulo: 'Objetivo e metas', icone: Target },
  { titulo: 'Sua semana', icone: CalendarDays },
  { titulo: 'Álcool', icone: Beer },
];

export default function OnboardingPage() {
  const perfil = usePerfil();
  const config = useConfig();
  const { hoje } = useAgora();
  const nav = useNavigate();
  const [passo, setPasso] = useState(0);
  if (!perfil || !config) return null;
  const proximaSegunda = addDias(hoje, ((8 - diaSemana(hoje)) % 7) || 7);
  const Icone = PASSOS[passo].icone;

  async function concluir() {
    await salvarPerfil({ onboardingFeito: true });
    await salvarConfig({ alcool: { ...config!.alcool, definido: true, faseDesde: perfil!.dataInicio }, semana0: { ...config!.semana0, alcool: true } });
    nav('/rotina/semana0', { replace: true });
  }

  return (
    <div className="safe-top flex min-h-screen flex-col pb-6 pt-6">
      <div className="mb-6 flex gap-1.5">
        {PASSOS.map((_, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition', i <= passo ? 'bg-ouro' : 'bg-borda')} />
        ))}
      </div>
      <div key={passo} className="flex-1 animate-entrar">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ouro/15 text-ouro">
          <Icone size={28} />
        </div>
        <p className="rotulo">
          Passo {passo + 1} de {PASSOS.length}
        </p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight">{passo === 0 ? `Bem-vindo ao No Eixo, ${perfil.nome}` : PASSOS[passo].titulo}</h1>

        {passo === 0 && (
          <>
            <p className="mb-4 text-suave">Confirme seus dados. Dá para mudar depois em Configurações.</p>
            <Card className="space-y-4">
              <label className="block">
                <span className="text-sm text-suave">Nome</span>
                <input className="campo mt-1" value={perfil.nome} onChange={(e) => salvarPerfil({ nome: e.target.value })} />
              </label>
              <div className="flex justify-around">
                <Contador rotulo="idade" valor={perfil.idade} onChange={(v) => salvarPerfil({ idade: v })} />
                <Contador rotulo="altura (cm)" valor={perfil.alturaCm} onChange={(v) => salvarPerfil({ alturaCm: v })} />
              </div>
              <div className="flex justify-center">
                <Contador rotulo="peso hoje (kg)" valor={perfil.pesoInicial} passo={0.1} onChange={(v) => salvarPerfil({ pesoInicial: v })} grande />
              </div>
            </Card>
          </>
        )}

        {passo === 1 && (
          <>
            <Card className="mb-3 brilho-ouro">
              <p className="font-semibold">{perfil.objetivo}</p>
              <p className="mt-2 text-sm text-suave">
                Musculação constrói e acelera; cardio e comida queimam. A barriga sai com o conjunto — e com o álcool fora da rotina.
              </p>
            </Card>
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Proteína por dia</span>
                <span className="numero font-bold text-ouro">
                  {perfil.metaProteinaMin}–{perfil.metaProteinaMax} g
                </span>
              </div>
              <p className="-mt-2 text-xs text-suave">O app começa com 100 g (adaptação) e sobe até 130–150 g na semana 7.</p>
              <div className="flex items-center justify-between">
                <span>Água por dia</span>
                <Contador valor={perfil.metaAguaMl} passo={250} sufixo="ml" onChange={(v) => salvarPerfil({ metaAguaMl: v })} />
              </div>
              <div>
                <div className="mb-2">Quando começa a semana 1?</div>
                <div className="flex flex-wrap gap-2">
                  <Chip ativo={perfil.dataInicio === hoje} onClick={() => salvarPerfil({ dataInicio: hoje })}>
                    Esta semana
                  </Chip>
                  <Chip ativo={perfil.dataInicio === proximaSegunda} onClick={() => salvarPerfil({ dataInicio: proximaSegunda })}>
                    Próxima segunda ({formatar(proximaSegunda, 'dd/MM')})
                  </Chip>
                </div>
              </div>
            </Card>
          </>
        )}

        {passo === 2 && (
          <Card className="space-y-4">
            <div>
              <div className="mb-2 font-semibold">Treino na Smart Fit (5h30)</div>
              <SeletorDias valor={config.diasTreino} max={2} onChange={(v) => salvarConfig({ diasTreino: v })} />
              <p className="mt-1 text-xs text-suave">1º dia = Treino A · 2º dia = Treino B</p>
            </div>
            <div>
              <div className="mb-2 font-semibold">Treino opcional</div>
              <div className="flex gap-2">
                <Chip ativo={config.diaTreinoOpcional === 6} onClick={() => salvarConfig({ diaTreinoOpcional: 6 })}>
                  Sábado de manhã
                </Chip>
                <Chip ativo={config.diaTreinoOpcional === null} onClick={() => salvarConfig({ diaTreinoOpcional: null })}>
                  Não
                </Chip>
              </div>
            </div>
            <div>
              <div className="mb-2 font-semibold">Shows à noite</div>
              <SeletorDias valor={config.diasShow} onChange={(v) => salvarConfig({ diasShow: v })} />
            </div>
            <div>
              <div className="mb-2 font-semibold">Dias no projeto (come fora café, almoço e lanche)</div>
              <SeletorDias valor={config.diasTrabalho} onChange={(v) => salvarConfig({ diasTrabalho: v })} />
            </div>
            <p className="text-sm text-suave">Preparo de marmitas: quinta de manhã e domingo às 10h.</p>
          </Card>
        )}

        {passo === 3 && (
          <>
            <p className="mb-4 text-suave">No máximo 1 dia fixo por semana, com limite de doses. Depois: 1 vez a cada 15 dias, e então zero. Quem decide o ritmo é você.</p>
            <Card className="space-y-4">
              <div>
                <div className="mb-2 font-semibold">Dia permitido</div>
                <div className="flex flex-wrap gap-1.5">
                  {NOMES_DIAS_CURTOS.map((n, d) => (
                    <Chip key={d} ativo={config.alcool.diaPermitido === d} onClick={() => salvarConfig({ alcool: { ...config.alcool, diaPermitido: d } })}>
                      {n}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Limite de doses</span>
                <Contador valor={config.alcool.limiteDoses} min={0} max={10} onChange={(v) => salvarConfig({ alcool: { ...config.alcool, limiteDoses: v } })} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quantas doses bebia por semana?</span>
                <Contador valor={config.alcool.dosesPorSemanaAntes} min={0} max={100} onChange={(v) => salvarConfig({ alcool: { ...config.alcool, dosesPorSemanaAntes: v } })} />
              </div>
              <div>
                <div className="mb-2 text-sm">Contato de apoio (opcional)</div>
                <input
                  className="campo mb-2"
                  placeholder="Nome"
                  value={config.contatoApoio.nome}
                  onChange={(e) => salvarConfig({ contatoApoio: { ...config.contatoApoio, nome: e.target.value } })}
                />
                <input
                  className="campo"
                  type="tel"
                  placeholder="Telefone com DDD"
                  value={config.contatoApoio.telefone}
                  onChange={(e) => salvarConfig({ contatoApoio: { ...config.contatoApoio, telefone: e.target.value } })}
                />
              </div>
              <p className="rounded-xl bg-ouro/10 p-3 text-sm">
                Combinado: <b>{NOMES_DIAS[config.alcool.diaPermitido].toLowerCase()}</b>, até <b>{config.alcool.limiteDoses} doses</b>.
              </p>
            </Card>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-2">
        <Botao variante="secundario" tamanho="lg" disabled={passo === 0} onClick={() => setPasso(passo - 1)} aria-label="Voltar">
          <ArrowLeft size={20} />
        </Botao>
        {passo < PASSOS.length - 1 ? (
          <Botao tamanho="lg" onClick={() => setPasso(passo + 1)}>
            Continuar <ArrowRight size={20} />
          </Botao>
        ) : (
          <Botao tamanho="lg" onClick={concluir}>
            Começar — Semana 0 <ArrowRight size={20} />
          </Botao>
        )}
      </div>
    </div>
  );
}
