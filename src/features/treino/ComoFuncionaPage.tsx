import { Flame } from 'lucide-react';
import { Cabecalho, Card, Secao } from '@/components/ui';
import { AQUECIMENTO, PRINCIPIOS_TREINO } from '@/data/treinos';

export default function ComoFuncionaPage() {
  return (
    <>
      <Cabecalho titulo="Como funciona o treino" voltar />
      <div className="space-y-3">
        {PRINCIPIOS_TREINO.map((p, i) => (
          <Card key={p.titulo} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="mb-1 font-bold text-ouro">{p.titulo}</div>
            <p className="text-[15px] leading-relaxed">{p.texto}</p>
          </Card>
        ))}
      </div>
      <Secao titulo="Aquecimento (os dois treinos)" className="mt-5">
        <Card className="space-y-2">
          {AQUECIMENTO.map((a) => (
            <div key={a} className="flex gap-2">
              <Flame size={18} className="mt-0.5 shrink-0 text-ouro" />
              {a}
            </div>
          ))}
        </Card>
      </Secao>
    </>
  );
}
