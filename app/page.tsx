import { Banknote, Landmark, Percent, Timer } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractsTable } from "@/components/contracts-table";
import { buildDashboardSummary, calculateCashFlow, formatCurrency, formatPercent } from "@/lib/calculations";
import { getAppData } from "@/lib/data";

export default async function DashboardPage() {
  const { capex, contracts, opex, revenue, source } = await getAppData();
  const summary = buildDashboardSummary(contracts, revenue, capex, opex);
  const cashFlow = calculateCashFlow(revenue, capex, opex);

  return (
    <>
      <PageHeader
        title="Dashboard executivo"
        description={`Visao consolidada dos contratos publicos, receitas, CAPEX, OPEX, margem e payback dos contratos Akler. Fonte: ${source === "database" ? "PostgreSQL" : "seed local"}.`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Contratado" value={formatCurrency(summary.totalContracted)} detail="Valor total em carteira" icon={Landmark} />
        <StatCard title="Receita realizada" value={formatCurrency(summary.realizedRevenue)} detail="Caixa ja reconhecido" icon={Banknote} />
        <StatCard title="Receita projetada" value={formatCurrency(summary.projectedRevenue)} detail="Forecast dos proximos meses" icon={Banknote} />
        <StatCard title="Margem bruta" value={formatPercent(summary.grossMargin)} detail="Receita menos CAPEX/OPEX" icon={Percent} />
        <StatCard title="Payback" value={summary.paybackMonth ?? "N/A"} detail="Mes de retorno acumulado" icon={Timer} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlow} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receita por status</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart realized={summary.realizedRevenue} projected={summary.projectedRevenue} />
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">CAPEX</span>
                <strong>{formatCurrency(summary.totalCapex)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">OPEX</span>
                <strong>{formatCurrency(summary.totalOpex)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Custo total</span>
                <strong>{formatCurrency(summary.totalCapex + summary.totalOpex)}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Contratos monitorados</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractsTable contracts={contracts} />
        </CardContent>
      </Card>
    </>
  );
}
