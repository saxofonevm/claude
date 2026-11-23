import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Clock, Plus, Search } from 'lucide-react';
import { db } from '@/db/db';
import type { Refeicao } from '@/db/tipos';
import { Cabecalho, Chip, Selo } from '@/components/ui';
import { ImagemPrato } from '@/components/Midia';
import { NOMES_REFEICAO, ORDEM_REFEICOES } from '@/data/pratos';

export default function CatalogoPage() {
  const pratos = useLiveQuery(() => db.pratos.toArray(), []);
  const [filtro, setFiltro] = useState<Refeicao | 'todos'>('todos');
  const [busca, setBusca] = useState('');
  const nav = useNavigate();
  if (!pratos) return null;
  const lista = pratos.filter(
    (p) => (filtro === 'todos' || p.refeicao === filtro) && p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  async function novo() {
    const id = `meu-${Date.now()}`;
    await db.pratos.put({
      id,
      nome: 'Novo prato',
      refeicao: filtro === 'todos' ? 'jantar' : filtro,
      ingredientes: [],
      preparo: [],
      tempoMin: 10,
      proteina: 20,
      ilustracao: 'marmita',
      personalizado: true,
    });
    nav(`/comida/prato/${id}?editar=1`);
  }

  return (
    <>
      <Cabecalho
        titulo="Catálogo de pratos"
        voltar
        acao={
          <button aria-label="Novo prato" onClick={novo} className="flex h-11 w-11 items-center justify-center rounded-full bg-ouro text-fundo">
            <Plus size={22} />
          </button>
        }
      />
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-suave" />
        <input className="campo pl-10" placeholder="Buscar prato" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip ativo={filtro === 'todos'} onClick={() => setFiltro('todos')}>
          Todos
        </Chip>
        {ORDEM_REFEICOES.map((r) => (
          <Chip key={r} ativo={filtro === r} onClick={() => setFiltro(r)}>
            {NOMES_REFEICAO[r]}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {lista.map((p, i) => (
          <Link key={p.id} to={`/comida/prato/${p.id}`} className="card animate-entrar overflow-hidden p-0" style={{ animationDelay: `${i * 25}ms` }}>
            <div className="aspect-[4/3] w-full">
              <ImagemPrato prato={p} />
            </div>
            <div className="p-3">
              <div className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-tight">{p.nome}</div>
              <div className="mt-2 flex items-center gap-2">
                <Selo>{p.proteina} g</Selo>
                <span className="flex items-center gap-1 text-xs text-suave">
                  <Clock size={12} /> {p.tempoMin} min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
