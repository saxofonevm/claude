import type { FichaTreino } from '@/db/tipos';

export const AQUECIMENTO = [
  '5 min de bicicleta ou esteira em ritmo leve.',
  '1 série leve (sem contar) do primeiro exercício.',
];

export const PRINCIPIOS_TREINO = [
  {
    titulo: 'A na terça, B na quinta',
    texto: 'O treino opcional de sábado alterna: semana ímpar do plano faz A, semana par faz B.',
  },
  {
    titulo: '55 a 60 minutos',
    texto: '5 min de aquecimento + musculação + 15 min de cardio no final.',
  },
  {
    titulo: 'Músculo acelera, conjunto queima',
    texto:
      'A musculação constrói músculo e acelera o metabolismo; o cardio e a alimentação queimam a gordura da barriga. Não existe queimar gordura só da barriga: ela sai com o conjunto.',
  },
  {
    titulo: 'Intensidade certa',
    texto: 'Termine cada série sentindo que conseguiria fazer só mais 1 ou 2 repetições.',
  },
  {
    titulo: 'Progressão',
    texto:
      'Fez o topo da faixa de repetições em todas as séries? Na próxima vez o app sugere aumentar a carga (+1 placa nas máquinas, +2 kg nos halteres).',
  },
  {
    titulo: 'Semanas 1 e 2: adaptação',
    texto: '2 séries por exercício e carga leve para aprender o movimento. Da semana 3 em diante, 3 séries. O app ajusta sozinho.',
  },
];

export const FICHAS: FichaTreino[] = [
  {
    id: 'A',
    nome: 'Treino A',
    foco: 'Pernas (frente) + Peito + Ombro + Tríceps + Core',
    itens: [
      { exercicioId: 'leg-press', series: 3, repMin: 10, repMax: 12, unidade: 'reps', descansoSeg: 90 },
      { exercicioId: 'supino-maquina', series: 3, repMin: 10, repMax: 12, unidade: 'reps', descansoSeg: 90 },
      { exercicioId: 'cadeira-extensora', series: 3, repMin: 12, repMax: 15, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'desenvolvimento-maquina', series: 3, repMin: 10, repMax: 12, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'peck-deck', series: 3, repMin: 12, repMax: 15, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'triceps-corda', series: 3, repMin: 12, repMax: 15, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'prancha', series: 3, repMin: 30, repMax: 45, unidade: 'seg', descansoSeg: 45 },
      {
        exercicioId: 'esteira-inclinada',
        series: 1,
        repMin: 15,
        repMax: 15,
        unidade: 'min',
        descansoSeg: 0,
        cardio: { minutos: 15 },
      },
    ],
  },
  {
    id: 'B',
    nome: 'Treino B',
    foco: 'Costas + Pernas (trás) + Glúteo + Bíceps + Core',
    itens: [
      { exercicioId: 'puxada-frontal', series: 3, repMin: 10, repMax: 12, unidade: 'reps', descansoSeg: 90 },
      { exercicioId: 'agachamento-smith', series: 3, repMin: 10, repMax: 12, unidade: 'reps', descansoSeg: 90 },
      { exercicioId: 'remada-baixa', series: 3, repMin: 10, repMax: 12, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'mesa-flexora', series: 3, repMin: 12, repMax: 15, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'cadeira-abdutora', series: 3, repMin: 15, repMax: 15, unidade: 'reps', descansoSeg: 45 },
      { exercicioId: 'rosca-direta-halteres', series: 3, repMin: 12, repMax: 12, unidade: 'reps', descansoSeg: 60 },
      { exercicioId: 'abdominal-maquina', series: 3, repMin: 15, repMax: 15, unidade: 'reps', descansoSeg: 45 },
      {
        exercicioId: 'bike-intervalada',
        series: 1,
        repMin: 15,
        repMax: 15,
        unidade: 'min',
        descansoSeg: 0,
        cardio: { minutos: 15, intervalo: { forteSeg: 60, leveSeg: 60 } },
      },
    ],
  },
];
