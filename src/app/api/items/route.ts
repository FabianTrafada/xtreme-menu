import { getDb } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const sql = getDb();
    const body = await req.json();
    const { id, category_id, name, description, price, image, popular, ingredients, image_aspect_ratio } = body;

    if (!id || !category_id || !name) {
      return NextResponse.json({ error: "id, category_id, and name are required" }, { status: 400 });
    }

    await sql`
      INSERT INTO menu_items (id, category_id, name, description, price, image, popular, ingredients, image_aspect_ratio)
      VALUES (${id}, ${category_id}, ${name}, ${description || null}, ${price || 0}, ${image || null}, ${popular || false}, ${ingredients || null}, ${image_aspect_ratio || 1.777})
    `;

    return NextResponse.json({ id, category_id, name, description, price, image, popular, ingredients, image_aspect_ratio });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
