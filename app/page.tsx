import Link from "next/link";
import { Banknote, Landmark, PiggyBank, Timer } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractsTable } from "@/components/contracts-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildDashboardSummary, calculateCashFlow, formatCurrency } from "@/lib/calculations";
import { getCfoData } from "@/lib/cfo-data";
import { getAppData } from "@/lib/data";
import { buildInvestmentCockpit } from "@/lib/investment-strategy";
import { buildOptimisticRevenueProjection, buildProjectedInvestmentCapex } from "@/lib/projections";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { capex, contractItems, contracts, opex, revenue, source } = await getAppData();
  const { monthly } = await getCfoData();
  const optimisticRevenue = buildOptimisticRevenueProjection(contracts, revenue);
  const projectedCapex = buildProjectedInvestmentCapex(contracts, contractItems, capex);
  const summary = buildDashboardSummary(contracts, optimisticRevenue, projectedCapex, opex);
  const cashFlow = calculateCashFlow(optimisticRevenue, projectedCapex, opex);
  const investment = buildInvestmentCockpit({ capex, contractItems, contracts, monthly, opex });

  return (
    <>
      <PageHeader
        title="Dashboard executivo"
        description={`Cockpit de contratos, caixa e decisao de investimento. Fonte operacional: ${source === "database" ? "PostgreSQL" : "seed local"}.`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Contratado" value={formatCurrency(summary.totalContracted)} detail="Valor total em carteira" icon={Landmark} />
        <StatCard title="Receita realizada" value={formatCurrency(summary.realizedRevenue)} detail="Caixa ja reconhecido" icon={Banknote} />
        <StatCard title="Receita projetada" value={formatCurrency(summary.projectedRevenue)} detail="Forecast dos proximos meses" icon={Banknote} />
        <StatCard title="Capital comprometido" value={formatCurrency(investment.committedInvestment)} detail="Itens e investimentos cadastrados" icon={PiggyBank} />
        <StatCard title="Horizonte" value={`${summary.optimisticMonths} meses`} detail="Prazo inicial + renovações" icon={Timer} />
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
            <CardTitle>Capital e funding</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{investment.fundingRecommendation.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{investment.fundingRecommendation.reading}</p>
                </div>
                <Badge className={fundingToneClass(investment.fundingRecommendation.tone)}>Funding</Badge>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <Metric label="Caixa proprio comprometido" value={formatCurrency(investment.ownCashInvestment)} />
              <Metric label="Terceiros/fornecedor" value={formatCurrency(investment.thirdPartyInvestment)} />
              <Metric label="Pressao 90 dias" value={formatCurrency(investment.upcomingOwnCash90d)} />
              <Metric label="Despesa recorrente vinculada" value={formatCurrency(investment.recurringOpex)} />
              <Metric label="Itens sem custo estimado" value={String(investment.missingCostItems)} />
            </div>
            <Button asChild variant="outline">
              <Link href="/capacity">Simular projeto novo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Decisoes que o CFO precisa responder</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {investment.cfoQuestions.map((item) => (
              <div key={item.question} className="rounded-md border bg-white p-4">
                <p className="text-sm font-semibold">{item.question}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Investimento por contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead className="text-right">Investimento</TableHead>
                  <TableHead className="text-right">Caixa proprio</TableHead>
                  <TableHead className="text-right">Payback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investment.exposure.slice(0, 6).map((row) => (
                  <TableRow key={row.contractId}>
                    <TableCell>
                      <div className="font-medium">{row.city}</div>
                      <div className="text-xs text-muted-foreground">{row.number}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.investment)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.ownCash)}</TableCell>
                    <TableCell className="text-right">{row.estimatedPaybackMonths ? `${row.estimatedPaybackMonths} meses` : "A classificar"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function fundingToneClass(tone: "safe" | "watch" | "critical") {
  if (tone === "critical") return "border-red-200 bg-red-50 text-red-700";
  if (tone === "watch") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
