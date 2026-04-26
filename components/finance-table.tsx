import { EditFinanceRecord, type FinanceRow } from "@/components/record-actions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import type { Contract } from "@/lib/types";

export function FinanceTable({
  rows,
  label,
  contracts,
  mode,
  emptyMessage = "Nenhum lancamento cadastrado."
}: {
  rows: FinanceRow[];
  label: string;
  contracts: Contract[];
  mode: "capex" | "opex" | "revenue";
  emptyMessage?: string;
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
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <span>{row.description}</span>
                {"generated" in row && row.generated ? <Badge className="bg-muted text-muted-foreground">Projetado</Badge> : null}
              </div>
            </TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
            <TableCell className="text-right">
              {"generated" in row && row.generated ? (
                <span className="text-xs text-muted-foreground">Automatico</span>
              ) : (
                <EditFinanceRecord mode={mode} row={row} />
              )}
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
