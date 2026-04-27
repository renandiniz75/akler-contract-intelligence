import { asc } from "drizzle-orm";
import { cfoProjectedExpenseRows } from "@/lib/cfo-projected-expense-data";

export type StrategicExpenseClass =
  | "delivery_cost"
  | "financial"
  | "intercompany"
  | "investment_candidate"
  | "needs_curation"
  | "recurring_opex"
  | "tax_payroll";

export type CfoProjectedExpense = {
  id?: string;
  sourceRow: number;
  company: string;
  dueDate: string;
  month: string;
  document: string;
  counterparty: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  subcategory: string;
  originFile: string;
  contractRef: string;
  notes: string;
  strategicClass: StrategicExpenseClass;
  searchText: string;
};

export type ProjectedExpenseGroup = {
  key: string;
  description: string;
  category: string;
  type: string;
  originFile: string;
  strategicClass: StrategicExpenseClass;
  amount: number;
  rowCount: number;
  firstMonth: string;
  lastMonth: string;
};

export function getStrategicExpenseClassLabel(value: string) {
  const labels: Record<string, string> = {
    delivery_cost: "Custo de entrega",
    financial: "Financeiro",
    intercompany: "Intercompany",
    investment_candidate: "Candidato a investimento",
    needs_curation: "Precisa curadoria",
    recurring_opex: "OPEX recorrente",
    tax_payroll: "Folha/tributos"
  };

  return labels[value] ?? value;
}

export async function getCfoProjectedExpenses(): Promise<{ rows: CfoProjectedExpense[]; source: "database" | "embedded" }> {
  try {
    const [{ db }, schema] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const rows = await db.select().from(schema.cfoProjectedExpenses).orderBy(asc(schema.cfoProjectedExpenses.month));

    if (rows.length === 0) {
      throw new Error("Projected expense table is empty.");
    }

    return {
      source: "database",
      rows: rows.map((row) => ({
        id: row.id,
        sourceRow: row.sourceRow,
        company: row.company,
        dueDate: row.dueDate,
        month: row.month,
        document: row.document,
        counterparty: row.counterparty,
        description: row.description,
        amount: Number(row.amount),
        type: row.type,
        category: row.category,
        subcategory: row.subcategory,
        originFile: row.originFile,
        contractRef: row.contractRef,
        notes: row.notes,
        strategicClass: row.strategicClass as StrategicExpenseClass,
        searchText: row.searchText
      }))
    };
  } catch {
    return {
      source: "embedded",
      rows: cfoProjectedExpenseRows.map((row) => ({ ...row, strategicClass: row.strategicClass as StrategicExpenseClass }))
    };
  }
}

export function filterProjectedExpenses(rows: CfoProjectedExpense[], query: string) {
  const terms = normalize(query)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return rows;
  }

  return rows.filter((row) => {
    const haystack = normalize(row.searchText);
    return terms.every((term) => haystack.includes(term));
  });
}

export function groupProjectedExpenses(rows: CfoProjectedExpense[]): ProjectedExpenseGroup[] {
  const groups = new Map<string, ProjectedExpenseGroup>();

  rows.forEach((row) => {
    const description = row.description || row.counterparty || "Sem descricao";
    const key = [description, row.category, row.type, row.originFile, row.strategicClass].join("|");
    const current =
      groups.get(key) ??
      ({
        key,
        description,
        category: row.category,
        type: row.type,
        originFile: row.originFile,
        strategicClass: row.strategicClass,
        amount: 0,
        rowCount: 0,
        firstMonth: row.month,
        lastMonth: row.month
      } satisfies ProjectedExpenseGroup);

    current.amount += row.amount;
    current.rowCount += 1;
    current.firstMonth = current.firstMonth < row.month ? current.firstMonth : row.month;
    current.lastMonth = current.lastMonth > row.month ? current.lastMonth : row.month;
    groups.set(key, current);
  });

  return Array.from(groups.values()).sort((first, second) => second.amount - first.amount);
}

export function summarizeProjectedExpenseRows(rows: CfoProjectedExpense[]) {
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  const months = new Set(rows.map((row) => row.month));
  const groups = groupProjectedExpenses(rows);
  const needsCuration = rows.filter((row) => row.strategicClass === "needs_curation").length;
  const investmentCandidates = rows.filter((row) => row.strategicClass === "investment_candidate").reduce((sum, row) => sum + row.amount, 0);

  return {
    totalAmount,
    totalRows: rows.length,
    totalGroups: groups.length,
    totalMonths: months.size,
    needsCuration,
    investmentCandidates
  };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
