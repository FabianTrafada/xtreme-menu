import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const auth = request.headers.get("authorization");
        if (auth !== `Bearer 061225`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sql = getDb();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const date = searchParams.get("date"); // YYYY-MM-DD

        let orders;

        if (status && date) {
            orders = await sql`
                SELECT * FROM orders
                WHERE status = ${status} AND created_at::date = ${date}::date
                ORDER BY created_at DESC
            `;
        } else if (status) {
            orders = await sql`
                SELECT * FROM orders
                WHERE status = ${status}
                ORDER BY created_at DESC
            `;
        } else if (date) {
            orders = await sql`
                SELECT * FROM orders
                WHERE created_at::date = ${date}::date
                ORDER BY created_at DESC
            `;
        } else {
            orders = await sql`
                SELECT * FROM orders
                ORDER BY created_at DESC
                LIMIT 100
            `;
        }

        // Fetch items for all orders
        const orderIds = orders.map((o) => o.id);
        let items: Record<string, unknown>[] = [];
        if (orderIds.length > 0) {
            items = await sql`
                SELECT * FROM order_items
                WHERE order_id = ANY(${orderIds})
            `;
        }

        // Group items by order
        const result = orders.map((order) => ({
            ...order,
            items: items.filter((item) => item.order_id === order.id),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Orders fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
