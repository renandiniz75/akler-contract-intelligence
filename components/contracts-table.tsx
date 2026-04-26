import { Badge } from "@/components/ui/badge";
import { EditContractRecord } from "@/components/record-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { getContractPotentialMonths } from "@/lib/projections";
import type { Contract } from "@/lib/types";

const statusLabel = {
  active: "Ativo",
  pending: "Pendente",
  completed: "Concluido",
  at_risk: "Em risco"
};

export function ContractsTable({ contracts }: { contracts: Contract[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contrato</TableHead>
          <TableHead>Municipio</TableHead>
          <TableHead>Orgao</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Renovacoes</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => (
          <TableRow key={contract.id}>
            <TableCell>
              <div className="font-medium">{contract.number}</div>
              <div className="max-w-md truncate text-xs text-muted-foreground">{contract.object}</div>
            </TableCell>
            <TableCell>{contract.city}</TableCell>
            <TableCell>{contract.agency}</TableCell>
            <TableCell>
              <Badge>{statusLabel[contract.status]}</Badge>
            </TableCell>
            <TableCell>
              <div className="font-medium">{contract.renewalCount} x {contract.renewalTermMonths}m</div>
              <div className="text-xs text-muted-foreground">{getContractPotentialMonths(contract)} meses potenciais</div>
            </TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(contract.totalValue)}</TableCell>
            <TableCell className="text-right">
              <EditContractRecord contract={contract} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
