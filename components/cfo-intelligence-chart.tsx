"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyDeviation } from "@/lib/cfo-strategy";

export function CfoIntelligenceChart({ data }: { data: MonthlyDeviation[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-[340px] w-full">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
            <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
            <Bar dataKey="plannedBurn" name="Baseline/projetado" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actualPayments" name="Saida realizada" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="gap" name="Gap" stroke="hsl(var(--chart-5))" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
