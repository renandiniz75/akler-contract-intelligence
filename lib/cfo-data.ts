import { asc } from "drizzle-orm";
import { cfoCategoryConsolidation, cfoMonthlyConsolidation } from "@/lib/cfo-consolidated-data";

export type MonthlyRow = {
  month: string;
  actualOperatingReceipts: number;
  actualOperatingPayments: number;
  actualOperatingNet: number;
  actualInvoicedRevenue: number;
  actualFinancialInflows: number;
  actualFinancialOutflows: number;
  actualIntercompanyInflows: number;
  actualIntercompanyOutflows: number;
  projectedReceipts: number;
  projectedExpenses: number;
  projectedInvestments: number;
  projectedNet: number;
  actualOperationalCash: number;
  projectedCash: number;
};

export type CategoryRow = {
  month: string;
  source: string;
  category: string;
  subcategory: string;
  flowType: string;
  treatment: string;
  amount: number;
  rowCount: number;
};

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export async function getCfoData(): Promise<{ monthly: MonthlyRow[]; categories: CategoryRow[]; source: "database" | "embedded" }> {
  try {
    const [{ db }, schema] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const [monthlyRows, categoryRows] = await Promise.all([
      db.select().from(schema.cfoMonthlySummaries).orderBy(asc(schema.cfoMonthlySummaries.month)),
      db.select().from(schema.cfoCategorySummaries).orderBy(asc(schema.cfoCategorySummaries.month))
    ]);

    if (monthlyRows.length === 0) {
      throw new Error("CFO tables are empty.");
    }

    return {
      source: "database",
      monthly: monthlyRows.map((row) => ({
        month: row.month,
        actualOperatingReceipts: toNumber(row.actualOperatingReceipts),
        actualOperatingPayments: toNumber(row.actualOperatingPayments),
        actualOperatingNet: toNumber(row.actualOperatingNet),
        actualInvoicedRevenue: toNumber(row.actualInvoicedRevenue),
        actualFinancialInflows: toNumber(row.actualFinancialInflows),
        actualFinancialOutflows: toNumber(row.actualFinancialOutflows),
        actualIntercompanyInflows: toNumber(row.actualIntercompanyInflows),
        actualIntercompanyOutflows: toNumber(row.actualIntercompanyOutflows),
        projectedReceipts: toNumber(row.projectedReceipts),
        projectedExpenses: toNumber(row.projectedExpenses),
        projectedInvestments: toNumber(row.projectedInvestments),
        projectedNet: toNumber(row.projectedNet),
        actualOperationalCash: toNumber(row.actualOperationalCash),
        projectedCash: toNumber(row.projectedCash)
      })),
      categories: categoryRows.map((row) => ({
        month: row.month,
        source: row.source,
        category: row.category,
        subcategory: row.subcategory,
        flowType: row.flowType,
        treatment: row.treatment,
        amount: toNumber(row.amount),
        rowCount: row.rowCount
      }))
    };
  } catch {
    return {
      source: "embedded",
      monthly: cfoMonthlyConsolidation.map((row) => ({ ...row })),
      categories: cfoCategoryConsolidation.map((row) => ({ ...row }))
    };
  }
}
