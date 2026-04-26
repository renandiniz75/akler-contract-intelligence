"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/calculations";
import { simulateCapacityScenario, type CapacityScenarioInput } from "@/lib/capacity-simulation";
import { Banknote, CheckCircle2, CircleAlert, Timer, Wallet } from "lucide-react";

const defaultScenario: CapacityScenarioInput = {
  name: "Contrato drones autonomos",
  initialCash: 8529954.96,
  units: 100,
  investmentPerUnit: 200000,
  supplierInstallments: 12,
  supplierStartOffsetMonths: 0,
  revenuePerUnitMonthly: 30000,
  revenueDurationMonths: 120,
  revenueStartOffsetMonths: 1,
  monthlyFixedBurn: 0
};

const numberFields: Array<{ key: keyof CapacityScenarioInput; label: string; step?: string }> = [
  { key: "initialCash", label: "Caixa inicial consolidado", step: "0.01" },
  { key: "units", label: "Quantidade de unidades" },
  { key: "investmentPerUnit", label: "Investimento por unidade", step: "0.01" },
  { key: "supplierInstallments", label: "Parcelas do fornecedor" },
  { key: "supplierStartOffsetMonths", label: "Inicio pagamento fornecedor" },
  { key: "revenuePerUnitMonthly", label: "Receita mensal por unidade", step: "0.01" },
  { key: "revenueDurationMonths", label: "Duracao da receita" },
  { key: "revenueStartOffsetMonths", label: "Inicio recebimento receita" },
  { key: "monthlyFixedBurn", label: "Consumo fixo mensal adicional", step: "0.01" }
];

export function CapacitySimulator() {
  const [scenario, setScenario] = useState<CapacityScenarioInput>(defaultScenario);
  const [mounted, setMounted] = useState(false);
  const result = useMemo(() => simulateCapacityScenario(scenario), [scenario]);
  const StatusIcon = result.feasible ? CheckCircle2 : CircleAlert;

  useEffect(() => {
    setMounted(true);
  }, []);

  function updateField(key: keyof CapacityScenarioInput, value: string) {
    setScenario((current) => ({
      ...current,
      [key]: key === "name" ? value : Number(value)
    }));
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Investimento" value={formatCurrency(result.totalInvestment)} detail={`${scenario.units} unidades`} icon={Wallet} />
        <StatCard title="Receita mensal" value={formatCurrency(result.monthlyRevenue)} detail="Novo contrato" icon={Banknote} />
        <StatCard title="Menor caixa" value={formatCurrency(result.lowestCash)} detail="Pior ponto do cenario" icon={StatusIcon} />
        <StatCard title="Capital necessario" value={formatCurrency(result.requiredCapital)} detail={result.feasible ? "Sem ruptura de caixa" : "Furo de caixa"} icon={CircleAlert} />
        <StatCard title="Payback" value={result.paybackMonth ? `Mes ${result.paybackMonth}` : "Nao atingido"} detail="Retorno ao caixa inicial" icon={Timer} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <Card>
          <CardHeader>
            <CardTitle>Premissas do contrato novo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="grid gap-2 md:col-span-2 xl:col-span-1">
                <Label htmlFor="scenario-name">Cenario</Label>
                <Input id="scenario-name" value={scenario.name} onChange={(event) => updateField("name", event.target.value)} />
              </div>
              {numberFields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type="number"
                    min="0"
                    step={field.step ?? "1"}
                    value={scenario[field.key] as number}
                    onChange={(event) => updateField(field.key, event.target.value)}
                  />
                </div>
              ))}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curva de capacidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.months}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(value) => `M${value}`} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                    <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                    <Bar dataKey="newRevenue" name="Receita nova" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="investmentOutflow" name="Investimento" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fixedBurn" name="Consumo fixo" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="cumulativeCash" name="Caixa acumulado" stroke="hsl(var(--chart-5))" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
