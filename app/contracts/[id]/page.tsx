import Link from "next/link";
import { ArrowLeft, Banknote, FileText, Percent, Timer } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { DocumentForm } from "@/components/forms/document-form";
import { EditContractRecord, DeleteRecordButton } from "@/components/record-actions";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildDashboardSummary, calculateCashFlow, formatCurrency, formatPercent } from "@/lib/calculations";
import { getAppData } from "@/lib/data";
import { buildOptimisticRevenueProjection, getContractPotentialMonths } from "@/lib/projections";

export const dynamic = "force-dynamic";

const documentTypeLabel = {
  contract: "Contrato",
  amendment: "Aditivo",
  measurement: "Medicao",
  invoice: "Nota fiscal",
  other: "Outro"
};

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAppData();
  const contract = data.contracts.find((item) => item.id === id);

  if (!contract) {
    return (
      <>
        <Button asChild variant="ghost" size="sm">
          <Link href="/contracts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Contratos
          </Link>
        </Button>
        <PageHeader title="Contrato nao encontrado" description="O contrato solicitado nao existe na carteira atual." />
      </>
    );
  }

  const contractItems = data.contractItems.filter((item) => item.contractId === id);
  const capex = data.capex.filter((item) => item.contractId === id);
  const opex = data.opex.filter((item) => item.contractId === id);
  const revenue = data.revenue.filter((item) => item.contractId === id);
  const documents = data.contractDocuments.filter((item) => item.contractId === id);
  const optimisticRevenue = buildOptimisticRevenueProjection([contract], revenue);
  const cashFlow = calculateCashFlow(optimisticRevenue, capex, opex);
  const summary = buildDashboardSummary([contract], optimisticRevenue, capex, opex);
  const budgetedItems = contractItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const realizedRevenue = revenue.filter((item) => item.status === "realized").reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/contracts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Carteira
          </Link>
        </Button>
        <EditContractRecord contract={contract} />
      </div>
      <PageHeader
        title={`${contract.city} · ${contract.number}`}
        description={`${contract.agency}. ${contract.object}. Fonte: ${data.source === "database" ? "PostgreSQL" : "seed local"}.`}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Contrato" value={formatCurrency(contract.totalValue)} detail="Valor anual/base" icon={FileText} />
        <StatCard title="Itens orcados" value={formatCurrency(budgetedItems)} detail={`${contractItems.length} itens contratuais`} icon={Banknote} />
        <StatCard title="Realizado" value={formatCurrency(realizedRevenue)} detail="Receita realizada lancada" icon={Banknote} />
        <StatCard title="Margem otimista" value={formatPercent(summary.grossMargin)} detail="Com renovacoes projetadas" icon={Percent} />
        <StatCard title="Horizonte" value={`${getContractPotentialMonths(contract)} meses`} detail={`${contract.renewalCount} renovacoes`} icon={Timer} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa do contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlow} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Condicoes contratuais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Vigencia inicial</span>
              <strong>{contract.startDate} a {contract.endDate}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Prazo inicial</span>
              <strong>{contract.initialTermMonths} meses</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Renovacoes</span>
              <strong>{contract.renewalCount} x {contract.renewalTermMonths} meses</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Receita mensal base</span>
              <strong>{formatCurrency(contract.totalValue / contract.initialTermMonths)}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Itens do contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Unitario</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <FinancialMiniTable title="Receitas" rows={revenue} valueLabel="Status" />
        <FinancialMiniTable title="CAPEX" rows={capex} valueLabel="Categoria" />
        <FinancialMiniTable title="OPEX" rows={opex} valueLabel="Categoria" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Documentos do contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.title}</TableCell>
                    <TableCell>{documentTypeLabel[document.type]}</TableCell>
                    <TableCell>
                      <a className="text-primary underline-offset-4 hover:underline" href={document.url} target="_blank" rel="noreferrer">
                        Abrir documento
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteRecordButton endpoint={`/api/contract-documents/${document.id}`} label={document.title} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DocumentForm contractId={contract.id} />
      </div>
    </>
  );
}

function FinancialMiniTable({
  title,
  rows,
  valueLabel
}: {
  title: string;
  rows: Array<{ id: string; month: string; description: string; amount: number; status?: string; category?: string }>;
  valueLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mes</TableHead>
              <TableHead>{valueLabel}</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.month}</TableCell>
                <TableCell>{row.status ?? row.category}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
