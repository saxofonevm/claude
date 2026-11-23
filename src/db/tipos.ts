// Tipos centrais do No Eixo. Datas sempre em ISO ('yyyy-MM-dd' para dias,
// ISO completo para instantes), no fuso America/Sao_Paulo.

export type DataISO = string; // 'yyyy-MM-dd'
export type Refeicao = 'cafe' | 'almoco' | 'lanche' | 'jantar';
export type FichaId = 'A' | 'B';
export type Secao = 'acougue' | 'hortifruti' | 'mercearia' | 'laticinios' | 'padaria';

/* ---------- Perfil e configurações ---------- */

export interface Perfil {
  id: 'eu';
  nome: string;
  idade: number;
  alturaCm: number;
  pesoInicial: number;
  cinturaInicial?: number;
  objetivo: string;
  metaProteinaMin: number;
  metaProteinaMax: number;
  metaAguaMl: number;
  /** Primeiro dia do plano de 12 semanas (semana 1 começa na segunda-feira desta data). */
  dataInicio: DataISO;
  onboardingFeito: boolean;
}

export type FaseAlcool = 'semanal' | 'quinzenal' | 'zero';

export interface ConfigAlcool {
  /** 0 = domingo ... 6 = sábado */
  diaPermitido: number;
  limiteDoses: number;
  fase: FaseAlcool;
  faseDesde: DataISO;
  precoDose: number;
  dosesPorSemanaAntes: number;
  definido: boolean;
}

export interface Configuracoes {
  id: 'app';
  tema: 'escuro' | 'claro';
  /** dias da semana com treino fixo (0 = dom). Padrão: [2, 4] */
  diasTreino: number[];
  /** dia do treino opcional (ou null). Padrão: 6 (sábado) */
  diaTreinoOpcional: number | null;
  diasShow: number[];
  /** dias de trabalho no projeto (café, almoço e lanche fora). Padrão: [1, 2, 3] */
  diasTrabalho: number[];
  diasPreparo: number[];
  alcool: ConfigAlcool;
  contatoApoio: { nome: string; telefone: string };
  motivos: string[];
  proteinaTrabalho: { cafe: number; almoco: number; lanche: number };
  semana0: Record<string, boolean>;
  refeicoesLivresSemana: number;
  horaVoltaShow: string;
  fraseRecusa: string;
}

/* ---------- Rotina e plano ---------- */

export type TipoDia = 'trabalho' | 'vespera' | 'treino' | 'treinoOpcional' | 'preparo' | 'show' | 'domingo';

export interface RotinaItem {
  id: string;
  tipoDia: TipoDia;
  hora: string; // 'HH:mm'
  horaFim?: string;
  titulo: string;
  detalhe?: string;
  acao?: 'treino' | 'mercado' | 'marmitas' | 'show' | 'revisao' | 'corpo' | 'refeicao';
  lembrete?: boolean;
  ordem: number;
}

export interface CheckRotina {
  id: string; // `${data}|${itemId}`
  data: DataISO;
  itemId: string;
  feito: boolean;
}

export interface FasePlano {
  id: number;
  nome: string;
  semanaInicio: number;
  semanaFim: number;
  series: number;
  metaProteina: number;
  treinosSemana: number;
  descricao: string;
  metas: string[];
}

/* ---------- Treino ---------- */

export type Equipamento = 'maquina' | 'polia' | 'halter' | 'smith' | 'peso-corporal' | 'cardio';

export interface Exercicio {
  id: string;
  nome: string;
  nomeIngles: string;
  grupo: string;
  musculos: string[];
  equipamento: Equipamento;
  /** imagens padrão (início e fim) em /exercicios */
  imagens: string[];
  fotoPropriaId?: number;
  execucao: string[];
  erros: string[];
  ajuste: string;
  substitutos: string[];
  /** incremento sugerido de carga (kg) */
  incremento: number;
  tipo: 'forca' | 'tempo' | 'cardio';
}

export interface ItemFicha {
  exercicioId: string;
  series: number;
  repMin: number;
  repMax: number;
  unidade: 'reps' | 'seg' | 'min';
  descansoSeg: number;
  cardio?: { minutos: number; intervalo?: { forteSeg: number; leveSeg: number } };
}

export interface FichaTreino {
  id: FichaId;
  nome: string;
  foco: string;
  itens: ItemFicha[];
}

