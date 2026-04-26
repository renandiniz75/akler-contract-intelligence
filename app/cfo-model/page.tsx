import { Banknote, ClipboardList, FileSpreadsheet, Landmark, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { cfoWorkbookInsights } from "@/lib/cfo-insights";

export default function CfoModelPage() {
  const insights = cfoWorkbookInsights;

  return (
    <>
      <PageHeader
        title="Modelo CFO"
        description="Leitura da planilha gerencial consolidada como base conceitual do sistema: caixa, contratos, receitas, despesas, investimentos e movimentos a eliminar."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Caixa inicial" value={formatCurrency(insights.initialCash)} detail="31/12/2025 consolidado" icon={Banknote} />
        <StatCard title="Contratos" value={`${insights.contracts.count}`} detail="Base CFO importada" icon={ClipboardList} />
        <StatCard title="Receita mensal" value={formatCurrency(insights.contracts.monthlyTotal)} detail="Carteira consolidada" icon={Landmark} />
        <StatCard title="Implantacao" value={formatCurrency(insights.contracts.implementationTotal)} detail="Valor comercial estimado" icon={WalletCards} />
        <StatCard title="Horizonte" value={`${insights.contracts.maxPendingMonths} meses`} detail={`${insights.periodStart} a ${insights.periodEnd}`} icon={FileSpreadsheet} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <InsightTable title="Faturamento realizado por cliente" rows={insights.actualRevenueByClient} />
        <InsightTable title="Receita projetada por tipo" rows={insights.projectedRevenueByType} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Taxonomia de despesas realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tratamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.actualExpenseCategories.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell>{row.treatment}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <InsightTable title="Despesas projetadas por categoria" rows={insights.projectedExpenseCategories} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regras de tratamento do caixa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {insights.movementTreatments.map((item) => (
              <div key={item.label} className="rounded-md border bg-white p-3">
                <p className="font-medium">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.rule}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modelo recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm">
              {insights.recommendedModel.map((item) => (
                <li key={item} className="rounded-md border bg-white p-3">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function InsightTable({ title, rows }: { title: string; rows: Array<{ label: string; amount: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
