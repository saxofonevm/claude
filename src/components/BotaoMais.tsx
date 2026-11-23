import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

export function BotaoMais() {
  return (
    <Link to="/mais" aria-label="Mais opções" className="flex h-11 w-11 items-center justify-center rounded-full bg-elevado text-texto active:scale-95">
      <LayoutGrid size={20} />
    </Link>
  );
}
