import { AuthTokenType } from "@prisma/client";
import { NextResponse } from "next/server";
import { consumeToken } from "@/lib/auth-email";
import { db } from "@/lib/db";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const consumed = await consumeToken(token, AuthTokenType.VERIFY_EMAIL);
  if (!consumed) {
    return NextResponse.json({ error: "Invalid or expired verification token." }, { status: 400 });
  }

  await db.user.update({
    where: { id: consumed.userId },
    data: { emailVerifiedAt: new Date() }
  });

  return NextResponse.json({ success: true });
}
