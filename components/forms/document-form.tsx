"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DocumentForm({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/contract-documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractId,
        title: formData.get("title"),
        type: formData.get("type"),
        url: formData.get("url")
      })
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
        <CardTitle>Novo documento</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="document-title">Titulo</Label>
            <Input id="document-title" name="title" placeholder="Contrato assinado, aditivo, medicao..." required />
          </div>
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select name="type" defaultValue="contract">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="amendment">Aditivo</SelectItem>
                <SelectItem value="measurement">Medicao</SelectItem>
                <SelectItem value="invoice">Nota fiscal</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document-url">URL do documento</Label>
            <Input id="document-url" name="url" type="url" placeholder="https://..." required />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Salvando..." : "Salvar documento"}
            </Button>
            {status === "saved" ? <span className="text-sm text-primary">Documento salvo.</span> : null}
            {status === "error" ? <span className="text-sm text-destructive">Falha ao salvar.</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
