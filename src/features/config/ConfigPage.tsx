import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarPlus, ChevronRight, Download, FileJson, FileSpreadsheet, Moon, RotateCcw, Sun, Trash2, Upload } from 'lucide-react';
import { db } from '@/db/db';
import type { Configuracoes } from '@/db/tipos';
import { Aviso, Botao, Cabecalho, Card, Chip, Contador, Interruptor, Secao } from '@/components/ui';
import { salvarConfig, salvarPerfil, useAgora, useConfig, usePerfil } from '@/hooks/dados';
import { NOMES_DIAS_CURTOS } from '@/lib/datas';
import { gerarICS } from '@/domain/ics';
import { apagarTudo, exportarCSV, exportarJSON, importarJSON } from '@/lib/backup';
import { restaurarPadrao } from '@/db/seed';
import { baixarArquivo } from '@/lib/utils';
import { avisar } from '@/store/app';

export function SeletorDias({ valor, onChange, max }: { valor: number[]; onChange: (v: number[]) => void; max?: number }) {
  // segunda primeiro
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="flex flex-wrap gap-1.5">
      {ordem.map((d) => {
        const ativo = valor.includes(d);
        return (
          <Chip
            key={d}
            ativo={ativo}
            className="min-w-[48px] px-2"
            onClick={() => {
              if (ativo) onChange(valor.filter((x) => x !== d));
              else if (!max || valor.length < max) onChange([...valor, d].sort());
              else onChange([...valor.slice(1), d].sort());
            }}
          >
            {NOMES_DIAS_CURTOS[d]}
          </Chip>
        );
      })}
    </div>
  );
}

