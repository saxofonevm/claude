import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Briefcase, Check, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { db } from '@/db/db';
import type { Configuracoes, DataISO, Prato, Refeicao, RegistroRefeicao } from '@/db/tipos';
import { Botao, Chip, Contador, Folha, Interruptor, Selo } from '@/components/ui';
import { ImagemPrato } from '@/components/Midia';
import { NOMES_REFEICAO, ORDEM_REFEICOES } from '@/data/pratos';
import { refeicoesDoDia } from '@/domain/dia';
import { TRABALHO } from '@/domain/planoAlimentar';
import { inicioSemana, addDias } from '@/lib/datas';
import { cn } from '@/lib/utils';
import { apagarRegistro, definirPratoNoPlano, registrarLivre, registrarPrato, trocarNoPlano, usePlano } from './servico';

/** Cardápio de um dia segundo o plano, com "Comi" em 1 toque. */
export function CardapioDia({ data, config, compacto }: { data: DataISO; config: Configuracoes; compacto?: boolean }) {
  const plano = usePlano(data);
  const pratos = useLiveQuery(() => db.pratos.toArray(), []);
  const registros = useLiveQuery(() => db.refeicoes.where('data').equals(data).toArray(), [data]);
  const [folha, setFolha] = useState<Refeicao | null>(null);
  const [editarTrabalho, setEditarTrabalho] = useState<RegistroRefeicao | null>(null);
  if (!plano || !pratos || !registros) return <div className="h-40" />;
  const porId = Object.fromEntries(pratos.map((p) => [p.id, p]));
  const efetivas = refeicoesDoDia(data, registros, config);
  const dia = plano.dias[data] ?? {};

  return (
    <div className="space-y-2">
      {ORDEM_REFEICOES.map((ref) => {
        const valor = dia[ref];
        const regs = efetivas.filter((r) => r.refeicao === ref);
        const prato = valor && valor !== TRABALHO ? porId[valor] : undefined;
        const trabalho = valor === TRABALHO || regs.some((r) => r.origem === 'trabalho' && !r.id);
        const comeu = regs.length > 0;
        return (
          <div key={ref} className={cn('rounded-2xl border p-2.5 transition', comeu ? 'border-verde/40 bg-verde/5' : 'border-borda/60 bg-superficie')}>
            <div className="flex items-center gap-3">
              {prato ? (
                <Link to={`/comida/prato/${prato.id}`} className="h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                  <ImagemPrato prato={prato} />
                </Link>
              ) : (
                <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-elevado text-suave">
                  <Briefcase size={22} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="rotulo">{NOMES_REFEICAO[ref]}</div>
                {comeu ? (
                  regs.map((r, k) => (
                    <div key={k} className="truncate text-[15px] font-semibold">
                      {r.livre && <Sparkles size={13} className="mr-1 inline text-ouro" />}
                      {r.descricao} <span className="numero font-normal text-suave">· {r.proteina} g</span>
                    </div>
                  ))
                ) : (
                  <div className="truncate text-[15px] font-semibold">
                    {prato?.nome ?? (trabalho ? 'No trabalho' : 'Sem plano')}
                    {prato && <span className="numero font-normal text-suave"> · {prato.proteina} g</span>}
                  </div>
                )}
              </div>
              {comeu ? (
                <button
                  aria-label={`Desfazer ${NOMES_REFEICAO[ref]}`}
                  onClick={() => {
                    const r = regs[regs.length - 1];
                    if (!r.id) setEditarTrabalho(r);
                    else void apagarRegistro(r);
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-verde text-fundo active:scale-90"
                >
                  <Check size={24} strokeWidth={3} />
                </button>
              ) : prato ? (
                <Botao tamanho="sm" className="min-w-[64px]" onClick={() => registrarPrato(data, ref, prato)}>
                  Comi
                </Botao>
              ) : (
                <Botao tamanho="sm" variante="secundario" onClick={() => setFolha(ref)}>
                  <Plus size={16} />
                </Botao>
              )}
            </div>
            {!compacto && (
              <div className="mt-2 flex gap-1.5 pl-[76px]">
                {!trabalho && (
                  <button onClick={() => trocarNoPlano(data, ref)} className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-elevado px-3 text-xs font-semibold">
                    <RefreshCw size={13} /> Trocar
                  </button>
                )}
                <button onClick={() => setFolha(ref)} className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-elevado px-3 text-xs font-semibold">
                  <Plus size={13} /> Outro
                </button>
                {trabalho && regs[0] && !regs[0].id && (
                  <button onClick={() => setEditarTrabalho(regs[0])} className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-elevado px-3 text-xs font-semibold">
                    Ajustar
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <FolhaRefeicao data={data} refeicao={folha} aoFechar={() => setFolha(null)} pratos={pratos} />
      <FolhaTrabalho registro={editarTrabalho} aoFechar={() => setEditarTrabalho(null)} />
    </div>
  );
}

function FolhaTrabalho({ registro, aoFechar }: { registro: RegistroRefeicao | null; aoFechar: () => void }) {
  const [g, setG] = useState(registro?.proteina ?? 15);
  const [ultimo, setUltimo] = useState(registro);
  if (registro !== ultimo) {
    setUltimo(registro);
    setG(registro?.proteina ?? 15);
  }
  if (!registro) return null;
  return (
    <Folha aberta titulo={`${NOMES_REFEICAO[registro.refeicao]} no trabalho`} aoFechar={aoFechar}>
      <p className="mb-4 text-sm text-suave">Proteína estimada desta refeição. Ajuste se comeu mais ou menos.</p>
      <div className="mb-5 flex justify-center">
        <Contador valor={g} onChange={setG} passo={5} sufixo="g" grande />
      </div>
      <div className="grid gap-2">
        <Botao
          bloco
          tamanho="lg"
          onClick={async () => {
            await registrarLivre({ data: registro.data, refeicao: registro.refeicao, descricao: 'No trabalho', proteina: g, livre: false, origem: 'trabalho' });
            aoFechar();
          }}
        >
          Salvar {g} g
        </Botao>
        <Botao
          variante="perigo"
          bloco
          onClick={async () => {
            await registrarLivre({ data: registro.data, refeicao: registro.refeicao, descricao: 'Não comi', proteina: 0, livre: false, origem: 'trabalho' });
            aoFechar();
          }}
        >
          Não comi
        </Botao>
      </div>
    </Folha>
  );
}

/** Escolher outro prato do catálogo, registrar livre (banco de alimentos) ou marcar refeição livre. */
export function FolhaRefeicao({ data, refeicao, aoFechar, pratos }: { data: DataISO; refeicao: Refeicao | null; aoFechar: () => void; pratos: Prato[] }) {
  const [aba, setAba] = useState<'catalogo' | 'alimentos' | 'livre'>('catalogo');
  const alimentos = useLiveQuery(() => db.alimentos.toArray(), []);
  const config = useLiveQuery(() => db.configuracoes.get('app'), []);
  const segunda = inicioSemana(data);
  const livresSemana = useLiveQuery(
    () => db.refeicoes.where('data').between(segunda, addDias(segunda, 6), true, true).filter((r) => r.livre).count(),
    [segunda],
  );
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [livreDesc, setLivreDesc] = useState('');
  const [livreProt, setLivreProt] = useState(20);
  const [salvarNoPlano, setSalvarNoPlano] = useState(false);
  if (!refeicao) return null;
  const lista = pratos.filter((p) => p.refeicao === refeicao);
  const outros = pratos.filter((p) => p.refeicao !== refeicao);
  const limite = config?.refeicoesLivresSemana ?? 2;
  const totalAlim = Object.entries(qtd).reduce((t, [id, n]) => t + (alimentos?.find((a) => a.id === id)?.proteina ?? 0) * n, 0);

  return (
    <Folha aberta titulo={NOMES_REFEICAO[refeicao]} aoFechar={aoFechar}>
      <div className="mb-3 flex gap-2">
        <Chip ativo={aba === 'catalogo'} onClick={() => setAba('catalogo')}>
          Pratos
        </Chip>
        <Chip ativo={aba === 'alimentos'} onClick={() => setAba('alimentos')}>
          Alimentos
        </Chip>
        <Chip ativo={aba === 'livre'} onClick={() => setAba('livre')}>
          Refeição livre
        </Chip>
      </div>

      {aba === 'catalogo' && (
        <>
          <label className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-elevado/60 px-3 py-2 text-sm">
            Usar também no plano deste dia
            <Interruptor ligado={salvarNoPlano} onChange={setSalvarNoPlano} rotulo="Salvar no plano" />
          </label>
          <div className="space-y-2">
            {[...lista, ...outros].map((p, i) => (
              <div key={p.id}>
                {i === lista.length && outros.length > 0 && <div className="rotulo mb-2 mt-4">Outras refeições</div>}
                <button
                  onClick={async () => {
                    await registrarPrato(data, refeicao, p, 'catalogo');
                    if (salvarNoPlano) await definirPratoNoPlano(data, refeicao, p.id);
                    aoFechar();
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-borda/60 p-2 text-left active:scale-[0.99]"
                >
                  <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg">
                    <ImagemPrato prato={p} />
                  </div>
                  <span className="flex-1 font-semibold">{p.nome}</span>
                  <Selo>{p.proteina} g</Selo>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {aba === 'alimentos' && alimentos && (
        <>
          <p className="mb-2 text-xs text-suave">Valores aproximados por porção (base TACO).</p>
          <div className="space-y-1.5">
            {alimentos.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-xl border border-borda/60 px-3 py-1.5">
                <div className="flex-1">
                  <div className="text-sm font-semibold">{a.nome}</div>
                  <div className="text-xs text-suave">
                    {a.porcao} · {a.proteina} g
                  </div>
                </div>
                <Contador valor={qtd[a.id] ?? 0} passo={0.5} onChange={(v) => setQtd({ ...qtd, [a.id]: v })} />
              </div>
            ))}
          </div>
          <Botao
            className="sticky bottom-0 mt-3"
            bloco
            tamanho="lg"
            disabled={totalAlim <= 0}
            onClick={async () => {
              const desc = Object.entries(qtd)
                .filter(([, n]) => n > 0)
                .map(([id, n]) => `${n}× ${alimentos.find((a) => a.id === id)?.nome.split(' (')[0]}`)
                .join(', ');
              await registrarLivre({ data, refeicao, descricao: desc, proteina: Math.round(totalAlim), livre: false, origem: 'livre' });
              setQtd({});
              aoFechar();
            }}
          >
            Registrar {Math.round(totalAlim)} g de proteína
          </Botao>
        </>
      )}

      {aba === 'livre' && (
        <div className="space-y-3">
          <p className="text-sm text-suave">
            Doces e frituras ficam aqui. Você tem até {limite} refeições livres por semana, sem perder pontos.{' '}
            <strong className="text-texto">
              Usadas: {livresSemana ?? 0}/{limite}
            </strong>
          </p>
          <input className="campo" placeholder="O que foi? (ex.: pizza com a banda)" value={livreDesc} onChange={(e) => setLivreDesc(e.target.value)} />
          <div className="flex items-center justify-between">
            <span className="text-sm">Proteína aproximada</span>
            <Contador valor={livreProt} passo={5} sufixo="g" onChange={setLivreProt} />
          </div>
          <Botao
            bloco
            tamanho="lg"
            disabled={(livresSemana ?? 0) >= limite}
            onClick={async () => {
              await registrarLivre({ data, refeicao, descricao: livreDesc || 'Refeição livre', proteina: livreProt, livre: true, origem: 'livre' });
              setLivreDesc('');
              aoFechar();
            }}
          >
            <Sparkles size={18} /> Marcar refeição livre
          </Botao>
          {(livresSemana ?? 0) >= limite && <p className="text-center text-xs text-perigo">Limite da semana atingido. Registre em “Alimentos”.</p>}
        </div>
      )}
    </Folha>
  );
}
