import { ContractsTable } from "@/components/contracts-table";
import { ContractForm } from "@/components/forms/contract-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { getAppData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const { contractItems, contracts } = await getAppData();
  const contractNames = new Map(contracts.map((contract) => [contract.id, contract.city]));

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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Itens contratuais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Unitario</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{contractNames.get(item.contractId) ?? item.contractId}</TableCell>
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
    </>
  );
}
