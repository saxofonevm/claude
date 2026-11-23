import { useLiveQuery } from 'dexie-react-hooks';
import { Droplets, Footprints, HeartPulse, Play, Scale, Smartphone } from 'lucide-react';
import { db } from '@/db/db';
import { Aviso, Cabecalho, Card, Chip, Secao } from '@/components/ui';
import { salvarConfig, useAgora, useConfig } from '@/hooks/dados';
import { addDias, formatar } from '@/lib/datas';
import { ATALHOS_PADRAO, textoPeso } from '@/domain/saude';
import { ImportarSaude } from './Componentes';
import { nomesAtalhos, rodarAtalho } from './servico';

function Passos({ itens }: { itens: string[] }) {
  return (
    <ol className="space-y-2.5">
      {itens.map((t, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ouro/15 text-xs font-bold text-ouro">{i + 1}</span>
          <span className="text-[15px] leading-snug" dangerouslySetInnerHTML={{ __html: t }} />
        </li>
      ))}
    </ol>
  );
}

export default function SaudePage() {
  const { hoje } = useAgora();
  const config = useConfig();
  const semana = useLiveQuery(() => db.saude.where('data').between(addDias(hoje, -6), hoje, true, true).toArray(), [hoje]);
  if (!config || !semana) return null;
  const nomes = nomesAtalhos(config);
  const decimal = config.atalhosDecimal ?? 'virgula';
  const exemplo = textoPeso(74.5, 90, decimal);
  const maxPassos = Math.max(1, ...semana.map((s) => s.passos ?? 0));

  return (
    <>
      <Cabecalho titulo="App Saúde" subtitulo="Integração pelo app Atalhos do iPhone" voltar />

      <Card className="mb-4 brilho-ouro">
        <div className="flex gap-3">
          <HeartPulse className="shrink-0 text-ouro" />
          <p className="text-[15px] leading-relaxed">
            Apps instalados pelo Safari não acessam o Saúde direto. A ponte é o app <b>Atalhos</b> (já vem no iPhone): você monta 3 atalhos uma vez só, uns 10
            minutos, e depois é 1 toque.
          </p>
        </div>
      </Card>

      <Secao titulo="Buscar dados do Saúde agora">
        <Card>
          <ImportarSaude data={hoje} />
        </Card>
      </Secao>

      {semana.some((s) => s.passos !== undefined) && (
        <Secao titulo="Passos nos últimos 7 dias">
          <Card>
            <div className="flex h-24 items-end gap-1.5">
              {Array.from({ length: 7 }, (_, i) => addDias(hoje, i - 6)).map((d) => {
                const p = semana.find((s) => s.data === d)?.passos;
                return (
                  <div key={d} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-ouro/70" style={{ height: `${Math.max(3, ((p ?? 0) / maxPassos) * 72)}px` }} title={p?.toLocaleString('pt-BR')} />
                    <span className="text-[10px] text-suave">{formatar(d, 'EEEEEE')}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </Secao>
      )}

      <Secao titulo={`Atalho 1 · “${nomes.peso}”`}>
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-suave">
            <Scale size={16} className="text-ouro" /> No Eixo → Saúde: peso e cintura
          </div>
          <Passos
            itens={[
              `Abra o app <b>Atalhos</b>, toque em <b>+</b> e dê o nome exato <b>${nomes.peso}</b>.`,
              `Adicione a ação <b>Dividir Texto</b>. Em “Texto”, escolha a variável <b>Entrada do Atalho</b>. Em separador, escolha <b>Personalizado</b> e digite <b>;</b>`,
              `Adicione <b>Obter Item da Lista</b> → <b>Primeiro Item</b> (do Texto Dividido).`,
              `Adicione <b>Registrar Amostra de Saúde</b>: tipo <b>Peso</b>, valor = <b>Item da Lista</b>, unidade <b>kg</b>.`,
              `Adicione outro <b>Obter Item da Lista</b> → <b>Último Item</b> (do Texto Dividido).`,
              `Adicione <b>Registrar Amostra de Saúde</b>: tipo <b>Circunferência da Cintura</b>, valor = <b>Item da Lista</b>, unidade <b>cm</b>.`,
              `Toque em <b>OK</b>. Na primeira vez, o iPhone pede permissão para gravar no Saúde: toque em <b>Permitir</b>.`,
            ]}
          />
          <button
            onClick={() => rodarAtalho(nomes.peso, exemplo)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-elevado px-4 text-sm font-semibold"
          >
            <Play size={16} /> Testar com {exemplo.replace(';', ' kg e ')} cm
          </button>
          <p className="text-xs text-suave">O teste grava esses valores de exemplo no Saúde; apague-os lá depois (Saúde → Peso → Mostrar Todos os Dados).</p>
        </Card>
      </Secao>

      <Secao titulo={`Atalho 2 · “${nomes.agua}”`}>
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-suave">
            <Droplets size={16} className="text-sky-400" /> No Eixo → Saúde: água
          </div>
          <Passos
            itens={[
              `Novo atalho com o nome exato <b>${nomes.agua}</b>.`,
              `Adicione <b>Registrar Amostra de Saúde</b>: tipo <b>Água</b>, valor = variável <b>Entrada do Atalho</b>, unidade <b>mL</b>.`,
              `Toque em <b>OK</b> e permita o acesso ao Saúde.`,
            ]}
          />
          <p className="text-sm text-suave">
            No app, a água vai somando; quando quiser, toque em <b>“Enviar +X ml ao Saúde”</b> (no contador de água). Só a parte nova é enviada, sem duplicar.
          </p>
        </Card>
      </Secao>

      <Secao titulo={`Atalho 3 · “${nomes.importar}”`}>
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-suave">
            <Footprints size={16} className="text-ouro" /> Saúde → No Eixo: peso, cintura e passos
          </div>
          <Passos
            itens={[
              `Novo atalho com o nome exato <b>${nomes.importar}</b>.`,
              `<b>Encontrar Amostras de Saúde</b> onde Tipo é <b>Peso</b>. Ordenar por <b>Data de Início</b>, ordem <b>Mais Recente Primeiro</b>, limite <b>1</b>. Depois adicione <b>Definir Variável</b> com o nome <b>Peso</b>.`,
              `Repita com Tipo <b>Circunferência da Cintura</b> (mesma ordem e limite 1) e <b>Definir Variável</b> <b>Cintura</b>.`,
              `<b>Encontrar Amostras de Saúde</b> onde Tipo é <b>Passos</b> e Data de Início é <b>hoje</b> (sem limite). Adicione <b>Calcular Estatísticas</b> → <b>Soma</b> e depois <b>Definir Variável</b> <b>Passos</b>.`,
              `Adicione a ação <b>Texto</b> e escreva exatamente: <b>NOEIXO;peso=</b>[Peso]<b>;cintura=</b>[Cintura]<b>;passos=</b>[Passos] — os itens entre colchetes são as variáveis (toque em “Variáveis” acima do teclado).`,
              `Adicione <b>Copiar para Área de Transferência</b>.`,
              `Opcional: <b>Mostrar Notificação</b> “Copiado! Volte ao No Eixo e toque em Colar dados”.`,
              `Toque em <b>OK</b> e permita a leitura do Saúde.`,
            ]}
          />
          <button onClick={() => rodarAtalho(nomes.importar)} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-elevado px-4 text-sm font-semibold">
            <Play size={16} /> Testar atalho
          </button>
          <p className="text-sm text-suave">
            Uso no dia a dia: toque em <b>1. Buscar no Saúde</b>, volte ao No Eixo e toque em <b>2. Colar dados</b>. Na primeira vez o iPhone pergunta se pode colar: toque em <b>Permitir colar</b>.
          </p>
        </Card>
      </Secao>

      <Secao titulo="Ajustes">
        <Card className="space-y-4">
          <div>
            <div className="mb-1 text-sm">Nomes dos atalhos (precisam ser iguais aos do app Atalhos)</div>
            {(['peso', 'agua', 'importar'] as const).map((k) => (
              <input
                key={k}
                aria-label={`Nome do atalho ${k}`}
                className="campo mt-2"
                value={nomes[k]}
                placeholder={ATALHOS_PADRAO[k]}
                onChange={(e) => salvarConfig({ atalhos: { ...nomes, [k]: e.target.value } })}
              />
            ))}
          </div>
          <div>
            <div className="mb-2 text-sm">Decimal dos números enviados</div>
            <div className="flex flex-wrap gap-2">
              <Chip ativo={decimal === 'virgula'} onClick={() => salvarConfig({ atalhosDecimal: 'virgula' })}>
                Vírgula (74,5) — iPhone em português
              </Chip>
              <Chip ativo={decimal === 'ponto'} onClick={() => salvarConfig({ atalhosDecimal: 'ponto' })}>
                Ponto (74.5)
              </Chip>
            </div>
            <p className="mt-2 text-xs text-suave">Se o peso aparecer errado no Saúde (por exemplo, 745 kg), troque esta opção.</p>
          </div>
        </Card>
      </Secao>

      <Aviso className="flex gap-2">
        <Smartphone size={14} className="mt-0.5 shrink-0" />
        Os nomes das ações podem variar um pouco conforme a versão do iOS. Se não achar uma ação, use a busca “Pesquisar ações” no Atalhos com a palavra-chave
        (ex.: “Amostra”, “Dividir”).
      </Aviso>
    </>
  );
}
