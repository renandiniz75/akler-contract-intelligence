import type { CategoryRow, MonthlyRow } from "@/lib/cfo-data";

export type StrategicClass =
  | "contract_revenue"
  | "recurring_opex"
  | "delivery_cost"
  | "tax_payroll"
  | "investment"
  | "financial"
  | "intercompany"
  | "needs_curation";

export type MonthlyDeviation = {
  month: string;
  actualPayments: number;
  plannedBurn: number;
  gap: number;
  actualReceipts: number;
  actualNet: number;
  severity: "ok" | "watch" | "critical";
};

export type RevenueQuality = {
  name: string;
  actualAmount: number;
  projectedAmount: number;
  actualMonths: number;
  projectedMonths: number;
  averageProjected: number;
  score: number;
  grade: "A" | "B" | "C";
  reading: string;
};

export type CategoryExplanation = {
  category: string;
  strategicClass: StrategicClass;
  amount: number;
  rowCount: number;
  share: number;
  reading: string;
};

const classLabels: Record<StrategicClass, string> = {
  contract_revenue: "Receita contratual",
  recurring_opex: "OPEX recorrente",
  delivery_cost: "Custo de entrega/implantacao",
  tax_payroll: "Folha e tributos",
  investment: "Investimento",
  financial: "Financeiro separado",
  intercompany: "Intercompany eliminado",
  needs_curation: "Curadoria obrigatoria"
};

export function getStrategicClassLabel(value: StrategicClass) {
  return classLabels[value];
}

export function buildCfoStrategy(monthly: MonthlyRow[], categories: CategoryRow[]) {
  const baselineBurn = getProjectedBurnBaseline(monthly);
  const deviations = buildMonthlyDeviations(monthly, baselineBurn);
  const revenueQuality = buildRevenueQuality(categories);
  const categoryExplanations = buildCategoryExplanations(categories, deviations.map((row) => row.month));
  const questions = buildStrategicQuestions(deviations, categoryExplanations, revenueQuality, baselineBurn);

  return {
    baselineBurn,
    deviations,
    revenueQuality,
    categoryExplanations,
    questions
  };
}

function getProjectedBurnBaseline(monthly: MonthlyRow[]) {
  const projectedBurns = monthly
    .map((row) => row.projectedExpenses + row.projectedInvestments)
    .filter((value) => value > 0)
    .sort((first, second) => first - second);

  if (projectedBurns.length === 0) {
    return 0;
  }

  const middle = Math.floor(projectedBurns.length / 2);
  return projectedBurns.length % 2 === 0 ? (projectedBurns[middle - 1] + projectedBurns[middle]) / 2 : projectedBurns[middle];
}

function buildMonthlyDeviations(monthly: MonthlyRow[], baselineBurn: number): MonthlyDeviation[] {
  return monthly
    .filter((row) => row.actualOperatingPayments > 0 || row.actualOperatingReceipts > 0)
    .map((row) => {
      const plannedBurn = row.projectedExpenses + row.projectedInvestments > 0 ? row.projectedExpenses + row.projectedInvestments : baselineBurn;
      const gap = row.actualOperatingPayments - plannedBurn;
      const ratio = plannedBurn > 0 ? gap / plannedBurn : 0;

      return {
        month: row.month,
        actualPayments: row.actualOperatingPayments,
        plannedBurn,
        gap,
        actualReceipts: row.actualOperatingReceipts,
        actualNet: row.actualOperatingNet,
        severity: gap <= 0 ? "ok" : ratio >= 0.5 ? "critical" : "watch"
      };
    });
}

