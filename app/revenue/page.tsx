import { FinanceTable } from "@/components/finance-table";
import { FinanceForm } from "@/components/forms/finance-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revenue } from "@/lib/seed-data";

export default function RevenuePage() {
  return (
    <>
      <PageHeader title="Receita" description="Receita projetada e realizada por contrato, mes e status financeiro." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lancamentos de receita</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceTable rows={revenue} label="Status" />
          </CardContent>
        </Card>
        <FinanceForm title="Nova receita" mode="revenue" />
      </div>
    </>
  );
}
