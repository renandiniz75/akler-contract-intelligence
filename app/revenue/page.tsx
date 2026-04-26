import { FinanceTable } from "@/components/finance-table";
import { FinanceForm } from "@/components/forms/finance-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAppData } from "@/lib/data";
import { buildOptimisticRevenueProjection } from "@/lib/projections";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const { contracts, revenue } = await getAppData();
  const projectedRevenue = buildOptimisticRevenueProjection(contracts, revenue);

  return (
    <>
      <PageHeader title="Receita" description="Receita realizada por lancamento e receita projetada pela regra financeira de cada contrato." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Receita realizada e projetada</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={projectedRevenue}
              label="Status"
              contracts={contracts}
              mode="revenue"
              emptyMessage="Nenhuma receita cadastrada ou projetada."
            />
          </CardContent>
        </Card>
        <FinanceForm title="Nova receita" mode="revenue" contracts={contracts} />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Regras de projecao por contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Horizonte</TableHead>
                <TableHead className="text-right">Reajuste</TableHead>
                <TableHead className="text-right">Frequencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.city} · {contract.number}</TableCell>
                  <TableCell className="text-right">{contract.revenueProjectionMonths} meses</TableCell>
                  <TableCell className="text-right">{contract.revenueAdjustmentRate}%</TableCell>
                  <TableCell className="text-right">{contract.revenueAdjustmentFrequencyMonths} meses</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
