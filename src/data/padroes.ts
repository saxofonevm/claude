import type { Configuracoes, Perfil } from '@/db/tipos';
import { hojeISO } from '@/lib/datas';

export function perfilPadrao(): Perfil {
  return {
    id: 'eu',
    nome: 'Tiago',
    idade: 40,
    alturaCm: 174,
    pesoInicial: 74.5,
    objetivo: 'Queimar a gordura da barriga e definir o corpo (recomposição corporal).',
    metaProteinaMin: 120,
    metaProteinaMax: 150,
    metaAguaMl: 2500,
    dataInicio: hojeISO(),
    onboardingFeito: false,
  };
}

export function configPadrao(): Configuracoes {
  return {
    id: 'app',
    tema: 'escuro',
    diasTreino: [2, 4],
    diaTreinoOpcional: 6,
    diasShow: [5, 6],
    diasTrabalho: [1, 2, 3],
    diasPreparo: [4],
    alcool: {
      diaPermitido: 0,
      limiteDoses: 2,
      fase: 'semanal',
      faseDesde: hojeISO(),
      precoDose: 12,
      dosesPorSemanaAntes: 10,
      definido: false,
    },
    contatoApoio: { nome: '', telefone: '' },
    motivos: [
      'Acordar inteiro para treinar às 5h30.',
      'Tocar e reger com a cabeça limpa.',
      'Ver a barriga diminuir de verdade.',
    ],
    proteinaTrabalho: { cafe: 15, almoco: 35, lanche: 10 },
    semana0: {},
    refeicoesLivresSemana: 2,
    horaVoltaShow: '00:30',
    fraseRecusa: 'Valeu, hoje tô só na água — amanhã cedo tem treino.',
  };
}
