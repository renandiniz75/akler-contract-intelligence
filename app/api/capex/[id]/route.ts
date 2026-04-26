import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { capex } from "@/db/schema";

const updateSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  category: z.enum(["labor", "materials", "equipment", "software", "logistics", "overhead"]).optional(),
  description: z.string().min(1).optional(),
  amount: z.coerce.number().nonnegative().optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = updateSchema.parse(await request.json());
  const [row] = await db
    .update(capex)
    .set({ ...payload, amount: payload.amount?.toString() })
    .where(eq(capex.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "CAPEX record not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.delete(capex).where(eq(capex.id, id)).returning({ id: capex.id });

  if (!row) {
    return NextResponse.json({ error: "CAPEX record not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
