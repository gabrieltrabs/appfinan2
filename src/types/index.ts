export type Classificacao = "essencial" | "desejo" | "poupanca" | "dinamico";

export interface Transacao {
  id: string;
  tipo: "receita" | "despesa";
  valor: number;
  categoriaId: string;
  classificacao: Classificacao;
  descricao: string;
  data: Date;
  metodoPagamento: string;
  recorrente: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  classificacao: Classificacao;
  icone: string;
  cor: string;
  padrao: boolean;
}

export interface PerfilUsuario {
  nome: string;
  email: string;
  rendaMensal: number;
  metaReservaEmergencia: number;
}