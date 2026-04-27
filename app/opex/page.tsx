import { WalletCards, AlertTriangle, Link2, Repeat } from "lucide-react";
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
import { buildCfoStrategy, getStrategicClassLabel } from "@/lib/cfo-strategy";

export const dynamic = "force-dynamic";

export default async function OpexPage() {
  const { contracts, opex } = await getAppData();
  const { categories, monthly } = await getCfoData();
  const strategy = buildCfoStrategy(monthly, categories);
  const recurringCategories = strategy.categoryExplanations.filter((row) => row.strategicClass === "recurring_opex" || row.strategicClass === "tax_payroll");
  const deliveryCategories = strategy.categoryExplanations.filter((row) => row.strategicClass === "delivery_cost" || row.strategicClass === "needs_curation");
  const recurringAmount = recurringCategories.reduce((sum, row) => sum + row.amount, 0);
  const deliveryAmount = deliveryCategories.reduce((sum, row) => sum + row.amount, 0);

  return (
    <>
      <PageHeader
        title="Despesas operacionais"
        description="Custos perenes e custos de entrega que precisam ser separados de investimento. O objetivo aqui e descobrir o que virou burn recorrente e o que pertence a contrato/projeto."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Burn-base CFO" value={formatCurrency(strategy.baselineBurn)} detail="Mediana projetada mensal" icon={Repeat} />
        <StatCard title="Recorrente identificado" value={formatCurrency(recurringAmount)} detail="Folha, tributos e OPEX" icon={WalletCards} />
        <StatCard title="Entrega/curadoria" value={formatCurrency(deliveryAmount)} detail="Pode conter implantacao" icon={AlertTriangle} />
        <StatCard title="OPEX vinculado" value={formatCurrency(opex.reduce((sum, row) => sum + row.amount, 0))} detail="Lancado contrato a contrato" icon={Link2} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Classificacao CFO para despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Leitura</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategy.categoryExplanations.slice(0, 10).map((row) => (
                <TableRow key={`${row.strategicClass}-${row.category}`}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell>
                    <Badge className={row.strategicClass === "delivery_cost" || row.strategicClass === "needs_curation" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"}>
                      {getStrategicClassLabel(row.strategicClass)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.reading}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Despesas vinculadas a contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={opex}
              label="Categoria"
              contracts={contracts}
              mode="opex"
              emptyMessage="Ainda nao ha OPEX por contrato importado. A planilha CFO tem despesas consolidadas, mas a maioria ainda nao esta vinculada contrato a contrato."
            />
          </CardContent>
        </Card>
        <FinanceForm title="Novo OPEX" mode="opex" contracts={contracts} />
      </div>
    </>
  );
}
