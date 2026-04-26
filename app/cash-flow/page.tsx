import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateCashFlow, formatCurrency } from "@/lib/calculations";
import { getAppData } from "@/lib/data";
import { buildOptimisticRevenueProjection, getOptimisticHorizonMonths } from "@/lib/projections";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const { capex, contracts, opex, revenue } = await getAppData();
  const optimisticRevenue = buildOptimisticRevenueProjection(contracts, revenue);
  const cashFlow = calculateCashFlow(optimisticRevenue, capex, opex);
  const horizonMonths = getOptimisticHorizonMonths(contracts);

  return (
    <>
      <PageHeader
        title="Fluxo de caixa"
        description={`Cenario otimista com receitas projetadas ate ${horizonMonths} meses, considerando prazo inicial e renovações contratuais.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Curva de caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <CashFlowChart data={cashFlow} />
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Memoria de calculo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Receita realizada</TableHead>
                <TableHead className="text-right">Receita projetada</TableHead>
                <TableHead className="text-right">CAPEX</TableHead>
                <TableHead className="text-right">OPEX</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlow.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.realizedRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.projectedRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.capex)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.opex)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.netProjected)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.cumulative)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
