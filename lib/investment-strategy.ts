import type { Capex, Contract, ContractItem, Opex } from "@/lib/types";
import type { MonthlyRow } from "@/lib/cfo-data";
import { buildProjectedInvestmentCapex } from "@/lib/projections";

export type ContractInvestmentExposure = {
  contractId: string;
  city: string;
  number: string;
  investment: number;
  ownCash: number;
  thirdParty: number;
  monthlyRevenue: number;
  estimatedPaybackMonths: number | null;
  missingCostItems: number;
};

export type InvestmentCockpit = {
  committedInvestment: number;
  ownCashInvestment: number;
  thirdPartyInvestment: number;
  upcomingOwnCash90d: number;
  recurringOpex: number;
  estimatedCurrentCash: number;
  baselineBurn: number;
  missingCostItems: number;
  exposure: ContractInvestmentExposure[];
  fundingRecommendation: {
    label: string;
    tone: "safe" | "watch" | "critical";
    reading: string;
  };
  cfoQuestions: Array<{ question: string; answer: string }>;
};

export function buildInvestmentCockpit({
  capex,
  contractItems,
  contracts,
  monthly,
  opex
}: {
  capex: Capex[];
  contractItems: ContractItem[];
  contracts: Contract[];
  monthly: MonthlyRow[];
  opex: Opex[];
}): InvestmentCockpit {
  const generatedCapex = buildProjectedInvestmentCapex(contracts, contractItems, capex);
  const manualCapex = capex.reduce((sum, row) => sum + row.amount, 0);
  const itemInvestment = contractItems.reduce((sum, row) => sum + row.estimatedCost, 0);
  const ownCashItems = contractItems.filter((row) => row.paymentSource === "own_cash").reduce((sum, row) => sum + row.estimatedCost, 0);
  const thirdPartyInvestment = contractItems.filter((row) => row.paymentSource === "third_party").reduce((sum, row) => sum + row.estimatedCost, 0);
  const upcomingOwnCash90d = sumUpcomingOwnCash(generatedCapex);
  const recurringOpex = opex.reduce((sum, row) => sum + row.amount, 0);
  const missingCostItems = contractItems.filter((row) => row.estimatedCost <= 0).length;
  const baselineBurn = getProjectedBurnBaseline(monthly);
  const estimatedCurrentCash = getEstimatedCurrentCash(monthly);
  const exposure = buildExposure(contracts, contractItems, opex);
  const committedInvestment = itemInvestment + manualCapex;
  const ownCashInvestment = ownCashItems + manualCapex;
  const fundingRecommendation = getFundingRecommendation({
    estimatedCurrentCash,
    ownCashInvestment,
    upcomingOwnCash90d
  });

  return {
    committedInvestment,
    ownCashInvestment,
    thirdPartyInvestment,
    upcomingOwnCash90d,
    recurringOpex,
    estimatedCurrentCash,
    baselineBurn,
    missingCostItems,
    exposure,
    fundingRecommendation,
    cfoQuestions: buildCfoQuestions({
      baselineBurn,
      committedInvestment,
      estimatedCurrentCash,
      missingCostItems,
      ownCashInvestment,
      thirdPartyInvestment,
      upcomingOwnCash90d
    })
  };
}

function sumUpcomingOwnCash(capex: Capex[]) {
  const months = Array.from(new Set(capex.map((row) => row.month))).sort();
  const firstThreeMonths = new Set(months.slice(0, 3));
  return capex.filter((row) => firstThreeMonths.has(row.month)).reduce((sum, row) => sum + row.amount, 0);
}

function getProjectedBurnBaseline(monthly: MonthlyRow[]) {
  const values = monthly
    .map((row) => row.projectedExpenses + row.projectedInvestments)
    .filter((value) => value > 0)
    .sort((first, second) => first - second);

  if (values.length === 0) return 0;

  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[middle];
}

function getEstimatedCurrentCash(monthly: MonthlyRow[]) {
  const actualRows = monthly
    .filter((row) => row.actualOperatingReceipts > 0 || row.actualOperatingPayments > 0)
    .sort((first, second) => first.month.localeCompare(second.month));

  return actualRows.at(-1)?.actualOperationalCash ?? monthly[0]?.actualOperationalCash ?? 0;
}

