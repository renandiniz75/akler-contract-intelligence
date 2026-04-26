"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContractItemForm({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const formData = new FormData(event.currentTarget);
    const payload = {
      contractId,
      description: formData.get("description"),
      quantity: formData.get("quantity"),
      unitPrice: formData.get("unitPrice")
    };

    const response = await fetch("/api/contract-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setStatus("saved");
      event.currentTarget.reset();
      router.refresh();
      return;
    }

    setStatus("error");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo item contratado</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`${contractId}-item-description`}>Descricao</Label>
            <Input id={`${contractId}-item-description`} name="description" placeholder="Linha orcada no contrato" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor={`${contractId}-item-quantity`}>Quantidade</Label>
              <Input id={`${contractId}-item-quantity`} name="quantity" type="number" min="1" step="1" defaultValue="1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${contractId}-item-unit-price`}>Valor unitario</Label>
              <Input id={`${contractId}-item-unit-price`} name="unitPrice" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={status === "saving"}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {status === "saving" ? "Salvando..." : "Adicionar item"}
            </Button>
            {status === "saved" ? <span className="text-sm text-primary">Item salvo.</span> : null}
            {status === "error" ? <span className="text-sm text-destructive">Falha ao salvar.</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
