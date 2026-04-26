"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/calculations";
import { simulateCapacityScenario, type CapacityScenarioInput } from "@/lib/capacity-simulation";
import { Banknote, CheckCircle2, CircleAlert, Play, RotateCcw, Timer, Wallet } from "lucide-react";

const defaultScenario: CapacityScenarioInput = {
  name: "Contrato drones autonomos",
  initialCash: 8529954.96,
  units: 100,
  investmentPerUnit: 200000,
  supplierInstallments: 12,
  supplierStartOffsetMonths: 0,
  supplierStartOffsetDays: 0,
  revenuePerUnitMonthly: 30000,
  revenueDurationMonths: 120,
  revenueStartOffsetMonths: 1,
  revenueReceiptDelayDays: 30,
  monthlyFixedBurn: 0,
  minimumCashBuffer: 0
};

const numberFields: Array<{ key: keyof CapacityScenarioInput; label: string; step?: string }> = [
  { key: "initialCash", label: "Caixa inicial consolidado", step: "0.01" },
  { key: "units", label: "Quantidade de unidades" },
  { key: "investmentPerUnit", label: "Investimento por unidade", step: "0.01" },
  { key: "supplierInstallments", label: "Parcelas do fornecedor" },
  { key: "supplierStartOffsetMonths", label: "Carencia fornecedor (meses)" },
  { key: "supplierStartOffsetDays", label: "Carencia fornecedor (dias)" },
  { key: "revenuePerUnitMonthly", label: "Receita mensal por unidade", step: "0.01" },
  { key: "revenueDurationMonths", label: "Duracao da receita" },
  { key: "revenueStartOffsetMonths", label: "Inicio da medicao (meses)" },
  { key: "revenueReceiptDelayDays", label: "Prazo recebimento orgao (dias)" },
  { key: "monthlyFixedBurn", label: "Consumo fixo mensal adicional", step: "0.01" },
  { key: "minimumCashBuffer", label: "Caixa minimo desejado", step: "0.01" }
];

export function CapacitySimulator() {
  const [draft, setDraft] = useState<CapacityScenarioInput>(defaultScenario);
  const [scenario, setScenario] = useState<CapacityScenarioInput>(defaultScenario);
  const [mounted, setMounted] = useState(false);
  const result = useMemo(() => simulateCapacityScenario(scenario), [scenario]);
  const StatusIcon = result.feasible ? CheckCircle2 : CircleAlert;
  const decision = result.feasible
    ? "Cenario viavel dentro do caixa minimo informado."
    : "Cenario exige capital adicional ou renegociacao de prazo.";
  const pressureMonths = result.months.filter((month) => month.investmentOutflow > 0 || month.newRevenue > 0).slice(0, 18);

  useEffect(() => {
    setMounted(true);
  }, []);

  function updateField(key: keyof CapacityScenarioInput, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: key === "name" ? value : Number(value)
    }));
  }

  function runSimulation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScenario(draft);
  }

  function resetScenario() {
    setDraft(defaultScenario);
    setScenario(defaultScenario);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Investimento" value={formatCurrency(result.totalInvestment)} detail={`${scenario.units} unidades`} icon={Wallet} />
        <StatCard title="Receita mensal" value={formatCurrency(result.monthlyRevenue)} detail="Novo contrato" icon={Banknote} />
        <StatCard title="Menor caixa" value={formatCurrency(result.lowestCash)} detail="Pior ponto do cenario" icon={StatusIcon} />
        <StatCard title="Capital necessario" value={formatCurrency(result.requiredCapital)} detail={result.feasible ? "Dentro da margem" : "Abaixo do caixa minimo"} icon={CircleAlert} />
        <StatCard title="Payback" value={result.paybackMonth ? `Mes ${result.paybackMonth}` : "Nao atingido"} detail="Retorno ao caixa inicial" icon={Timer} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <Card>
          <CardHeader>
            <CardTitle>Premissas manuais do contrato novo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-1" onSubmit={runSimulation}>
              <div className="grid gap-2 md:col-span-2 xl:col-span-1">
                <Label htmlFor="scenario-name">Cenario</Label>
                <Input id="scenario-name" value={draft.name} onChange={(event) => updateField("name", event.target.value)} />
              </div>
              {numberFields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type="number"
                    min="0"
                    step={field.step ?? "1"}
                    value={draft[field.key] as number}
                    onChange={(event) => updateField(field.key, event.target.value)}
                  />
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 md:col-span-2 xl:col-span-1">
                <Button type="submit">
                  <Play className="mr-2 h-4 w-4" />
                  Simular
                </Button>
                <Button type="button" variant="outline" onClick={resetScenario}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Resetar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className={result.feasible ? "border-primary/30" : "border-destructive/40"}>
            <CardHeader>
              <CardTitle>Diagnostico da simulacao</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-start gap-3 rounded-md bg-muted p-4">
                <StatusIcon className={result.feasible ? "mt-0.5 h-5 w-5 text-primary" : "mt-0.5 h-5 w-5 text-destructive"} />
                <div>
                  <p className="font-semibold">{decision}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O menor caixa ocorre no mes {result.lowestCashMonth || 1}. O fornecedor começa no mes{" "}
                    {result.firstSupplierPaymentMonth ?? "sem saida"} e a receita entra no mes {result.firstRevenueMonth ?? "sem entrada"}.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <Metric label="Receita total do contrato" value={formatCurrency(result.totalRevenue)} />
                <Metric label="Investimento total" value={formatCurrency(result.totalInvestment)} />
                <Metric label="Capital adicional" value={formatCurrency(result.requiredCapital)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curva de capacidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
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

      <Card>
        <CardHeader>
          <CardTitle>Memoria mensal da simulacao</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Investimento</TableHead>
                <TableHead className="text-right">Consumo fixo</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">Caixa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pressureMonths.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">M{month.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(month.newRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(month.investmentOutflow)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(month.fixedBurn)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(month.net)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(month.cumulativeCash)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
