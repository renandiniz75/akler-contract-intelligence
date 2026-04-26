import type { Capex, CashFlowMonth, Contract, DashboardSummary, Opex, Revenue } from "@/lib/types";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
});

export function formatCurrency(value: number) {
  return currency.format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function calculateMargin(revenue: number, costs: number) {
  if (revenue === 0) {
    return 0;
  }

  return ((revenue - costs) / revenue) * 100;
}

export function calculateCashFlow(revenue: Revenue[], capex: Capex[], opex: Opex[]): CashFlowMonth[] {
  const months = new Set<string>();

  revenue.forEach((item) => months.add(item.month));
  capex.forEach((item) => months.add(item.month));
  opex.forEach((item) => months.add(item.month));

  let cumulative = 0;

  return Array.from(months)
    .sort()
    .map((month) => {
      const monthRevenue = revenue.filter((item) => item.month === month);
      const projectedRevenue = monthRevenue
        .filter((item) => item.status === "projected")
        .reduce((sum, item) => sum + item.amount, 0);
      const realizedRevenue = monthRevenue
        .filter((item) => item.status === "realized")
        .reduce((sum, item) => sum + item.amount, 0);
      const capexAmount = capex
        .filter((item) => item.month === month)
        .reduce((sum, item) => sum + item.amount, 0);
      const opexAmount = opex
        .filter((item) => item.month === month)
        .reduce((sum, item) => sum + item.amount, 0);
      const netProjected = projectedRevenue + realizedRevenue - capexAmount - opexAmount;
      const netRealized = realizedRevenue - capexAmount - opexAmount;

      cumulative += netProjected;

      return {
        month,
        projectedRevenue,
        realizedRevenue,
        capex: capexAmount,
        opex: opexAmount,
        netProjected,
        netRealized,
        cumulative
      };
    });
}

export function calculatePayback(cashFlow: CashFlowMonth[]) {
  return cashFlow.find((item) => item.cumulative >= 0)?.month ?? null;
}

export function buildDashboardSummary(
  contracts: Contract[],
  revenue: Revenue[],
  capex: Capex[],
  opex: Opex[]
): DashboardSummary {
  const totalContracted = contracts.reduce((sum, item) => sum + item.totalValue, 0);
  const projectedRevenue = revenue
    .filter((item) => item.status === "projected")
    .reduce((sum, item) => sum + item.amount, 0);
  const realizedRevenue = revenue
    .filter((item) => item.status === "realized")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalCapex = capex.reduce((sum, item) => sum + item.amount, 0);
  const totalOpex = opex.reduce((sum, item) => sum + item.amount, 0);
  const cashFlow = calculateCashFlow(revenue, capex, opex);

  return {
    totalContracted,
    projectedRevenue,
    realizedRevenue,
    totalCapex,
    totalOpex,
    grossMargin: calculateMargin(projectedRevenue + realizedRevenue, totalCapex + totalOpex),
    paybackMonth: calculatePayback(cashFlow),
    optimisticMonths: Math.max(
      ...contracts.map((contract) => contract.initialTermMonths + contract.renewalCount * contract.renewalTermMonths),
      0
    )
  };
}
