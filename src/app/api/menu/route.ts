import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getDb();

    const categories = await sql`
      SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC, name ASC
    `;

    const items = await sql`
      SELECT id, category_id, name, description, price, image, popular, ingredients
      FROM menu_items ORDER BY name ASC
    `;

    // Group items into categories
    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: items
        .filter((item) => item.category_id === cat.id)
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          price: item.price,
          image: item.image || undefined,
          popular: item.popular || false,
          ingredients: item.ingredients || undefined,
        })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
