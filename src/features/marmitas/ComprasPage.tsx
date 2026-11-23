import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Copy, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { db } from '@/db/db';
import type { Secao as SecaoT } from '@/db/tipos';
import { Botao, Cabecalho, Card, Chip, Secao, Vazio } from '@/components/ui';
import { agruparPorSecao, formatarQtd, ORDEM_SECOES, textoWhatsApp } from '@/domain/listaCompras';
import { NOMES_SECAO } from '@/data/pratos';
import { cn, copiarTexto } from '@/lib/utils';
import { avisar } from '@/store/app';

export default function ComprasPage() {
  const itens = useLiveQuery(() => db.listaCompras.toArray(), []);
  const [novo, setNovo] = useState('');
  const [secao, setSecao] = useState<SecaoT>('mercearia');
  if (!itens) return null;
  const grupos = agruparPorSecao(itens);
  const marcados = itens.filter((i) => i.marcado).length;

  return (
    <>
      <Cabecalho titulo="Lista de compras" subtitulo={`${marcados} de ${itens.length} no carrinho`} voltar />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Botao
          variante="secundario"
          onClick={async () => {
            const ok = await copiarTexto(textoWhatsApp(itens));
            avisar(ok ? 'Lista copiada. Cole no WhatsApp!' : 'Não foi possível copiar', ok ? 'ok' : 'erro');
          }}
        >
          <Copy size={18} /> Copiar lista
        </Botao>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(textoWhatsApp(itens))}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 font-semibold text-[#25D366]"
        >
          <MessageCircle size={18} /> WhatsApp
        </a>
      </div>

      {itens.length === 0 ? (
        <Vazio titulo="Lista vazia" texto="Gere a lista no planejador de marmitas ou adicione itens abaixo." />
      ) : (
        grupos.map((g) => (
          <Secao key={g.secao} titulo={g.nome}>
            <Card className="divide-y divide-borda/50 p-0">
              {g.itens.map((i) => (
                <div key={i.id} className="flex items-center">
                  <button
                    onClick={() => db.listaCompras.update(i.id, { marcado: !i.marcado })}
                    className="flex min-h-[52px] flex-1 items-center gap-3 px-4 py-2 text-left"
                  >
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2', i.marcado ? 'border-verde bg-verde text-fundo' : 'border-borda')}>
                      {i.marcado && <Check size={16} strokeWidth={3} />}
                    </span>
                    <span className={cn('flex-1', i.marcado && 'text-suave line-through')}>{i.nome}</span>
                    {i.qtd > 0 && <span className="numero text-sm font-semibold text-suave">{formatarQtd(i.qtd, i.un)}</span>}
                  </button>
                  {i.manual && (
                    <button aria-label={`Remover ${i.nome}`} onClick={() => db.listaCompras.delete(i.id)} className="flex h-11 w-11 items-center justify-center text-suave">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </Card>
          </Secao>
        ))
      )}

      <Secao titulo="Adicionar item">
        <Card className="space-y-3">
          <input className="campo" placeholder="Ex.: azeite, café, papel-toalha" value={novo} onChange={(e) => setNovo(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {ORDEM_SECOES.map((s) => (
              <Chip key={s} ativo={secao === s} onClick={() => setSecao(s)}>
                {NOMES_SECAO[s]}
              </Chip>
            ))}
          </div>
          <Botao
            bloco
            disabled={!novo.trim()}
            onClick={async () => {
              await db.listaCompras.put({ id: `manual-${Date.now()}`, nome: novo.trim(), secao, qtd: 0, un: 'un', marcado: false, manual: true });
              setNovo('');
            }}
          >
            <Plus size={18} /> Adicionar
          </Botao>
        </Card>
      </Secao>
      {marcados > 0 && (
        <Botao variante="fantasma" bloco onClick={() => db.listaCompras.toCollection().modify({ marcado: false })}>
          Desmarcar tudo
        </Botao>
      )}
    </>
  );
}
