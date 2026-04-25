"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ContractForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const response = await fetch("/api/contracts", {
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
        <CardTitle>Novo contrato</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="number">Numero</Label>
            <Input id="number" name="number" placeholder="AKL-2026-004" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Municipio</Label>
            <Input id="city" name="city" placeholder="Municipio" required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="agency">Orgao contratante</Label>
            <Input id="agency" name="agency" placeholder="Prefeitura Municipal" required />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="object">Objeto</Label>
            <Input id="object" name="object" placeholder="Objeto do contrato" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Inicio</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">Fim</Label>
            <Input id="endDate" name="endDate" type="date" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="total">Valor total</Label>
            <Input id="total" name="totalValue" type="number" placeholder="0.00" required />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select name="status" defaultValue="pending">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="at_risk">Em risco</SelectItem>
                <SelectItem value="completed">Concluido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Salvando..." : "Salvar contrato"}
            </Button>
            {status === "saved" && <span className="text-sm text-primary">Contrato salvo.</span>}
            {status === "error" && <span className="text-sm text-destructive">Falha ao salvar.</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
