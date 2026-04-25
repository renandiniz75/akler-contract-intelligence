import { FinanceTable } from "@/components/finance-table";
import { FinanceForm } from "@/components/forms/finance-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

export default async function CapexPage() {
  const { capex, contracts } = await getAppData();

  return (
    <>
      <PageHeader title="CAPEX" description="Investimentos de implantacao, infraestrutura e ativos por contrato." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Investimentos registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTable rows={capex} label="Categoria" contracts={contracts} />
          </CardContent>
        </Card>
        <FinanceForm title="Novo CAPEX" mode="capex" contracts={contracts} />
      </div>
    </>
  );
}
