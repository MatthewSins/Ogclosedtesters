import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.DEVELOPER, Role.TESTER, Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const user = await db.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      testerJoins: {
        include: {
          project: {
            select: {
              id: true,
              appName: true,
              status: true,
              endDate: true,
              durationDays: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json(user);
}
