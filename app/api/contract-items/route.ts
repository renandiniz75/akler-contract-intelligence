import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contractItems } from "@/db/schema";
import { createdResponse } from "@/lib/api-response";

const contractItemSchema = z.object({
  contractId: z.string().uuid(),
  description: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().nonnegative()
});

export async function GET() {
  return NextResponse.json(await db.select().from(contractItems));
}

export async function POST(request: NextRequest) {
  const payload = contractItemSchema.parse(await request.json());
  const [row] = await db
    .insert(contractItems)
    .values({ ...payload, unitPrice: payload.unitPrice.toString() })
    .returning();

  return createdResponse(row);
}
