import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ClipboardPaste, Footprints, HeartPulse, Send } from 'lucide-react';
import { db } from '@/db/db';
import type { DataISO } from '@/db/tipos';
import { Botao, Folha } from '@/components/ui';
import { useConfig } from '@/hooks/dados';
import { aguaPendente, lerDadosSaude } from '@/domain/saude';
import { avisar } from '@/store/app';
import { enviarAguaAoSaude, enviarPesoAoSaude, lerAreaTransferencia, nomesAtalhos, resumoDados, rodarAtalho, salvarDadosSaude } from './servico';

/** "Buscar no Saúde" (roda o atalho) + "Colar dados do Saúde" (lê a área de transferência). */
export function ImportarSaude({ data }: { data: DataISO }) {
  const config = useConfig();
  const [manual, setManual] = useState(false);
  const [texto, setTexto] = useState('');

  async function colar() {
    const r = await lerAreaTransferencia();
    if (r.dados) {
      await salvarDadosSaude(data, r.dados);
      avisar(`Do Saúde: ${resumoDados(r.dados)}`);
    } else if (r.erro === 'vazio') {
      avisar('Não achei dados do Saúde. Rode o atalho primeiro.', 'info');
    } else setManual(true);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <Botao variante="secundario" onClick={() => rodarAtalho(nomesAtalhos(config).importar)}>
          <HeartPulse size={18} /> 1. Buscar no Saúde
        </Botao>
        <Botao onClick={colar}>
          <ClipboardPaste size={18} /> 2. Colar dados
        </Botao>
      </div>
      <p className="mt-2 text-xs text-suave">
        O atalho copia peso, cintura e passos; volte para cá e toque em “Colar dados”.{' '}
        <Link to="/saude" className="font-semibold text-ouro underline">
          Como montar o atalho
        </Link>
      </p>
      <Folha aberta={manual} aoFechar={() => setManual(false)} titulo="Colar dados do Saúde">
        <p className="mb-3 text-sm text-suave">O iPhone não liberou a leitura automática. Toque e segure no campo abaixo, escolha “Colar” e salve.</p>
        <textarea className="campo min-h-[90px]" placeholder="NOEIXO;peso=…;cintura=…;passos=…" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <Botao
          className="mt-3"
          bloco
          tamanho="lg"
          onClick={async () => {
            const d = lerDadosSaude(texto);
            if (!d) return avisar('Esse texto não veio do atalho do No Eixo', 'erro');
            await salvarDadosSaude(data, d);
            avisar(`Do Saúde: ${resumoDados(d)}`);
            setTexto('');
            setManual(false);
          }}
        >
          Salvar
        </Botao>
      </Folha>
    </div>
  );
}

/** Botão que envia peso e cintura do dia ao Saúde. */
export function EnviarPesoSaude({ data }: { data: DataISO }) {
  const config = useConfig();
  const medida = useLiveQuery(() => db.medidasCorpo.get(data), [data]);
  if (!medida?.peso) return null;
  return (
    <Botao
      variante="contorno"
      bloco
      onClick={async () => {
        if (await enviarPesoAoSaude(data, config)) avisar('Abrindo o Atalhos…', 'info');
      }}
    >
      <Send size={16} /> {medida.enviadoSaude ? 'Enviar de novo ao Saúde' : 'Enviar peso e cintura ao Saúde'}
    </Botao>
  );
}

/** Link discreto para enviar a água ainda não enviada ao Saúde. */
export function EnviarAguaSaude({ data }: { data: DataISO }) {
  const config = useConfig();
  const agua = useLiveQuery(() => db.agua.get(data), [data]);
  const pendente = aguaPendente(agua?.ml ?? 0, agua?.enviadoSaudeMl);
  if (pendente <= 0) return null;
  return (
    <button
      onClick={() => enviarAguaAoSaude(data, config)}
      className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-ouro"
    >
      <Send size={14} /> Enviar +{pendente} ml ao Saúde
    </button>
  );
}

/** Passos do dia importados do Saúde. */
export function PassosHoje({ data }: { data: DataISO }) {
  const r = useLiveQuery(() => db.saude.get(data), [data]);
  if (r?.passos === undefined) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-suave">
      <Footprints size={16} className="text-ouro" />
      <b className="numero text-texto">{r.passos.toLocaleString('pt-BR')}</b> passos hoje
    </span>
  );
}
