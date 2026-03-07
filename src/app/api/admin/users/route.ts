import { Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const updateSchema = z.object({
  userId: z.string().min(1),
  status: z.nativeEnum(UserStatus)
});

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(users);
}

export async function PATCH(req: Request): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  try {
    const payload = updateSchema.parse(await req.json());

    const updated = await db.user.update({
      where: { id: payload.userId },
      data: { status: payload.status },
      select: { id: true, status: true }
    });

    await db.adminAudit.create({
      data: {
        adminId: auth.user.id,
        action: "UPDATE_USER_STATUS",
        targetType: "USER",
        targetId: payload.userId,
        payload: { status: payload.status }
      }
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid admin update payload." }, { status: 400 });
  }
}
