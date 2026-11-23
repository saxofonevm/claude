import type { RotinaItem, TipoDia } from '@/db/tipos';

export const NOMES_TIPO_DIA: Record<TipoDia, string> = {
  trabalho: 'Dia de projeto (trabalho)',
  vespera: 'Véspera de treino',
  treino: 'Dia de treino',
  treinoOpcional: 'Treino opcional',
  preparo: 'Dia de preparo',
  show: 'Dia de show',
  domingo: 'Domingo',
};

export const ROTINA_PADRAO: RotinaItem[] = [
  // Segunda a quarta
  { id: 'trab-jantar', tipoDia: 'trabalho', hora: '19:30', titulo: 'Jantar em casa', detalhe: 'Marmita do estoque ou um jantar rápido da lista.', acao: 'refeicao', ordem: 1 },
  // Véspera de treino (segunda e quarta à noite)
  { id: 'vesp-roupa', tipoDia: 'vespera', hora: '21:30', titulo: 'Separar roupa, fone e garrafa do treino', detalhe: 'Deixe tudo na porta. Amanhã é só levantar e ir.', lembrete: true, ordem: 1 },
  { id: 'vesp-dormir', tipoDia: 'vespera', hora: '22:30', titulo: 'Celular longe, preparar para dormir', detalhe: 'Dormir cedo é o que garante o treino das 5h30.', ordem: 2 },
  // Dia de treino (terça e quinta)
  { id: 'treino-acordar', tipoDia: 'treino', hora: '05:00', titulo: 'Acordar, 1 copo de água e algo leve', detalhe: 'Banana ou café com leite.', lembrete: true, ordem: 1 },
  { id: 'treino-treino', tipoDia: 'treino', hora: '05:30', horaFim: '06:30', titulo: 'Treino na Smart Fit', detalhe: 'Terça: Treino A · Quinta: Treino B.', acao: 'treino', ordem: 2 },
  { id: 'treino-cafe', tipoDia: 'treino', hora: '06:30', horaFim: '07:30', titulo: 'Café da manhã com proteína', acao: 'refeicao', ordem: 3 },
  // Quinta — dia de preparo
  { id: 'prep-mercado', tipoDia: 'preparo', hora: '08:00', titulo: 'Mercado', detalhe: 'Leve a lista de compras do app.', acao: 'mercado', lembrete: true, ordem: 1 },
  { id: 'prep-marmitas', tipoDia: 'preparo', hora: '09:00', horaFim: '11:00', titulo: 'Preparo das marmitas', detalhe: 'Bases em lote: frango, carne, feijão, arroz, legumes e ovos.', acao: 'marmitas', lembrete: true, ordem: 2 },
  // Sábado — treino opcional
  { id: 'opc-treino', tipoDia: 'treinoOpcional', hora: '08:00', horaFim: '09:00', titulo: 'Treino opcional', detalhe: 'Semana ímpar: A · semana par: B. Se não der, tudo bem.', acao: 'treino', ordem: 1 },
  // Dias de show (sexta e sábado)
  { id: 'show-plano', tipoDia: 'show', hora: '17:00', titulo: 'Revisar o Plano do show', detalhe: 'Frase de recusa pronta e horário de volta.', acao: 'show', lembrete: true, ordem: 1 },
  { id: 'show-jantar', tipoDia: 'show', hora: '18:00', titulo: 'Jantar completo antes de sair', detalhe: 'Nunca sair de estômago vazio.', acao: 'refeicao', ordem: 2 },
  { id: 'show-agua', tipoDia: 'show', hora: '18:30', titulo: 'Levar garrafa de água e bebida sem álcool', ordem: 3 },
  // Domingo
  { id: 'dom-livre', tipoDia: 'domingo', hora: '08:00', titulo: 'Manhã livre / descanso', ordem: 1 },
  { id: 'dom-marmitas', tipoDia: 'domingo', hora: '10:00', titulo: '2º preparo de marmitas', detalhe: 'Reforçar o estoque para segunda a quarta.', acao: 'marmitas', lembrete: true, ordem: 2 },
  { id: 'dom-revisao', tipoDia: 'domingo', hora: '19:00', titulo: 'Pesar, medir a cintura e revisar a semana', acao: 'revisao', lembrete: true, ordem: 3 },
];
