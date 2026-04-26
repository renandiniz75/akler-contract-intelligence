import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contractDocuments } from "@/db/schema";
import { createdResponse } from "@/lib/api-response";

const documentSchema = z.object({
  contractId: z.string().uuid(),
  title: z.string().min(1),
  type: z.enum(["contract", "amendment", "measurement", "invoice", "other"]).default("other"),
  url: z.string().url()
});

export async function GET() {
  return NextResponse.json(await db.select().from(contractDocuments));
}

export async function POST(request: NextRequest) {
  const payload = documentSchema.parse(await request.json());
  const [row] = await db.insert(contractDocuments).values(payload).returning();

  return createdResponse(row);
}
