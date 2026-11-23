import type { FasePlano } from '@/db/tipos';

export const TOTAL_SEMANAS = 12;

export const FASES: FasePlano[] = [
  {
    id: 1,
    nome: 'Adaptação',
    semanaInicio: 1,
    semanaFim: 2,
    series: 2,
    metaProteina: 100,
    treinosSemana: 2,
    descricao: 'Aprender os movimentos, criar o horário e montar as primeiras marmitas.',
    metas: ['2 treinos por semana com 2 séries', 'Marmitas de quinta-feira', 'Meta de proteína: 100 g por dia'],
  },
  {
    id: 2,
    nome: 'Construção',
    semanaInicio: 3,
    semanaFim: 6,
    series: 3,
    metaProteina: 120,
    treinosSemana: 2,
    descricao: 'Subir o volume e firmar a alimentação.',
    metas: ['3 séries por exercício', 'Meta de proteína: 120 g por dia', 'Testar o 3º treino no sábado'],
  },
  {
    id: 3,
    nome: 'Consolidação',
    semanaInicio: 7,
    semanaFim: 12,
    series: 3,
    metaProteina: 130,
    treinosSemana: 3,
    descricao: 'Progressão de carga e rotina no automático.',
    metas: ['Progressão de carga', '3 treinos por semana quando possível', 'Proteína de 130 a 150 g por dia'],
  },
];
