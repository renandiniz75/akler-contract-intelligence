import { db } from "@/db";
import * as schema from "@/db/schema";
import { seedData } from "@/lib/seed-data";

async function main() {
  await db.delete(schema.revenue);
  await db.delete(schema.opex);
  await db.delete(schema.capex);
  await db.delete(schema.contractItems);
  await db.delete(schema.contracts);

  const contractIdMap = new Map<string, string>();

  for (const contract of seedData.contracts) {
    const [inserted] = await db
      .insert(schema.contracts)
      .values({
        city: contract.city,
        id: contract.id,
        agency: contract.agency,
        number: contract.number,
        object: contract.object,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        totalValue: contract.totalValue.toString(),
        initialTermMonths: contract.initialTermMonths,
        renewalCount: contract.renewalCount,
        renewalTermMonths: contract.renewalTermMonths
      })
      .returning({ id: schema.contracts.id });

    contractIdMap.set(contract.id, inserted.id);
  }

  await db.insert(schema.contractItems).values(
    seedData.contractItems.map((item) => ({
      contractId: contractIdMap.get(item.contractId)!,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString()
    }))
  );

  await db.insert(schema.capex).values(
    seedData.capex.map((item) => ({
      contractId: contractIdMap.get(item.contractId)!,
      month: item.month,
      category: item.category,
      description: item.description,
      amount: item.amount.toString()
    }))
  );

  await db.insert(schema.opex).values(
    seedData.opex.map((item) => ({
      contractId: contractIdMap.get(item.contractId)!,
      month: item.month,
      category: item.category,
      description: item.description,
      amount: item.amount.toString()
    }))
  );

  await db.insert(schema.revenue).values(
    seedData.revenue.map((item) => ({
      contractId: contractIdMap.get(item.contractId)!,
      month: item.month,
      status: item.status,
      description: item.description,
      amount: item.amount.toString()
    }))
  );

  console.log("Seed completed for Linhares, Aracruz and Itapemirim.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
