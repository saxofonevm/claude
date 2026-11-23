import type { Alimento } from '@/db/tipos';

// Valores aproximados por porção, base tabela TACO (e rótulos médios para whey).
export const ALIMENTOS: Alimento[] = [
  { id: 'frango', nome: 'Frango (peito cozido/desfiado)', porcao: '100 g', proteina: 32 },
  { id: 'patinho', nome: 'Patinho moído refogado', porcao: '100 g', proteina: 28 },
  { id: 'ovo', nome: 'Ovo cozido ou mexido', porcao: '1 unidade', proteina: 6 },
  { id: 'atum', nome: 'Atum em lata (drenado)', porcao: '1/2 lata (60 g)', proteina: 15 },
  { id: 'tilapia', nome: 'Tilápia assada', porcao: '100 g', proteina: 26 },
  { id: 'feijao', nome: 'Feijão cozido', porcao: '1 concha (100 g)', proteina: 5 },
  { id: 'arroz', nome: 'Arroz branco cozido', porcao: '4 colheres (100 g)', proteina: 3 },
  { id: 'iogurte', nome: 'Iogurte natural', porcao: '1 pote (170 g)', proteina: 7 },
  { id: 'whey', nome: 'Whey protein', porcao: '1 dose (30 g)', proteina: 21 },
  { id: 'queijo-minas', nome: 'Queijo minas frescal', porcao: '1 fatia (30 g)', proteina: 5 },
  { id: 'leite', nome: 'Leite', porcao: '1 copo (200 ml)', proteina: 6 },
  { id: 'pao-integral', nome: 'Pão integral', porcao: '2 fatias', proteina: 5 },
  { id: 'requeijao', nome: 'Requeijão light', porcao: '1 colher (30 g)', proteina: 3 },
];
