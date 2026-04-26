import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contracts } from "@/db/schema";
import { createdResponse } from "@/lib/api-response";

const contractSchema = z.object({
  city: z.string().min(1),
  agency: z.string().min(1),
  number: z.string().min(1),
  object: z.string().min(1),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  status: z.enum(["active", "pending", "completed", "at_risk"]).default("pending"),
  totalValue: z.coerce.number().nonnegative(),
  initialTermMonths: z.coerce.number().int().positive().default(12),
  renewalCount: z.coerce.number().int().nonnegative().default(9),
  renewalTermMonths: z.coerce.number().int().positive().default(12),
  revenueProjectionMonths: z.coerce.number().int().positive().default(120),
  revenueAdjustmentRate: z.coerce.number().nonnegative().default(0),
  revenueAdjustmentFrequencyMonths: z.coerce.number().int().positive().default(12)
});

export async function GET() {
  const rows = await db.select().from(contracts);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const payload = contractSchema.parse(await request.json());
  const [row] = await db
    .insert(contracts)
    .values({
      ...payload,
      totalValue: payload.totalValue.toString(),
      revenueAdjustmentRate: payload.revenueAdjustmentRate.toString()
    })
    .returning();

  return createdResponse(row);
}
