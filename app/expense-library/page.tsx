import Link from "next/link";
import type { Route } from "next";
import { Database, Layers3, Search, Tags, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import {
  filterProjectedExpenses,
  getCfoProjectedExpenses,
  getStrategicExpenseClassLabel,
  groupProjectedExpenses,
  summarizeProjectedExpenseRows
} from "@/lib/cfo-projected-expenses";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function ExpenseLibraryPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const { rows, source } = await getCfoProjectedExpenses();
  const filteredRows = filterProjectedExpenses(rows, query);
  const summary = summarizeProjectedExpenseRows(rows);
  const filteredSummary = summarizeProjectedExpenseRows(filteredRows);
  const groups = groupProjectedExpenses(filteredRows);

  return (
    <>
      <PageHeader
        title="Base de despesas projetadas"
        description={`Linhas detalhadas da aba Custos e Despesas projetados em base ${source === "database" ? "PostgreSQL" : "embarcada"} para busca, curadoria e classificacao.`}
      />

      <form className="mb-6 flex flex-col gap-3 rounded-lg border bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={query} placeholder="Buscar Dell, fornecedor, categoria, documento, contrato..." className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
        {query ? (
          <Button asChild variant="outline">
            <Link href={"/expense-library" as Route}>Limpar</Link>
          </Button>
        ) : null}
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Linhas importadas" value={String(summary.totalRows)} detail="Despesas projetadas úteis" icon={Database} />
        <StatCard title="Grupos" value={String(summary.totalGroups)} detail="Fornecedor/descrição/categoria" icon={Layers3} />
        <StatCard title="Valor projetado" value={formatCurrency(summary.totalAmount)} detail={`${summary.totalMonths} meses`} icon={WalletCards} />
        <StatCard title="Candidatos a investimento" value={formatCurrency(summary.investmentCandidates)} detail="Possível CAPEX/funding" icon={Tags} />
        <StatCard title="Resultado da busca" value={String(filteredSummary.totalRows)} detail={query || "Sem filtro aplicado"} icon={Search} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Grupos para curadoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Despesa / fornecedor</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Linhas</TableHead>
                <TableHead className="text-right">Periodo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.slice(0, 30).map((row) => (
                <TableRow key={row.key}>
                  <TableCell>
                    <div className="font-medium">{row.description}</div>
                    <div className="text-xs text-muted-foreground">{row.type} · {row.originFile}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={classNameFor(row.strategicClass)}>{getStrategicExpenseClassLabel(row.strategicClass)}</Badge>
                  </TableCell>
                  <TableCell>{row.category || "Sem categoria"}</TableCell>
                  <TableCell className="text-right">{row.rowCount}</TableCell>
                  <TableCell className="text-right">{row.firstMonth} - {row.lastMonth}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Linhas detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.slice(0, 80).map((row) => (
                <TableRow key={`${row.sourceRow}-${row.document}-${row.amount}`}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell>
                    <div>{row.document || "-"}</div>
                    <div className="text-xs text-muted-foreground">Linha {row.sourceRow}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.description || row.counterparty || "Sem descricao"}</div>
                    <div className="text-xs text-muted-foreground">{row.company} · {row.originFile}</div>
                  </TableCell>
                  <TableCell>{row.category || "Sem categoria"}</TableCell>
                  <TableCell>
                    <Badge className={classNameFor(row.strategicClass)}>{getStrategicExpenseClassLabel(row.strategicClass)}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function classNameFor(value: string) {
  if (value === "investment_candidate") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "needs_curation" || value === "delivery_cost") return "border-amber-200 bg-amber-50 text-amber-700";
  if (value === "recurring_opex" || value === "tax_payroll") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}
