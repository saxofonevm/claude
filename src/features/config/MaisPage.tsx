import { Link } from 'react-router-dom';
import { Beer, ChefHat, ClipboardCheck, HeartHandshake, HeartPulse, Info, Ruler, Settings, Target } from 'lucide-react';
import { Cabecalho } from '@/components/ui';

const ITENS = [
  { to: '/alcool', rotulo: 'Álcool', detalhe: 'Contadores, gatilhos e apoio', icone: Beer },
  { to: '/habitos', rotulo: 'Hábitos', detalhe: 'Fazer e evitar', icone: HeartHandshake },
  { to: '/corpo', rotulo: 'Corpo', detalhe: 'Peso, cintura e fotos', icone: Ruler },
  { to: '/saude', rotulo: 'App Saúde', detalhe: 'Peso, água e passos via Atalhos', icone: HeartPulse },
  { to: '/marmitas', rotulo: 'Marmitas', detalhe: 'Receitas, compras e estoque', icone: ChefHat },
  { to: '/rotina/plano', rotulo: 'Plano de 12 semanas', detalhe: 'Fases e conquistas', icone: Target },
  { to: '/rotina/semana0', rotulo: 'Semana 0', detalhe: 'Checklist de início', icone: ClipboardCheck },
  { to: '/config', rotulo: 'Configurações', detalhe: 'Perfil, rotina, backup e lembretes', icone: Settings },
  { to: '/sobre', rotulo: 'Sobre', detalhe: 'Créditos e avisos', icone: Info },
];

export default function MaisPage() {
  return (
    <>
      <Cabecalho titulo="Mais" voltar />
      <div className="grid grid-cols-2 gap-3">
        {ITENS.map(({ to, rotulo, detalhe, icone: I }, i) => (
          <Link key={to} to={to} className="card flex min-h-[120px] animate-entrar flex-col justify-between active:scale-[0.98]" style={{ animationDelay: `${i * 30}ms` }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ouro/15 text-ouro">
              <I size={22} />
            </span>
            <span>
              <span className="block font-bold">{rotulo}</span>
              <span className="block text-xs text-suave">{detalhe}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
