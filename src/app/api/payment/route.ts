import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, grossAmount, items, tableNumber, customerName } = body;

        if (!orderId || !grossAmount || !items || !tableNumber) {
            return NextResponse.json(
                { error: "Missing required fields: orderId, grossAmount, items, tableNumber" },
                { status: 400 }
            );
        }

        // Save order to database with "pending" status
        const sql = getDb();

        await sql`
            INSERT INTO orders (id, table_number, customer_name, status, total)
            VALUES (${orderId}, ${tableNumber}, ${customerName || "Guest"}, 'pending', ${grossAmount})
        `;

        for (const item of items) {
            const itemId = `${orderId}-${item.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
            await sql`
                INSERT INTO order_items (id, order_id, item_name, item_price, quantity)
                VALUES (${itemId}, ${orderId}, ${item.name}, ${item.price}, ${item.quantity})
            `;
        }

        const snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
            serverKey: process.env.MIDTRANS_SERVER_KEY!,
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
        });

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            item_details: items.map((item: { name: string; price: number; quantity: number }) => ({
                id: item.name.toLowerCase().replace(/\s+/g, "-"),
                price: item.price,
                quantity: item.quantity,
                name: item.name.substring(0, 50), // Midtrans max 50 chars
            })),
            credit_card: {
                secure: true,
            },
        };

        const transaction = await snap.createTransaction(parameter);

        return NextResponse.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Midtrans error:", message, error);
        return NextResponse.json(
            { error: `Failed to create transaction: ${message}` },
            { status: 500 }
        );
    }
}
