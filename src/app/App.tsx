import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { garantirDadosIniciais } from '@/db/seed';
import { useConfig, usePerfil } from '@/hooks/dados';

const p = <T extends { default: React.ComponentType }>(f: () => Promise<T>) => lazy(f);

const HojePage = p(() => import('@/features/hoje/HojePage'));
const TreinoPage = p(() => import('@/features/treino/TreinoPage'));
const ExercicioPage = p(() => import('@/features/treino/ExercicioPage'));
const AoVivoPage = p(() => import('@/features/treino/AoVivoPage'));
const ResumoPage = p(() => import('@/features/treino/ResumoPage'));
const HistoricoPage = p(() => import('@/features/treino/HistoricoPage'));
const ComoFuncionaPage = p(() => import('@/features/treino/ComoFuncionaPage'));
const ComidaPage = p(() => import('@/features/alimentacao/ComidaPage'));
const CatalogoPage = p(() => import('@/features/alimentacao/CatalogoPage'));
const PratoPage = p(() => import('@/features/alimentacao/PratoPage'));
const ComoMontarPage = p(() => import('@/features/alimentacao/ComoMontarPage'));
const MarmitasPage = p(() => import('@/features/marmitas/MarmitasPage'));
const ReceitaPage = p(() => import('@/features/marmitas/ReceitaPage'));
const ComprasPage = p(() => import('@/features/marmitas/ComprasPage'));
const RotinaPage = p(() => import('@/features/rotina/RotinaPage'));
const EditorRotinaPage = p(() => import('@/features/rotina/EditorRotinaPage'));
const Semana0Page = p(() => import('@/features/rotina/Semana0Page'));
const Plano12Page = p(() => import('@/features/rotina/Plano12Page'));
const AlcoolPage = p(() => import('@/features/alcool/AlcoolPage'));
const VontadePage = p(() => import('@/features/alcool/VontadePage'));
const PlanoShowPage = p(() => import('@/features/alcool/PlanoShowPage'));
const HabitosPage = p(() => import('@/features/habitos/HabitosPage'));
const CorpoPage = p(() => import('@/features/corpo/CorpoPage'));
const SemanaPage = p(() => import('@/features/semana/SemanaPage'));
const ConfigPage = p(() => import('@/features/config/ConfigPage'));
const MaisPage = p(() => import('@/features/config/MaisPage'));
const SobrePage = p(() => import('@/features/config/SobrePage'));
const OnboardingPage = p(() => import('@/features/config/OnboardingPage'));

function Carregando() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-borda border-t-ouro" />
    </div>
  );
}

/** Aplica o tema e manda para o onboarding no primeiro uso. */
function Guardiao({ children }: { children: ReactNode }) {
  const perfil = usePerfil();
  const config = useConfig();
  const { pathname } = useLocation();
  useEffect(() => {
    if (!config) return;
    const escuro = config.tema === 'escuro';
    document.documentElement.classList.toggle('dark', escuro);
    try {
      localStorage.setItem('no-eixo:tema', config.tema);
    } catch {
      /* ok */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', escuro ? '#101325' : '#f7f6fc');
  }, [config]);
  if (!perfil || !config) return <Carregando />;
  if (!perfil.onboardingFeito && !pathname.startsWith('/boas-vindas')) return <Navigate to="/boas-vindas" replace />;
  return <>{children}</>;
}

const s = (el: ReactNode) => <Suspense fallback={<Carregando />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    element: (
      <Guardiao>
        <Layout />
      </Guardiao>
    ),
    children: [
      { path: '/', element: s(<HojePage />) },
      { path: '/treino', element: s(<TreinoPage />) },
      { path: '/treino/como-funciona', element: s(<ComoFuncionaPage />) },
      { path: '/treino/exercicio/:id', element: s(<ExercicioPage />) },
      { path: '/treino/ao-vivo/:id', element: s(<AoVivoPage />) },
      { path: '/treino/resumo/:id', element: s(<ResumoPage />) },
      { path: '/treino/historico', element: s(<HistoricoPage />) },
      { path: '/comida', element: s(<ComidaPage />) },
      { path: '/comida/catalogo', element: s(<CatalogoPage />) },
      { path: '/comida/prato/:id', element: s(<PratoPage />) },
      { path: '/comida/como-montar', element: s(<ComoMontarPage />) },
      { path: '/marmitas', element: s(<MarmitasPage />) },
      { path: '/marmitas/receita/:id', element: s(<ReceitaPage />) },
      { path: '/marmitas/compras', element: s(<ComprasPage />) },
      { path: '/rotina', element: s(<RotinaPage />) },
      { path: '/rotina/editor', element: s(<EditorRotinaPage />) },
      { path: '/rotina/semana0', element: s(<Semana0Page />) },
      { path: '/rotina/plano', element: s(<Plano12Page />) },
      { path: '/alcool', element: s(<AlcoolPage />) },
      { path: '/alcool/vontade', element: s(<VontadePage />) },
      { path: '/alcool/show', element: s(<PlanoShowPage />) },
      { path: '/habitos', element: s(<HabitosPage />) },
      { path: '/corpo', element: s(<CorpoPage />) },
      { path: '/semana', element: s(<SemanaPage />) },
      { path: '/config', element: s(<ConfigPage />) },
      { path: '/mais', element: s(<MaisPage />) },
      { path: '/sobre', element: s(<SobrePage />) },
      { path: '/boas-vindas', element: s(<OnboardingPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    garantirDadosIniciais()
      .then(() => setPronto(true))
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : String(e)));
  }, []);
  if (erro)
    return (
      <div className="p-6 text-center">
        <h1 className="mb-2 text-xl font-bold">Não foi possível abrir os dados</h1>
        <p className="text-suave">{erro}</p>
        <p className="mt-2 text-sm text-suave">No iPhone, saia do modo de navegação privada e tente de novo.</p>
      </div>
    );
  if (!pronto) return <Carregando />;
  return <RouterProvider router={router} />;
}
