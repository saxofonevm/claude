import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowUpRight, Phone, MessageCircle, Plus, ShieldCheck, Trash2, Wind, Mic2 } from 'lucide-react';
import { db } from '@/db/db';
import type { DataISO, FaseAlcool } from '@/db/tipos';
import { Aviso, Botao, Cabecalho, Card, Chip, Contador, Folha, Numero, Secao } from '@/components/ui';
import { useAgora, useConfig, usePerfil, salvarConfig } from '@/hooks/dados';
import { addDias, diaSemana, formatar, inicioSemana, NOMES_DIAS, NOMES_DIAS_CURTOS } from '@/lib/datas';
import { diasDeRisco, diasSemBeber, dosesNoPeriodo, economizado, mapaGatilhos, NOMES_FASE, NOMES_GATILHO, recordeSemBeber, sugerirAvanco } from '@/domain/alcool';
import { cn, moeda } from '@/lib/utils';
import { avisar } from '@/store/app';
import { FolhaBebi, RegistroAlcoolRapido, registrarNaoBebi } from './RegistroAlcool';

export function linkWhatsApp(tel: string, texto = '') {
  const n = tel.replace(/\D/g, '');
  const num = n.length <= 11 ? `55${n}` : n;
  return `https://wa.me/${num}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}

export default function AlcoolPage() {
  const { hoje } = useAgora();
  const perfil = usePerfil();
  const config = useConfig();
  const registros = useLiveQuery(() => db.registrosAlcool.toArray(), []);
  const vontades = useLiveQuery(() => db.vontades.toArray(), []);
  const [diaSel, setDiaSel] = useState<DataISO | null>(null);
  const [novoMotivo, setNovoMotivo] = useState('');
  if (!perfil || !config || !registros || !vontades) return null;
  const a = config.alcool;
  const seg = inicioSemana(hoje);
  const sugestao = sugerirAvanco(registros, hoje, a);
  const gat = mapaGatilhos(registros, vontades);
  const risco = diasDeRisco(registros, vontades);
  const maxRisco = Math.max(1, ...risco);
  const maxGat = Math.max(1, ...gat.map((g) => g.total));
  const ultimos = Array.from({ length: 14 }, (_, i) => addDias(hoje, i - 13));
  const salvarAlcool = (p: Partial<typeof a>) => salvarConfig({ alcool: { ...a, ...p } });

  return (
    <>
      <Cabecalho titulo="Álcool" subtitulo={`Fase: ${NOMES_FASE[a.fase]}`} voltar />

      {!a.definido && (
        <Card className="mb-4 border-ouro/60">
          <div className="mb-1 font-bold">Defina o seu dia permitido</div>
          <p className="mb-3 text-sm text-suave">No máximo 1 dia fixo por semana. O objetivo final é tirar a bebida da sua vida.</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {NOMES_DIAS_CURTOS.map((n, d) => (
              <Chip key={d} ativo={a.diaPermitido === d} onClick={() => salvarAlcool({ diaPermitido: d })}>
                {n}
              </Chip>
            ))}
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm">Limite de doses</span>
            <Contador valor={a.limiteDoses} min={0} max={10} onChange={(v) => salvarAlcool({ limiteDoses: v })} />
          </div>
          <Botao
            bloco
            onClick={async () => {
              await salvarAlcool({ definido: true, faseDesde: hoje });
              await salvarConfig({ semana0: { ...config.semana0, alcool: true } });
              avisar('Combinado!');
            }}
          >
            Confirmar {NOMES_DIAS[a.diaPermitido].toLowerCase()} · até {a.limiteDoses} doses
          </Botao>
        </Card>
      )}

      {sugestao && (
        <Card className="mb-4 border-verde/60 bg-verde/10">
          <div className="flex items-center gap-2 font-bold text-verde">
            <ArrowUpRight size={18} /> 4 semanas cumprindo a fase!
          </div>
          <p className="mt-1 text-sm">
            Quer avançar para <b>{NOMES_FASE[sugestao]}</b>? Quem decide é você.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Botao onClick={() => salvarAlcool({ fase: sugestao, faseDesde: hoje })}>Avançar</Botao>
            <Botao variante="secundario" onClick={() => salvarAlcool({ faseDesde: hoje })}>
              Ainda não
            </Botao>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <div className="rotulo mb-2">Hoje</div>
        <RegistroAlcoolRapido data={hoje} />
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Link to="/alcool/vontade" className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-perigo/15 font-bold text-perigo active:scale-95">
          <Wind size={20} /> Estou com vontade
        </Link>
        <Link to="/alcool/show" className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-ouro/15 font-bold text-ouro active:scale-95">
          <Mic2 size={20} /> Plano do show
        </Link>
      </div>

      <Card className="mb-4 grid grid-cols-2 gap-4 brilho-ouro">
        <Numero valor={diasSemBeber(registros, hoje, perfil.dataInicio)} rotulo="dias sem beber" />
        <Numero valor={recordeSemBeber(registros, hoje, perfil.dataInicio)} rotulo="recorde" />
        <Numero valor={dosesNoPeriodo(registros, seg, addDias(seg, 6))} rotulo="doses na semana" />
        <Numero valor={dosesNoPeriodo(registros, hoje.slice(0, 8) + '01', hoje)} rotulo="doses no mês" />
        <Numero className="col-span-2" valor={moeda(economizado(registros, perfil.dataInicio, hoje, a))} rotulo={`economizado (base: ${a.dosesPorSemanaAntes} doses/semana a ${moeda(a.precoDose)})`} />
      </Card>

      <Secao titulo="Últimos 14 dias (toque para registrar)">
        <Card>
          <div className="grid grid-cols-7 gap-1.5">
            {ultimos.map((d) => {
              const r = registros.find((x) => x.data === d);
              return (
                <button
                  key={d}
                  onClick={() => setDiaSel(d)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-xl text-[10px] font-semibold',
                    r ? (r.bebeu ? 'bg-ouro/25 text-ouro' : 'bg-verde/25 text-verde') : 'bg-elevado text-suave',
                    d === hoje && 'ring-2 ring-texto/30',
                  )}
                >
                  <span>{NOMES_DIAS_CURTOS[diaSemana(d)]}</span>
                  <span className="text-sm">{r ? (r.bebeu ? r.doses : '✓') : formatar(d, 'd')}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </Secao>

      <Secao titulo="Mapa de gatilhos">
        <Card className="space-y-3">
          {gat.length === 0 ? (
            <p className="text-sm text-suave">Sem gatilhos registrados ainda.</p>
          ) : (
            gat.map((g) => (
              <div key={g.gatilho} className="flex items-center gap-2">
                <span className="w-24 text-sm">{NOMES_GATILHO[g.gatilho]}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-borda/40">
                  <div className="h-full rounded-full bg-ouro" style={{ width: `${(g.total / maxGat) * 100}%` }} />
                </div>
                <span className="numero w-6 text-right text-sm font-bold">{g.total}</span>
              </div>
            ))
          )}
          <div className="border-t border-borda/60 pt-3">
            <div className="rotulo mb-2">Dias de maior risco</div>
            <div className="flex h-24 items-end gap-1.5">
              {risco.map((n, d) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-1">
                  <div className={cn('w-full rounded-t-md', n === maxRisco && n > 0 ? 'bg-perigo' : 'bg-ouro/50')} style={{ height: `${Math.max(4, (n / maxRisco) * 72)}px` }} />
                  <span className="text-[10px] text-suave">{NOMES_DIAS_CURTOS[d]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Secao>

      <Secao titulo="Meus motivos para parar">
        <Card className="space-y-2">
          {config.motivos.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0 text-ouro" />
              <span className="flex-1">{m}</span>
              <button aria-label="Remover motivo" onClick={() => salvarConfig({ motivos: config.motivos.filter((_, k) => k !== i) })} className="flex h-10 w-10 items-center justify-center text-suave">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input className="campo" placeholder="Escreva um motivo" value={novoMotivo} onChange={(e) => setNovoMotivo(e.target.value)} />
            <Botao
              aria-label="Adicionar motivo"
              disabled={!novoMotivo.trim()}
              onClick={async () => {
                await salvarConfig({ motivos: [...config.motivos, novoMotivo.trim()] });
                setNovoMotivo('');
              }}
            >
              <Plus size={18} />
            </Botao>
          </div>
        </Card>
      </Secao>

      <Secao titulo="Contato de apoio">
        <Card className="space-y-2">
          <input className="campo" placeholder="Nome" value={config.contatoApoio.nome} onChange={(e) => salvarConfig({ contatoApoio: { ...config.contatoApoio, nome: e.target.value } })} />
          <input
            className="campo"
            type="tel"
            inputMode="tel"
            placeholder="Telefone com DDD"
            value={config.contatoApoio.telefone}
            onChange={(e) => salvarConfig({ contatoApoio: { ...config.contatoApoio, telefone: e.target.value } })}
          />
          {config.contatoApoio.telefone && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a href={`tel:${config.contatoApoio.telefone.replace(/\D/g, '')}`} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-elevado font-semibold">
                <Phone size={18} /> Ligar
              </a>
              <a
                href={linkWhatsApp(config.contatoApoio.telefone, 'Oi! Tô com vontade de beber, pode conversar um pouco?')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 font-semibold text-[#25D366]"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          )}
        </Card>
      </Secao>

      <Secao titulo="Regras">
        <Card className="space-y-4">
          <div>
            <div className="mb-2 text-sm">Fase</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(NOMES_FASE) as FaseAlcool[]).map((f) => (
                <Chip key={f} ativo={a.fase === f} onClick={() => salvarAlcool({ fase: f, faseDesde: hoje })}>
                  {NOMES_FASE[f]}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm">Dia permitido</div>
            <div className="flex flex-wrap gap-2">
              {NOMES_DIAS_CURTOS.map((n, d) => (
                <Chip key={d} ativo={a.diaPermitido === d} onClick={() => salvarAlcool({ diaPermitido: d, definido: true })}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Limite de doses</span>
            <Contador valor={a.limiteDoses} min={0} max={10} onChange={(v) => salvarAlcool({ limiteDoses: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Preço médio da dose (R$)</span>
            <Contador valor={a.precoDose} min={0} max={100} onChange={(v) => salvarAlcool({ precoDose: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Doses por semana antes</span>
            <Contador valor={a.dosesPorSemanaAntes} min={0} max={100} onChange={(v) => salvarAlcool({ dosesPorSemanaAntes: v })} />
          </div>
        </Card>
      </Secao>

      <Aviso>Se você bebia todos os dias e em grande quantidade, faça a redução com acompanhamento médico.</Aviso>

      <FolhaDia data={diaSel} aoFechar={() => setDiaSel(null)} />
    </>
  );
}

function FolhaDia({ data, aoFechar }: { data: DataISO | null; aoFechar: () => void }) {
  const [bebi, setBebi] = useState(false);
  if (!data) return null;
  if (bebi)
    return (
      <FolhaBebi
        data={data}
        aberta
        aoFechar={() => {
          setBebi(false);
          aoFechar();
        }}
      />
    );
  return (
    <Folha aberta titulo={formatar(data, "EEEE',' dd/MM")} aoFechar={aoFechar}>
      <div className="grid gap-2">
        <Botao
          tamanho="lg"
          className="bg-verde text-fundo"
          onClick={async () => {
            await registrarNaoBebi(data);
            aoFechar();
          }}
        >
          Não bebi
        </Botao>
        <Botao tamanho="lg" variante="secundario" onClick={() => setBebi(true)}>
          Bebi
        </Botao>
        <Botao
          variante="fantasma"
          onClick={async () => {
            await db.registrosAlcool.delete(data);
            aoFechar();
          }}
        >
          Apagar registro
        </Botao>
      </div>
    </Folha>
  );
}
