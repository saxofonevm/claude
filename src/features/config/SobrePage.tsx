import { Aviso, Cabecalho, Card, Secao } from '@/components/ui';
import { AVISO_NUTRI } from '@/data/pratos';

export default function SobrePage() {
  return (
    <>
      <Cabecalho titulo="Sobre o No Eixo" voltar />
      <Card className="mb-4 text-center">
        <img src="/pwa-192.png" alt="" className="mx-auto mb-3 h-20 w-20 rounded-2xl" />
        <div className="text-xl font-extrabold">No Eixo</div>
        <p className="text-sm text-suave">Treino, alimentação, rotina e hábitos. Versão 1.0</p>
        <p className="mt-2 text-sm">Funciona offline. Seus dados ficam só neste aparelho, sem login e sem nuvem.</p>
      </Card>
      <Secao titulo="Créditos das imagens">
        <Card className="space-y-2 text-sm">
          <p>
            Fotos dos exercícios: <b>Free Exercise DB</b> —{' '}
            <a className="text-ouro underline" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">
              github.com/yuhonas/free-exercise-db
            </a>
            , liberado em domínio público (licença Unlicense). Obrigado aos autores!
          </p>
          <p>Ilustrações dos pratos e do grupo muscular: desenhos próprios do app (SVG).</p>
          <p>
            Ícones:{' '}
            <a className="text-ouro underline" href="https://lucide.dev" target="_blank" rel="noreferrer">
              Lucide
            </a>{' '}
            (licença ISC).
          </p>
        </Card>
      </Secao>
      <Secao titulo="Avisos">
        <div className="space-y-2">
          <Aviso>{AVISO_NUTRI} Valores de proteína aproximados, base tabela TACO.</Aviso>
          <Aviso>Se você bebia todos os dias e em grande quantidade, faça a redução com acompanhamento médico.</Aviso>
          <Aviso>Antes de começar a treinar, se tiver alguma condição de saúde, converse com um médico.</Aviso>
        </div>
      </Secao>
    </>
  );
}
