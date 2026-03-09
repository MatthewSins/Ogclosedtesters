import { AuthTokenType } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeToken } from "@/lib/auth-email";
import { db } from "@/lib/db";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6)
});

export async function POST(req: Request): Promise<Response> {
  try {
    const payload = schema.parse(await req.json());
    const consumed = await consumeToken(payload.token, AuthTokenType.RESET_PASSWORD);

    if (!consumed) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    const passwordHash = await hash(payload.password, 10);
    await db.user.update({
      where: { id: consumed.userId },
      data: { passwordHash }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid reset request payload." }, { status: 400 });
  }
}
