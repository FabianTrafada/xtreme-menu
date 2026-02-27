import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "061225";

/**
 * Verify the admin password from the Authorization header.
 * Expected format: `Bearer <password>`
 * Returns null if authorized, or a 401 NextResponse if not.
 */
export function verifyAdmin(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  if (token !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return null; // Authorized
}
