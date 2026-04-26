export type CapacityScenarioInput = {
  name: string;
  initialCash: number;
  units: number;
  investmentPerUnit: number;
  supplierInstallments: number;
  supplierStartOffsetMonths: number;
  supplierStartOffsetDays: number;
  revenuePerUnitMonthly: number;
  revenueDurationMonths: number;
  revenueStartOffsetMonths: number;
  revenueReceiptDelayDays: number;
  monthlyFixedBurn: number;
  minimumCashBuffer: number;
};

export type CapacityScenarioMonth = {
  month: number;
  investmentOutflow: number;
  newRevenue: number;
  fixedBurn: number;
  net: number;
  cumulativeCash: number;
};

export type CapacityScenarioResult = {
  totalInvestment: number;
  monthlyRevenue: number;
  totalRevenue: number;
  lowestCash: number;
  requiredCapital: number;
  paybackMonth: number | null;
  feasible: boolean;
  bufferBreached: boolean;
  months: CapacityScenarioMonth[];
};

function daysToMonthOffset(days: number) {
  return Math.ceil(days / 30);
}

export function simulateCapacityScenario(input: CapacityScenarioInput): CapacityScenarioResult {
  const supplierStartOffset = input.supplierStartOffsetMonths + daysToMonthOffset(input.supplierStartOffsetDays);
  const revenueStartOffset = input.revenueStartOffsetMonths + daysToMonthOffset(input.revenueReceiptDelayDays);
  const horizon = Math.max(
    supplierStartOffset + input.supplierInstallments,
    revenueStartOffset + input.revenueDurationMonths,
    24
  );
  const totalInvestment = input.units * input.investmentPerUnit;
  const investmentInstallment = totalInvestment / input.supplierInstallments;
  const monthlyRevenue = input.units * input.revenuePerUnitMonthly;
  const totalRevenue = monthlyRevenue * input.revenueDurationMonths;
  let cumulativeCash = input.initialCash;
  let lowestCash = cumulativeCash;
  let paybackMonth: number | null = null;

  const months = Array.from({ length: horizon }, (_, index): CapacityScenarioMonth => {
    const month = index + 1;
    const paysSupplier = month > supplierStartOffset && month <= supplierStartOffset + input.supplierInstallments;
    const receivesRevenue = month > revenueStartOffset && month <= revenueStartOffset + input.revenueDurationMonths;
    const investmentOutflow = paysSupplier ? investmentInstallment : 0;
    const newRevenue = receivesRevenue ? monthlyRevenue : 0;
    const fixedBurn = input.monthlyFixedBurn;
    const net = newRevenue - investmentOutflow - fixedBurn;

    cumulativeCash += net;
    lowestCash = Math.min(lowestCash, cumulativeCash);

    if (paybackMonth === null && cumulativeCash >= input.initialCash && month > supplierStartOffset) {
      paybackMonth = month;
    }

    return {
      month,
      investmentOutflow,
      newRevenue,
      fixedBurn,
      net,
      cumulativeCash
    };
  });

  return {
    totalInvestment,
    monthlyRevenue,
    totalRevenue,
    lowestCash,
    requiredCapital: Math.max(0, -lowestCash),
    paybackMonth,
    feasible: lowestCash >= input.minimumCashBuffer,
    bufferBreached: lowestCash < input.minimumCashBuffer,
    months
  };
}