export default function ConfigPage() {
  const perfil = usePerfil();
  const config = useConfig();
  const { hoje } = useAgora();
  const rotina = useLiveQuery(() => db.rotina.toArray(), []);
  const arquivo = useRef<HTMLInputElement>(null);
  const [apagando, setApagando] = useState('');
  if (!perfil || !config || !rotina) return null;
  const set = (p: Partial<Configuracoes>) => salvarConfig(p);

  function ics() {
    return gerarICS({ rotina: rotina!, config: config!, inicio: hoje });
  }

  return (
    <>
      <Cabecalho titulo="Configurações" voltar />

      <Secao titulo="Perfil">
        <Card className="space-y-3">
          <label className="block">
            <span className="text-sm text-suave">Nome</span>
            <input className="campo mt-1" value={perfil.nome} onChange={(e) => salvarPerfil({ nome: e.target.value })} />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-sm text-suave">Idade</span>
              <input className="campo mt-1" type="number" inputMode="numeric" value={perfil.idade} onChange={(e) => salvarPerfil({ idade: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="text-sm text-suave">Altura (cm)</span>
              <input className="campo mt-1" type="number" inputMode="numeric" value={perfil.alturaCm} onChange={(e) => salvarPerfil({ alturaCm: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="text-sm text-suave">Peso inicial</span>
              <input className="campo mt-1" type="number" inputMode="decimal" step="0.1" value={perfil.pesoInicial} onChange={(e) => salvarPerfil({ pesoInicial: Number(e.target.value) })} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-suave">Início do plano de 12 semanas</span>
            <input className="campo mt-1" type="date" value={perfil.dataInicio} onChange={(e) => e.target.value && salvarPerfil({ dataInicio: e.target.value })} />
          </label>
        </Card>
      </Secao>

      <Secao titulo="Metas">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Proteína mínima (g)</span>
            <Contador valor={perfil.metaProteinaMin} passo={5} onChange={(v) => salvarPerfil({ metaProteinaMin: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Proteína máxima (g)</span>
            <Contador valor={perfil.metaProteinaMax} passo={5} onChange={(v) => salvarPerfil({ metaProteinaMax: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Água (ml)</span>
            <Contador valor={perfil.metaAguaMl} passo={250} onChange={(v) => salvarPerfil({ metaAguaMl: v })} />
          </div>
          <p className="text-xs text-suave">A meta diária de proteína usada na pontuação segue a fase do plano (100 → 120 → 130 g).</p>
        </Card>
      </Secao>

      <Secao titulo="Rotina semanal">
        <Card className="space-y-4">
          <div>
            <div className="mb-2 text-sm">Dias de treino fixo (1º = Treino A, 2º = Treino B)</div>
            <SeletorDias valor={config.diasTreino} max={2} onChange={(v) => set({ diasTreino: v })} />
          </div>
          <div>
            <div className="mb-2 text-sm">Treino opcional</div>
            <div className="flex flex-wrap gap-1.5">
              <Chip ativo={config.diaTreinoOpcional === null} onClick={() => set({ diaTreinoOpcional: null })}>
                Nenhum
              </Chip>
              {[6, 0, 5].map((d) => (
                <Chip key={d} ativo={config.diaTreinoOpcional === d} onClick={() => set({ diaTreinoOpcional: d })}>
                  {NOMES_DIAS_CURTOS[d]}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm">Dias de show</div>
            <SeletorDias valor={config.diasShow} onChange={(v) => set({ diasShow: v })} />
          </div>
          <div>
            <div className="mb-2 text-sm">Dias no projeto (café, almoço e lanche fora)</div>
            <SeletorDias valor={config.diasTrabalho} onChange={(v) => set({ diasTrabalho: v })} />
          </div>
          <div>
            <div className="mb-2 text-sm">Dia de mercado e preparo (além do domingo)</div>
            <SeletorDias valor={config.diasPreparo} onChange={(v) => set({ diasPreparo: v })} />
          </div>
          <div className="border-t border-borda/60 pt-3">
            <div className="mb-2 text-sm">Proteína estimada no trabalho (g)</div>
            <div className="space-y-2">
              {(['cafe', 'almoco', 'lanche'] as const).map((r) => (
                <div key={r} className="flex items-center justify-between">
                  <span className="text-sm text-suave">{r === 'cafe' ? 'Café' : r === 'almoco' ? 'Almoço' : 'Lanche'}</span>
                  <Contador valor={config.proteinaTrabalho[r]} passo={5} onChange={(v) => set({ proteinaTrabalho: { ...config.proteinaTrabalho, [r]: v } })} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Refeições livres por semana</span>
            <Contador valor={config.refeicoesLivresSemana} min={0} max={4} onChange={(v) => set({ refeicoesLivresSemana: v })} />
          </div>
          <Link to="/rotina/editor" className="flex min-h-[44px] items-center justify-between font-semibold text-ouro">
            Editar horários e tarefas <ChevronRight size={18} />
          </Link>
          <Link to="/alcool" className="flex min-h-[44px] items-center justify-between font-semibold text-ouro">
            Regras do álcool <ChevronRight size={18} />
          </Link>
        </Card>
      </Secao>

      <Secao titulo="Lembretes no Calendário do iPhone">
        <Card className="space-y-3">
          <p className="text-sm text-suave">
            Notificações de app web não são confiáveis no iPhone. Gere um arquivo .ics com eventos semanais (véspera do treino, treino, mercado, marmitas, plano do show e
            revisão) e importe no app Calendário. O arquivo acompanha a sua rotina: se mudar horários, gere de novo.
          </p>
          <Botao
            bloco
            tamanho="lg"
            onClick={async () => {
              baixarArquivo('no-eixo-lembretes.ics', ics(), 'text/calendar');
              await set({ semana0: { ...config.semana0, lembretes: true } });
            }}
          >
            <CalendarPlus size={20} /> Baixar lembretes (.ics)
          </Botao>
          <Botao
            bloco
            variante="secundario"
            onClick={async () => {
              await set({ semana0: { ...config.semana0, lembretes: true } });
              window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics())}`;
            }}
          >
            Abrir direto no Calendário
          </Botao>
          <Aviso>
            No iPhone: toque em “Baixar”, abra o arquivo e escolha “Adicionar todos”. Se reimportar, apague antes o calendário antigo para não duplicar.
          </Aviso>
        </Card>
      </Secao>

      <Secao titulo="Aparência">
        <Card className="flex items-center gap-3">
          {config.tema === 'escuro' ? <Moon className="text-ouro" /> : <Sun className="text-ouro" />}
          <span className="flex-1">Modo escuro</span>
          <Interruptor ligado={config.tema === 'escuro'} onChange={(v) => set({ tema: v ? 'escuro' : 'claro' })} rotulo="Modo escuro" />
        </Card>
      </Secao>

      <Secao titulo="Backup">
        <Card className="space-y-2">
          <Botao
            bloco
            variante="secundario"
            onClick={async () => baixarArquivo(`no-eixo-backup-${hoje}.json`, await exportarJSON(), 'application/json')}
          >
            <FileJson size={18} /> Exportar tudo (JSON com fotos)
          </Botao>
          <Botao bloco variante="secundario" onClick={async () => baixarArquivo(`no-eixo-${hoje}.csv`, await exportarCSV(), 'text/csv')}>
            <FileSpreadsheet size={18} /> Exportar planilha (CSV)
          </Botao>
          <input
            ref={arquivo}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              if (!confirm('Importar este backup? Os dados atuais serão substituídos.')) return;
              try {
                await importarJSON(await f.text());
                avisar('Backup importado');
                setTimeout(() => window.location.reload(), 600);
              } catch (err) {
                avisar(err instanceof Error ? err.message : 'Arquivo inválido', 'erro');
              }
            }}
          />
          <Botao bloco variante="secundario" onClick={() => arquivo.current?.click()}>
            <Upload size={18} /> Importar backup
          </Botao>
          <p className="pt-1 text-xs text-suave">
            <Download size={12} className="mr-1 inline" />
            Seus dados ficam só neste aparelho. Exporte um backup de vez em quando e guarde no iCloud Drive.
          </p>
        </Card>
      </Secao>

      <Secao titulo="Conteúdo">
        <Card className="space-y-2">
          <Botao
            bloco
            variante="fantasma"
            onClick={async () => {
              if (!confirm('Restaurar todos os pratos ao conteúdo original? Suas fotos são mantidas.')) return;
              await restaurarPadrao('pratos');
              avisar('Pratos restaurados');
            }}
          >
            <RotateCcw size={16} /> Restaurar pratos originais
          </Botao>
          <Botao
            bloco
            variante="fantasma"
            onClick={async () => {
              if (!confirm('Restaurar os exercícios originais? As fotos dos aparelhos são mantidas.')) return;
              await restaurarPadrao('exercicios');
              avisar('Exercícios restaurados');
            }}
          >
            <RotateCcw size={16} /> Restaurar exercícios originais
          </Botao>
          <Link to="/sobre" className="flex min-h-[48px] items-center justify-between px-2 font-semibold">
            Sobre e créditos <ChevronRight size={18} />
          </Link>
        </Card>
      </Secao>

      <Secao titulo="Zona de perigo">
        <Card className="space-y-2 border-perigo/40">
          <p className="text-sm text-suave">Apaga treinos, refeições, registros, fotos e configurações deste aparelho. Não dá para desfazer.</p>
          <input className="campo" placeholder='Digite APAGAR para confirmar' value={apagando} onChange={(e) => setApagando(e.target.value)} />
          <Botao
            bloco
            variante="perigo"
            disabled={apagando.trim().toUpperCase() !== 'APAGAR'}
            onClick={async () => {
              if (!confirm('Última confirmação: apagar TODOS os dados?')) return;
              await apagarTudo();
              window.location.href = '/';
            }}
          >
            <Trash2 size={18} /> Apagar todos os dados
          </Botao>
        </Card>
      </Secao>
    </>
  );
}
