import { EditFinanceRecord, type FinanceRow } from "@/components/record-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import type { Contract } from "@/lib/types";

export function FinanceTable({
  rows,
  label,
  contracts,
  mode
}: {
  rows: FinanceRow[];
  label: string;
  contracts: Contract[];
  mode: "capex" | "opex" | "revenue";
}) {
  const contractNames = new Map(contracts.map((contract) => [contract.id, contract.city]));

  function getKind(row: FinanceRow) {
    return "status" in row ? row.status : row.category;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mes</TableHead>
          <TableHead>Contrato</TableHead>
          <TableHead>{label}</TableHead>
          <TableHead>Descricao</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.month}</TableCell>
            <TableCell className="font-medium">{contractNames.get(row.contractId) ?? row.contractId}</TableCell>
            <TableCell>{getKind(row)}</TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
            <TableCell className="text-right">
              <EditFinanceRecord mode={mode} row={row} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
