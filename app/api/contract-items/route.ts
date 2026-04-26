import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contractItems } from "@/db/schema";
import { createdResponse } from "@/lib/api-response";

const contractItemSchema = z.object({
  contractId: z.string().uuid(),
  description: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  investmentCategory: z.enum(["labor", "materials", "equipment", "software", "logistics", "overhead"]).default("equipment"),
  estimatedCost: z.coerce.number().nonnegative().default(0),
  paymentStartOffsetMonths: z.coerce.number().int().nonnegative().default(0),
  installmentCount: z.coerce.number().int().positive().default(1),
  paymentSource: z.enum(["own_cash", "third_party"]).default("own_cash")
});

export async function GET() {
  return NextResponse.json(await db.select().from(contractItems));
}

export async function POST(request: NextRequest) {
  const payload = contractItemSchema.parse(await request.json());
  const [row] = await db
    .insert(contractItems)
    .values({ ...payload, unitPrice: payload.unitPrice.toString(), estimatedCost: payload.estimatedCost.toString() })
    .returning();

  return createdResponse(row);
}
