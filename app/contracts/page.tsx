import { ContractsTable } from "@/components/contracts-table";
import { ContractForm } from "@/components/forms/contract-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const { contracts } = await getAppData();

  return (
    <>
      <PageHeader title="Contratos" description="Cadastro e acompanhamento dos contratos publicos geridos pela Akler." />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Carteira de contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractsTable contracts={contracts} />
          </CardContent>
        </Card>
        <ContractForm />
      </div>
    </>
  );
}
