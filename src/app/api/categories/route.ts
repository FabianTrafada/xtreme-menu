import { getDb } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const sql = getDb();
    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "id and name are required" }, { status: 400 });
    }

    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM categories`;
    const sortOrder = maxOrder[0].next_order;

    await sql`INSERT INTO categories (id, name, sort_order) VALUES (${id}, ${name}, ${sortOrder})`;

    return NextResponse.json({ id, name, sort_order: sortOrder });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
