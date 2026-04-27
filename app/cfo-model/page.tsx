import { asc } from "drizzle-orm";
import { Banknote, FileSpreadsheet, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { cfoCategoryConsolidation, cfoMonthlyConsolidation } from "@/lib/cfo-consolidated-data";
import { cfoWorkbookInsights } from "@/lib/cfo-insights";

export const dynamic = "force-dynamic";

type MonthlyRow = {
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

type CategoryRow = {
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

async function getCfoData(): Promise<{ monthly: MonthlyRow[]; categories: CategoryRow[]; source: "database" | "embedded" }> {
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

export default async function CfoModelPage() {
  const { categories, monthly, source } = await getCfoData();
  const actualMonths = monthly.filter((row) => row.actualOperatingReceipts > 0 || row.actualOperatingPayments > 0);
  const projectedMonths = monthly.filter((row) => row.projectedReceipts > 0 || row.projectedExpenses > 0 || row.projectedInvestments > 0);
  const actualReceipts = sum(actualMonths, "actualOperatingReceipts");
  const actualPayments = sum(actualMonths, "actualOperatingPayments");
  const projectedReceipts = sum(projectedMonths, "projectedReceipts");
  const projectedExpenses = sum(projectedMonths, "projectedExpenses");
  const projectedInvestments = sum(projectedMonths, "projectedInvestments");
  const actualBurnAverage = actualMonths.length > 0 ? actualPayments / actualMonths.length : 0;
  const projectedBurnAverage = projectedMonths.length > 0 ? (projectedExpenses + projectedInvestments) / projectedMonths.length : 0;
  const minProjectedCash = projectedMonths.reduce((min, row) => Math.min(min, row.projectedCash), cfoWorkbookInsights.initialCash);
  const topActualExpenses = topCategories(categories, "actual_expense");
  const topProjectedExpenses = topCategories(categories, "projected_expense");
  const financialSeparated = sumByTreatment(categories, "financial_separated");
  const intercompanyEliminated = sumByTreatment(categories, "intercompany_eliminated");

  return (
    <>
      <PageHeader
        title="Modelo CFO"
        description={`Consolidacao operacional da planilha CFO em base ${source === "database" ? "PostgreSQL" : "embarcada"}: receitas, despesas, investimentos, intercompany e aplicacoes separados para curadoria.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Caixa inicial" value={formatCurrency(cfoWorkbookInsights.initialCash)} detail="Base CFO 31/12/2025" icon={Banknote} />
        <StatCard title="Receita realizada" value={formatCurrency(actualReceipts)} detail={`${actualMonths.length} meses com movimento`} icon={TrendingUp} />
        <StatCard title="Saida realizada" value={formatCurrency(actualPayments)} detail={`Media ${formatCurrency(actualBurnAverage)}/mes`} icon={TrendingDown} />
        <StatCard title="Burn projetado" value={formatCurrency(projectedBurnAverage)} detail="Despesas + investimentos" icon={WalletCards} />
        <StatCard title="Menor caixa proj." value={formatCurrency(minProjectedCash)} detail={`${projectedMonths.length} meses projetados`} icon={FileSpreadsheet} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumo mensal consolidado</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Entradas reais</TableHead>
                  <TableHead className="text-right">Saidas reais</TableHead>
                  <TableHead className="text-right">Receita proj.</TableHead>
                  <TableHead className="text-right">Despesas proj.</TableHead>
                  <TableHead className="text-right">Invest. proj.</TableHead>
                  <TableHead className="text-right">Caixa proj.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.slice(0, 18).map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.actualOperatingReceipts)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.actualOperatingPayments)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.projectedReceipts)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.projectedExpenses)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.projectedInvestments)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(row.projectedCash)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tratamentos de consolidacao</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Metric label="Aplicacoes/resgates separados" value={formatCurrency(financialSeparated)} />
            <Metric label="Intercompany eliminado" value={formatCurrency(intercompanyEliminated)} />
            <Metric label="Receita projetada total" value={formatCurrency(projectedReceipts)} />
            <Metric label="Despesas projetadas totais" value={formatCurrency(projectedExpenses + projectedInvestments)} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <CategoryTable title="Top despesas realizadas" rows={topActualExpenses} />
        <CategoryTable title="Top despesas projetadas" rows={topProjectedExpenses} />
      </div>
    </>
  );
}

function sum(rows: MonthlyRow[], key: keyof MonthlyRow) {
  return rows.reduce((total, row) => total + Number(row[key]), 0);
}

function topCategories(rows: CategoryRow[], source: string) {
  const grouped = new Map<string, { category: string; amount: number; rowCount: number }>();

  rows
    .filter((row) => row.source === source && row.treatment === "operational")
    .forEach((row) => {
      const current = grouped.get(row.category) ?? { category: row.category, amount: 0, rowCount: 0 };
      current.amount += row.amount;
      current.rowCount += row.rowCount;
      grouped.set(row.category, current);
    });

  return Array.from(grouped.values())
    .sort((first, second) => second.amount - first.amount)
    .slice(0, 10);
}

function sumByTreatment(rows: CategoryRow[], treatment: string) {
  return rows.filter((row) => row.treatment === treatment).reduce((total, row) => total + row.amount, 0);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function CategoryTable({ title, rows }: { title: string; rows: Array<{ category: string; amount: number; rowCount: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Linhas</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium">{row.category}</TableCell>
                <TableCell className="text-right">{row.rowCount}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
