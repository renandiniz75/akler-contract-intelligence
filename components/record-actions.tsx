"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Capex, Contract, ContractStatus, ExpenseCategory, Opex, Revenue, RevenueStatus } from "@/lib/types";

type Mode = "capex" | "opex" | "revenue";
export type FinanceRow = Capex | Opex | Revenue;

const expenseCategories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "labor", label: "Equipe" },
  { value: "materials", label: "Materiais" },
  { value: "equipment", label: "Equipamentos" },
  { value: "software", label: "Software" },
  { value: "logistics", label: "Logistica" },
  { value: "overhead", label: "Overhead" }
];

const revenueStatuses: Array<{ value: RevenueStatus; label: string }> = [
  { value: "projected", label: "Projetada" },
  { value: "realized", label: "Realizada" }
];

const contractStatuses: Array<{ value: ContractStatus; label: string }> = [
  { value: "pending", label: "Pendente" },
  { value: "active", label: "Ativo" },
  { value: "at_risk", label: "Em risco" },
  { value: "completed", label: "Concluido" }
];

export function DeleteRecordButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    setError(false);
    const confirmed = window.confirm(`Excluir ${label}?`);

    if (!confirmed) {
      return;
    }

    setPending(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    setPending(false);

    if (response.ok) {
      router.refresh();
      return;
    }

    setError(true);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="ghost" size="icon" onClick={handleDelete} disabled={pending} aria-label={`Excluir ${label}`}>
        <Trash2 className="h-4 w-4" />
      </Button>
      {error ? <span className="text-xs text-destructive">Erro</span> : null}
    </div>
  );
}

export function EditFinanceRecord({ mode, row }: { mode: Mode; row: FinanceRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const endpoint = `/api/${mode}/${row.id}`;
  const isRevenue = mode === "revenue";
  const currentKind = isRevenue ? (row as Revenue).status : (row as Capex | Opex).category;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const formData = new FormData(event.currentTarget);
    const payload = {
      month: formData.get("month"),
      description: formData.get("description"),
      amount: formData.get("amount"),
      ...(isRevenue ? { status: formData.get("status") } : { category: formData.get("category") })
    };

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setStatus("saved");
      setOpen(false);
      router.refresh();
      return;
    }

    setStatus("error");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Editar lancamento">
          <Pencil className="h-4 w-4" />
        </Button>
        <DeleteRecordButton endpoint={endpoint} label="lancamento" />
      </div>
      {open ? (
        <form className="grid w-full min-w-[280px] gap-3 rounded-md border bg-white p-3 text-left shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label htmlFor={`${row.id}-month`}>Mes</Label>
            <Input id={`${row.id}-month`} name="month" type="month" defaultValue={row.month} required />
          </div>
          <div className="grid gap-1">
            <Label>{isRevenue ? "Status" : "Categoria"}</Label>
            <Select name={isRevenue ? "status" : "category"} defaultValue={currentKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(isRevenue ? revenueStatuses : expenseCategories).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${row.id}-amount`}>Valor</Label>
            <Input id={`${row.id}-amount`} name="amount" type="number" defaultValue={row.amount} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${row.id}-description`}>Descricao</Label>
            <Input id={`${row.id}-description`} name="description" defaultValue={row.description} required />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={status === "saving"}>
              {status === "saving" ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            {status === "error" ? <span className="text-xs text-destructive">Falha ao salvar</span> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function EditContractRecord({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const endpoint = `/api/contracts/${contract.id}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const formData = new FormData(event.currentTarget);
    const payload = {
      number: formData.get("number"),
      city: formData.get("city"),
      agency: formData.get("agency"),
      object: formData.get("object"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      totalValue: formData.get("totalValue"),
      status: formData.get("status")
    };

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setStatus("saved");
      setOpen(false);
      router.refresh();
      return;
    }

    setStatus("error");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Editar contrato">
          <Pencil className="h-4 w-4" />
        </Button>
        <DeleteRecordButton endpoint={endpoint} label={contract.number} />
      </div>
      {open ? (
        <form className="grid w-full min-w-[320px] gap-3 rounded-md border bg-white p-3 text-left shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label htmlFor={`${contract.id}-number`}>Numero</Label>
            <Input id={`${contract.id}-number`} name="number" defaultValue={contract.number} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${contract.id}-city`}>Municipio</Label>
            <Input id={`${contract.id}-city`} name="city" defaultValue={contract.city} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${contract.id}-agency`}>Orgao</Label>
            <Input id={`${contract.id}-agency`} name="agency" defaultValue={contract.agency} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${contract.id}-object`}>Objeto</Label>
            <Input id={`${contract.id}-object`} name="object" defaultValue={contract.object} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor={`${contract.id}-startDate`}>Inicio</Label>
              <Input id={`${contract.id}-startDate`} name="startDate" type="date" defaultValue={contract.startDate} required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`${contract.id}-endDate`}>Fim</Label>
              <Input id={`${contract.id}-endDate`} name="endDate" type="date" defaultValue={contract.endDate} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor={`${contract.id}-totalValue`}>Valor</Label>
              <Input id={`${contract.id}-totalValue`} name="totalValue" type="number" defaultValue={contract.totalValue} required />
            </div>
            <div className="grid gap-1">
              <Label>Status</Label>
              <Select name="status" defaultValue={contract.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractStatuses.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={status === "saving"}>
              {status === "saving" ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            {status === "error" ? <span className="text-xs text-destructive">Falha ao salvar</span> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
