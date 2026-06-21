import { Classificacao, Transacao } from "../types";

export interface RelatorioOrcamento {
  limite: number;
  gastoAtual: number;
  porcentagemGasta: number;
  status: "regular" | "alerta" | "critico";
}

export interface AnaliseFinanceira {
  rendaTotal: number;
  despesaTotal: number;
  saldoRestante: number;
  essencial: RelatorioOrcamento;
  desejo: RelatorioOrcamento;
  poupanca: RelatorioOrcamento;
  indiceSaude: number; // De 0 a 100
}

// Função pura para calcular a saúde financeira baseada no método 50/30/20
export function calcularOrcamento(rendaMensal: number, transacoes: Transacao[]): AnaliseFinanceira {
  // 1. Separar receitas extras se houver (além da renda fixa do perfil)
  const receitasExtras = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const rendaTotal = rendaMensal + receitasExtras;

  // 2. Definir limites teóricos do 50/30/20
  const limites = {
    essencial: rendaTotal * 0.5,
    desejo: rendaTotal * 0.3,
    poupanca: rendaTotal * 0.2,
  };

  // 3. Somar os gastos reais por categoria
  const gastos = {
    essencial: 0,
    desejo: 0,
    poupanca: 0,
  };

  let despesaTotal = 0;

  transacoes.forEach((t) => {
    if (t.tipo === "despesa") {
      gastos[t.classificacao as keyof typeof gastos] += t.valor;
      despesaTotal += t.valor;
    }
  });

  // Helper para criar a estrutura de status de cada pilar
  const criarRelatorio = (tipo: Classificacao): RelatorioOrcamento => {
    const limite = limites[tipo as keyof typeof limites];
    const gastoAtual = gastos[tipo as keyof typeof gastos];
    const porcentagemGasta = limite > 0 ? (gastoAtual / limite) * 100 : 0;

    let status: RelatorioOrcamento["status"] = "regular";
    if (porcentagemGasta >= 100) status = "critico";
    else if (porcentagemGasta >= 80) status = "alerta";

    return { limite, gastoAtual, porcentagemGasta, status };
  };

  // 4. Calcular Índice de Saúde Financeira (Métrica simplificada baseada em desvios)
  // Penaliza se gastar mais que o teto em Essencial/Desejos ou se poupar menos que 20%
  let pontos = 100;

  const relatorioEssencial = criarRelatorio("essencial");
  const relatorioDesejo = criarRelatorio("desejo");
  const relatorioPoupanca = criarRelatorio("poupanca");

  if (relatorioEssencial.porcentagemGasta > 100) pontos -= 35;
  if (relatorioDesejo.porcentagemGasta > 100) pontos -= 35;
  if (relatorioPoupanca.gastoAtual < limites.poupanca) {
    const desvio = 1 - (relatorioPoupanca.gastoAtual / (limites.poupanca || 1));
    pontos -= Math.min(30, desvio * 30);
  }

  return {
    rendaTotal,
    despesaTotal,
    saldoRestante: rendaTotal - despesaTotal,
    essencial: relatorioEssencial,
    desejo: relatorioDesejo,
    poupanca: relatorioPoupanca,
    indiceSaude: Math.max(0, Math.round(pontos)),
  };
}