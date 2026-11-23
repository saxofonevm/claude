import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bell, BellOff, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { db } from '@/db/db';
import type { RotinaItem, TipoDia } from '@/db/tipos';
import { Aviso, Botao, Cabecalho, Card, Chip } from '@/components/ui';
import { NOMES_TIPO_DIA } from '@/data/rotina';
import { diasDoTipo } from '@/domain/rotina';
import { useConfig } from '@/hooks/dados';
import { NOMES_DIAS_CURTOS, minutosDoDia } from '@/lib/datas';
import { restaurarPadrao } from '@/db/seed';
import { avisar } from '@/store/app';

const TIPOS = Object.keys(NOMES_TIPO_DIA) as TipoDia[];

export default function EditorRotinaPage() {
  const config = useConfig();
  const rotina = useLiveQuery(() => db.rotina.toArray(), []);
  const [tipo, setTipo] = useState<TipoDia>('treino');
  if (!rotina || !config) return null;
  const itens = rotina.filter((r) => r.tipoDia === tipo).sort((a, b) => minutosDoDia(a.hora) - minutosDoDia(b.hora));
  const dias = diasDoTipo(tipo, config);

  const atualizar = (id: string, p: Partial<RotinaItem>) => db.rotina.update(id, p);

  return (
    <>
      <Cabecalho titulo="Editar rotina" voltar />
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {TIPOS.map((t) => (
          <Chip key={t} ativo={t === tipo} onClick={() => setTipo(t)}>
            {NOMES_TIPO_DIA[t]}
          </Chip>
        ))}
      </div>
      <p className="mb-3 px-1 text-sm text-suave">
        Acontece em: <strong className="text-texto">{dias.length ? dias.map((d) => NOMES_DIAS_CURTOS[d]).join(', ') : 'nenhum dia'}</strong>. Os dias de treino, show e
        trabalho se mudam em Configurações.
      </p>
      <div className="space-y-2">
        {itens.map((i) => (
          <Card key={i.id} className="space-y-2 p-3">
            <div className="flex gap-2">
              <input type="time" aria-label="Horário" className="campo w-[110px]" value={i.hora} onChange={(e) => atualizar(i.id, { hora: e.target.value })} />
              <input
                type="time"
                aria-label="Até"
                className="campo w-[110px]"
                value={i.horaFim ?? ''}
                onChange={(e) => atualizar(i.id, { horaFim: e.target.value || undefined })}
              />
              <button
                aria-label={i.lembrete ? 'Tirar lembrete' : 'Adicionar lembrete'}
                onClick={() => atualizar(i.id, { lembrete: !i.lembrete })}
                className={`ml-auto flex h-11 w-11 items-center justify-center rounded-xl ${i.lembrete ? 'bg-ouro/15 text-ouro' : 'bg-elevado text-suave'}`}
              >
                {i.lembrete ? <Bell size={18} /> : <BellOff size={18} />}
              </button>
              <button
                aria-label="Apagar"
                onClick={() => confirm(`Apagar "${i.titulo}"?`) && db.rotina.delete(i.id)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-elevado text-suave"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <input className="campo font-semibold" value={i.titulo} onChange={(e) => atualizar(i.id, { titulo: e.target.value })} aria-label="Tarefa" />
            <input className="campo text-sm" placeholder="Detalhe (opcional)" value={i.detalhe ?? ''} onChange={(e) => atualizar(i.id, { detalhe: e.target.value })} />
          </Card>
        ))}
      </div>
      <Botao
        className="mt-3"
        bloco
        variante="secundario"
        onClick={() =>
          db.rotina.put({ id: `meu-${Date.now()}`, tipoDia: tipo, hora: '12:00', titulo: 'Nova tarefa', ordem: itens.length + 1 })
        }
      >
        <Plus size={18} /> Adicionar tarefa
      </Botao>
      <Aviso className="mt-4">O sino indica as tarefas que viram lembretes no arquivo .ics do Calendário do iPhone (em Configurações).</Aviso>
      <Botao
        className="mt-3"
        bloco
        variante="fantasma"
        onClick={async () => {
          if (!confirm('Restaurar a rotina padrão? Suas edições serão perdidas.')) return;
          await restaurarPadrao('rotina');
          avisar('Rotina restaurada');
        }}
      >
        <RotateCcw size={16} /> Restaurar rotina padrão
      </Botao>
    </>
  );
}
