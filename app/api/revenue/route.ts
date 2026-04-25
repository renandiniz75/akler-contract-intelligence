import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revenue } from "@/db/schema";
import { db } from "@/db";
import { createdResponse } from "@/lib/api-response";

const revenueSchema = z.object({
  contractId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  status: z.enum(["projected", "realized"]),
  description: z.string().min(1),
  amount: z.coerce.number().nonnegative()
});

export async function GET() {
  return NextResponse.json(await db.select().from(revenue));
}

export async function POST(request: NextRequest) {
  const payload = revenueSchema.parse(await request.json());
  const [row] = await db
    .insert(revenue)
    .values({ ...payload, amount: payload.amount.toString() })
    .returning();

  return createdResponse(row);
}
