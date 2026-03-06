import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const sql = getDb();

        const snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
            serverKey: process.env.MIDTRANS_SERVER_KEY!,
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
        });

        const statusResponse = await snap.transaction.notification(body);
        const orderId = statusResponse.order_id as string;
        const transactionStatus = statusResponse.transaction_status as string;
        const fraudStatus = statusResponse.fraud_status as string;
        const paymentType = statusResponse.payment_type as string;
        const transactionId = statusResponse.transaction_id as string;

        let status = "pending";

        if (transactionStatus === "capture") {
            status = fraudStatus === "accept" ? "paid" : "challenge";
        } else if (transactionStatus === "settlement") {
            status = "paid";
        } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
            status = "cancelled";
        } else if (transactionStatus === "pending") {
            status = "pending";
        } else if (transactionStatus === "refund") {
            status = "refunded";
        }

        await sql`
            UPDATE orders
            SET status = ${status},
                payment_type = ${paymentType},
                midtrans_transaction_id = ${transactionId},
                updated_at = NOW()
            WHERE id = ${orderId}
        `;

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Notification handler error:", error);
        return NextResponse.json(
            { error: "Failed to process notification" },
            { status: 500 }
        );
    }
}
