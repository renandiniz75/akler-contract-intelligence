import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contracts } from "@/db/schema";

const updateSchema = z.object({
  city: z.string().min(1).optional(),
  agency: z.string().min(1).optional(),
  number: z.string().min(1).optional(),
  object: z.string().min(1).optional(),
  startDate: z.string().min(10).optional(),
  endDate: z.string().min(10).optional(),
  status: z.enum(["active", "pending", "completed", "at_risk"]).optional(),
  totalValue: z.coerce.number().nonnegative().optional(),
  initialTermMonths: z.coerce.number().int().positive().optional(),
  renewalCount: z.coerce.number().int().nonnegative().optional(),
  renewalTermMonths: z.coerce.number().int().positive().optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = updateSchema.parse(await request.json());
  const [row] = await db
    .update(contracts)
    .set({
      ...payload,
      totalValue: payload.totalValue?.toString(),
      updatedAt: new Date()
    })
    .where(eq(contracts.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.delete(contracts).where(eq(contracts.id, id)).returning({ id: contracts.id });

  if (!row) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
