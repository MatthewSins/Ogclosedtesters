import { NextResponse } from "next/server";
import { z } from "zod";
import { issueResetToken } from "@/lib/auth-email";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email()
});

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`forgot:${ip}`, 15, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: `Too many requests. Try again in ${rate.retryAfter}s.` }, { status: 429 });
  }

  try {
    const payload = schema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email: payload.email } });
    if (user) {
      await issueResetToken({ id: user.id, email: user.email });
    }

    return NextResponse.json({ success: true, message: "If the account exists, a reset link was sent." });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
