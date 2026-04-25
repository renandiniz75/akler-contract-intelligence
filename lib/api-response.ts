import { NextResponse } from "next/server";

export function notConfiguredResponse() {
  return NextResponse.json(
    {
      error: "DATABASE_URL is not configured. Set environment variables and run database migrations before using CRUD APIs."
    },
    { status: 503 }
  );
}

export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}
