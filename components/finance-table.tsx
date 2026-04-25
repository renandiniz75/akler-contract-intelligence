import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import type { Contract } from "@/lib/types";

type Row = {
  id: string;
  contractId: string;
  month: string;
  category?: string;
  status?: string;
  description: string;
  amount: number;
};

export function FinanceTable({ rows, label, contracts }: { rows: Row[]; label: string; contracts: Contract[] }) {
  const contractNames = new Map(contracts.map((contract) => [contract.id, contract.city]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mes</TableHead>
          <TableHead>Contrato</TableHead>
          <TableHead>{label}</TableHead>
          <TableHead>Descricao</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.month}</TableCell>
            <TableCell className="font-medium">{contractNames.get(row.contractId) ?? row.contractId}</TableCell>
            <TableCell>{row.category ?? row.status}</TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
