import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contractItems } from "@/db/schema";

const updateSchema = z.object({
  description: z.string().min(1).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  investmentCategory: z.enum(["labor", "materials", "equipment", "software", "logistics", "overhead"]).optional(),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  paymentStartOffsetMonths: z.coerce.number().int().nonnegative().optional(),
  installmentCount: z.coerce.number().int().positive().optional(),
  paymentSource: z.enum(["own_cash", "third_party"]).optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = updateSchema.parse(await request.json());
  const [row] = await db
    .update(contractItems)
    .set({ ...payload, unitPrice: payload.unitPrice?.toString(), estimatedCost: payload.estimatedCost?.toString() })
    .where(eq(contractItems.id, id))
    .returning();

  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(contractItems).where(eq(contractItems.id, id));
  return NextResponse.json({ ok: true });
}
