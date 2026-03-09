import { UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { issueVerificationToken } from "@/lib/auth-email";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["DEVELOPER", "TESTER"]).default("DEVELOPER")
});

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`register:${ip}`, 10, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: `Too many requests. Try again in ${rate.retryAfter}s.` }, { status: 429 });
  }

  try {
    const payload = registerSchema.parse(await req.json());

    const existing = await db.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const passwordHash = await hash(payload.password, 10);

    const user = await db.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: payload.role,
        status: UserStatus.ACTIVE
      }
    });

    await issueVerificationToken({ id: user.id, email: user.email });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      message: "Account created. Please verify your email before signing in."
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
  }
}
