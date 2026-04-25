"use client";

import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CashFlowMonth } from "@/lib/types";

export function CashFlowChart({ data }: { data: CashFlowMonth[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
          <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          <Bar dataKey="realizedRevenue" name="Receita realizada" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="projectedRevenue" name="Receita projetada" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="capex" name="CAPEX" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="opex" name="OPEX" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="cumulative" name="Acumulado" stroke="hsl(var(--chart-5))" strokeWidth={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
