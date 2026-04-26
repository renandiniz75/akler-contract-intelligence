import { asc } from "drizzle-orm";
import type { Capex, Contract, ContractDocument, ContractItem, Opex, Revenue } from "@/lib/types";
import { seedData } from "@/lib/seed-data";

type AppData = {
  contracts: Contract[];
  contractItems: ContractItem[];
  capex: Capex[];
  opex: Opex[];
  revenue: Revenue[];
  contractDocuments: ContractDocument[];
  source: "database" | "seed";
};

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export async function getAppData(): Promise<AppData> {
  if (!hasDatabaseUrl()) {
    return { ...seedData, source: "seed" };
  }

  try {
    const [{ db }, schema] = await Promise.all([import("@/db"), import("@/db/schema")]);

    const [contractRows, itemRows, capexRows, opexRows, revenueRows, documentRows] = await Promise.all([
      db.select().from(schema.contracts).orderBy(asc(schema.contracts.city)),
      db.select().from(schema.contractItems).orderBy(asc(schema.contractItems.createdAt)),
      db.select().from(schema.capex).orderBy(asc(schema.capex.month)),
      db.select().from(schema.opex).orderBy(asc(schema.opex.month)),
      db.select().from(schema.revenue).orderBy(asc(schema.revenue.month)),
      db.select().from(schema.contractDocuments).orderBy(asc(schema.contractDocuments.uploadedAt))
    ]);

    return {
      source: "database",
      contracts: contractRows.map((contract) => ({
        id: contract.id,
        city: contract.city,
        agency: contract.agency,
        number: contract.number,
        object: contract.object,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        totalValue: toNumber(contract.totalValue),
        initialTermMonths: contract.initialTermMonths,
        renewalCount: contract.renewalCount,
        renewalTermMonths: contract.renewalTermMonths,
        revenueProjectionMonths: contract.revenueProjectionMonths,
        revenueAdjustmentRate: toNumber(contract.revenueAdjustmentRate),
        revenueAdjustmentFrequencyMonths: contract.revenueAdjustmentFrequencyMonths
      })),
      contractItems: itemRows.map((item) => ({
        id: item.id,
        contractId: item.contractId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        investmentCategory: item.investmentCategory,
        estimatedCost: toNumber(item.estimatedCost),
        paymentStartOffsetMonths: item.paymentStartOffsetMonths,
        installmentCount: item.installmentCount,
        paymentSource: item.paymentSource
      })),
      capex: capexRows.map((item) => ({
        id: item.id,
        contractId: item.contractId,
        month: item.month,
        category: item.category,
        description: item.description,
        amount: toNumber(item.amount)
      })),
      opex: opexRows.map((item) => ({
        id: item.id,
        contractId: item.contractId,
        month: item.month,
        category: item.category,
        description: item.description,
        amount: toNumber(item.amount)
      })),
      revenue: revenueRows.map((item) => ({
        id: item.id,
        contractId: item.contractId,
        month: item.month,
        status: item.status,
        description: item.description,
        amount: toNumber(item.amount)
      })),
      contractDocuments: documentRows.map((item) => ({
        id: item.id,
        contractId: item.contractId,
        title: item.title,
        type: item.type,
        url: item.url,
        uploadedAt: item.uploadedAt.toISOString()
      }))
    };
  } catch (error) {
    console.error("Falling back to seed data because database read failed.", error);
    return { ...seedData, source: "seed" };
  }
}
