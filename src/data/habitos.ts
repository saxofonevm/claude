import type { Habito } from '@/db/tipos';

export const HABITOS_PADRAO: Omit<Habito, 'criadoEm'>[] = [
  { id: 'dormir-23h', nome: 'Dormir até 23h', tipo: 'fazer', icone: '🌙', ativo: true },
  { id: 'roupa-treino', nome: 'Separar a roupa do treino', tipo: 'fazer', icone: '🎒', ativo: true },
  { id: 'agua', nome: '2,5 L de água', tipo: 'fazer', icone: '💧', ativo: true, auto: 'agua' },
  { id: 'alongar', nome: 'Alongar 10 min', tipo: 'fazer', icone: '🧘', ativo: true },
];
