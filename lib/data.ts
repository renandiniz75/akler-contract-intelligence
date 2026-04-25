import { asc } from "drizzle-orm";
import type { Capex, Contract, ContractItem, Opex, Revenue } from "@/lib/types";
import { seedData } from "@/lib/seed-data";

type AppData = {
  contracts: Contract[];
  contractItems: ContractItem[];
  capex: Capex[];
  opex: Opex[];
  revenue: Revenue[];
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

    const [contractRows, itemRows, capexRows, opexRows, revenueRows] = await Promise.all([
      db.select().from(schema.contracts).orderBy(asc(schema.contracts.city)),
      db.select().from(schema.contractItems).orderBy(asc(schema.contractItems.createdAt)),
      db.select().from(schema.capex).orderBy(asc(schema.capex.month)),
      db.select().from(schema.opex).orderBy(asc(schema.opex.month)),
      db.select().from(schema.revenue).orderBy(asc(schema.revenue.month))
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
        totalValue: toNumber(contract.totalValue)
      })),
      contractItems: itemRows.map((item) => ({
        id: item.id,
        contractId: item.contractId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice)
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
      }))
    };
  } catch (error) {
    console.error("Falling back to seed data because database read failed.", error);
    return { ...seedData, source: "seed" };
  }
}
