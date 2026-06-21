import { Categoria } from "../types";

export const CATEGORIAS_PADRAO: Omit<Categoria, "id">[] = [
  { nome: "Moradia", classificacao: "essencial", icone: "home", cor: "#4A90D9", padrao: true },
  { nome: "Alimentação", classificacao: "essencial", icone: "utensils", cor: "#50C878", padrao: true },
  { nome: "Transporte", classificacao: "essencial", icone: "car", cor: "#9B59B6", padrao: true },
  { nome: "Saúde", classificacao: "essencial", icone: "heart-pulse", cor: "#E74C3C", padrao: true },
  { nome: "Plano de Saúde", classificacao: "essencial", icone: "medkit", cor: "#FF6B6B", padrao: true },
  { nome: "Seguros", classificacao: "essencial", icone: "lock", cor: "#34495E", padrao: true },
  { nome: "Lazer", classificacao: "desejo", icone: "ticket", cor: "#F39C12", padrao: true },
  { nome: "Compras", classificacao: "desejo", icone: "shopping-bag", cor: "#E67E22", padrao: true },
  { nome: "Assinaturas", classificacao: "desejo", icone: "tv", cor: "#1ABC9C", padrao: true },
  { nome: "Investimentos", classificacao: "poupanca", icone: "trending-up", cor: "#27AE60", padrao: true },
  { nome: "Reserva de Emergência", classificacao: "poupanca", icone: "shield", cor: "#2980B9", padrao: true },
  { nome: "Outros", classificacao: "dinamico", icone: "more-horiz", cor: "#7F8C8D", padrao: true },
];