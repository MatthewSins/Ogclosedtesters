import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isErrorResponse, requireUser } from "@/lib/require-role";

const updateSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "PAUSED"])
});

export async function GET(): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  const projects = await db.project.findMany({
    include: {
      developer: { select: { id: true, name: true, email: true } },
      _count: { select: { testerJoins: true, feedback: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(projects);
}

export async function PATCH(req: Request): Promise<Response> {
  const auth = await requireUser([Role.ADMIN]);
  if (isErrorResponse(auth)) return auth;

  try {
    const payload = updateSchema.parse(await req.json());

    const updated = await db.project.update({
      where: { id: payload.projectId },
      data: { status: payload.status }
    });

    await db.adminAudit.create({
      data: {
        adminId: auth.user.id,
        action: "UPDATE_PROJECT_STATUS",
        targetType: "PROJECT",
        targetId: payload.projectId,
        payload: { status: payload.status }
      }
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid project update payload." }, { status: 400 });
  }
}
