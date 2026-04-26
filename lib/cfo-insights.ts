export const cfoWorkbookInsights = {
  source: "Fluxo_Caixa_Gerencial_2026-04-24.xlsx",
  initialCash: 8529954.96,
  periodStart: "2026-01-01",
  periodEnd: "2035-05-31",
  contracts: {
    count: 16,
    monthlyTotal: 5926605.63,
    implementationTotal: 5263805.27,
    maxPendingMonths: 109
  },
  actualRevenueByClient: [
    { label: "STARTID · Municipio da Serra", amount: 2797798.29 },
    { label: "AKLER · SEMOBI", amount: 2421539.15 },
    { label: "AKLER · Aracruz", amount: 1997172.72 },
    { label: "AKLER · Marataizes", amount: 1544124.78 },
    { label: "AKLER · Linhares", amount: 1527712.89 },
    { label: "AKLER · Itapemirim", amount: 1425772.7 },
    { label: "AKLER · TJBA", amount: 368386.74 },
    { label: "STARTID · Itapemirim", amount: 364462.81 }
  ],
  projectedRevenueByType: [
    { label: "AKLER · Mensal", amount: 532823388.04 },
    { label: "STARTID · Mensal", amount: 16646650 },
    { label: "AKLER · Implantacao", amount: 0 }
  ],
  actualExpenseCategories: [
    { label: "Aplicacoes financeiras", amount: 7391000, treatment: "Nao operacional / separar do consumo de caixa" },
    { label: "Fornecedores", amount: 8803312.37, treatment: "Desembolso operacional" },
    { label: "Tributos", amount: 1441293.19, treatment: "Desembolso operacional" },
    { label: "Folha e encargos", amount: 467928.5, treatment: "Desembolso operacional" }
  ],
  projectedExpenseCategories: [
    { label: "Materiais/CMV", amount: 73726981.79 },
    { label: "Servicos de Terceiros", amount: 57202467.02 },
    { label: "Operacao/TI/Viagens", amount: 30968668.7 },
    { label: "Aluguel/Condominio/Ativos", amount: 8155700.73 },
    { label: "Folha", amount: 7231330.32 },
    { label: "Outras", amount: 3569204.77 },
    { label: "Encargos/Beneficios", amount: 2220050.63 },
    { label: "Comercial/Marketing", amount: 1852592.8 },
    { label: "Tributos", amount: 872689.28 },
    { label: "Financeiras", amount: 461068.63 }
  ],
  movementTreatments: [
    {
      label: "Recebimentos operacionais",
      rule: "Entram no caixa operacional e podem ser reconciliados com faturamento/contratos."
    },
    {
      label: "Fornecedores, tributos, folha e despesas",
      rule: "Saem do caixa operacional e devem ser classificados por natureza e, quando possivel, por contrato."
    },
    {
      label: "Aplicacoes e resgates financeiros",
      rule: "Separar do consumo operacional para nao distorcer capacidade de investimento."
    },
    {
      label: "Transferencias intercompany",
      rule: "Eliminar na consolidacao Akler para evitar dupla contagem."
    }
  ],
  recommendedModel: [
    "Contratos geram receita projetada, vigencia, reajuste e vencimento.",
    "Itens do contrato explicam escopo e podem gerar investimento previsto.",
    "Investimentos devem representar desembolso para implantar/entregar contrato.",
    "OPEX deve representar despesa operacional recorrente, consolidada ou vinculada a contrato.",
    "Movimentacao financeira realizada deve reconciliar caixa, separando intercompany e aplicacoes.",
    "Capacidade usa caixa consolidado, investimento novo, prazo de fornecedor e recebimento do orgao."
  ]
};
