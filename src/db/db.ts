import Dexie, { type Table } from 'dexie';
import type {
  Agua,
  Alimento,
  CheckRotina,
  Configuracoes,
  EstoqueMarmita,
  Exercicio,
  FasePlano,
  FichaTreino,
  Foto,
  Habito,
  ItemListaCompras,
  MedidaCorpo,
  Perfil,
  PlanoAlimentarSemana,
  Prato,
  Preparo,
  ReceitaBase,
  RegistroAlcool,
  RegistroHabito,
  RegistroRefeicao,
  RevisaoSemanal,
  RotinaItem,
  SessaoTreino,
  Vontade,
} from './tipos';

export class NoEixoDB extends Dexie {
  perfil!: Table<Perfil, string>;
  configuracoes!: Table<Configuracoes, string>;
  rotina!: Table<RotinaItem, string>;
  checksRotina!: Table<CheckRotina, string>;
  fasesPlano!: Table<FasePlano, number>;
  exercicios!: Table<Exercicio, string>;
  fichasTreino!: Table<FichaTreino, string>;
  sessoesTreino!: Table<SessaoTreino, number>;
  pratos!: Table<Prato, string>;
  planoAlimentar!: Table<PlanoAlimentarSemana, string>;
  refeicoes!: Table<RegistroRefeicao, number>;
  alimentos!: Table<Alimento, string>;
  receitasBase!: Table<ReceitaBase, string>;
  preparos!: Table<Preparo, number>;
  estoqueMarmitas!: Table<EstoqueMarmita, string>;
  listaCompras!: Table<ItemListaCompras, string>;
  registrosAlcool!: Table<RegistroAlcool, string>;
  vontades!: Table<Vontade, number>;
  habitos!: Table<Habito, string>;
  registrosHabitos!: Table<RegistroHabito, string>;
  medidasCorpo!: Table<MedidaCorpo, string>;
  fotos!: Table<Foto, number>;
  revisoesSemanais!: Table<RevisaoSemanal, string>;
  agua!: Table<Agua, string>;

  constructor() {
    super('no-eixo');
    // Migrações versionadas: ao mudar o esquema, crie .version(2) mantendo a 1.
    this.version(1).stores({
      perfil: 'id',
      configuracoes: 'id',
      rotina: 'id, tipoDia',
      checksRotina: 'id, data',
      fasesPlano: 'id',
      exercicios: 'id',
      fichasTreino: 'id',
      sessoesTreino: '++id, data, ficha',
      pratos: 'id, refeicao',
      planoAlimentar: 'id',
      refeicoes: '++id, data, refeicao',
      alimentos: 'id',
      receitasBase: 'id',
      preparos: '++id, data',
      estoqueMarmitas: 'pratoId',
      listaCompras: 'id, secao',
      registrosAlcool: 'data',
      vontades: '++id, data',
      habitos: 'id',
      registrosHabitos: 'id, habitoId, data',
      medidasCorpo: 'data',
      fotos: '++id, tipo, ref',
      revisoesSemanais: 'id',
      agua: 'data',
    });
  }
}

export const db = new NoEixoDB();

export const TABELAS = [
  'perfil',
  'configuracoes',
  'rotina',
  'checksRotina',
  'fasesPlano',
  'exercicios',
  'fichasTreino',
  'sessoesTreino',
  'pratos',
  'planoAlimentar',
  'refeicoes',
  'alimentos',
  'receitasBase',
  'preparos',
  'estoqueMarmitas',
  'listaCompras',
  'registrosAlcool',
  'vontades',
  'habitos',
  'registrosHabitos',
  'medidasCorpo',
  'fotos',
  'revisoesSemanais',
  'agua',
] as const;

export type NomeTabela = (typeof TABELAS)[number];