function normalizeRevenueName(value: string) {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (cleaned.includes("SEMOBI") || cleaned.includes("MOBILIDADE")) return "SEMOBI";
  if (cleaned.includes("TRIBUNAL DE JUSTICA") || cleaned.includes("TJBA")) return "TJBA";
  if (cleaned.includes("ARACRUZ")) return "Aracruz";
  if (cleaned.includes("ANCHIETA")) return "Anchieta";
  if (cleaned.includes("ITAPEMIRIM")) return "Itapemirim";
  if (cleaned.includes("LINHARES")) return "Linhares";
  if (cleaned.includes("MARATAIZES")) return "Marataizes";
  if (cleaned.includes("SERRA")) return "Serra";
  if (cleaned.includes("CREA")) return "CREA-ES";
  return value;
}

function buildRevenueQuality(categories: CategoryRow[]): RevenueQuality[] {
  const grouped = new Map<string, { actualAmount: number; projectedAmount: number; actualMonths: Set<string>; projectedMonths: Set<string> }>();

  categories
    .filter((row) => row.treatment === "operational" && (row.source === "actual_revenue" || row.source === "projected_revenue"))
    .forEach((row) => {
      const name = normalizeRevenueName(row.category);
      const current = grouped.get(name) ?? {
        actualAmount: 0,
        projectedAmount: 0,
        actualMonths: new Set<string>(),
        projectedMonths: new Set<string>()
      };

      if (row.source === "actual_revenue") {
        current.actualAmount += row.amount;
        current.actualMonths.add(row.month);
      } else {
        current.projectedAmount += row.amount;
        current.projectedMonths.add(row.month);
      }

      grouped.set(name, current);
    });

  return Array.from(grouped.entries())
    .map(([name, row]) => {
      const actualMonths = row.actualMonths.size;
      const projectedMonths = row.projectedMonths.size;
      const averageProjected = projectedMonths > 0 ? row.projectedAmount / projectedMonths : 0;
      const score = Math.min(
        100,
        Math.round(
          Math.min(35, projectedMonths * 0.35) +
            Math.min(30, averageProjected / 45000) +
            Math.min(20, actualMonths * 5) +
            (row.actualAmount > 0 ? 15 : 0)
        )
      );
      const grade: RevenueQuality["grade"] = score >= 75 ? "A" : score >= 50 ? "B" : "C";

      return {
        name,
        actualAmount: row.actualAmount,
        projectedAmount: row.projectedAmount,
        actualMonths,
        projectedMonths,
        averageProjected,
        score,
        grade,
        reading:
          grade === "A"
            ? "Receita forte para sustentar caixa e simular renovacoes."
            : grade === "B"
              ? "Boa receita, mas precisa validar prazo real de recebimento."
              : "Receita menor ou menos provada; usar com desconto nas simulacoes."
      };
    })
    .sort((first, second) => second.score - first.score || second.projectedAmount - first.projectedAmount);
}

