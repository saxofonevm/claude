import { Aviso, Cabecalho, Card } from '@/components/ui';
import { IlustracaoPrato } from '@/components/Midia';
import { AVISO_NUTRI, PRINCIPIOS_PRATO } from '@/data/pratos';

export default function ComoMontarPage() {
  return (
    <>
      <Cabecalho titulo="Como montar o prato" voltar />
      <Card className="mb-4 overflow-hidden p-0">
        <div className="aspect-[4/3]">
          <IlustracaoPrato chave="frango" />
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 text-center text-xs">
          <div>
            <div className="mx-auto mb-1 h-3 w-3 rounded-full bg-[#6fbf73]" />
            <b>1/2</b> verduras e legumes
          </div>
          <div>
            <div className="mx-auto mb-1 h-3 w-3 rounded-full bg-[#e2a35d]" />
            <b>1/4</b> proteína
          </div>
          <div>
            <div className="mx-auto mb-1 h-3 w-3 rounded-full bg-[#f2efe6]" />
            <b>1/4</b> carboidrato
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        {PRINCIPIOS_PRATO.map((p, i) => (
          <Card key={p.titulo} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="mb-1 font-bold text-ouro">{p.titulo}</div>
            <p className="leading-relaxed">{p.texto}</p>
          </Card>
        ))}
      </div>
      <Aviso className="mt-4">{AVISO_NUTRI}</Aviso>
    </>
  );
}
