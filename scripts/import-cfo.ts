import { inArray, like } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { cfoCategoryConsolidation, cfoMonthlyConsolidation } from "@/lib/cfo-consolidated-data";
import { cfoActualRevenue, cfoImportMetadata } from "@/lib/cfo-import-data";
import { seedData } from "@/lib/seed-data";

const importPrefix = "[CFO]";

async function main() {
  const contractIdMap = new Map<string, string>();

  for (const contract of seedData.contracts) {
    const [row] = await db
      .insert(schema.contracts)
      .values({
        id: contract.id,
        city: contract.city,
        agency: contract.agency,
        number: contract.number,
        object: contract.object,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        totalValue: contract.totalValue.toString(),
        initialTermMonths: contract.initialTermMonths,
        renewalCount: contract.renewalCount,
        renewalTermMonths: contract.renewalTermMonths,
        revenueProjectionMonths: contract.revenueProjectionMonths,
        revenueAdjustmentRate: contract.revenueAdjustmentRate.toString(),
        revenueAdjustmentFrequencyMonths: contract.revenueAdjustmentFrequencyMonths,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: schema.contracts.number,
        set: {
          city: contract.city,
          agency: contract.agency,
          object: contract.object,
          startDate: contract.startDate,
          endDate: contract.endDate,
          status: contract.status,
          totalValue: contract.totalValue.toString(),
          initialTermMonths: contract.initialTermMonths,
          renewalCount: contract.renewalCount,
          renewalTermMonths: contract.renewalTermMonths,
          revenueProjectionMonths: contract.revenueProjectionMonths,
          revenueAdjustmentRate: contract.revenueAdjustmentRate.toString(),
          revenueAdjustmentFrequencyMonths: contract.revenueAdjustmentFrequencyMonths,
          updatedAt: new Date()
        }
      })
      .returning({ id: schema.contracts.id, number: schema.contracts.number });

    contractIdMap.set(row.number, row.id);
  }

  const itemIds = seedData.contractItems.map((item) => item.id);
  if (itemIds.length > 0) {
    await db.delete(schema.contractItems).where(inArray(schema.contractItems.id, itemIds));
    await db.insert(schema.contractItems).values(
      seedData.contractItems.map((item) => ({
        id: item.id,
        contractId: contractIdMap.get(seedData.contracts.find((contract) => contract.id === item.contractId)?.number ?? "") ?? item.contractId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        investmentCategory: item.investmentCategory,
        estimatedCost: item.estimatedCost.toString(),
        paymentStartOffsetMonths: item.paymentStartOffsetMonths,
        installmentCount: item.installmentCount,
        paymentSource: item.paymentSource
      }))
    );
  }

  const documentIds = seedData.contractDocuments.map((item) => item.id);
  if (documentIds.length > 0) {
    await db.delete(schema.contractDocuments).where(inArray(schema.contractDocuments.id, documentIds));
    await db.insert(schema.contractDocuments).values(
      seedData.contractDocuments.map((item) => ({
        id: item.id,
        contractId: contractIdMap.get(seedData.contracts.find((contract) => contract.id === item.contractId)?.number ?? "") ?? item.contractId,
        title: item.title,
        type: item.type,
        url: item.url,
        uploadedAt: new Date(item.uploadedAt)
      }))
    );
  }

  await db.delete(schema.revenue).where(like(schema.revenue.description, `${importPrefix}%`));
  await db.insert(schema.revenue).values(
    cfoActualRevenue.map((item) => ({
      contractId: contractIdMap.get(item.contractNumber)!,
      month: item.month,
      status: "realized" as const,
      description: `${importPrefix} NF ${item.invoiceNumber} · ${item.sourceCompany} · ${item.client} · emitida em ${item.issuedAt}`,
      amount: item.amount.toString()
    }))
  );

  await db.delete(schema.cfoCategorySummaries);
  await db.delete(schema.cfoMonthlySummaries);

  await db.insert(schema.cfoMonthlySummaries).values(
    cfoMonthlyConsolidation.map((item) => ({
      month: item.month,
      actualOperatingReceipts: item.actualOperatingReceipts.toString(),
      actualOperatingPayments: item.actualOperatingPayments.toString(),
      actualOperatingNet: item.actualOperatingNet.toString(),
      actualInvoicedRevenue: item.actualInvoicedRevenue.toString(),
      actualFinancialInflows: item.actualFinancialInflows.toString(),
      actualFinancialOutflows: item.actualFinancialOutflows.toString(),
      actualIntercompanyInflows: item.actualIntercompanyInflows.toString(),
      actualIntercompanyOutflows: item.actualIntercompanyOutflows.toString(),
      projectedReceipts: item.projectedReceipts.toString(),
      projectedExpenses: item.projectedExpenses.toString(),
      projectedInvestments: item.projectedInvestments.toString(),
      projectedNet: item.projectedNet.toString(),
      actualOperationalCash: item.actualOperationalCash.toString(),
      projectedCash: item.projectedCash.toString()
    }))
  );

  for (let index = 0; index < cfoCategoryConsolidation.length; index += 500) {
    const chunk = cfoCategoryConsolidation.slice(index, index + 500);
    await db.insert(schema.cfoCategorySummaries).values(
      chunk.map((item) => ({
        month: item.month,
        source: item.source,
        category: item.category,
        subcategory: item.subcategory,
        flowType: item.flowType,
        treatment: item.treatment,
        amount: item.amount.toString(),
        rowCount: item.rowCount
      }))
    );
  }

  console.log(
    `CFO import completed: ${contractIdMap.size} contracts upserted, ${seedData.contractItems.length} contract items refreshed, ${seedData.contractDocuments.length} documents refreshed, ${cfoActualRevenue.length} realized revenue rows imported, ${cfoMonthlyConsolidation.length} monthly summaries and ${cfoCategoryConsolidation.length} category summaries imported from ${cfoImportMetadata.source}.`
  );
  console.log(`Skipped notes: ${cfoImportMetadata.skippedActualRevenueRows.join("; ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
