"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function RevenueChart({ realized, projected }: { realized: number; projected: number }) {
  const [mounted, setMounted] = useState(false);
  const data = [
    { name: "Realizada", value: realized, fill: "hsl(var(--chart-1))" },
    { name: "Projetada", value: projected, fill: "hsl(var(--chart-3))" }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-[260px] w-full">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={96} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          </PieChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
