import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, MessageCircle, Phone, X } from 'lucide-react';
import { db } from '@/db/db';
import type { Gatilho } from '@/db/tipos';
import { Anel, Botao, Card, Chip, Secao } from '@/components/ui';
import { useAgora } from '@/hooks/dados';
import { NOMES_GATILHO } from '@/domain/alcool';
import { formatarTempo, vibrar } from '@/lib/utils';
import { avisar } from '@/store/app';
import { linkWhatsApp } from './AlcoolPage';

const DURACAO = 15 * 60;
const FASES = [
  { nome: 'Inspire pelo nariz', seg: 4, escala: 1 },
  { nome: 'Segure', seg: 7, escala: 1 },
  { nome: 'Solte pela boca', seg: 8, escala: 0.55 },
];
const ALTERNATIVAS = [
  'Água com gás, gelo e limão',
  'Comer algo agora (fome amplifica a vontade)',
  'Tocar 10 minutos de sax',
  'Caminhar 10 minutos',
  'Banho quente',
  'Mandar mensagem para alguém',
];

export default function VontadePage() {
  const nav = useNavigate();
  const { hoje } = useAgora();
  const config = useLiveQuery(() => db.configuracoes.get('app'), []);
  const [inicio] = useState(() => Date.now());
  const [, tique] = useState(0);
  const idRef = useRef<number | null>(null);
  const [gatilho, setGatilho] = useState<Gatilho | undefined>();

  useEffect(() => {
    const t = setInterval(() => tique((x) => x + 1), 250);
    let ativo = true;
    void db.vontades.add({ data: hoje, dataHora: new Date().toISOString(), passou: null }).then((id) => {
      if (ativo) idRef.current = id;
      else void db.vontades.delete(id);
    });
    return () => {
      ativo = false;
      clearInterval(t);
    };
  }, [hoje]);

  const decorrido = (Date.now() - inicio) / 1000;
  const restante = Math.max(0, DURACAO - decorrido);

  // ciclo 4-7-8 (19 s)
  const pos = decorrido % 19;
  let acc = 0;
  let fase = FASES[0];
  let restFase = 0;
  for (const f of FASES) {
    if (pos < acc + f.seg) {
      fase = f;
      restFase = Math.ceil(acc + f.seg - pos);
      break;
    }
    acc += f.seg;
  }
  const ultimaFase = useRef(fase.nome);
  useEffect(() => {
    if (ultimaFase.current !== fase.nome) {
      ultimaFase.current = fase.nome;
      vibrar(15);
    }
  }, [fase.nome]);

  async function finalizar(passou: boolean) {
    if (idRef.current) await db.vontades.update(idRef.current, { passou, gatilho });
    avisar(passou ? 'A vontade passou. Você venceu essa! 💪' : 'Tudo bem. Registre com honestidade e recomeça agora.', passou ? 'ok' : 'info');
    nav(-1);
  }

  return (
    <div className="safe-top pb-8 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Estou com vontade</h1>
        <button aria-label="Fechar" onClick={() => finalizar(true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado">
          <X size={20} />
        </button>
      </div>
      <p className="mb-4 text-sm text-suave">A vontade sobe, chega no pico e passa — quase sempre em menos de 15 minutos. Respira comigo.</p>

      <Card className="mb-4 flex flex-col items-center py-6">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div
            className="absolute rounded-full bg-ouro/20"
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${fase.escala})`,
              transition: `transform ${fase.nome.startsWith('Segure') ? 0.2 : fase.seg}s ease-in-out`,
            }}
          />
          <div
            className="absolute rounded-full bg-ouro/40"
            style={{ width: '70%', height: '70%', transform: `scale(${fase.escala})`, transition: `transform ${fase.seg}s ease-in-out` }}
          />
          <div className="relative text-center">
            <div className="text-lg font-bold">{fase.nome}</div>
            <div className="numero text-5xl font-extrabold text-ouro">{restFase}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-suave">Respiração 4-7-8: inspire 4 s · segure 7 s · solte 8 s</p>
      </Card>

      <Card className="mb-4 flex items-center gap-4">
        <Anel valor={DURACAO - restante} max={DURACAO} tamanho={88} espessura={8}>
          <span className="numero text-lg font-bold">{formatarTempo(restante)}</span>
        </Anel>
        <div className="flex-1 text-sm">
          {restante > 0 ? 'Fique só até o timer acabar. Depois você decide.' : <b className="text-verde">15 minutos! Como está a vontade agora?</b>}
        </div>
      </Card>

      {config && config.motivos.length > 0 && (
        <Secao titulo="Meus motivos">
          <Card className="space-y-2">
            {config.motivos.map((m) => (
              <p key={m} className="text-[15px] font-semibold">
                “{m}”
              </p>
            ))}
          </Card>
        </Secao>
      )}

      <Secao titulo="Faça outra coisa agora">
        <div className="grid grid-cols-2 gap-2">
          {ALTERNATIVAS.map((a) => (
            <div key={a} className="rounded-2xl border border-borda/60 bg-superficie p-3 text-sm font-medium">
              {a}
            </div>
          ))}
        </div>
      </Secao>

      {config?.contatoApoio.telefone && (
        <Secao titulo={`Falar com ${config.contatoApoio.nome || 'meu contato'}`}>
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${config.contatoApoio.telefone.replace(/\D/g, '')}`} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-elevado font-semibold">
              <Phone size={18} /> Ligar
            </a>
            <a
              href={linkWhatsApp(config.contatoApoio.telefone, 'Oi! Tô com vontade de beber, pode conversar um pouco?')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#25D366]/15 font-semibold text-[#25D366]"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
        </Secao>
      )}

      <Secao titulo="O que provocou a vontade?">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(NOMES_GATILHO) as Gatilho[]).map((g) => (
            <Chip key={g} ativo={gatilho === g} onClick={() => setGatilho(gatilho === g ? undefined : g)}>
              {NOMES_GATILHO[g]}
            </Chip>
          ))}
        </div>
      </Secao>

      <div className="grid grid-cols-2 gap-2">
        <Botao tamanho="lg" className="bg-verde text-fundo" onClick={() => finalizar(true)}>
          <Check size={20} /> A vontade passou
        </Botao>
        <Botao tamanho="lg" variante="secundario" onClick={() => finalizar(false)}>
          Não passou
        </Botao>
      </div>
    </div>
  );
}
