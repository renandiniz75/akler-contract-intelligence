import type { Capex, Contract, ContractItem, Revenue } from "@/lib/types";

function addMonths(date: Date, months: number) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getContractPotentialMonths(contract: Contract) {
  return contract.initialTermMonths + contract.renewalCount * contract.renewalTermMonths;
}

export function buildOptimisticRevenueProjection(contracts: Contract[], revenue: Revenue[]): Revenue[] {
  const existingRevenueKeys = new Set(revenue.map((item) => `${item.contractId}:${item.month}`));
  const generatedRevenue = contracts.flatMap((contract) => {
    const totalMonths = getContractPotentialMonths(contract);
    const monthlyAmount = contract.totalValue / contract.initialTermMonths;
    const startDate = new Date(`${contract.startDate}T00:00:00.000Z`);

    return Array.from({ length: totalMonths }, (_, index): Revenue | null => {
      const month = monthKey(addMonths(startDate, index));
      const key = `${contract.id}:${month}`;

      if (existingRevenueKeys.has(key)) {
        return null;
      }

      return {
        id: `optimistic-${contract.id}-${month}`,
        contractId: contract.id,
        month,
        status: "projected" as const,
        description: `Projecao otimista com ${contract.renewalCount} renovacoes`,
        amount: monthlyAmount,
        generated: true
      };
    }).filter((item): item is Revenue => item !== null);
  });

  return [...revenue, ...generatedRevenue];
}

export function buildProjectedInvestmentCapex(contracts: Contract[], contractItems: ContractItem[], capex: Capex[]): Capex[] {
  const generatedCapex = contractItems.flatMap((item) => {
    if (item.estimatedCost <= 0 || item.paymentSource !== "own_cash") {
      return [];
    }

    const contract = contracts.find((candidate) => candidate.id === item.contractId);

    if (!contract) {
      return [];
    }

    const startDate = new Date(`${contract.startDate}T00:00:00.000Z`);
    const installmentAmount = item.estimatedCost / item.installmentCount;

    return Array.from({ length: item.installmentCount }, (_, index): Capex => {
      const month = monthKey(addMonths(startDate, item.paymentStartOffsetMonths + index));

      return {
        id: `projected-investment-${item.id}-${month}`,
        contractId: item.contractId,
        month,
        category: item.investmentCategory,
        description: `Investimento previsto: ${item.description}`,
        amount: installmentAmount,
        generated: true
      };
    });
  });

  return [...capex, ...generatedCapex];
}

export function getOptimisticHorizonMonths(contracts: Contract[]) {
  return Math.max(...contracts.map(getContractPotentialMonths), 0);
}
