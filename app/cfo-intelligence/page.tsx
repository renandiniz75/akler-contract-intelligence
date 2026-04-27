import { AlertTriangle, BrainCircuit, CheckCircle2, CircleDollarSign, SearchCheck, TrendingUp } from "lucide-react";
import { CfoIntelligenceChart } from "@/components/cfo-intelligence-chart";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { getCfoData } from "@/lib/cfo-data";
import { buildCfoStrategy, getStrategicClassLabel } from "@/lib/cfo-strategy";

export const dynamic = "force-dynamic";

export default async function CfoIntelligencePage() {
  const { categories, monthly, source } = await getCfoData();
  const strategy = buildCfoStrategy(monthly, categories);
  const totalGap = strategy.deviations.reduce((sum, row) => sum + Math.max(row.gap, 0), 0);
  const criticalMonths = strategy.deviations.filter((row) => row.severity === "critical").length;
  const topRevenue = strategy.revenueQuality[0];
  const curationQueue = strategy.categoryExplanations.filter((row) => row.strategicClass === "needs_curation" || row.strategicClass === "delivery_cost");
  const recurringAmount = strategy.categoryExplanations
    .filter((row) => row.strategicClass === "recurring_opex" || row.strategicClass === "tax_payroll")
    .reduce((sum, row) => sum + row.amount, 0);

  return (
    <>
      <PageHeader
        title="Inteligencia CFO"
        description={`Leitura estrategica da planilha CFO em base ${source === "database" ? "PostgreSQL" : "embarcada"}: desvio real vs planejado, qualidade das receitas e fila de curadoria.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Burn-base" value={formatCurrency(strategy.baselineBurn)} detail="Mediana projetada mensal" icon={CircleDollarSign} />
        <StatCard title="Gap realizado" value={formatCurrency(totalGap)} detail="Excesso acima do baseline" icon={AlertTriangle} />
        <StatCard title="Meses criticos" value={String(criticalMonths)} detail="Saida > 50% acima do plano" icon={SearchCheck} />
        <StatCard title="Recorrente identificado" value={formatCurrency(recurringAmount)} detail="Folha, tributos e OPEX" icon={CheckCircle2} />
        <StatCard title="Melhor receita" value={topRevenue?.name ?? "N/A"} detail={topRevenue ? `Nota ${topRevenue.grade} · ${formatCurrency(topRevenue.averageProjected)}/mes` : "Sem ranking"} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Realizado vs baseline CFO</CardTitle>
          </CardHeader>
          <CardContent>
            <CfoIntelligenceChart data={strategy.deviations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas estrategicas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {strategy.questions.map((item) => (
              <div key={item.question} className="rounded-md border bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  {item.question}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Qualidade das receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receita</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead className="text-right">Media proj.</TableHead>
                  <TableHead className="text-right">Meses</TableHead>
                  <TableHead className="text-right">Realizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategy.revenueQuality.slice(0, 10).map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.reading}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={gradeClassName(row.grade)}>{row.grade} · {row.score}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.averageProjected)}</TableCell>
                    <TableCell className="text-right">{row.projectedMonths}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.actualAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explicacao dos desvios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategy.categoryExplanations.slice(0, 12).map((row) => (
                  <TableRow key={`${row.strategicClass}-${row.category}`}>
                    <TableCell>
                      <div className="font-medium">{row.category}</div>
                      <div className="text-xs text-muted-foreground">{row.reading}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={classNameForStrategicClass(row.strategicClass)}>{getStrategicClassLabel(row.strategicClass)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPercent(row.share)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Fila de curadoria para melhorar a inteligencia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prioridade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Decisao de negocio</TableHead>
                <TableHead className="text-right">Linhas</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {curationQueue.slice(0, 8).map((row, index) => (
                <TableRow key={`${row.strategicClass}-${row.category}-curation`}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="text-muted-foreground">{curationDecision(row.strategicClass)}</TableCell>
                  <TableCell className="text-right">{row.rowCount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Memoria mensal do desvio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Entradas reais</TableHead>
                <TableHead className="text-right">Saidas reais</TableHead>
                <TableHead className="text-right">Baseline/plano</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategy.deviations.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.actualReceipts)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.actualPayments)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.plannedBurn)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.gap)}</TableCell>
                  <TableCell>
                    <Badge className={severityClassName(row.severity)}>{severityLabel(row.severity)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function gradeClassName(grade: string) {
  if (grade === "A") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (grade === "B") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function classNameForStrategicClass(value: string) {
  if (value === "delivery_cost" || value === "needs_curation") return "border-amber-200 bg-amber-50 text-amber-700";
  if (value === "recurring_opex" || value === "tax_payroll") return "border-blue-200 bg-blue-50 text-blue-700";
  if (value === "investment") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function severityClassName(value: string) {
  if (value === "critical") return "border-red-200 bg-red-50 text-red-700";
  if (value === "watch") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function severityLabel(value: string) {
  if (value === "critical") return "Critico";
  if (value === "watch") return "Atencao";
  return "Dentro";
}

function curationDecision(value: string) {
  if (value === "delivery_cost") return "Abrir por fornecedor, contrato e item para separar investimento de custo operacional.";
  return "Criar regra de classificacao ou revisar origem na planilha CFO.";
}
