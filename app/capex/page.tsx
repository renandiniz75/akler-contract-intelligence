import { FinanceTable } from "@/components/finance-table";
import { FinanceForm } from "@/components/forms/finance-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";
import { buildProjectedInvestmentCapex } from "@/lib/projections";

export const dynamic = "force-dynamic";

export default async function CapexPage() {
  const { capex, contractItems, contracts } = await getAppData();
  const projectedCapex = buildProjectedInvestmentCapex(contracts, contractItems, capex);

  return (
    <>
      <PageHeader title="Investimentos" description="Desembolsos de implantacao, infraestrutura e ativos. Quando houver custo estimado nos itens do contrato, ele entra aqui como investimento projetado." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Investimentos realizados e projetados</CardTitle>
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