export interface SerieRegistro {
  carga: number;
  reps: number;
  feita: boolean;
}

export interface ExercicioSessao {
  planejadoId: string;
  exercicioId: string;
  series: SerieRegistro[];
}

export interface SessaoTreino {
  id?: number;
  data: DataISO;
  ficha: FichaId;
  opcional: boolean;
  inicio: string;
  fim?: string;
  exercicios: ExercicioSessao[];
  cardioMin: number;
  concluida: boolean;
}

/* ---------- Alimentação ---------- */

export interface ItemCompra {
  id: string;
  nome: string;
  secao: Secao;
  un: 'g' | 'un' | 'ml' | 'pct' | 'lata' | 'colher';
  /** unidade de compra para exibição amigável (ex.: 'dúzia') */
  dica?: string;
}

export interface Ingrediente {
  texto: string;
  itemId?: string;
  qtd?: number;
}

export interface Prato {
  id: string;
  nome: string;
  refeicao: Refeicao;
  ingredientes: Ingrediente[];
  preparo: string[];
  tempoMin: number;
  proteina: number;
  ilustracao: string;
  fotoId?: number;
  marmita?: boolean;
  /** jantar 'marmita do estoque' */
  usaEstoque?: boolean;
  personalizado?: boolean;
}

export type ValorPlano = string; // pratoId | 'trabalho'

export interface PlanoAlimentarSemana {
  id: DataISO; // segunda-feira da semana
  dias: Record<DataISO, Partial<Record<Refeicao, ValorPlano>>>;
}

export interface RegistroRefeicao {
  id?: number;
  data: DataISO;
  refeicao: Refeicao;
  pratoId?: string;
  descricao: string;
  proteina: number;
  livre: boolean;
  origem: 'plano' | 'catalogo' | 'livre' | 'trabalho' | 'estoque';
  /** marmita retirada do estoque (devolvida se o registro for apagado) */
  estoquePratoId?: string;
  criadoEm: string;
}

export interface Alimento {
  id: string;
  nome: string;
  porcao: string;
  proteina: number;
}

export interface PassoReceita {
  texto: string;
  timerMin?: number;
}

export interface ReceitaBase {
  id: string;
  nome: string;
  rende: string;
  porcoes: number;
  ingredientes: Ingrediente[];
  passos: PassoReceita[];
  conserva: string;
  usos: string;
}

export interface Preparo {
  id?: number;
  data: DataISO;
  itens: { pratoId: string; porcoes: number }[];
  receitas: string[];
  concluido: boolean;
}

export interface EstoqueMarmita {
  pratoId: string;
  nome: string;
  quantidade: number;
  atualizado: string;
}

export interface ItemListaCompras {
  id: string;
  nome: string;
  secao: Secao;
  qtd: number;
  un: string;
  marcado: boolean;
  manual?: boolean;
}

/* ---------- Álcool e hábitos ---------- */

export type Gatilho = 'show' | 'social' | 'estresse' | 'tedio' | 'solidao' | 'comemoracao';

export interface RegistroAlcool {
  data: DataISO;
  bebeu: boolean;
  doses: number;
  onde?: string;
  gatilho?: Gatilho;
  nota?: string;
}

export interface Vontade {
  id?: number;
  data: DataISO;
  dataHora: string;
  passou: boolean | null;
  gatilho?: Gatilho;
  nota?: string;
}

export interface Habito {
  id: string;
  nome: string;
  tipo: 'fazer' | 'evitar';
  icone: string;
  ativo: boolean;
  criadoEm: DataISO;
  auto?: 'agua';
}

export interface RegistroHabito {
  id: string; // `${habitoId}|${data}`
  habitoId: string;
  data: DataISO;
  status: 'ok' | 'falhou';
}

/* ---------- Corpo, semana, outros ---------- */

export interface MedidaCorpo {
  data: DataISO;
  peso?: number;
  cintura?: number;
  fotoId?: number;
}

export interface Foto {
  id?: number;
  tipo: 'exercicio' | 'prato' | 'progresso';
  ref: string;
  blob: Blob;
  criadoEm: string;
}

export interface RevisaoSemanal {
  id: DataISO; // segunda-feira
  funcionou: string;
  tirou: string;
  ajuste: string;
  resumo?: Record<string, number | string>;
  criadoEm: string;
}

export interface Agua {
  data: DataISO;
  ml: number;
}
