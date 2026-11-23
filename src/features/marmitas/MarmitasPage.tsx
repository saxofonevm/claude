import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, ChefHat, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { db } from '@/db/db';
import { Botao, Cabecalho, Card, Contador, Interruptor, LinhaLink, Secao, Selo } from '@/components/ui';
import { ImagemPrato } from '@/components/Midia';
import { useAgora } from '@/hooks/dados';
import { totalEstoque, LIMITE_ALERTA, adicionarAoEstoque, consumirDoEstoque } from '@/domain/estoque';
import { formatar } from '@/lib/datas';
import { avisar } from '@/store/app';
import { concluirPreparo, gerarListaCompras, usePreparoAtual } from './servico';

export default function MarmitasPage() {
  const { hoje } = useAgora();
  const nav = useNavigate();
  const preparo = usePreparoAtual(hoje);
  const pratos = useLiveQuery(() => db.pratos.toArray(), []);
  const estoque = useLiveQuery(() => db.estoqueMarmitas.toArray(), []);
  const receitas = useLiveQuery(() => db.receitasBase.toArray(), []);
  const historico = useLiveQuery(() => db.preparos.filter((p) => p.concluido).reverse().limit(5).toArray(), []);
  const [incluirPlano, setIncluirPlano] = useState(true);
  if (!preparo || !pratos || !estoque || !receitas) return null;

  const marmitaveis = pratos.filter((p) => p.marmita || p.refeicao === 'almoco');
  const qtd = (id: string) => preparo.itens.find((i) => i.pratoId === id)?.porcoes ?? 0;
  const totalPlanejado = preparo.itens.reduce((t, i) => t + i.porcoes, 0);
  const total = totalEstoque(estoque);
  const baixo = total <= LIMITE_ALERTA;

  async function setQtd(id: string, n: number) {
    const itens = preparo!.itens.some((i) => i.pratoId === id)
      ? preparo!.itens.map((i) => (i.pratoId === id ? { ...i, porcoes: n } : i))
      : [...preparo!.itens, { pratoId: id, porcoes: n }];
    await db.preparos.update(preparo!.id!, { itens });
  }

  async function ajustarEstoque(pratoId: string, delta: number) {
    const p = pratos!.find((x) => x.id === pratoId);
    const novo = delta > 0 ? adicionarAoEstoque(estoque!, pratoId, p?.nome ?? '', delta) : consumirDoEstoque(estoque!, pratoId, -delta).estoque;
    await db.estoqueMarmitas.bulkPut(novo);
  }

  return (
    <>
      <Cabecalho titulo="Marmitas" subtitulo="Preparo na quinta e no domingo" voltar />

      <Card className={`mb-4 ${baixo ? 'border-perigo/50' : 'brilho-ouro'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${baixo ? 'bg-perigo/15 text-perigo' : 'bg-ouro/15 text-ouro'}`}>
            <Package size={28} />
          </div>
          <div className="flex-1">
            <div className="rotulo">Estoque na geladeira</div>
            <div className="numero text-3xl font-extrabold">
              {total} <span className="text-base font-semibold text-suave">marmitas</span>
            </div>
          </div>
        </div>
        {baixo && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-perigo/10 px-3 py-2 text-sm text-perigo">
            <AlertTriangle size={16} /> Estoque baixo. Planeje o próximo preparo.
          </p>
        )}
        {estoque.filter((e) => e.quantidade > 0).length > 0 && (
          <div className="mt-3 space-y-1 border-t border-borda/60 pt-3">
            {estoque
              .filter((e) => e.quantidade > 0)
              .map((e) => (
                <div key={e.pratoId} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-sm">{pratos.find((p) => p.id === e.pratoId)?.nome ?? e.nome}</span>
                  <button aria-label="Tirar uma" onClick={() => ajustarEstoque(e.pratoId, -1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-elevado">
                    <Minus size={14} />
                  </button>
                  <span className="numero w-6 text-center font-bold">{e.quantidade}</span>
                  <button aria-label="Somar uma" onClick={() => ajustarEstoque(e.pratoId, 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-elevado">
                    <Plus size={14} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </Card>

      <Secao titulo={`Planejador · ${totalPlanejado} porções`}>
        <Card className="space-y-2 p-3">
          {marmitaveis.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Link to={`/comida/prato/${p.id}`} className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                <ImagemPrato prato={p} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-semibold leading-tight">{p.nome}</div>
                <div className="text-xs text-suave">{p.proteina} g de proteína</div>
              </div>
              <Contador valor={qtd(p.id)} onChange={(n) => setQtd(p.id, n)} max={20} />
            </div>
          ))}
          <label className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-elevado/60 px-3 py-2 text-sm">
            <span>Incluir café, lanche e jantar do plano (dias em que você cozinha)</span>
            <Interruptor ligado={incluirPlano} onChange={setIncluirPlano} rotulo="Incluir plano" />
          </label>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Botao
              variante="secundario"
              onClick={async () => {
                await gerarListaCompras(preparo.itens, incluirPlano, hoje);
                nav('/marmitas/compras');
              }}
            >
              <ShoppingCart size={18} /> Lista de compras
            </Botao>
            <Botao
              disabled={totalPlanejado === 0}
              onClick={async () => {
                const n = await concluirPreparo(preparo, hoje);
                avisar(`+${n} marmitas no estoque`);
              }}
            >
              <ChefHat size={18} /> Preparei!
            </Botao>
          </div>
        </Card>
      </Secao>

      <Secao titulo="Bases em lote (passo a passo com timer)">
        <Card className="p-1">
          {receitas.map((r) => (
            <LinhaLink key={r.id} to={`/marmitas/receita/${r.id}`} icone={<ChefHat size={20} />} titulo={r.nome} detalhe={`${r.rende} · ${r.porcoes} porções`} />
          ))}
        </Card>
      </Secao>

      {historico && historico.length > 0 && (
        <Secao titulo="Últimos preparos">
          <Card className="space-y-2">
            {historico.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="capitalize">{formatar(h.data, "EEEE',' dd/MM")}</span>
                <Selo>{h.itens.reduce((t, i) => t + i.porcoes, 0)} marmitas</Selo>
              </div>
            ))}
          </Card>
        </Secao>
      )}
    </>
  );
}
