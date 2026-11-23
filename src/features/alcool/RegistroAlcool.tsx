import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Beer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { db } from '@/db/db';
import type { DataISO, Gatilho } from '@/db/tipos';
import { Botao, Chip, Contador, Folha } from '@/components/ui';
import { NOMES_GATILHO, permitidoNoDia } from '@/domain/alcool';
import { cn, vibrar } from '@/lib/utils';
import { avisar } from '@/store/app';

export async function registrarNaoBebi(data: DataISO) {
  await db.registrosAlcool.put({ data, bebeu: false, doses: 0 });
  vibrar(30);
  avisar('Dia sem álcool registrado. +30 pts');
}

/** Registro de álcool em 2 toques: "Não bebi" ou "Bebi" + doses. */
export function RegistroAlcoolRapido({ data }: { data: DataISO }) {
  const registro = useLiveQuery(() => db.registrosAlcool.get(data), [data], null);
  const config = useLiveQuery(() => db.configuracoes.get('app'), []);
  const [bebi, setBebi] = useState(false);
  if (registro === null || !config) return <div className="h-14" />;

  if (registro)
    return (
      <div className="flex items-center gap-3">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-full', registro.bebeu ? 'bg-ouro/15 text-ouro' : 'bg-verde/15 text-verde')}>
          {registro.bebeu ? <Beer size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{registro.bebeu ? `Bebi · ${registro.doses} ${registro.doses === 1 ? 'dose' : 'doses'}` : 'Não bebi hoje'}</div>
          <div className="text-xs text-suave">
            {registro.bebeu ? (registro.gatilho ? `Gatilho: ${NOMES_GATILHO[registro.gatilho]}` : 'Registrado') : 'Seguindo no eixo'}
          </div>
        </div>
        <button className="min-h-[44px] px-2 text-sm font-semibold text-suave underline" onClick={() => db.registrosAlcool.delete(data)}>
          Corrigir
        </button>
      </div>
    );

  const permitido = permitidoNoDia(data, config.alcool, []);
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Botao tamanho="lg" className="bg-verde text-fundo hover:bg-verde/90" onClick={() => registrarNaoBebi(data)}>
          <CheckCircle2 size={20} /> Não bebi
        </Botao>
        <Botao tamanho="lg" variante="secundario" onClick={() => setBebi(true)}>
          <Beer size={20} /> Bebi
        </Botao>
      </div>
      {!permitido && config.alcool.definido && <p className="mt-2 text-center text-xs text-suave">Hoje não é o seu dia permitido.</p>}
      <FolhaBebi data={data} aberta={bebi} aoFechar={() => setBebi(false)} />
    </>
  );
}

export function FolhaBebi({ data, aberta, aoFechar }: { data: DataISO; aberta: boolean; aoFechar: () => void }) {
  const [doses, setDoses] = useState(1);
  const [gatilho, setGatilho] = useState<Gatilho | undefined>();
  const [onde, setOnde] = useState('');
  return (
    <Folha aberta={aberta} aoFechar={aoFechar} titulo="Registrar bebida">
      <p className="mb-4 text-sm text-suave">Sem julgamento. Registrar é o que permite entender e ajustar.</p>
      <div className="mb-5 flex justify-center">
        <Contador valor={doses} onChange={setDoses} min={1} max={30} sufixo={doses === 1 ? ' dose' : ' doses'} grande />
      </div>
      <div className="rotulo mb-2">Gatilho</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(NOMES_GATILHO) as Gatilho[]).map((g) => (
          <Chip key={g} ativo={gatilho === g} onClick={() => setGatilho(gatilho === g ? undefined : g)}>
            {NOMES_GATILHO[g]}
          </Chip>
        ))}
      </div>
      <input className="campo mb-4" placeholder="Onde? (opcional)" value={onde} onChange={(e) => setOnde(e.target.value)} />
      <Botao
        bloco
        tamanho="lg"
        onClick={async () => {
          await db.registrosAlcool.put({ data, bebeu: true, doses, gatilho, onde: onde || undefined });
          avisar('Registrado. Amanhã é outro dia: recomeça agora.', 'info');
          aoFechar();
        }}
      >
        Salvar
      </Botao>
    </Folha>
  );
}
