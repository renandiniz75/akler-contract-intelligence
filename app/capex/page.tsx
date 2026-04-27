import { Banknote, CircleDollarSign, PiggyBank, SearchCheck } from "lucide-react";
import { FinanceTable } from "@/components/finance-table";
import { FinanceForm } from "@/components/forms/finance-form";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { getCfoData } from "@/lib/cfo-data";
import { getAppData } from "@/lib/data";
import { buildInvestmentCockpit } from "@/lib/investment-strategy";
import { buildProjectedInvestmentCapex } from "@/lib/projections";

export const dynamic = "force-dynamic";

export default async function CapexPage() {
  const { capex, contractItems, contracts, opex } = await getAppData();
  const { monthly } = await getCfoData();
  const projectedCapex = buildProjectedInvestmentCapex(contracts, contractItems, capex);
  const cockpit = buildInvestmentCockpit({ capex, contractItems, contracts, monthly, opex });

  return (
    <>
      <PageHeader
        title="Investimentos"
        description="Capital necessario para implantar contratos e projetos: cameras, servidores, licencas, mobiliario, obra, equipe de implantacao e parcelamento de fornecedor."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Capital comprometido" value={formatCurrency(cockpit.committedInvestment)} detail="Itens + lancamentos manuais" icon={PiggyBank} />
        <StatCard title="Caixa proprio" value={formatCurrency(cockpit.ownCashInvestment)} detail="Desembolso Akler" icon={Banknote} />
        <StatCard title="Terceiros" value={formatCurrency(cockpit.thirdPartyInvestment)} detail="Fornecedor, banco ou parceiro" icon={CircleDollarSign} />
        <StatCard title="A classificar" value={String(cockpit.missingCostItems)} detail="Itens sem custo estimado" icon={SearchCheck} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Como decidir o funding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-md border bg-white p-4">
            <Badge className={cockpit.fundingRecommendation.tone === "critical" ? "border-red-200 bg-red-50 text-red-700" : cockpit.fundingRecommendation.tone === "watch" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
              {cockpit.fundingRecommendation.label}
            </Badge>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{cockpit.fundingRecommendation.reading}</p>
          </div>
          <div className="grid gap-3">
            {cockpit.cfoQuestions.map((item) => (
              <div key={item.question} className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-semibold">{item.question}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exposicao por contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Receita mensal</TableHead>
                <TableHead className="text-right">Investimento</TableHead>
                <TableHead className="text-right">Terceiros</TableHead>
                <TableHead className="text-right">Payback estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cockpit.exposure.map((row) => (
                <TableRow key={row.contractId}>
                  <TableCell>
                    <div className="font-medium">{row.city}</div>
                    <div className="text-xs text-muted-foreground">{row.number}</div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(row.monthlyRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.investment)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.thirdParty)}</TableCell>
                  <TableCell className="text-right">{row.estimatedPaybackMonths ? `${row.estimatedPaybackMonths} meses` : "A classificar"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Parcelamento do investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={projectedCapex}
              label="Categoria"
              contracts={contracts}
              mode="capex"
              emptyMessage="Ainda nao ha desembolsos de investimento cadastrados. A planilha trouxe valores comerciais/implantacao, mas nao custos de fornecedor por item."
            />
          </CardContent>
        </Card>
        <FinanceForm title="Novo investimento" mode="capex" contracts={contracts} />
      </div>
    </>
  );
}
