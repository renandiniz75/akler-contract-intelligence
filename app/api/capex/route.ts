import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { capex } from "@/db/schema";
import { db } from "@/db";
import { createdResponse } from "@/lib/api-response";

const capexSchema = z.object({
  contractId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  category: z.enum(["labor", "materials", "equipment", "software", "logistics", "overhead"]),
  description: z.string().min(1),
  amount: z.coerce.number().nonnegative()
});

export async function GET() {
  return NextResponse.json(await db.select().from(capex));
}

export async function POST(request: NextRequest) {
  const payload = capexSchema.parse(await request.json());
  const [row] = await db
    .insert(capex)
    .values({ ...payload, amount: payload.amount.toString() })
    .returning();

  return createdResponse(row);
}
