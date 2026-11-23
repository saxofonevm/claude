import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Clock, Pencil, Trash2, Utensils } from 'lucide-react';
import { db } from '@/db/db';
import type { Prato, Refeicao } from '@/db/tipos';
import { Botao, Cabecalho, Card, Chip, Contador, Secao, Selo, Vazio } from '@/components/ui';
import { BotaoFoto, ImagemPrato } from '@/components/Midia';
import { NOMES_REFEICAO, ORDEM_REFEICOES, PRATOS } from '@/data/pratos';
import { useAgora } from '@/hooks/dados';
import { registrarPrato } from './servico';
import { avisar } from '@/store/app';

export default function PratoPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const prato = useLiveQuery(() => db.pratos.get(id), [id]);
  const [editando, setEditando] = useState(params.get('editar') === '1');
  const { hoje } = useAgora();
  if (prato === undefined) return null;
  if (!prato) return <Vazio titulo="Prato não encontrado" />;

  return (
    <>
      <Cabecalho
        titulo={prato.nome}
        subtitulo={NOMES_REFEICAO[prato.refeicao]}
        voltar
        acao={
          <button aria-label="Editar prato" onClick={() => setEditando(!editando)} className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado">
            <Pencil size={18} />
          </button>
        }
      />
      {editando ? (
        <Editor prato={prato} aoTerminar={() => setEditando(false)} />
      ) : (
        <>
          <Card className="mb-4 overflow-hidden p-0">
            <div className="aspect-[4/3] w-full">
              <ImagemPrato prato={prato} />
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3">
              <Selo>{prato.proteina} g de proteína</Selo>
              <Selo cor="suave">
                <Clock size={12} /> {prato.tempoMin} min
              </Selo>
              {prato.marmita && <Selo cor="verde">vira marmita</Selo>}
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-borda/60 p-3">
              <Botao onClick={() => registrarPrato(hoje, prato.refeicao, prato, 'catalogo')}>
                <Utensils size={18} /> Comi agora
              </Botao>
              <BotaoFoto
                tipo="prato"
                refFoto={`prato:${prato.id}`}
                fotoAtual={prato.fotoId}
                texto={prato.fotoId ? 'Trocar foto' : 'Fotografar meu prato'}
                aoSalvar={(fid) => db.pratos.update(prato.id, { fotoId: fid })}
              />
            </div>
          </Card>
          <Secao titulo="Ingredientes">
            <Card>
              <ul className="space-y-2">
                {prato.ingredientes.map((i, k) => (
                  <li key={k} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ouro" />
                    {i.texto}
                  </li>
                ))}
              </ul>
            </Card>
          </Secao>
          <Secao titulo="Modo de preparo">
            <Card>
              <ol className="space-y-3">
                {prato.preparo.map((p, k) => (
                  <li key={k} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ouro/15 text-sm font-bold text-ouro">{k + 1}</span>
                    <span className="pt-0.5">{p}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </Secao>
        </>
      )}
    </>
  );
}

function Editor({ prato, aoTerminar }: { prato: Prato; aoTerminar: () => void }) {
  const nav = useNavigate();
  const [nome, setNome] = useState(prato.nome);
  const [refeicao, setRefeicao] = useState<Refeicao>(prato.refeicao);
  const [proteina, setProteina] = useState(prato.proteina);
  const [tempo, setTempo] = useState(prato.tempoMin);
  const [ingredientes, setIngredientes] = useState(prato.ingredientes.map((i) => i.texto).join('\n'));
  const [preparo, setPreparo] = useState(prato.preparo.join('\n'));
  const original = PRATOS.find((p) => p.id === prato.id);

  async function salvar() {
    const linhas = ingredientes.split('\n').map((l) => l.trim()).filter(Boolean);
    await db.pratos.update(prato.id, {
      nome: nome.trim() || prato.nome,
      refeicao,
      proteina,
      tempoMin: tempo,
      ingredientes: linhas.map((texto) => prato.ingredientes.find((i) => i.texto === texto) ?? { texto }),
      preparo: preparo.split('\n').map((l) => l.trim()).filter(Boolean),
    });
    avisar('Prato salvo');
    aoTerminar();
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="rotulo">Nome</span>
        <input className="campo mt-1" value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <div>
        <span className="rotulo">Refeição</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {ORDEM_REFEICOES.map((r) => (
            <Chip key={r} ativo={refeicao === r} onClick={() => setRefeicao(r)}>
              {NOMES_REFEICAO[r]}
            </Chip>
          ))}
        </div>
      </div>
      <Card className="flex justify-around">
        <Contador rotulo="proteína (g)" valor={proteina} passo={1} onChange={setProteina} />
        <Contador rotulo="tempo (min)" valor={tempo} passo={5} onChange={setTempo} />
      </Card>
      <label className="block">
        <span className="rotulo">Ingredientes (um por linha)</span>
        <textarea className="campo mt-1 min-h-[120px]" value={ingredientes} onChange={(e) => setIngredientes(e.target.value)} />
      </label>
      <label className="block">
        <span className="rotulo">Modo de preparo (um passo por linha)</span>
        <textarea className="campo mt-1 min-h-[120px]" value={preparo} onChange={(e) => setPreparo(e.target.value)} />
      </label>
      <Botao bloco tamanho="lg" onClick={salvar}>
        Salvar
      </Botao>
      {original && (
        <Botao
          bloco
          variante="fantasma"
          onClick={async () => {
            await db.pratos.put({ ...original, fotoId: prato.fotoId });
            avisar('Prato restaurado');
            aoTerminar();
          }}
        >
          Restaurar original
        </Botao>
      )}
      {prato.personalizado && (
        <Botao
          bloco
          variante="perigo"
          onClick={async () => {
            if (!confirm('Apagar este prato?')) return;
            await db.pratos.delete(prato.id);
            nav('/comida/catalogo', { replace: true });
          }}
        >
          <Trash2 size={18} /> Apagar prato
        </Botao>
      )}
    </div>
  );
}
