import { getDb } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, image, popular, ingredients } = body;

    await sql`
      UPDATE menu_items 
      SET name = ${name}, description = ${description || null}, price = ${price || 0}, 
          image = ${image || null}, popular = ${popular || false}, ingredients = ${ingredients || null}
      WHERE id = ${id}
    `;

    return NextResponse.json({ id, name, description, price, image, popular, ingredients });
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const sql = getDb();
    const { id } = await params;

    await sql`DELETE FROM menu_items WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
