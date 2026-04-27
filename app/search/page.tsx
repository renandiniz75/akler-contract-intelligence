import Link from "next/link";
import type { Route } from "next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/calculations";
import { filterProjectedExpenses, getCfoProjectedExpenses, getStrategicExpenseClassLabel } from "@/lib/cfo-projected-expenses";
import { getAppData } from "@/lib/data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const [{ rows: projectedExpenses }, appData] = await Promise.all([getCfoProjectedExpenses(), getAppData()]);
  const expenseHits = query ? filterProjectedExpenses(projectedExpenses, query).slice(0, 20) : [];
  const contractHits = query ? searchContracts(appData.contracts, query) : [];
  const itemHits = query ? searchContractItems(appData.contractItems, appData.contracts, query) : [];
  const financeHits = query ? searchFinance(appData, query) : [];
  const totalHits = expenseHits.length + contractHits.length + itemHits.length + financeHits.length;

  return (
    <>
      <PageHeader title="Busca inteligente" description="Encontre despesas, contratos, itens, receitas, investimentos e OPEX por palavra-chave." />

      <form className="mb-6 flex flex-col gap-3 rounded-lg border bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={query} placeholder="Ex.: Dell, Aracruz, servidor, NE 7867984..." className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {query ? (
        <div className="mb-6 rounded-md border bg-muted/30 p-4 text-sm">
          <strong>{totalHits}</strong> resultados exibidos para <strong>{query}</strong>. A busca cruza base CFO projetada, contratos, itens e lançamentos financeiros.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ResultCard title="Despesas projetadas CFO">
          {expenseHits.map((row) => (
            <Link key={`${row.sourceRow}-${row.amount}`} href={`/expense-library?q=${encodeURIComponent(query)}` as Route} className="block rounded-md border p-3 hover:bg-accent">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.description || row.counterparty || "Sem descricao"}</p>
                  <p className="text-xs text-muted-foreground">{row.month} · {row.document || "sem documento"} · linha {row.sourceRow}</p>
                </div>
                <strong>{formatCurrency(row.amount)}</strong>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{row.category || "Sem categoria"}</Badge>
                <Badge className="bg-muted text-muted-foreground">{getStrategicExpenseClassLabel(row.strategicClass)}</Badge>
              </div>
            </Link>
          ))}
        </ResultCard>

        <ResultCard title="Contratos">
          {contractHits.map((row) => (
            <Link key={row.id} href={`/contracts/${row.id}`} className="block rounded-md border p-3 hover:bg-accent">
              <p className="font-medium">{row.city} · {row.number}</p>
              <p className="text-sm text-muted-foreground">{row.object}</p>
              <p className="mt-1 text-sm font-medium">{formatCurrency(row.totalValue)}</p>
            </Link>
          ))}
        </ResultCard>

        <ResultCard title="Itens de contrato">
          {itemHits.map((row) => (
            <Link key={row.id} href={`/contracts/${row.contractId}`} className="block rounded-md border p-3 hover:bg-accent">
              <p className="font-medium">{row.description}</p>
              <p className="text-xs text-muted-foreground">{row.contractLabel} · {row.quantity} un.</p>
              <p className="mt-1 text-sm font-medium">{formatCurrency(row.estimatedCost)} estimado</p>
            </Link>
          ))}
        </ResultCard>

        <ResultCard title="Receitas, investimentos e despesas vinculadas">
          {financeHits.map((row) => (
            <div key={row.key} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.description}</p>
                  <p className="text-xs text-muted-foreground">{row.kind} · {row.month} · {row.contractLabel}</p>
                </div>
                <strong>{formatCurrency(row.amount)}</strong>
              </div>
            </div>
          ))}
        </ResultCard>
      </div>
    </>
  );
}

function ResultCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {children}
        {Array.isArray(children) && children.length === 0 ? <p className="text-sm text-muted-foreground">Sem resultados nesta área.</p> : null}
      </CardContent>
    </Card>
  );
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matches(values: string[], query: string) {
  const haystack = normalize(values.join(" "));
  return normalize(query).split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
}

function searchContracts(contracts: Awaited<ReturnType<typeof getAppData>>["contracts"], query: string) {
  return contracts
    .filter((row) => matches([row.city, row.agency, row.number, row.object, row.status], query))
    .slice(0, 12);
}

function searchContractItems(
  items: Awaited<ReturnType<typeof getAppData>>["contractItems"],
  contracts: Awaited<ReturnType<typeof getAppData>>["contracts"],
  query: string
) {
  const contractNames = new Map(contracts.map((contract) => [contract.id, `${contract.city} · ${contract.number}`]));
  return items
    .filter((row) => matches([row.description, row.investmentCategory, row.paymentSource, contractNames.get(row.contractId) ?? ""], query))
    .slice(0, 12)
    .map((row) => ({ ...row, contractLabel: contractNames.get(row.contractId) ?? row.contractId }));
}

function searchFinance(appData: Awaited<ReturnType<typeof getAppData>>, query: string) {
  const contractNames = new Map(appData.contracts.map((contract) => [contract.id, `${contract.city} · ${contract.number}`]));
  const rows = [
    ...appData.revenue.map((row) => ({ key: `revenue-${row.id}`, kind: "Receita", month: row.month, description: row.description, amount: row.amount, contractLabel: contractNames.get(row.contractId) ?? row.contractId })),
    ...appData.capex.map((row) => ({ key: `capex-${row.id}`, kind: "Investimento", month: row.month, description: row.description, amount: row.amount, contractLabel: contractNames.get(row.contractId) ?? row.contractId })),
    ...appData.opex.map((row) => ({ key: `opex-${row.id}`, kind: "Despesa", month: row.month, description: row.description, amount: row.amount, contractLabel: contractNames.get(row.contractId) ?? row.contractId }))
  ];

  return rows.filter((row) => matches([row.kind, row.month, row.description, row.contractLabel], query)).slice(0, 20);
}