function classifyCategory(row: CategoryRow): StrategicClass {
  const text = `${row.category} ${row.subcategory} ${row.flowType}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (row.treatment === "financial_separated" || text.includes("aplicac") || text.includes("resgate")) return "financial";
  if (row.treatment === "intercompany_eliminated" || text.includes("intercompany") || text.includes("transferencia")) return "intercompany";
  if (row.source === "projected_investment" || text.includes("investimento")) return "investment";
  if (text.includes("folha") || text.includes("encargo") || text.includes("tribut")) return "tax_payroll";
  if (text.includes("servicos") || text.includes("aluguel") || text.includes("marketing") || text.includes("financeiras")) return "recurring_opex";
  if (text.includes("fornecedor") || text.includes("materiais") || text.includes("cmv") || text.includes("ti") || text.includes("viagens")) return "delivery_cost";
  return "needs_curation";
}

function readingForClass(value: StrategicClass) {
  if (value === "delivery_cost") return "Provavel custo de entrega ou implantacao; precisa abrir fornecedor/item para separar CAPEX de consumo recorrente.";
  if (value === "recurring_opex") return "Custo recorrente; se estiver acima do baseline, vira aumento estrutural de burn.";
  if (value === "tax_payroll") return "Despesa previsivel, mas sensivel a folha, encargos e faturamento.";
  if (value === "investment") return "Investimento projetado; deve entrar na capacidade de caixa e payback.";
  if (value === "financial") return "Movimento financeiro separado para nao distorcer o consumo operacional.";
  if (value === "intercompany") return "Eliminado na consolidacao Akler para evitar dupla contagem.";
  return "Categoria agregada demais; precisa curadoria para explicar o desvio.";
}

function buildCategoryExplanations(categories: CategoryRow[], months: string[]): CategoryExplanation[] {
  const actualMonths = new Set(months);
  const grouped = new Map<string, CategoryExplanation>();

  categories
    .filter((row) => actualMonths.has(row.month))
    .filter((row) => row.source === "actual_expense" || row.source === "cash_movement")
    .filter((row) => row.amount > 0)
    .filter((row) => !row.flowType.toLowerCase().includes("recebimentos") && !row.category.toLowerCase().includes("entradas"))
    .forEach((row) => {
      const strategicClass = classifyCategory(row);
      const key = `${strategicClass}:${row.category}`;
      const current = grouped.get(key) ?? {
        category: row.category,
        strategicClass,
        amount: 0,
        rowCount: 0,
        share: 0,
        reading: readingForClass(strategicClass)
      };

      current.amount += row.amount;
      current.rowCount += row.rowCount;
      grouped.set(key, current);
    });

  const rows = Array.from(grouped.values()).sort((first, second) => second.amount - first.amount);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return rows.map((row) => ({
    ...row,
    share: total > 0 ? (row.amount / total) * 100 : 0
  }));
}

function buildStrategicQuestions(
  deviations: MonthlyDeviation[],
  categories: CategoryExplanation[],
  revenueQuality: RevenueQuality[],
  baselineBurn: number
) {
  const worstMonth = deviations.reduce<MonthlyDeviation | null>((worst, row) => (!worst || row.gap > worst.gap ? row : worst), null);
  const deliveryCost = sumByClass(categories, "delivery_cost");
  const recurringCost = sumByClass(categories, "recurring_opex") + sumByClass(categories, "tax_payroll");
  const curationCost = sumByClass(categories, "needs_curation");
  const bestRevenue = revenueQuality[0];
  const averageActualBurn = deviations.length > 0 ? deviations.reduce((sum, row) => sum + row.actualPayments, 0) / deviations.length : 0;

  return [
    {
      question: "Por que o caixa saiu mais que o orcado?",
      answer: worstMonth
        ? `${worstMonth.month} e o pior mes capturado: saiu ${money(worstMonth.actualPayments)} contra baseline de ${money(worstMonth.plannedBurn)}, gap de ${money(worstMonth.gap)}.`
        : "Ainda nao ha meses realizados suficientes para medir desvio."
    },
    {
      question: "Isso parece investimento ou aumento recorrente de gasto?",
      answer: `A primeira leitura separa ${money(deliveryCost)} como custo de entrega/implantacao, ${money(recurringCost)} como recorrente/folha/tributos e ${money(curationCost)} ainda agregado demais para conclusao final.`
    },
    {
      question: "Qual receita sustenta melhor novas decisoes?",
      answer: bestRevenue
        ? `${bestRevenue.name} aparece como melhor receita no score atual: ${money(bestRevenue.averageProjected)}/mes projetado medio, ${bestRevenue.projectedMonths} meses projetados e nota ${bestRevenue.grade}.`
        : "Ainda nao ha receitas classificadas para ranking."
    },
    {
      question: "Qual burn devo usar em simulacao conservadora?",
      answer: `Use ${money(Math.max(baselineBurn, averageActualBurn))}/mes como referencia conservadora agora. O baseline projetado e ${money(baselineBurn)}, mas o burn realizado medio esta em ${money(averageActualBurn)}.`
    }
  ];
}

function sumByClass(rows: CategoryExplanation[], strategicClass: StrategicClass) {
  return rows.filter((row) => row.strategicClass === strategicClass).reduce((sum, row) => sum + row.amount, 0);
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", maximumFractionDigits: 0, style: "currency" });
}