function buildExposure(contracts: Contract[], contractItems: ContractItem[], opex: Opex[]): ContractInvestmentExposure[] {
  return contracts
    .map((contract) => {
      const items = contractItems.filter((row) => row.contractId === contract.id);
      const investment = items.reduce((sum, row) => sum + row.estimatedCost, 0);
      const ownCash = items.filter((row) => row.paymentSource === "own_cash").reduce((sum, row) => sum + row.estimatedCost, 0);
      const thirdParty = items.filter((row) => row.paymentSource === "third_party").reduce((sum, row) => sum + row.estimatedCost, 0);
      const recurringCosts = opex.filter((row) => row.contractId === contract.id).reduce((sum, row) => sum + row.amount, 0);
      const monthlyRevenue = contract.initialTermMonths > 0 ? contract.totalValue / contract.initialTermMonths : 0;
      const monthlyContribution = monthlyRevenue - recurringCosts / Math.max(contract.initialTermMonths, 1);
      const estimatedPaybackMonths = investment > 0 && monthlyContribution > 0 ? Math.ceil(investment / monthlyContribution) : null;

      return {
        contractId: contract.id,
        city: contract.city,
        number: contract.number,
        investment,
        ownCash,
        thirdParty,
        monthlyRevenue,
        estimatedPaybackMonths,
        missingCostItems: items.filter((row) => row.estimatedCost <= 0).length
      };
    })
    .filter((row) => row.investment > 0 || row.missingCostItems > 0)
    .sort((first, second) => second.investment - first.investment);
}

function getFundingRecommendation({
  estimatedCurrentCash,
  ownCashInvestment,
  upcomingOwnCash90d
}: {
  estimatedCurrentCash: number;
  ownCashInvestment: number;
  upcomingOwnCash90d: number;
}) {
  const shortTermPressure = estimatedCurrentCash > 0 ? upcomingOwnCash90d / estimatedCurrentCash : 0;
  const totalPressure = estimatedCurrentCash > 0 ? ownCashInvestment / estimatedCurrentCash : 0;

  if (shortTermPressure >= 0.35 || totalPressure >= 0.8) {
    return {
      label: "Buscar capital de terceiros",
      tone: "critical" as const,
      reading: "O investimento consome uma parcela relevante do caixa. Simule fornecedor, banco ou parceiro antes de assumir caixa proprio."
    };
  }

  if (shortTermPressure >= 0.2 || totalPressure >= 0.5) {
    return {
      label: "Modelo hibrido",
      tone: "watch" as const,
      reading: "O caixa suporta parte do investimento, mas vale parcelar itens de maior peso e preservar capital de giro."
    };
  }

  return {
    label: "Caixa proprio possivel",
    tone: "safe" as const,
    reading: "Pelo cadastro atual, o desembolso nao pressiona o caixa de forma critica. Ainda assim, confirme itens sem custo estimado."
  };
}

function buildCfoQuestions({
  baselineBurn,
  committedInvestment,
  estimatedCurrentCash,
  missingCostItems,
  ownCashInvestment,
  thirdPartyInvestment,
  upcomingOwnCash90d
}: {
  baselineBurn: number;
  committedInvestment: number;
  estimatedCurrentCash: number;
  missingCostItems: number;
  ownCashInvestment: number;
  thirdPartyInvestment: number;
  upcomingOwnCash90d: number;
}) {
  return [
    {
      question: "Uso caixa proprio ou capital de terceiros?",
      answer: `Compare ${money(ownCashInvestment)} de caixa proprio contra caixa estimado de ${money(estimatedCurrentCash)} e burn-base de ${money(baselineBurn)}/mes. Se o projeto exigir preservar caixa, migre itens para fornecedor/terceiros.`
    },
    {
      question: "Quanto bate no caixa nos proximos 90 dias?",
      answer: `Pelo parcelamento dos itens, ${money(upcomingOwnCash90d)} aparece como pressao de curto prazo. Esse e o numero para negociar prazo com fornecedor.`
    },
    {
      question: "O investimento esta completo?",
      answer: missingCostItems > 0 ? `${missingCostItems} itens de contrato ainda nao tem custo estimado. Sem isso, o cockpit subestima capital necessario.` : "Todos os itens cadastrados ja possuem custo estimado."
    },
    {
      question: "Quanto ja esta financiado por terceiros?",
      answer: `${money(thirdPartyInvestment)} esta marcado como terceiros/fornecedor. O total comprometido cadastrado e ${money(committedInvestment)}.`
    }
  ];
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", maximumFractionDigits: 0, style: "currency" });
}
