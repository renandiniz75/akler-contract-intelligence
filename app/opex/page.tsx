import { FinanceTable } from "@/components/finance-table";
import { FinanceForm } from "@/components/forms/finance-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { opex } from "@/lib/seed-data";

export default function OpexPage() {
  return (
    <>
      <PageHeader title="OPEX" description="Custos operacionais mensais, equipe, logistica e overhead por contrato." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Despesas operacionais</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTable rows={opex} label="Categoria" />
          </CardContent>
        </Card>
        <FinanceForm title="Novo OPEX" mode="opex" />
      </div>
    </>
  );
}
