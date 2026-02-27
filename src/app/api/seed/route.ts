import { getDb, initDb } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { menuData } from "@/data/menu";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const sql = getDb();

    // Init tables
    await initDb();

    // Clear existing data
    await sql`DELETE FROM menu_items`;
    await sql`DELETE FROM categories`;

    // Seed categories and items
    for (let i = 0; i < menuData.length; i++) {
      const cat = menuData[i];
      await sql`INSERT INTO categories (id, name, sort_order) VALUES (${cat.id}, ${cat.name}, ${i})`;

      for (const item of cat.items) {
        await sql`
          INSERT INTO menu_items (id, category_id, name, description, price, image, popular, ingredients, image_aspect_ratio)
          VALUES (${item.id}, ${cat.id}, ${item.name}, ${item.description || null}, ${item.price}, ${item.image || null}, ${item.popular || false}, ${item.ingredients || null}, ${item.imageAspectRatio || 1.777})
        `;
      }
    }

    return NextResponse.json({ success: true, categories: menuData.length });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
