import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { revenue } from "@/db/schema";

const updateSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  status: z.enum(["projected", "realized"]).optional(),
  description: z.string().min(1).optional(),
  amount: z.coerce.number().nonnegative().optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = updateSchema.parse(await request.json());
  const [row] = await db
    .update(revenue)
    .set({ ...payload, amount: payload.amount?.toString() })
    .where(eq(revenue.id, id))
    .returning();

  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(revenue).where(eq(revenue.id, id));
  return NextResponse.json({ ok: true });
}
