"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Contract } from "@/lib/types";

export function FinanceForm({ title, mode, contracts }: { title: string; mode: "capex" | "opex" | "revenue"; contracts: Contract[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const defaultContractId = contracts[0]?.id;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const formData = new FormData(event.currentTarget);
    const payload = {
      contractId: formData.get("contractId"),
      month: formData.get("month"),
      category: formData.get("category"),
      status: formData.get("status"),
      amount: formData.get("amount"),
      description: formData.get("description")
    };

    const response = await fetch(`/api/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus(response.ok ? "saved" : "error");
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Contrato</Label>
            <Select name="contractId" defaultValue={defaultContractId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-month`}>Mes</Label>
            <Input id={`${mode}-month`} name="month" type="month" required />
          </div>
          <div className="grid gap-2">
            <Label>{mode === "revenue" ? "Status" : "Categoria"}</Label>
            <Select name={mode === "revenue" ? "status" : "category"} defaultValue={mode === "revenue" ? "projected" : "labor"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mode === "revenue" ? (
                  <>
                    <SelectItem value="projected">Projetada</SelectItem>
                    <SelectItem value="realized">Realizada</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="labor">Equipe</SelectItem>
                    <SelectItem value="materials">Materiais</SelectItem>
                    <SelectItem value="equipment">Equipamentos</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="logistics">Logistica</SelectItem>
                    <SelectItem value="overhead">Overhead</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-amount`}>Valor</Label>
            <Input id={`${mode}-amount`} name="amount" type="number" placeholder="0.00" required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor={`${mode}-description`}>Descricao</Label>
            <Input id={`${mode}-description`} name="description" placeholder="Descricao do lancamento" required />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Salvando..." : "Salvar lancamento"}
            </Button>
            {status === "saved" && <span className="text-sm text-primary">Lancamento salvo.</span>}
            {status === "error" && <span className="text-sm text-destructive">Falha ao salvar.</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
